import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import fg from 'fast-glob'

interface DeclarationInfo {
  name: string
  kind: 'class' | 'interface'
  exported: boolean
}

interface ExportTarget {
  file: string
  originalName: string
}

interface FileInfo {
  path: string
  isIndex: boolean
  declarations: DeclarationInfo[]
  exports: Map<string, ExportTarget[]>
  exportAlls: string[]
  hasDefaultExport: boolean
  defaultExportName?: string
}

interface ImportEntry {
  specifier: string
  isTypeOnly: boolean
  defaultImport?: string
  namespaceImport?: string
  namedImports: { imported: string }[]
}

type Layer = 'presentation' | 'domain' | 'data' | 'infra' | 'main' | 'other'

interface GraphNode {
  id: string
  label: string
  type: 'file' | 'class' | 'interface'
  file: string
  layer: Layer
}

interface GraphLink {
  source: string
  target: string
  kind: 'imports' | 'declares'
}

const projectRoot = path.resolve(__dirname, '..')
const srcRoot = path.normalize(path.join(projectRoot, 'src'))
const outputFile = path.join(projectRoot, 'dependency-graph.html')
const tsconfigPath = path.join(projectRoot, 'tsconfig.json')

const normalizePath = (p: string) => path.normalize(p)

function loadCompilerOptions (): ts.CompilerOptions {
  const configResult = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
  if (configResult.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configResult.error.messageText, '\n'))
  }
  const parsed = ts.parseJsonConfigFileContent(configResult.config, ts.sys, projectRoot)
  return parsed.options
}

const compilerOptions = loadCompilerOptions()
const baseUrl = compilerOptions.baseUrl ? path.resolve(projectRoot, compilerOptions.baseUrl) : srcRoot

function resolvePathFromAlias (specifier: string): string | null {
  if (!compilerOptions.paths) return null

  for (const [alias, targets] of Object.entries(compilerOptions.paths)) {
    const starIndex = alias.indexOf('*')
    if (starIndex === -1 && alias !== specifier) continue

    const prefix = starIndex === -1 ? alias : alias.slice(0, starIndex)
    const suffix = starIndex === -1 ? '' : alias.slice(starIndex + 1)

    if (!specifier.startsWith(prefix) || !specifier.endsWith(suffix)) continue

    const matched = starIndex === -1 ? '' : specifier.slice(prefix.length, specifier.length - suffix.length)

    for (const target of targets) {
      const mapped = target.replace('*', matched)
      const candidate = path.resolve(baseUrl, mapped)
      const resolved = resolveFileLike(candidate)
      if (resolved) return resolved
    }
  }

  return null
}

function resolveFileLike (candidate: string): string | null {
  const extensions = ['.ts', '.tsx', '.js', '.jsx']

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return normalizeResolvedPath(candidate)
  }

  for (const ext of extensions) {
    const withExt = `${candidate}${ext}`
    if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
      return normalizeResolvedPath(withExt)
    }
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    for (const ext of extensions) {
      const indexPath = path.join(candidate, `index${ext}`)
      if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
        return normalizeResolvedPath(indexPath)
      }
    }
  }

  return null
}

function normalizeResolvedPath (resolved: string): string | null {
  const normalized = normalizePath(resolved)
  if (!normalized.startsWith(srcRoot)) return null
  if (normalized.endsWith('.d.ts')) return null
  if (/\.(spec|test)\.tsx?$/i.test(normalized)) return null
  return normalized
}

function resolveModule (importer: string, specifier: string): string | null {
  const { resolvedModule } = ts.resolveModuleName(specifier, importer, compilerOptions, ts.sys)
  if (resolvedModule?.resolvedFileName) {
    const normalized = normalizeResolvedPath(resolvedModule.resolvedFileName)
    if (normalized) return normalized
  }

  const aliasResolved = resolvePathFromAlias(specifier)
  if (aliasResolved) return aliasResolved

  const relativeCandidate = resolveFileLike(path.resolve(path.dirname(importer), specifier))
  if (relativeCandidate) return relativeCandidate

  return null
}

