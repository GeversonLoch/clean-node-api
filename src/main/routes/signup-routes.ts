/**
* Arquivo que define as rotas relacionadas ao cadastro de usuários (signup).
*/
import { Router } from "express";

export default (router: Router): void => {
    router.post('/signup', (req, res) => {
        res.json({
            ok: 'ok'
        })
    })
}
