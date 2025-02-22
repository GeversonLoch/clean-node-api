export default {
  // Todos os módulos importados em seus testes devem ser simulados automaticamente
  // automock: false,

  // Pare de executar testes após falhas `n`
  // bail: 0,

  // O diretório onde Jest deve armazenar suas informações de dependência em cache
  // cacheDirectory: "C:\\Users\\GeversonLencarLoch\\AppData\\Local\\Temp\\jest",

  // Limpe automaticamente chamadas simuladas, instâncias, contextos e resultados antes de cada teste
  clearMocks: true,

  // Indica se as informações de cobertura devem ser coletadas durante a execução do teste
  collectCoverage: true,

  // Uma matriz de padrões glob indicando um conjunto de arquivos para os quais as informações de cobertura devem ser coletadas
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],

  // O diretório onde o Jest deve gerar seus arquivos de cobertura
  coverageDirectory: 'coverage',

  // Uma matriz de strings de padrão regexp usadas para pular a coleta de cobertura
  coveragePathIgnorePatterns: [
    "index\\.ts$" // Ignora esses arquivos nos relatórios de coverage
  ],

  // Indica qual provedor deve ser usado para instrumentar o código para cobertura
  // coverageProvider: 'v8'

  // Uma lista de nomes de repórteres que Jest usa ao escrever relatórios de cobertura
  // coverageReporters: [
  //   "json",
  //   "text",
  //   "lcov",
  //   "clover"
  // ],

  // Um objeto que configura a imposição de limite mínimo para resultados de cobertura
  // coverageThreshold: undefined,

  // Um caminho para um extrator de dependência personalizado
  // dependencyExtractor: undefined,

  // Fazer chamadas de APIs obsoletas lançarem mensagens de erro úteis
  // errorOnDeprecated: false,

  // A configuração padrão para temporizadores falsos
  // fakeTimers: {
  //   "enableGlobally": false
  // },

  // Força a coleta de cobertura de arquivos ignorados usando uma matriz de padrões glob
  // forceCoverageMatch: [],

  // Um caminho para um módulo que exporta uma função assíncrona que é acionada uma vez antes de todos os conjuntos de teste
  // globalSetup: undefined,

  // Um caminho para um módulo que exporta uma função assíncrona que é acionada uma vez após todos os conjuntos de testes
  // globalTeardown: undefined,

  // Um conjunto de variáveis globais que precisam estar disponíveis em todos os ambientes de teste
  // globals: {},

  // A quantidade máxima de trabalhadores usados para executar seus testes. Pode ser especificado como % ou um número.
  // Por exemplo. maxWorkers: 10% usará 10% da quantidade de CPU + 1 como o número máximo de trabalhadores.
  // maxWorkers: 2 usará no máximo 2 trabalhadores.
  // maxWorkers: "50%",

  // Uma matriz de nomes de diretórios a serem pesquisados recursivamente a partir do local do módulo requerido
  // moduleDirectories: [
  //   "node_modules"
  // ],

  // Uma matriz de extensões de arquivo que seus módulos usam
  // moduleFileExtensions: [
  //   "js",
  //   "mjs",
  //   "cjs",
  //   "jsx",
  //   "ts",
  //   "tsx",
  //   "json",
  //   "node"
  // ],

  // Um mapa de expressões regulares para nomes de módulos ou matrizes de nomes de módulos que permitem stub out recursos com um único módulo
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
  },

  // Uma matriz de strings de padrão regexp, combinadas com todos os caminhos do módulo antes de serem consideradas 'visíveis' para o carregador do módulo
  // modulePathIgnorePatterns: [],

  // Ativa notificações para resultados de testes
  // notify: false,

  // Um enum que especifica o modo de notificação. Requer { notify: true }
  // notifyMode: "failure-change",

  // Uma predefinição que é usada como base para a configuração do Jest
  preset: '@shelf/jest-mongodb',

  // Executar testes de um ou mais projetos
  // projects: undefined,

  // Use esta opção de configuração para adicionar repórteres personalizados ao Jest
  // reporters: undefined,

  // Redefinir automaticamente o estado simulado antes de cada teste
  // resetMocks: false,

  // Redefina o registro do módulo antes de executar cada teste individual
  // resetModules: false,

  // Um caminho para um resolvedor personalizado
  // resolver: undefined,

  // Restaurar automaticamente o estado simulado e a implementação antes de cada teste
  // restoreMocks: false,

  // O diretório raiz que o Jest deve verificar para testes e módulos dentro
  // rootDir: undefined,

  // Uma lista de caminhos para diretórios que Jest deve usar para procurar arquivos em
  roots: ['<rootDir>/src'],

  // Permite que você use um executor personalizado em vez do executor de teste padrão do Jest
  // runner: "jest-runner",

  // Os caminhos para módulos que executam algum código para configurar ou configurar o ambiente de teste antes de cada teste
  // setupFiles: [],

  // Uma lista de caminhos para módulos que executam algum código para configurar ou configurar a estrutura de teste antes de cada teste
  // setupFilesAfterEnv: [],

  // O número de segundos após o qual um teste é considerado lento e relatado como tal nos resultados.
  // slowTestThreshold: 5,

  // Uma lista de caminhos para módulos serializadores de instantâneo que Jest deve usar para teste de instantâneo
  // snapshotSerializers: [],

  // O ambiente de teste que será usado para teste
  testEnvironment: 'node',

  // Opções que serão passadas para o testEnvironment
  // testEnvironmentOptions: {},

  // Adiciona um campo de localização aos resultados do teste
  // testLocationInResults: false,

  // Os padrões glob que Jest usa para detectar arquivos de teste
  // testMatch: [
  //   "**/__tests__/**/*.[jt]s?(x)",
  //   "**/?(*.)+(spec|test).[tj]s?(x)"
  // ],

  // Uma matriz de strings de padrão regexp que correspondem a todos os caminhos de teste, os testes correspondentes são ignorados
  testPathIgnorePatterns: [
    "index\\.ts$" // Ignora qualquer arquivo que termine com "index.ts"
  ],

  // O padrão regexp ou matriz de padrões que Jest usa para detectar arquivos de teste
  // testRegex: [],

  // Esta opção permite o uso de um processador de resultados personalizado
  // testResultsProcessor: undefined,

  // Esta opção permite o uso de um executor de teste personalizado
  // testRunner: "jest-circus/runner",

  // Um mapa de expressões regulares para caminhos para transformadores
  transform: {
    '.+\\.ts$': 'ts-jest'
  }

  // Uma matriz de strings de padrão regexp que correspondem a todos os caminhos de arquivo de origem, os arquivos correspondentes ignorarão a transformação
  // transformIgnorePatterns: [
  //   "\\\\node_modules\\\\",
  //   "\\.pnp\\.[^\\\\]+$"
  // ],

  // Uma matriz de strings de padrão regexp que são combinadas com todos os módulos antes que o carregador de módulo retorne automaticamente uma simulação para eles
  // unmockedModulePathPatterns: undefined,

  // Indica se cada teste individual deve ser relatado durante a execução
  // verbose: undefined,

  // Uma matriz de padrões regexp que correspondem a todos os caminhos de arquivo de origem antes de executar novamente os testes no modo de observação
  // watchPathIgnorePatterns: [],

  // Se deve usar o watchman para rastreamento de arquivos
  // watchman: true,
}
