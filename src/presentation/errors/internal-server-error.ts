export class InternalServerError extends Error {

    /*
        Atenção:
        Quanto a identificação dos erros, recomenda-se adotar uma abordagem segura ao lidar com mensagens de erro.
        Ao implementar, forneça mensagens genéricas e amigáveis para o usuário final,
        mantendo detalhes específicos do erro registrados nos logs do servidor.
        Isso permite que os desenvolvedores investiguem e resolvam problemas com base nas
        informações detalhadas disponíveis nos logs, sem expor esses detalhes diretamente ao usuário final.
        Essa prática ajuda a garantir a segurança do sistema e facilita a manutenção futura.
    */

  constructor(stack: string) {
    super('Desculpe, algo deu errado! 😕')
    this.name = `InternalServerError`
    this.stack = stack
  }
}
