/**
 * Dependency-cruiser configuration.
 * See https://github.com/sverweij/dependency-cruiser/blob/main/doc/configuration.md
 */
module.exports = {
  extends: 'dependency-cruiser/configs/recommended-strict',
  options: {
    includeOnly: ['^src'],
    doNotFollow: {
      path: 'node_modules',
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
