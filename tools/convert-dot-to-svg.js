#!/usr/bin/env node
const { stdin, stdout, stderr, exit } = process;
const Viz = require('viz.js');
const { Module, render } = require('viz.js/full.render.js');

let dotInput = '';

stdin.setEncoding('utf8');
stdin.on('data', (chunk) => {
  dotInput += chunk;
});

stdin.on('end', async () => {
  if (!dotInput.trim()) {
    stderr.write('No DOT input received. Make sure depcruise emitted data.\n');
    exit(1);
    return;
  }

  const viz = new Viz({ Module, render });
  try {
    const svg = await viz.renderString(dotInput);
    stdout.write(svg);
  } catch (error) {
    stderr.write(`Failed to convert DOT to SVG: ${error.message}\n`);
    exit(1);
  }
});
