/*
* Realiza testes no middleware bodyParser utilizando a biblioteca supertest.
* Verifica se o middleware está corretamente analisando o corpo das requisições como JSON.
*/
import request from "supertest"
import app from "@main/config/app"

describe('Body Parser Middleware', () => {
    // Garante que o body da requisição é convertido para JSON
    test('Should parse body as json', async () => {
        // Define uma rota de teste que retorna o corpo da requisição
        app.post('/test_body_parser', (req, res) => {
            res.send(req.body)
        })

        // Envia uma requisição POST com um corpo JSON para validar o middleware
        await request(app)
            .post('/test_body_parser')
            .send({ name: 'any_name' })
    })
})
