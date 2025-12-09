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
  directory: string
}

interface GraphLink {
  source: string
  target: string
  kind: 'imports' | 'declares'
  lintViolation?: boolean
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

  // export default class Foo {}
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

function getDirectoryKey (filePath: string): string {
  const relDir = path
    .relative(srcRoot, path.dirname(filePath))
    .replace(/\\/g, '/')
  return relDir || '.'
}

function addFileNode (filePath: string): GraphNode {
  const id = fileNodeId(filePath)
  let node = nodes.get(id)
  if (!node) {
    node = {
      id,
      label: path.basename(filePath),
      type: 'file',
      file: filePath,
      layer: detectLayer(filePath),
      directory: getDirectoryKey(filePath)
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
      layer: detectLayer(filePath),
      directory: getDirectoryKey(filePath)
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

// ranking de camadas para o lint
function getLayerRank (layer: Layer): number {
  switch (layer) {
    case 'domain': return 0
    case 'data': return 1
    case 'infra': return 2
    case 'other': return 2
    case 'presentation': return 3
    case 'main': return 4
    default: return 2
  }
}

function isArchitectureViolation (link: GraphLink): boolean {
  if (link.kind !== 'imports') return false

  const sourceNode = nodes.get(link.source)
  const targetNode = nodes.get(link.target)
  if (!sourceNode || !targetNode) return false

  const sourceRank = getLayerRank(sourceNode.layer)
  const targetRank = getLayerRank(targetNode.layer)

  return sourceRank < targetRank
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

buildGraph()

links.forEach(link => {
  link.lintViolation = isArchitectureViolation(link)
})

function generateHtml (nodesList: GraphNode[], linksList: GraphLink[]): string {
  const data = { nodes: nodesList, links: linksList }
  const graphData = JSON.stringify(data)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Dependency Graph</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      background: #0d1117;
      color: #e6edf3;
    }
    #graph {
      width: 100vw;
      height: 100vh;
    }
    .legend {
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.6);
      padding: 10px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 20;
    }
    .legend div {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend .color {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      display: inline-block;
    }
    #search {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 20;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #333;
      background: #161b22;
      color: #e6edf3;
      font-size: 13px;
    }
    .layer-filter,
    .type-filter,
    .node-controls {
      position: fixed;
      background: rgba(0,0,0,0.6);
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 20;
    }
    .layer-filter {
      bottom: 10px;
      left: 10px;
    }
    .type-filter {
      bottom: 60px;
      left: 10px;
    }
    .layer-filter button,
    .type-filter button,
    .node-controls button {
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
    .type-filter button.active {
      background: #1f6feb;
      border-color: #388bfd;
    }
    .node-controls {
      bottom: 10px;
      right: 10px;
      max-width: 260px;
    }
    .node-controls button {
      display: block;
      width: 100%;
      text-align: left;
      margin-top: 4px;
    }
  </style>
  <script src="https://unpkg.com/cytoscape@3/dist/cytoscape.min.js"></script>
</head>
<body>
  <div class="legend">
    <div><span class="color" style="background:#4c8bf5"></span>Arquivo</div>
    <div><span class="color" style="background:#2fb344"></span>Classe</div>
    <div><span class="color" style="background:#f59f00"></span>Interface</div>
    <div>Vermelho: imports (dependências)</div>
    <div>Verde: declarações internas</div>
    <div>Tracejado: relação de declaração</div>
    <div style="margin-top:4px;">Borda vermelha: violação de arquitetura</div>
  </div>

  <input
    id="search"
    type="text"
    placeholder="Buscar nó (arquivo / classe / interface)..."
  />

  <div class="type-filter" id="type-filter"></div>
  <div class="layer-filter" id="layer-filter"></div>

  <div class="node-controls" id="node-controls">
    <div>Dica: clique em um nó para destacar dependências.</div>
    <div>Segure <strong>Alt</strong> e clique em um nó para ocultar/mostrar.</div>
    <button id="organize-nodes">Organizar nós</button>
    <button id="reset-hidden">Mostrar todos os nós</button>
    <button id="reset-filters">Limpar filtros</button>
    <button id="toggle-lint">Ocultar violações de arquitetura</button>
  </div>

  <div id="graph"></div>

  <script>
    (function () {
      const rawData = ${graphData};

      const width = window.innerWidth;
      const height = window.innerHeight;

      const nodeTypes = Array.from(new Set(rawData.nodes.map(n => n.type))).sort();
      const layers = Array.from(new Set(rawData.nodes.map(n => n.layer))).sort();

      const preferredLayerOrder = ['main', 'infra', 'data', 'domain', 'presentation', 'other'];
      const orderedLayers = preferredLayerOrder
        .filter(l => layers.includes(l))
        .concat(layers.filter(l => !preferredLayerOrder.includes(l)));

      // ----- Diretórios (containers compostos) -----
      function normalizeDirPath (dir) {
        if (!dir || dir === '') return '.';
        return dir;
      }

      const dirMap = new Map();
      function ensureDir (dirPath) {
        dirPath = normalizeDirPath(dirPath);
        if (dirMap.has(dirPath)) return dirMap.get(dirPath);

        let parentPath = null;
        if (dirPath !== '.') {
          const idx = dirPath.lastIndexOf('/');
          parentPath = idx > -1 ? dirPath.slice(0, idx) : '.';
          if (parentPath) ensureDir(parentPath);
        }

        const info = {
          id: 'dir:' + dirPath,
          path: dirPath,
          name: dirPath === '.' ? 'src' : dirPath.split('/').slice(-1)[0],
          parentPath
        };
        dirMap.set(dirPath, info);
        return info;
      }

      // Cria todos os diretórios necessários
      rawData.nodes.forEach(n => {
        ensureDir(n.directory);
      });

      const elements = [];

      // Containers de diretório:
      // - NÃO criamos container para '.' (src)
      // - Se o parentPath for '.', não setamos parent (top-level)
      Array.from(dirMap.values()).forEach(info => {
        if (info.path === '.') {
          // não cria quadrado para src
          return;
        }
        const data = {
          id: info.id,
          label: info.name,
          fullPath: info.path,
          dirContainer: true
        };
        if (info.parentPath && info.parentPath !== '.') {
          data.parent = 'dir:' + info.parentPath;
        }
        elements.push({ data });
      });

      // Nós reais (file/class/interface)
      rawData.nodes.forEach(n => {
        const dirKey = normalizeDirPath(n.directory);
        const data = {
          id: n.id,
          label: n.label,
          type: n.type,
          file: n.file,
          layer: n.layer,
          directory: dirKey
        };
        if (dirKey !== '.') {
          data.parent = 'dir:' + dirKey;
        }
        elements.push({
          data,
          position: { x: width / 2, y: height / 2 }
        });
      });

      // Arestas
      rawData.links.forEach((l, index) => {
        const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
        const targetId = typeof l.target === 'string' ? l.target : l.target.id;

        elements.push({
          data: {
            id: sourceId + '->' + targetId + ':' + l.kind + ':' + index,
            source: sourceId,
            target: targetId,
            kind: l.kind,
            lintViolation: Boolean(l.lintViolation)
          },
          classes: l.kind
        });
      });

      const cy = cytoscape({
        container: document.getElementById('graph'),
        elements: elements,
        layout: {
          name: 'preset',
          fit: true,
          padding: 40
        },
        wheelSensitivity: 0.2,
        style: [
          {
            selector: 'node[dirContainer]',
            style: {
              'shape': 'round-rectangle',
              'background-color': '#111827',
              'background-opacity': 0.26,
              'border-color': '#30363d',
              'border-width': 1,
              'padding': '16px',
              'label': 'data(label)',
              'font-size': 11,
              'color': '#9ca3af',
              'text-valign': 'top',
              'text-halign': 'left',
              'text-margin-y': -2,
              'text-margin-x': 6,
              'z-compound-depth': 'bottom'
            }
          },
          {
            selector: 'node[type]',
            style: {
              'shape': 'hexagon',
              'width': 90,
              'height': 40,
              'background-color': '#4c8bf5',
              'border-color': '#0d1117',
              'border-width': 1,
              'label': 'data(label)',
              'font-size': 8,
              'color': '#e6edf3',
              'text-wrap': 'wrap',
              'text-max-width': 80,
              'text-valign': 'center',
              'text-halign': 'center',
              'text-margin-x': 0,
              'text-outline-width': 0
            }
          },
          {
            selector: 'node[type = "file"]',
            style: { 'background-color': '#4c8bf5' }
          },
          {
            selector: 'node[type = "class"]',
            style: { 'background-color': '#2fb344' }
          },
          {
            selector: 'node[type = "interface"]',
            style: { 'background-color': '#f59f00' }
          },
          {
            selector: 'edge',
            style: {
              'width': 0.7,
              'line-color': '#30363d',
              'opacity': 0.18,
              'curve-style': 'bezier',
              'target-arrow-shape': 'none'
            }
          },
          {
            selector: 'edge[kind = "imports"]',
            style: {
              'line-color': '#30363d',
              'target-arrow-shape': 'triangle',
              'target-arrow-color': '#30363d'
            }
          },
          {
            selector: 'edge[kind = "declares"]',
            style: {
              'line-style': 'dotted'
            }
          },
          {
            selector: 'edge.highlight[kind = "imports"]',
            style: {
              'line-color': '#ff6b6b',
              'target-arrow-color': '#ff6b6b',
              'opacity': 0.95,
              'width': 1.4
            }
          },
          {
            selector: 'edge.highlight[kind = "declares"]',
            style: {
              'line-color': '#94d82d',
              'opacity': 0.95,
              'width': 1.4
            }
          },
          {
            selector: 'node.highlight',
            style: {
              'border-color': '#ffffff',
              'border-width': 1.4,
              'opacity': 1
            }
          },
          {
            selector: 'node.dimmed, node.layer-dimmed, node.type-dimmed',
            style: {
              'opacity': 0.18,
              'text-opacity': 0.18
            }
          },
          {
            selector: 'edge.dimmed, edge.layer-dimmed, edge.type-dimmed',
            style: {
              'opacity': 0.04
            }
          },
          {
            selector: 'node.hidden, edge.hidden',
            style: { 'display': 'none' }
          },
          {
            selector: 'edge.lint-violation',
            style: {
              'line-color': '#ff4d4f',
              'target-arrow-color': '#ff4d4f',
              'opacity': 0.95,
              'width': 1.6
            }
          }
        ]
      });

      const hiddenNodes = new Set();
      let lintEnabled = true;

      const inputSearch = document.getElementById('search');
      const layerFilterEl = document.getElementById('layer-filter');
      const typeFilterEl = document.getElementById('type-filter');
      const resetHiddenBtn = document.getElementById('reset-hidden');
      const resetFiltersBtn = document.getElementById('reset-filters');
      const toggleLintBtn = document.getElementById('toggle-lint');
      const organizeBtn = document.getElementById('organize-nodes');

      const activeLayers = new Set();
      const activeTypes = new Set();

      const typeLabels = { file: 'file', class: 'class', interface: 'interface' };

      // Layout: camadas (Y) x diretórios (X), com margem maior
      // Layout: camadas (Y) x diretórios (X), evitando sobreposição de containers irmãos
      function organizeByLayerAndType () {
        const verticalGapBetweenLayers = 200;  // distância entre faixas de layer
        const rowGap = 26;                     // distância entre linhas de nós
        const dirGapMargin = 140;              // margem extra entre diretórios irmãos
        const colGapWithinDir = 110;           // distância entre tipos dentro do mesmo diretório
        const leftMargin = 220;
        const topMargin = 80;

        let currentY = topMargin;

        cy.batch(() => {
          orderedLayers.forEach(layerName => {
            const nodesInLayer = cy.nodes('[type][layer = "' + layerName + '"]');
            if (!nodesInLayer.length) return;

            // Agrupa nós por diretório (mesmo nível = mesmo parent)
            const groupByDir = {};
            nodesInLayer.forEach(n => {
              const dir = n.data('directory') || '.';
              if (!groupByDir[dir]) {
                groupByDir[dir] = [];
              }
              groupByDir[dir].push(n);
            });

            const dirKeys = Object.keys(groupByDir).sort();
            if (!dirKeys.length) return;

            let maxRowsLayer = 1;
            let currentX = leftMargin;

            dirKeys.forEach(dirPath => {
              const dirNodes = groupByDir[dirPath];

              // Dentro do diretório, separa por tipo (file/class/interface)
              const groupByType = {};
              nodeTypes.forEach(t => { groupByType[t] = []; });
              dirNodes.forEach(n => {
                const t = n.data('type');
                if (!groupByType[t]) groupByType[t] = [];
                groupByType[t].push(n);
              });

              const activeTypesForDir = nodeTypes.filter(
                t => groupByType[t] && groupByType[t].length > 0
              );
              if (!activeTypesForDir.length) return;

              // Calcula quantas linhas esse diretório vai usar
              let maxRowsDir = 1;
              activeTypesForDir.forEach(type => {
                const colNodes = groupByType[type];
                if (colNodes.length > maxRowsDir) maxRowsDir = colNodes.length;
              });

              // Largura aproximada do diretório (para não colidir com o próximo)
              const dirWidth = Math.max(
                260, // largura mínima
                (activeTypesForDir.length - 1) * colGapWithinDir + 160 // + padding
              );

              // Posiciona os nós desse diretório dentro desse “bloco” horizontal
              activeTypesForDir.forEach((type, typeIndex) => {
                const colNodes = groupByType[type];
                const baseX = currentX + typeIndex * colGapWithinDir;

                colNodes.forEach((node, i) => {
                  const x = baseX;
                  const y = currentY + i * rowGap;
                  node.position({ x, y });
                });
              });

              if (maxRowsDir > maxRowsLayer) maxRowsLayer = maxRowsDir;

              // Avança o cursor horizontal para o próximo diretório irmão
              currentX += dirWidth + dirGapMargin;
            });

            // Avança o cursor vertical para a próxima camada (layer)
            currentY += maxRowsLayer * rowGap + verticalGapBetweenLayers;
          });
        });

        cy.fit(cy.nodes('[type]'), 60);
      }

      function applyLintStyles () {
        cy.edges().forEach(e => {
          const isViolation = !!e.data('lintViolation');
          if (isViolation && lintEnabled) {
            e.addClass('lint-violation');
          } else {
            e.removeClass('lint-violation');
          }
        });
      }
      applyLintStyles();

      function updateVisibility () {
        cy.nodes('[type]').forEach(n => {
          const id = n.id();
          if (hiddenNodes.has(id)) {
            n.addClass('hidden');
          } else {
            n.removeClass('hidden');
          }
        });

        cy.edges().forEach(e => {
          const sourceHidden = hiddenNodes.has(e.data('source'));
          const targetHidden = hiddenNodes.has(e.data('target'));
          if (sourceHidden || targetHidden) {
            e.addClass('hidden');
          } else {
            e.removeClass('hidden');
          }
        });
      }

      function toggleNodeVisibility (node) {
        const id = node.id();
        if (hiddenNodes.has(id)) {
          hiddenNodes.delete(id);
        } else {
          hiddenNodes.add(id);
        }
        updateVisibility();
      }

      // Filtro por camada
      if (layerFilterEl && orderedLayers.length) {
        orderedLayers.forEach(layer => {
          const btn = document.createElement('button');
          btn.textContent = layer;
          btn.addEventListener('click', () => {
            if (activeLayers.has(layer)) {
              activeLayers.delete(layer);
              btn.classList.remove('active');
            } else {
              activeLayers.add(layer);
              btn.classList.add('active');
            }
            applyLayerFilter();
          });
          layerFilterEl.appendChild(btn);
        });
      }

      function applyLayerFilter () {
        if (!activeLayers.size) {
          cy.nodes('[type]').removeClass('layer-dimmed');
          cy.edges().removeClass('layer-dimmed');
          return;
        }

        cy.nodes('[type]').forEach(n => {
          const nodeLayer = n.data('layer');
          if (activeLayers.has(nodeLayer)) {
            n.removeClass('layer-dimmed');
          } else {
            n.addClass('layer-dimmed');
          }
        });

        cy.edges().forEach(e => {
          const src = cy.getElementById(e.data('source'));
          const tgt = cy.getElementById(e.data('target'));
          const sLayer = src.data('layer');
          const tLayer = tgt.data('layer');

          if (activeLayers.has(sLayer) || activeLayers.has(tLayer)) {
            e.removeClass('layer-dimmed');
          } else {
            e.addClass('layer-dimmed');
          }
        });
      }

      // Filtro por tipo
      if (typeFilterEl && nodeTypes.length) {
        nodeTypes.forEach(type => {
          const btn = document.createElement('button');
          btn.textContent = typeLabels[type] || type;
          btn.addEventListener('click', () => {
            if (activeTypes.has(type)) {
              activeTypes.delete(type);
              btn.classList.remove('active');
            } else {
              activeTypes.add(type);
              btn.classList.add('active');
            }
            applyTypeFilter();
          });
          typeFilterEl.appendChild(btn);
        });
      }

      function applyTypeFilter () {
        if (!activeTypes.size) {
          cy.nodes('[type]').removeClass('type-dimmed');
          cy.edges().removeClass('type-dimmed');
          return;
        }

        cy.nodes('[type]').forEach(n => {
          const nodeType = n.data('type');
          if (activeTypes.has(nodeType)) {
            n.removeClass('type-dimmed');
          } else {
            n.addClass('type-dimmed');
          }
        });

        cy.edges().forEach(e => {
          const src = cy.getElementById(e.data('source'));
          const tgt = cy.getElementById(e.data('target'));
          const sType = src.data('type');
          const tType = tgt.data('type');

          if (activeTypes.has(sType) || activeTypes.has(tType)) {
            e.removeClass('type-dimmed');
          } else {
            e.addClass('type-dimmed');
          }
        });
      }

      // Busca
      if (inputSearch) {
        inputSearch.addEventListener('input', () => {
          const term = inputSearch.value.toLowerCase().trim();

          cy.nodes('[type]').removeClass('dimmed');
          cy.edges().removeClass('dimmed');

          if (!term) return;

          const matchedNodes = cy.nodes('[type]').filter(n =>
            String(n.data('label') || '').toLowerCase().includes(term)
          );

          const matchedIds = new Set();
          matchedNodes.forEach(n => matchedIds.add(n.id()));

          cy.nodes('[type]').forEach(n => {
            if (!matchedIds.has(n.id())) {
              n.addClass('dimmed');
            }
          });

          cy.edges().forEach(e => {
            const sId = e.data('source');
            const tId = e.data('target');
            if (!matchedIds.has(sId) && !matchedIds.has(tId)) {
              e.addClass('dimmed');
            }
          });
        });
      }

      if (resetHiddenBtn) {
        resetHiddenBtn.addEventListener('click', () => {
          hiddenNodes.clear();
          updateVisibility();
        });
      }

      if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
          if (inputSearch) inputSearch.value = '';

          cy.nodes('[type]').removeClass('dimmed layer-dimmed type-dimmed highlight');
          cy.edges().removeClass('dimmed layer-dimmed type-dimmed highlight');

          activeLayers.clear();
          if (layerFilterEl) {
            Array.from(layerFilterEl.querySelectorAll('button')).forEach(btn => {
              btn.classList.remove('active');
            });
          }
          applyLayerFilter();

          activeTypes.clear();
          if (typeFilterEl) {
            Array.from(typeFilterEl.querySelectorAll('button')).forEach(btn => {
              btn.classList.remove('active');
            });
          }
          applyTypeFilter();
        });
      }

      if (toggleLintBtn) {
        toggleLintBtn.addEventListener('click', () => {
          lintEnabled = !lintEnabled;
          applyLintStyles();
          toggleLintBtn.textContent = lintEnabled
            ? 'Ocultar violações de arquitetura'
            : 'Mostrar violações de arquitetura';
        });
      }

      if (organizeBtn) {
        organizeBtn.addEventListener('click', () => {
          organizeByLayerAndType();
        });
      }

      function highlightDependencies (node) {
        if (!node.data('type')) return;

        cy.nodes('[type]').removeClass('highlight dimmed');
        cy.edges().removeClass('highlight dimmed');

        const neighborhood = node.closedNeighborhood();
        neighborhood.addClass('highlight');

        const others = cy.elements().difference(neighborhood);
        others.addClass('dimmed');
      }

      cy.on('tap', 'node', (evt) => {
        const node = evt.target;
        const original = evt.originalEvent || {};

        if (!node.data('type')) {
          if (original.altKey) toggleNodeVisibility(node);
          return;
        }

        if (original.altKey) {
          toggleNodeVisibility(node);
          return;
        }

        highlightDependencies(node);
      });

      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          cy.nodes('[type]').removeClass('highlight dimmed');
          cy.edges().removeClass('highlight dimmed');
        }
      });

      organizeByLayerAndType();
    })();
  </script>
</body>
</html>`
}

const nodesList = Array.from(nodes.values())
const linksList = links.map(link => ({ ...link }))

fs.writeFileSync(outputFile, generateHtml(nodesList, linksList), 'utf-8')
console.log(`Dependency graph generated at ${path.relative(projectRoot, outputFile)}`)