function isExported (node: ts.Node): boolean {
  return Boolean(node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword))
}

const files = fg.sync(['src/**/*.{ts,tsx}'], {
  cwd: projectRoot,
  absolute: true,
  ignore: ['**/*.spec.ts', '**/*.test.ts', '**/*.d.ts']
}).map(normalizePath)

const fileInfos = new Map<string, FileInfo>()
const importEntries = new Map<string, ImportEntry[]>()

function ensureFileInfo (filePath: string): FileInfo {
  const normalized = normalizePath(filePath)

  let info = fileInfos.get(normalized)
  if (!info) {
    info = {
      path: normalized,
      isIndex: path.basename(normalized) === 'index.ts' || path.basename(normalized) === 'index.tsx',
      declarations: [],
      exports: new Map(),
      exportAlls: [],
      hasDefaultExport: false
    }
    fileInfos.set(normalized, info)
  }
  return info
}

function addExportTarget (fileInfo: FileInfo, exportedName: string, target: ExportTarget): void {
  const targets = fileInfo.exports.get(exportedName) ?? []
  targets.push(target)
  fileInfo.exports.set(exportedName, targets)
}

function collectFileData (filePath: string): void {
  const normalized = normalizePath(filePath)
  const sourceText = fs.readFileSync(normalized, 'utf-8')
  const sourceFile = ts.createSourceFile(normalized, sourceText, ts.ScriptTarget.Latest, true)
  const fileInfo = ensureFileInfo(normalized)
  const imports: ImportEntry[] = []

  sourceFile.forEachChild(node => {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const namedImports: { imported: string }[] = []
      let defaultImport: string | undefined
      let namespaceImport: string | undefined

      if (node.importClause) {
        defaultImport = node.importClause.name?.text
        if (node.importClause.namedBindings) {
          if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            namespaceImport = node.importClause.namedBindings.name.text
          } else if (ts.isNamedImports(node.importClause.namedBindings)) {
            node.importClause.namedBindings.elements.forEach(element => {
              const imported = (element.propertyName ?? element.name).text
              namedImports.push({ imported })
            })
          }
        }
      }

      imports.push({
        specifier: node.moduleSpecifier.text,
        isTypeOnly: Boolean(node.importClause?.isTypeOnly),
        defaultImport,
        namespaceImport,
        namedImports
      })
    }

    if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
      const name = node.name?.text
      if (name) {
        const declaration: DeclarationInfo = {
          name,
          kind: ts.isClassDeclaration(node) ? 'class' : 'interface',
          exported: isExported(node)
        }
        fileInfo.declarations.push(declaration)
        if (declaration.exported) {
          addExportTarget(fileInfo, name, { file: filePath, originalName: name })
        }
      }
    }

    if (ts.isExportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
        ? node.moduleSpecifier.text
        : null
      const resolvedModule = moduleSpecifier ? resolveModule(filePath, moduleSpecifier) : null

      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach(element => {
          const exportedName = element.name.text
          const originalName = (element.propertyName ?? element.name).text
          if (resolvedModule) {
            addExportTarget(fileInfo, exportedName, { file: resolvedModule, originalName })
          } else {
            addExportTarget(fileInfo, exportedName, { file: filePath, originalName })
          }
        })
      } else if (!node.exportClause && resolvedModule) {
        // export * from './module'
        fileInfo.exportAlls.push(resolvedModule)
      }
    }

    if (ts.isExportAssignment(node)) {
      fileInfo.hasDefaultExport = true
      fileInfo.defaultExportName = 'default'
    }

    if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) {
      if (node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.DefaultKeyword)) {
        fileInfo.hasDefaultExport = true
        fileInfo.defaultExportName = 'default'
      }
    }
  })

  if (imports.length) {
    importEntries.set(normalized, imports)
  }

  // Handle `export default class Foo {}` pattern
  sourceFile.statements.forEach(statement => {
    if (ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement)) {
      const hasDefault = statement.modifiers?.some(mod => mod.kind === ts.SyntaxKind.DefaultKeyword)
      if (hasDefault) {
        fileInfo.hasDefaultExport = true
        fileInfo.defaultExportName = statement.name?.text ?? 'default'
        if (statement.name?.text) {
          addExportTarget(fileInfo, 'default', { file: filePath, originalName: statement.name.text })
        }
      }
    }
  })

  if (fileInfo.hasDefaultExport && !fileInfo.exports.has('default')) {
    addExportTarget(fileInfo, 'default', { file: filePath, originalName: fileInfo.defaultExportName ?? 'default' })
  }
}

