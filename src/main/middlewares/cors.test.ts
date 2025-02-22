/*
* Realiza testes no middleware cors utilizando a biblioteca supertest.
* Verificando se o middleware define corretamente os cabeçalhos.
*/
import request from "supertest"
import app from "../config/app"

describe('CORS Middleware', () => {
    // Garante que o CORS esteja habilitado com os cabeçalhos corretos
    test('Should enable CORS with correct headers', async () => {
        // Define uma rota de teste que retorna uma resposta simples
        app.get('/test_cors', (req, res) => {
            res.send()
        })

        // Envia uma requisição GET para validar o middleware e os cabeçalhos CORS
        await request(app)
            .get('/test_cors')
            .expect('access-control-allow-origin', '*')
            .expect('access-control-allow-methods', '*')
            .expect('access-control-allow-headers', '*')
    })
})
