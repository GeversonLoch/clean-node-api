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
  defaultImport?: string
  namespaceImport?: string
  namedImports: { imported: string }[]
}

type Layer = 'presentation' | 'domain' | 'data' | 'infra' | 'main' | 'other'

interface GraphNode {
  id: string
  label: string
  type: 'file' | 'class' | 'interface'
  layer: Layer
  directory: string
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
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      background: #0d1117;
      color: #e6edf3;
      overflow: hidden;
      user-select: none;
    }
    #graph {
      width: 100vw;
      height: 100vh;
      cursor: grab;
    }
    #graph:active {
      cursor: grabbing;
    }
    body.ctrl-active #graph {
      cursor: default;
    }
    body.ctrl-active #graph .cy-node {
      cursor: move;
    }
    .legend {
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(22, 27, 34, 0.95);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #30363d;
      font-size: 13px;
      z-index: 20;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .legend div {
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .legend .color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      display: inline-block;
    }
    .legend .key-hint {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #30363d;
      font-size: 11px;
      color: #8b949e;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .kbd {
      background: #30363d;
      padding: 2px 6px;
      border-radius: 4px;
      color: #e6edf3;
      font-family: monospace;
      border: 1px solid #6e7681;
    }
    .controls-container {
        position: fixed;
        bottom: 20px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 20;
    }
    .filter-group {
      background: rgba(22, 27, 34, 0.95);
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #30363d;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .filter-group button {
      margin: 2px;
      padding: 4px 8px;
      background: #21262d;
      border: 1px solid #30363d;
      color: #c9d1d9;
      border-radius: 6px;
      cursor: pointer;
      font-size: 11px;
      transition: all 0.2s;
    }
    .filter-group button:hover {
        background: #30363d;
    }
    .filter-group button.active {
      background: #1f6feb;
      border-color: #388bfd;
      color: white;
    }
    #search {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 20;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #30363d;
      background: rgba(22, 27, 34, 0.95);
      color: #e6edf3;
      font-size: 13px;
      width: 250px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    #search:focus {
        outline: none;
        border-color: #58a6ff;
    }
    #reset-filters {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 8px 16px;
        background: #238636;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        z-index: 20;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }

    .nav-panel {
      position: fixed;
      bottom: 70px; /* Acima do botão reset */
      right: 20px;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .d-pad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 4px;
      background: rgba(22, 27, 34, 0.95);
      padding: 6px;
      border-radius: 50%; /* Formato redondo geral */
      border: 1px solid #30363d;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }

    .zoom-group {
      display: flex;
      flex-direction: column;
      background: rgba(22, 27, 34, 0.95);
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #30363d;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }

    .nav-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: #21262d;
      color: #e6edf3;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
      transition: background 0.2s;
    }

    .nav-btn:hover { background: #30363d; color: #58a6ff; }
    .nav-btn:active { background: #1f6feb; color: #fff; }

    #nav-up { grid-column: 2; grid-row: 1; }
    #nav-left { grid-column: 1; grid-row: 2; }
    #nav-fit { grid-column: 2; grid-row: 2; font-size: 12px; }
    #nav-right { grid-column: 3; grid-row: 2; }
    #nav-down { grid-column: 2; grid-row: 3; }

    .zoom-group .nav-btn {
      border-radius: 0;
      width: 36px;
      height: 36px;
      border-bottom: 1px solid #30363d;
    }
    .zoom-group .nav-btn:last-child { border-bottom: none; }
  </style>
  <script src="https://unpkg.com/cytoscape@3/dist/cytoscape.min.js"></script>
  <script src="https://unpkg.com/dagre@0.8.5/dist/dagre.min.js"></script>
  <script src="https://unpkg.com/cytoscape-dagre@2.5.0/cytoscape-dagre.js"></script>
</head>
<body>
  <div class="legend">
    <div style="font-weight:bold; margin-bottom:10px; color:#fff">Legenda</div>
    <div><span class="color" style="background:#4c8bf5"></span>Arquivo</div>
    <div><span class="color" style="background:#2fb344"></span>Classe</div>
    <div><span class="color" style="background:#f59f00"></span>Interface</div>
    <div><span class="color" style="background:transparent; border: 1px dashed #9ca3af"></span>Diretório</div>
    <div style="font-size:11px; color:#8b949e; margin-top:8px">Linha Sólida: Import</div>
    <div style="font-size:11px; color:#8b949e">Linha Pontilhada: Declaração</div>
    <div class="key-hint">
      <span class="kbd">Ctrl</span> + Arrastar para mover nós
    </div>
  </div>

  <input id="search" type="text" placeholder="Buscar nó (arquivo / classe)..." />

  <div class="controls-container">
      <div class="filter-group" id="type-filter">
          <div style="margin-bottom:5px; font-size:11px; font-weight:bold; color:#8b949e">FILTRAR TIPO</div>
      </div>
      <div class="filter-group" id="layer-filter">
          <div style="margin-bottom:5px; font-size:11px; font-weight:bold; color:#8b949e">FILTRAR CAMADA</div>
      </div>
  </div>

  <div class="nav-panel">
    <div class="d-pad">
      <button id="nav-up" class="nav-btn" title="Mover Cima">▴</button>
      <button id="nav-left" class="nav-btn" title="Mover Esquerda">◂</button>
      <button id="nav-fit" class="nav-btn" title="Centralizar">◎</button>
      <button id="nav-right" class="nav-btn" title="Mover Direita">▸</button>
      <button id="nav-down" class="nav-btn" title="Mover Baixo">▾</button>
    </div>

    <div class="zoom-group">
      <button id="nav-zoom-in" class="nav-btn" title="Zoom In">+</button>
      <button id="nav-zoom-out" class="nav-btn" title="Zoom Out">-</button>
    </div>
  </div>

  <button id="reset-filters">Resetar Visualização</button>

  <div id="graph"></div>

  <script>
    (function () {
      const rawData = ${graphData};
      const nodeTypes = Array.from(new Set(rawData.nodes.map(n => n.type))).sort();
      const layers = Array.from(new Set(rawData.nodes.map(n => n.layer))).sort();
      const preferredLayerOrder = ['main', 'infra', 'data', 'domain', 'presentation', 'other'];
      const orderedLayers = preferredLayerOrder
        .filter(l => layers.includes(l))
        .concat(layers.filter(l => !preferredLayerOrder.includes(l)));

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

      rawData.nodes.forEach(n => { ensureDir(n.directory); });

      const elements = [];

      Array.from(dirMap.values()).forEach(info => {
        if (info.path === '.') return;
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

      rawData.nodes.forEach(n => {
        const dirKey = normalizeDirPath(n.directory);
        const data = {
          id: n.id,
          label: n.label,
          type: n.type,
          layer: n.layer,
          directory: dirKey
        };
        if (dirKey !== '.') {
          data.parent = 'dir:' + dirKey;
        }
        elements.push({ data });
      });

      rawData.links.forEach((l, index) => {
        const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
        const targetId = typeof l.target === 'string' ? l.target : l.target.id;
        elements.push({
          data: {
            id: sourceId + '->' + targetId + ':' + l.kind + ':' + index,
            source: sourceId,
            target: targetId,
            kind: l.kind
          },
          classes: l.kind
        });
      });

      const cy = cytoscape({
        container: document.getElementById('graph'),
        elements: elements,
        autoungrabify: true,
        boxSelectionEnabled: false,
        layout: {
          name: 'dagre',
          rankDir: 'TB',
          ranker: 'network-simplex',
          nodeDimensionsIncludeLabels: true,
          padding: 30,
          spacingFactor: 1.0,
          rankSep: 80,
          nodeSep: 30,
          edgeSep: 10,
          animate: true,
          animationDuration: 500
        },

        wheelSensitivity: 1.0,
        minZoom: 0.05,
        maxZoom: 5,

        style: [
          {
            selector: 'node[dirContainer]',
            style: {
              'shape': 'round-rectangle',
              'background-color': '#161b22',
              'background-opacity': 0.4,
              'border-color': '#30363d',
              'border-width': 1,
              'border-style': 'dashed',
              'padding': '12px',
              'label': 'data(label)',
              'font-size': 14,
              'font-weight': 'bold',
              'color': '#8b949e',
              'text-valign': 'top',
              'text-halign': 'center',
              'text-margin-y': -8,
            }
          },
          {
            selector: 'node[type]',
            style: {
              'shape': 'round-rectangle',
              'width': 'label',
              'height': 'label',
              'padding': '8px',
              'border-color': 'rgba(255,255,255,0.1)',
              'border-width': 1,
              'label': 'data(label)',
              'font-size': 10,
              'font-family': 'Consolas, monospace',
              'color': '#e6edf3',
              'text-valign': 'center',
              'text-halign': 'center',
              'text-wrap': 'wrap',
              'text-max-width': 120
            }
          },
          {
            selector: 'node[type = "file"]',
            style: { 
                'background-color': '#1f2937',
                'border-left-color': '#4c8bf5',
                'border-left-width': 4
            }
          },
          {
            selector: 'node[type = "class"]',
            style: { 
                'background-color': '#1f2937',
                'border-left-color': '#2fb344',
                'border-left-width': 4
            }
          },
          {
            selector: 'node[type = "interface"]',
            style: { 
                'background-color': '#1f2937',
                'border-left-color': '#f59f00',
                'border-left-width': 4
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 1,
              'line-color': '#30363d',
              'opacity': 0.4,
              'curve-style': 'taxi',
              'taxi-direction': 'vertical',
              'target-arrow-shape': 'none'
            }
          },
          {
            selector: 'edge[kind = "imports"]',
            style: {
              'target-arrow-shape': 'triangle',
              'target-arrow-color': '#30363d'
            }
          },
          {
            selector: 'edge[kind = "declares"]',
            style: {
              'line-style': 'dashed',
              'width': 1
            }
          },
          {
            selector: '.highlight',
            style: {
              'border-color': '#fff',
              'border-width': 2,
              'opacity': 1,
              'z-index': 999
            }
          },
          {
             selector: 'edge.highlight',
             style: {
                 'line-color': '#58a6ff',
                 'target-arrow-color': '#58a6ff',
                 'width': 2,
                 'opacity': 1
             }
          },
          {
            selector: '.dimmed',
            style: {
              'opacity': 0.1,
              'z-index': 1
            }
          }
        ]
      });

      cy.nodes().pannable(true);

      const handleKeyDown = (e) => {
        if (e.key === 'Control') {
          cy.autoungrabify(false);
          cy.nodes().pannable(false);
          document.body.classList.add('ctrl-active');
        }
      };

      const handleKeyUp = (e) => {
        if (e.key === 'Control') {
          cy.autoungrabify(true);
          cy.nodes().pannable(true);
          document.body.classList.remove('ctrl-active');
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);

      const activeLayers = new Set();
      const activeTypes = new Set();
      const typeLabels = { file: 'File', class: 'Class', interface: 'Interface' };

      function createFilterButtons(containerId, items, activeSet, labelMap, callback) {
          const container = document.getElementById(containerId);
          if(!container) return;
          items.forEach(item => {
              const btn = document.createElement('button');
              btn.textContent = labelMap ? (labelMap[item] || item) : item;
              btn.onclick = () => {
                  if(activeSet.has(item)) {
                      activeSet.delete(item);
                      btn.classList.remove('active');
                  } else {
                      activeSet.add(item);
                      btn.classList.add('active');
                  }
                  callback();
              };
              container.appendChild(btn);
          });
      }

      function updateVisibility() {
          const nodes = cy.nodes('[type]');
          const edges = cy.edges();

          cy.batch(() => {
              nodes.removeClass('dimmed');
              edges.removeClass('dimmed');

              const hasLayerFilter = activeLayers.size > 0;
              const hasTypeFilter = activeTypes.size > 0;

              if (!hasLayerFilter && !hasTypeFilter) return;

              nodes.forEach(n => {
                  const layerMatch = !hasLayerFilter || activeLayers.has(n.data('layer'));
                  const typeMatch = !hasTypeFilter || activeTypes.has(n.data('type'));

                  if (!layerMatch || !typeMatch) {
                      n.addClass('dimmed');
                  }
              });

              edges.forEach(e => {
                  const src = e.source();
                  const tgt = e.target();
                  if (src.hasClass('dimmed') || tgt.hasClass('dimmed')) {
                      e.addClass('dimmed');
                  }
              });
          });
      }

      if (orderedLayers.length) createFilterButtons('layer-filter', orderedLayers, activeLayers, null, updateVisibility);
      if (nodeTypes.length) createFilterButtons('type-filter', nodeTypes, activeTypes, typeLabels, updateVisibility);

      const searchInput = document.getElementById('search');
      searchInput.addEventListener('input', (e) => {
          const term = e.target.value.toLowerCase();
          cy.batch(() => {
              if (!term) {
                  cy.elements().removeClass('dimmed highlight');
                  updateVisibility();
                  return;
              }

              const matches = cy.nodes('[type]').filter(n => n.data('label').toLowerCase().includes(term));
              const neighborhood = matches.neighborhood().add(matches);

              cy.elements().addClass('dimmed').removeClass('highlight');
              neighborhood.removeClass('dimmed').addClass('highlight');
              matches.parents().removeClass('dimmed'); 
          });
      });

      document.getElementById('reset-filters').addEventListener('click', () => {
          activeLayers.clear();
          activeTypes.clear();
          document.querySelectorAll('.filter-group button').forEach(b => b.classList.remove('active'));
          searchInput.value = '';
          cy.elements().removeClass('dimmed highlight');
          cy.fit(); // Ajuste para usar fit() ao invés de rodar layout novamente
      });

      const panStep = 100;

      document.getElementById('nav-up').addEventListener('click', () => {
        cy.panBy({ x: 0, y: panStep }); // Move o grafo para baixo (vista sobe)
      });
      document.getElementById('nav-down').addEventListener('click', () => {
        cy.panBy({ x: 0, y: -panStep }); // Move o grafo para cima (vista desce)
      });
      document.getElementById('nav-left').addEventListener('click', () => {
        cy.panBy({ x: panStep, y: 0 }); // Move o grafo para direita (vista vai p/ esq)
      });
      document.getElementById('nav-right').addEventListener('click', () => {
        cy.panBy({ x: -panStep, y: 0 }); // Move o grafo para esquerda (vista vai p/ dir)
      });

      document.getElementById('nav-fit').addEventListener('click', () => {
        cy.fit(undefined, 30);
      });

      document.getElementById('nav-zoom-in').addEventListener('click', () => {
        const zoom = cy.zoom();
        cy.zoom({
          level: zoom * 1.2,
          renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
        });
      });

      document.getElementById('nav-zoom-out').addEventListener('click', () => {
        const zoom = cy.zoom();
        cy.zoom({
          level: zoom / 1.2,
          renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
        });
      });

      cy.on('tap', 'node[type]', (evt) => {
          const node = evt.target;
          cy.batch(() => {
            cy.elements().addClass('dimmed').removeClass('highlight');
            const neighborhood = node.closedNeighborhood();
            neighborhood.removeClass('dimmed').addClass('highlight');
            neighborhood.parents().removeClass('dimmed');
          });
      });

      cy.on('tap', (evt) => {
          if (evt.target === cy) {
              cy.elements().removeClass('dimmed highlight');
              updateVisibility();
          }
      });

    })();
  </script>
</body>
</html>`
}

const nodesList = Array.from(nodes.values())
const linksList = links.map(link => ({ ...link }))

fs.writeFileSync(outputFile, generateHtml(nodesList, linksList), 'utf-8')
console.log(`Dependency graph generated at ${path.relative(projectRoot, outputFile)}`)