files.forEach(collectFileData)

function dedupeTargets (targets: ExportTarget[]): ExportTarget[] {
  const seen = new Set<string>()
  const result: ExportTarget[] = []
  targets.forEach(target => {
    const key = `${target.file}::${target.originalName}`
    if (!seen.has(key)) {
      seen.add(key)
      result.push(target)
    }
  })
  return result
}

function resolveExportTargets (filePath: string, exportName: string, visited = new Set<string>()): ExportTarget[] {
  const visitKey = `${filePath}::${exportName}`
  if (visited.has(visitKey)) return []
  visited.add(visitKey)

  const fileInfo = fileInfos.get(filePath)
  if (!fileInfo) return []

  const direct = fileInfo.exports.get(exportName) ?? []
  let results: ExportTarget[] = []

  direct.forEach(target => {
    if (target.file === filePath) {
      results.push(target)
    } else {
      results = results.concat(resolveExportTargets(target.file, target.originalName, visited))
    }
  })

  if (!results.length) {
    for (const exportAll of fileInfo.exportAlls) {
      results = results.concat(resolveExportTargets(exportAll, exportName, visited))
    }
  }

  if (!results.length && !fileInfo.isIndex) {
    // Fallback to file declarations
    const declaration = fileInfo.declarations.find(decl => decl.name === exportName && decl.exported)
    if (declaration) {
      results.push({ file: filePath, originalName: exportName })
    }
    if (exportName === 'default' && fileInfo.hasDefaultExport) {
      results.push({ file: filePath, originalName: fileInfo.defaultExportName ?? 'default' })
    }
  }

  return dedupeTargets(results)
}

function collectAllExports (filePath: string, visited = new Set<string>()): ExportTarget[] {
  if (visited.has(filePath)) return []
  visited.add(filePath)
  const fileInfo = fileInfos.get(filePath)
  if (!fileInfo) return []

  let targets: ExportTarget[] = []
  fileInfo.exports.forEach((value, key) => {
    targets = targets.concat(resolveExportTargets(filePath, key, new Set()))
  })
  fileInfo.exportAlls.forEach(targetPath => {
    targets = targets.concat(collectAllExports(targetPath, visited))
  })

  return dedupeTargets(targets)
}

const nodes = new Map<string, GraphNode>()
const links: GraphLink[] = []

function fileNodeId (filePath: string): string {
  return `file:${path.relative(projectRoot, filePath)}`
}

function symbolNodeId (filePath: string, name: string): string {
  return `symbol:${path.relative(projectRoot, filePath)}::${name}`
}

function addFileNode (filePath: string): GraphNode {
  const id = fileNodeId(filePath)
  let node = nodes.get(id)
  if (!node) {
    node = {
      id,
      label: path.relative(projectRoot, filePath),
      type: 'file',
      file: filePath,
      layer: detectLayer(filePath)
    }
    nodes.set(id, node)
  }
  return node
}

function addSymbolNode (filePath: string, declaration: DeclarationInfo): GraphNode {
  const id = symbolNodeId(filePath, declaration.name)
  let node = nodes.get(id)
  if (!node) {
    node = {
      id,
      label: `${declaration.name} (${declaration.kind})`,
      type: declaration.kind,
      file: filePath,
      layer: detectLayer(filePath)
    }
    nodes.set(id, node)
  }
  return node
}

