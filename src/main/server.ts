/*
* Responsável por iniciar o servidor.
* Importa a configuração do app e inicia o servidor.
*/

import "@main/config/env-config"
import app from "@main/config/app"
import { mongoDBAdapter } from "@main/config/db-connection"
import { AddressInfo } from "net"

mongoDBAdapter.connect()
  .then(() => {
    const server = app.listen(process.env.PORT, () => {
      const { address, port } = server.address() as AddressInfo
      console.info(`Server running at http://${address}:${port}`)
    })
  })
  .catch(console.error)
