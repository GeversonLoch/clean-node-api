module.exports = {
    mongodbMemoryServerOptions: {
        binary: {
            version: '8.0.4',
            skipMD5: true,
        },
        instance: {
            dbName: 'jest',
        },
        autoStart: true, // Garante que o MongoDB em memória seja iniciado automaticamente antes dos testes
    },
}