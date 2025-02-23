/**
* Define as rotas relacionadas ao cadastro de usuários.
*/
import { Router } from "express";

export default (router: Router): void => {
    router.post('/signup', (req, res) => {
        res.json({
            ok: 'ok'
        })
    })
}
