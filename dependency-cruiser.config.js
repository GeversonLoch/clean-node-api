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
    enhancedResolveOptions: {
      alias: {
        '^@domain/(.*)': 'src/domain/$1',
        '^@data/(.*)': 'src/data/$1',
        '^@infrastructure/(.*)': 'src/infrastructure/$1',
        '^@presentation/(.*)': 'src/presentation/$1',
        '^@utils/(.*)': 'src/utils/$1',
        '^@main/(.*)': 'src/main/$1',
      },
    },
    reporterOptions: {
      dot: {
        collapsePattern: '^(domain|data|infrastructure|presentation|utils|main)\\/',
      },
    },
  },
};
