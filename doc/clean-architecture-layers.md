# Clean Architecture Layers

## Presentation
Camada do front-end onde fica a interface do usuário. Nessa camada podemos 
encontrar as views, models(view models) e input controllers.

## Application
Orquestra objetos de **Domain** para executar tarefas exigidas pelos usuários.
Já nessa camada podemos encontrar as controllers, Services e Event Listeners.

## Domain
Esta é a camada que contém toda a lógica de negócios, as Interfaces, 
Entities(Models), DTOs, Services, Events e qualquer outro tipo de objeto 
que contenha Lógica de Negócios.

## Common/Utils
Nesta camada podemos encontrar os facilitadores(helpers) da aplicação.

## Persistence/Data
Camada responsável pela comunicação com o/os bancos de dados. 
É nessa camada que encontramos as Entities(ORM) dos BD e Migrations
(Camada responsável para manutenção do BD como tabelas).

## Conceito de Inversão de Dependências
A inversão de dependência é a estratégia de depender de interfaces ou classes abstratas, ao invés de classes concretas.
Não confunda “Inversão de Dependência” com “Injeção de Dependências”.
https://medium.com/contexto-delimitado/o-princ%C3%ADpio-da-invers%C3%A3o-de-depend%C3%AAncia-d52987634fa9

## O Princípio Aberto Fechado (Open Closed Principle — OCP)
Indica o objetivo da arquitetura Orientada a Objetos.
https://medium.com/contexto-delimitado/o-princípio-aberto-fechado-9341b96f060f

## Referencias
https://herbertograca.com/2017/08/03/layered-architecture
https://www.youtube.com/watch?v=ow8UUjS5vzU&ab_channel=C%C3%B3digoFonteTV