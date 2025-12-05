#!/usr/bin/env node
const { stdin, stdout, stderr, exit } = process;
const Viz = require('viz.js');
const { Module, render } = require('viz.js/full.render.js');

function isIndexModule(source) {
  return /(?:^|[\\/])index\.ts$/.test(source);
}

function isSourceModule(source) {
  return /^src\//.test(source);
}

function isTestModule(source) {
  return /\.(spec|test)\.ts$/.test(source);
}

function resolveNonIndexTargets(moduleBySource, start) {
  const stack = [start];
  const visited = new Set();
  const resolved = new Set();

  while (stack.length) {
    const current = stack.pop();
    if (visited.has(current)) continue;
    visited.add(current);

    const module = moduleBySource.get(current);
    if (!module) continue;

    (module.dependencies || []).forEach((dep) => {
      const target = dep.resolved || dep.module;
      if (!target || !isSourceModule(target) || isTestModule(target)) return;

      if (isIndexModule(target)) {
        stack.push(target);
      } else {
        resolved.add(target);
      }
    });
  }

  return [...resolved];
}

function buildGraph(cruiseOutput) {
  const moduleBySource = new Map(
    (cruiseOutput.modules || []).map((mod) => [mod.source, mod]),
  );
  const nodes = new Set();
  const edges = [];

  (cruiseOutput.modules || []).forEach((mod) => {
    if (isIndexModule(mod.source) || isTestModule(mod.source) || !isSourceModule(mod.source)) return;
    nodes.add(mod.source);

    (mod.dependencies || []).forEach((dep) => {
      const target = dep.resolved || dep.module;
      if (!target || !isSourceModule(target) || isTestModule(target)) return;

      if (isIndexModule(target)) {
        const forwardedTargets = resolveNonIndexTargets(moduleBySource, target);
        if (forwardedTargets.length === 0) return;

        forwardedTargets.forEach((resolvedTarget) => {
          nodes.add(resolvedTarget);
          edges.push([mod.source, resolvedTarget]);
        });
      } else {
        nodes.add(target);
        edges.push([mod.source, target]);
      }
    });
  });

  return { nodes: [...nodes], edges };
}

