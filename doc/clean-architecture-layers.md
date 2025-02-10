# Clean Architecture Layers

## Apresentação (Presentation)
Camada responsável pela interface com o usuário, seja ela uma interface gráfica, API ou qualquer outro meio de interação.
Nessa camada, encontramos as Views, ViewModels e os Controllers que lidam com a entrada e apresentação de dados ao usuário.

## Aplicação (Application)
Orquestra as operações da camada de **Domínio (Domain)** para executar as tarefas exigidas pelos usuários.
Aqui residem os Casos de Uso (Use Cases) ou Interatores, que coordenam o fluxo de dados entre as camadas.
Também podemos encontrar os Services que são específicos da aplicação.

## Domínio (Domain)
Esta é a camada central que contém toda a lógica de negócios puramente, independente de detalhes técnicos ou frameworks.
Inclui as Entities(Models), Value Objects, Interfaces de Repositório e Serviços de Domínio.
Qualquer lógica relacionada às regras de negócio deve estar aqui.

## Infraestrutura (Infrastructure)
Camada responsável pela implementação dos detalhes técnicos, como persistência de dados, comunicação com serviços externos, entre outros.
Nesta camada, encontramos as implementações concretas das interfaces definidas na camada de Domínio, como os Repositórios, Gateways e Adapters.

## Persistence/Data -> (Infraestrutura)
Camada responsável pela comunicação com os bancos de dados e outros meios de armazenamento.
É aqui que encontramos as implementações concretas das Interfaces de Repositório definidas na camada de Domínio,
além de configurações de ORMs, Migrations e mapeamentos de dados.

## Common/Utils
Nesta camada podemos encontrar os facilitadores(helpers) da aplicação.

## Conceito de Inversão de Dependências
O Princípio da Inversão de Dependência (Dependency Inversion Principle - DIP)
sugere que módulos de alto nível não devem depender de módulos de baixo nível;
ambos devem depender de abstrações.
Isso significa depender de interfaces ou classes abstratas ao invés de implementações concretas.
Não confunda "Inversão de Dependência" com "Injeção de Dependências".
https://medium.com/contexto-delimitado/o-princ%C3%ADpio-da-invers%C3%A3o-de-depend%C3%AAncia-d52987634fa9

## O Princípio Aberto/Fechado (Open/Closed Principle — OCP)
Indica que entidades de software (classes, módulos, funções, etc.) devem ser abertas para extensão, mas fechadas para modificação. Isso permite que o comportamento do software seja estendido sem alterar o código fonte existente, seguindo os princípios da programação orientada a objetos.
https://medium.com/contexto-delimitado/o-princípio-aberto-fechado-9341b96f060f

## Referencias
https://herbertograca.com/2017/08/03/layered-architecture
https://www.youtube.com/watch?v=ow8UUjS5vzU&ab_channel=C%C3%B3digoFonteTV