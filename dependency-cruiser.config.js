/**
 * Dependency-cruiser configuration.
 * See https://github.com/sverweij/dependency-cruiser/blob/main/doc/configuration.md
 */
const path = require('path');

module.exports = {
  extends: 'dependency-cruiser/configs/recommended-strict',
  options: {
    includeOnly: ['^src'],
    doNotFollow: {
      path: 'node_modules',
    },
    enhancedResolveOptions: {
      alias: {
        '@domain': path.resolve(__dirname, 'src/domain'),
        '@data': path.resolve(__dirname, 'src/data'),
        '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
        '@presentation': path.resolve(__dirname, 'src/presentation'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@main': path.resolve(__dirname, 'src/main'),
      },
    },
    tsConfig: {
      fileName: './tsconfig.json',
    },
    reporterOptions: {
      dot: {
        collapsePattern: '^(domain|data|infrastructure|presentation|utils|main)\\/',
      },
    },
  },
};
