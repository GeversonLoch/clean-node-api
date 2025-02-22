/*
* Exporta o middleware bodyParser, que utiliza a função json do Express.
* Este middleware é responsável por transformar o corpo das requisições em objetos JSON.
*/
import { json } from "express"

// Cria e exporta o middleware para parsear o body das requisições em JSON
export const bodyParser = json()