function groupNodesByTopLevel(nodes) {
  const groups = new Map();

  nodes.forEach((node) => {
    const relativePath = node.replace(/^src\//, '');
    const [topLevel = 'src'] = relativePath.split('/');
    if (!groups.has(topLevel)) groups.set(topLevel, []);
    groups.get(topLevel).push(node);
  });

  return groups;
}

function buildDot(graph) {
  const lines = [
    'digraph dependencies {',
    '  graph [rankdir=LR, splines=ortho, nodesep=0.6, ranksep=1.0, concentrate=true, fontsize=10];',
    '  node [shape=box, style="rounded,filled", fillcolor="#f8f9fb", color="#c0cad5", fontname="Inter,Helvetica,Arial,sans-serif", fontsize=10];',
    '  edge [color="#8194b1", arrowsize=0.7, penwidth=0.9];',
  ];

  const groups = groupNodesByTopLevel(graph.nodes);
  groups.forEach((nodes, groupName) => {
    lines.push(`  subgraph "cluster_${groupName}" {`);
    lines.push('    style=rounded;');
    lines.push('    color="#d5ddea";');
    lines.push(`    label="${groupName}";`);
    lines.push('    fontname="Inter,Helvetica,Arial,sans-serif";');
    lines.push('    fontsize=11;');

    nodes.forEach((node) => {
      const label = node.replace(/^src\//, '');
      lines.push(`    "${node}" [label="${label}"];`);
    });

    lines.push('  }');
  });

  graph.edges.forEach(([from, to]) => {
    lines.push(`  "${from}" -> "${to}";`);
  });

  lines.push('}');
  return lines.join('\n');
}

function addInteractivity(svg) {
  const style = `
  <style>
    g.node { cursor: pointer; }
    g.node polygon, g.node path, g.node rect { transition: fill 120ms ease, stroke 120ms ease, opacity 120ms ease; }
    g.node text { transition: fill 120ms ease, opacity 120ms ease; }
    g.edge path { transition: stroke 120ms ease, opacity 120ms ease; }
    g.edge polygon { transition: fill 120ms ease, stroke 120ms ease, opacity 120ms ease; }
    g.node.dim polygon, g.node.dim path, g.node.dim rect, g.node.dim text { opacity: 0.25; }
    g.edge.dim path, g.edge.dim polygon { opacity: 0.25; }
    g.node.active rect, g.node.active polygon, g.node.active path { fill: #fff5e6; stroke: #f6a12a; }
    g.node.active text { fill: #6b3b00; }
    g.node.connected rect, g.node.connected polygon, g.node.connected path { fill: #e9f2ff; stroke: #6b9ce8; }
    g.node.connected text { fill: #1b4f9d; }
    g.edge.active path, g.edge.active polygon { stroke: #f6a12a; fill: #f6a12a; opacity: 0.95; }
  </style>`;

  const script = `
  <script><![CDATA[
    (function attachHoverHighlight() {
      const svg = document.currentScript && document.currentScript.ownerSVGElement;
      if (!svg) return;

      const nodes = Array.from(svg.querySelectorAll('g.node'));
      const edges = Array.from(svg.querySelectorAll('g.edge'));
      const nodeById = new Map();
      const adjacency = new Map();

      function ensureSet(map, key) {
        if (!map.has(key)) map.set(key, new Set());
        return map.get(key);
      }

      nodes.forEach((node) => {
        const title = node.querySelector('title');
        const id = title ? title.textContent.trim() : '';
        if (!id) return;
        node.dataset.nodeId = id;
        node.setAttribute('tabindex', '0');
        nodeById.set(id, node);
      });

      edges.forEach((edge) => {
        const title = edge.querySelector('title');
        if (!title) return;
        const [from, to] = title.textContent.split('->').map((part) => part.trim());
        if (!from || !to) return;
        edge.dataset.from = from;
        edge.dataset.to = to;
        ensureSet(adjacency, from).add(to);
        ensureSet(adjacency, to).add(from);
      });

      function clearHighlight() {
        nodes.forEach((node) => node.classList.remove('active', 'connected', 'dim'));
        edges.forEach((edge) => edge.classList.remove('active', 'dim'));
      }

      function highlight(nodeId) {
        clearHighlight();
        nodes.forEach((node) => node.classList.add('dim'));
        edges.forEach((edge) => edge.classList.add('dim'));

        const origin = nodeById.get(nodeId);
        if (origin) {
          origin.classList.remove('dim');
          origin.classList.add('active');
        }

        const neighbors = adjacency.get(nodeId) || new Set();
        neighbors.forEach((neighborId) => {
          const neighborNode = nodeById.get(neighborId);
          if (neighborNode) {
            neighborNode.classList.remove('dim');
            neighborNode.classList.add('connected');
          }
        });

        edges.forEach((edge) => {
          const from = edge.dataset.from;
          const to = edge.dataset.to;
          if (from === nodeId || to === nodeId) {
            edge.classList.remove('dim');
            edge.classList.add('active');
          }
        });
      }

      nodes.forEach((node) => {
        const id = node.dataset.nodeId;
        if (!id) return;
        node.addEventListener('mouseenter', () => highlight(id));
        node.addEventListener('mouseleave', clearHighlight);
        node.addEventListener('focus', () => highlight(id));
        node.addEventListener('blur', clearHighlight);
      });
    })();
  ]]></script>`;

  return svg.replace('</svg>', `${style}\n${script}\n</svg>`);
}

let rawInput = '';
stdin.setEncoding('utf8');
stdin.on('data', (chunk) => {
  rawInput += chunk;
});

stdin.on('end', async () => {
  if (!rawInput.trim()) {
    stderr.write('No input received. Make sure depcruise emitted data.\n');
    exit(1);
    return;
  }

  let cruiseOutput;
  try {
    cruiseOutput = JSON.parse(rawInput);
  } catch (error) {
    stderr.write(
      'Failed to parse depcruise JSON output. Ensure you run with --output-type json.\n',
    );
    exit(1);
    return;
  }

  const graph = buildGraph(cruiseOutput);
  if (graph.edges.length === 0) {
    stderr.write('No dependencies found after filtering barrel index.ts files.\n');
    exit(1);
    return;
  }

  const viz = new Viz({ Module, render });
  try {
    const svg = await viz.renderString(buildDot(graph));
    stdout.write(addInteractivity(svg));
  } catch (error) {
    stderr.write(`Failed to convert DOT to SVG: ${error.message}\n`);
    exit(1);
  }
});