function registerDeclarationNodes (): void {
  fileInfos.forEach(info => {
    if (info.isIndex) return
    const fileNode = addFileNode(info.path)
    info.declarations.forEach(declaration => {
      const symbolNode = addSymbolNode(info.path, declaration)
      links.push({
        source: fileNode.id,
        target: symbolNode.id,
        kind: 'declares'
      })
    })
  })
}

function handleImportTargets (importer: string, modulePath: string, entry: ImportEntry): void {
  const importerInfo = fileInfos.get(importer)
  if (importerInfo?.isIndex) return
  const moduleInfo = fileInfos.get(modulePath)
  if (!moduleInfo) return

  const importTargets: ExportTarget[] = []

  if (entry.namespaceImport) {
    importTargets.push(...collectAllExports(modulePath))
  }

  entry.namedImports.forEach(named => {
    importTargets.push(...resolveExportTargets(modulePath, named.imported))
  })

  if (entry.defaultImport) {
    importTargets.push(...resolveExportTargets(modulePath, 'default'))
  }

  if (!entry.namedImports.length && !entry.defaultImport && !entry.namespaceImport) {
    // Side-effect import, connect to file directly
    importTargets.push({ file: modulePath, originalName: path.basename(modulePath) })
  }

  if (!importTargets.length && moduleInfo.isIndex) {
    moduleInfo.exportAlls.forEach(targetPath => {
      importTargets.push({ file: targetPath, originalName: path.basename(targetPath) })
    })
  }

  if (!importTargets.length) {
    importTargets.push({ file: modulePath, originalName: path.basename(modulePath) })
  }

  const importerNode = addFileNode(importer)
  const seenTargets = new Set<string>()
  const seenFiles = new Set<string>()

  const expandedTargets: ExportTarget[] = []

  const pushTargetsFromIndex = (indexPath: string): void => {
    const exported = collectAllExports(indexPath)
    if (exported.length) {
      expandedTargets.push(...exported)
    }
    const indexInfo = fileInfos.get(indexPath)
    indexInfo?.exportAlls.forEach(targetPath => {
      expandedTargets.push({ file: targetPath, originalName: path.basename(targetPath) })
    })
  }

  importTargets.forEach(target => {
    const resolvedInfo = fileInfos.get(target.file)
    if (resolvedInfo?.isIndex) {
      pushTargetsFromIndex(target.file)
      return
    }
    expandedTargets.push(target)
  })

  if (!expandedTargets.length && moduleInfo.isIndex) {
    pushTargetsFromIndex(modulePath)
  }

  if (!expandedTargets.length) {
    expandedTargets.push({ file: modulePath, originalName: path.basename(modulePath) })
  }

  expandedTargets.forEach(target => {
    const resolvedInfo = fileInfos.get(target.file)
    if (!resolvedInfo) return
    const targetFileNode = addFileNode(resolvedInfo.path)
    if (!seenFiles.has(targetFileNode.id)) {
      links.push({ source: importerNode.id, target: targetFileNode.id, kind: 'imports' })
      seenFiles.add(targetFileNode.id)
    }

    const targetKey = `${target.file}::${target.originalName}`
    if (seenTargets.has(targetKey)) return
    seenTargets.add(targetKey)

    const declaration = resolvedInfo.declarations.find(decl => decl.name === target.originalName)
    if (declaration) {
      const symbolNode = addSymbolNode(target.file, declaration)
      links.push({ source: importerNode.id, target: symbolNode.id, kind: 'imports' })
    }
  })
}

function buildGraph (): void {
  registerDeclarationNodes()
  importEntries.forEach((entries, importer) => {
    entries.forEach(entry => {
      const resolved = resolveModule(importer, entry.specifier)
      if (!resolved) return
      handleImportTargets(importer, resolved, entry)
    })
  })
}

