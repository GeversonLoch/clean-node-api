/*
 * Testa o middleware contentTypeJson para garantir que as respostas são enviadas com o cabeçalho "Content-Type"
 * definido como "application/json" por padrão.
 *
 * Ao chamar uma rota que retorna uma resposta, o middleware contentTypeJson assegura que o cabeçalho "Content-Type"
 * seja corretamente definido, permitindo que os clientes interpretem o conteúdo JSON sem problemas de formatação ou compatibilidade.
 */
import request from "supertest"
import app from "../config/app"

describe('Content Type Middleware', () => {
    // Garante que a configuração defina corretamente o cabeçalho "Content-Type" para respostas JSON
    test('Should return default content type as JSON', async () => {
        // Define uma rota de teste que retorna uma resposta (mesmo usando res.send, o middleware garante o tipo JSON)
        app.get('/test_content_type_return_json', (req, res) => {
            res.send() // Mesmo utilizando res.send(), o middleware contentTypeJson define o cabeçalho como "application/json"
        })

        // Envia uma requisição GET para validar se o cabeçalho "Content-Type" contém "json"
        await request(app)
            .get('/test_content_type_return_json')
            .expect('content-type', /json/)
    })

    // Testa a sobrescrição do cabeçalho "Content-Type" para um tipo não padrão (XML) quando explicitamente configurado na rota
    test('Should return XML content type when forced', async () => {
        // Define uma rota de teste que sobrescreve explicitamente o cabeçalho "Content-Type" para "xml"
        app.get('/test_content_type_return_xml', (req, res) => {
            res.type('xml') // Sobrescreve o tipo de conteúdo para "xml", ignorando o middleware que define o padrão JSON
            res.send() // Envia a resposta com o cabeçalho modificado para "xml"
        })

        // Envia uma requisição GET para validar se o cabeçalho "Content-Type" foi corretamente alterado para conter "xml"
        await request(app)
            .get('/test_content_type_return_xml')
            .expect('content-type', /xml/)
    })
})