function detectLayer (filePath: string): Layer {
  const rel = path
    .relative(srcRoot, filePath)
    .replace(/\\/g, '/')

  if (rel.startsWith('presentation/')) return 'presentation'
  if (rel.startsWith('domain/')) return 'domain'
  if (rel.startsWith('data/')) return 'data'
  if (rel.startsWith('infra/') || rel.startsWith('infrastructure/')) return 'infra'
  if (rel.startsWith('main/')) return 'main'
  return 'other'
}

buildGraph()

function generateHtml (nodesList: GraphNode[], linksList: GraphLink[]): string {
  const data = { nodes: nodesList, links: linksList }
  const graphData = JSON.stringify(data)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Dependency Graph</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #0d1117; color: #e6edf3; }
    #graph { width: 100vw; height: 100vh; }
    .legend { position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.6); padding: 10px; border-radius: 6px; font-size: 14px; }
    .legend div { margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
    .legend .color { width: 14px; height: 14px; border-radius: 50%; display: inline-block; }
    .node text { pointer-events: none; font-size: 12px; fill: #e6edf3; }
    .link { stroke: #5d636f; stroke-opacity: 0.5; }
    .link.declares { stroke-dasharray: 4 2; }
    .node circle { stroke: #0d1117; stroke-width: 1px; }
    .node.file circle { fill: #4c8bf5; }
    .node.class circle { fill: #2fb344; }
    .node.interface circle { fill: #f59f00; }
    .node.dimmed circle, .node.dimmed text { opacity: 0.2; }
    .link.dimmed { opacity: 0.1; }
    .link.imports.highlight { stroke: #ff6b6b; stroke-opacity: 0.9; }
    .link.declares.highlight { stroke: #94d82d; stroke-opacity: 0.9; }
    .layer-filter {
      position: fixed;
      bottom: 10px;
      left: 10px;
      background: rgba(0,0,0,0.6);
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 12px;
    }
    .layer-filter button {
      margin: 2px 4px;
      padding: 2px 6px;
      background: #161b22;
      border: 1px solid #30363d;
      color: #e6edf3;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .layer-filter button.active {
      background: #238636;
      border-color: #2ea043;
    }
    .node.layer-dimmed circle,
    .node.layer-dimmed text {
      opacity: 0.15;
    }
    .link.layer-dimmed {
      opacity: 0.05;
    }
    /* Filtro por tipo de nó */
    .type-filter {
      position: fixed;
      bottom: 60px;
      left: 10px;
      background: rgba(0,0,0,0.6);
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 12px;
    }
    .type-filter button {
      margin: 2px 4px;
      padding: 2px 6px;
      background: #161b22;
      border: 1px solid #30363d;
      color: #e6edf3;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .type-filter button.active {
      background: #1f6feb;
      border-color: #388bfd;
    }
    .node.type-dimmed circle,
    .node.type-dimmed text {
      opacity: 0.15;
    }
    .link.type-dimmed {
      opacity: 0.05;
    }
    .layer-bands rect {
      fill: #161b22;
      opacity: 0.18;
    }
    .layer-bands text {
      fill: #8b949e;
      font-size: 11px;
      text-transform: uppercase;
    }
    .node-controls {
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.6);
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 12px;
      max-width: 220px;
    }
    .node-controls button {
      margin-top: 4px;
      padding: 2px 6px;
      background: #161b22;
      border: 1px solid #30363d;
      color: #e6edf3;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .node.hidden circle,
    .node.hidden text {
      display: none;
    }
    .link.hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div class="legend">
    <div><span class="color" style="background:#4c8bf5"></span>Arquivo</div>
    <div><span class="color" style="background:#2fb344"></span>Classe</div>
    <div><span class="color" style="background:#f59f00"></span>Interface</div>
    <div>Vermelho: arquivos/símbolos importados</div>
    <div>Verde: declarações internas</div>
  </div>
  <input
    id="search"
    type="text"
    placeholder="Buscar nó (arquivo / classe / interface)..."
    style="position:fixed;top:10px;right:10px;z-index:10;padding:4px 8px;border-radius:4px;border:1px solid #333;background:#161b22;color:#e6edf3;font-size:13px;"
  />
  <div class="type-filter" id="type-filter"></div>
  <div class="layer-filter" id="layer-filter"></div>
  <div class="node-controls" id="node-controls">
    <div>Dica: dê <strong>duplo clique</strong> em um nó para ocultar/mostrar.</div>
    <button id="reset-hidden">Mostrar todos</button>
  </div>
  <svg id="graph"></svg>
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  <script>
    const data = ${graphData};
    const width = window.innerWidth;
    const height = window.innerHeight;

    const layerY = {
      presentation: height * 0.15,
      domain:       height * 0.35,
      data:         height * 0.55,
      infra:        height * 0.75,
      main:         height * 0.9,
      other:        height * 0.5
    };

    function getLayerY (d) {
      return layerY[d.layer] || layerY.other;
    }

    const svg = d3.select('#graph').attr('width', width).attr('height', height);
    const container = svg.append('g');

    const defs = svg.append('defs');

    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 12)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#5d636f');

    const zoom = d3.zoom().scaleExtent([0.1, 5]).on('zoom', (event) => {
      container.attr('transform', event.transform);
    });
    svg.call(zoom);

    // Faixas de camada (fundo)
    const layerBands = container.append('g').attr('class', 'layer-bands');
    const layerOrder = ['presentation', 'domain', 'data', 'infra', 'main', 'other'];
    const bandHeight = 110;

    layerOrder.forEach(key => {
      const y = layerY[key];
      if (!y) return;
      layerBands.append('rect')
        .attr('x', -width)
        .attr('y', y - bandHeight / 2)
        .attr('width', width * 3)
        .attr('height', bandHeight);
      layerBands.append('text')
        .attr('x', 20)
        .attr('y', y - bandHeight / 2 + 14)
        .text(key.toUpperCase());
    });

    layerBands.lower();

    const link = container.append('g')
      .attr('stroke-width', 1.2)
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('class', d => 'link ' + d.kind)
      .attr('marker-end', d => d.kind === 'imports' ? 'url(#arrow)' : null);

    const node = container.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', d => 'node ' + d.type)
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    const hiddenNodes = new Set();

    function updateVisibility () {
      node.classed('hidden', n => hiddenNodes.has(n.id));
      link.classed('hidden', l =>
        hiddenNodes.has(l.source.id) || hiddenNodes.has(l.target.id)
      );
    }

    function toggleNodeVisibility (n) {
      if (hiddenNodes.has(n.id)) {
        hiddenNodes.delete(n.id);
      } else {
        hiddenNodes.add(n.id);
      }
      updateVisibility();
    }

    // ----- Filtro por camada -----
    const layerFilterEl = document.getElementById('layer-filter');

    const layers = Array.from(new Set(data.nodes.map(n => n.layer))).sort();
    let activeLayer = null;

    if (layerFilterEl && layers.length) {
      layers.forEach(layer => {
        const btn = document.createElement('button');
        btn.textContent = layer;
        btn.addEventListener('click', () => {
          if (activeLayer === layer) {
            activeLayer = null;
            btn.classList.remove('active');
            applyLayerFilter();
            return;
          }
          activeLayer = layer;
          [...layerFilterEl.querySelectorAll('button')].forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          applyLayerFilter();
        });
        layerFilterEl.appendChild(btn);
      });
    }

    function applyLayerFilter () {
      if (!activeLayer) {
        node.classed('layer-dimmed', false);
        link.classed('layer-dimmed', false);
        return;
      }

      const visibleIds = new Set(
        data.nodes.filter(n => n.layer === activeLayer).map(n => n.id)
      );

      node.classed('layer-dimmed', n => !visibleIds.has(n.id));
      link.classed('layer-dimmed', l =>
        !visibleIds.has(l.source.id) && !visibleIds.has(l.target.id)
      );
    }

    // ----- Filtro por tipo de nó (file / class / interface) -----
    const typeFilterEl = document.getElementById('type-filter');
    const nodeTypes = Array.from(new Set(data.nodes.map(n => n.type))).sort();
    let activeType = null;

    const typeLabels = {
      file: 'file',
      class: 'class',
      interface: 'interface'
    };

    if (typeFilterEl && nodeTypes.length) {
      nodeTypes.forEach(type => {
        const btn = document.createElement('button');
        btn.textContent = typeLabels[type] || type;
        btn.addEventListener('click', () => {
          if (activeType === type) {
            activeType = null;
            btn.classList.remove('active');
            applyTypeFilter();
            return;
          }
          activeType = type;
          [...typeFilterEl.querySelectorAll('button')].forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          applyTypeFilter();
        });
        typeFilterEl.appendChild(btn);
      });
    }

    function applyTypeFilter () {
      if (!activeType) {
        node.classed('type-dimmed', false);
        link.classed('type-dimmed', false);
        return;
      }

      const visibleIds = new Set(
        data.nodes.filter(n => n.type === activeType).map(n => n.id)
      );

      node.classed('type-dimmed', n => !visibleIds.has(n.id));
      link.classed('type-dimmed', l =>
        !visibleIds.has(l.source.id) && !visibleIds.has(l.target.id)
      );
    }

    node.append('circle')
      .attr('r', 10);

    node.append('text')
      .attr('x', 14)
      .attr('y', '0.31em')
      .text(d => d.label);

    const searchInput = document.getElementById('search');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase().trim();

        if (!term) {
          // limpa filtro
          node.classed('dimmed', false);
          link.classed('dimmed', false);
          return;
        }

        const matchedIds = new Set(
          data.nodes
            .filter(n => n.label.toLowerCase().includes(term))
            .map(n => n.id)
        );

        node.classed('dimmed', n => !matchedIds.has(n.id));
        link.classed('dimmed', l => !matchedIds.has(l.source.id) && !matchedIds.has(l.target.id));
      });
    }

    const resetHiddenBtn = document.getElementById('reset-hidden');
    if (resetHiddenBtn) {
      resetHiddenBtn.addEventListener('click', () => {
        hiddenNodes.clear();
        updateVisibility();
      });
    }

    const simulation = d3.forceSimulation(data.nodes)
      .force('link',
        d3.forceLink(data.links)
          .id(d => d.id)
          .distance(1000)
          .strength(0.8)
      )
      .force('charge',
        d3.forceManyBody()
          .strength(-900)
      )
      .force('collide',
        d3.forceCollide()
          .radius(d => d.type === 'file' ? 38 : 30)
          .iterations(2)
      )
      .force('layer',
        d3.forceY(d => getLayerY(d))
          .strength(0.35)
      )
      .force('center', d3.forceX(width / 2))
      .on('tick', ticked);

    function ticked () {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');
    }

    function dragStarted (event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged (event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded (event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    node.on('click', (event, d) => {
      // se for duplo-clique, ignora o highlight (será tratado no dblclick)
      if (event.detail > 1) return;
      highlightDependencies(d);
    });

    node.on('dblclick', (event, d) => {
      event.stopPropagation();
      toggleNodeVisibility(d);
    });

    function highlightDependencies (selected) {
      const incoming = new Set();
      const outgoing = new Set();

      link.classed('highlight', l => {
        const isOutgoing = l.source.id === selected.id;
        const isIncoming = l.target.id === selected.id;
        if (isOutgoing) outgoing.add(l.target.id);
        if (isIncoming) incoming.add(l.source.id);
        return isOutgoing || isIncoming;
      });

      node.classed('dimmed', n => n.id !== selected.id && !incoming.has(n.id) && !outgoing.has(n.id));
      link.classed('dimmed', l => l.source.id !== selected.id && l.target.id !== selected.id);
    }
  </script>
</body>
</html>`
}

const nodesList = Array.from(nodes.values())
const linksList = links.map(link => ({ ...link }))

fs.writeFileSync(outputFile, generateHtml(nodesList, linksList), 'utf-8')
console.log(`Dependency graph generated at ${path.relative(projectRoot, outputFile)}`)
