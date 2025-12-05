# 📘 Clean Node API

Uma API desenvolvida com uma arquitetura definida e modular, priorizando a manutenibilidade e escalabilidade. O projeto segue a metodologia TDD (Test-Driven Development) para garantir a confiabilidade do código, aplicando os conceitos de Clean Architecture para distribuir responsabilidades em camadas bem definidas. Além disso, adota os princípios do SOLID e utiliza Design Patterns para solucionar desafios comuns de forma eficiente e reutilizável.

---

## 🚀 Configuração do Ambiente

* **Versão do Node.js:** `22.15.1`
* **MongoDB** `8.0.9`

---

## 📦 Dependências e Bibliotecas

As seguintes bibliotecas são utilizadas no projeto:

### 🌱 Configuração de Ambiente
```sh
npm install dotenv
```

### 🔧 Configuração de Lint e Formatação
```sh
npm i -D git-commit-msg-linter
npm i -D typescript @types/node
npm install -D eslint@^7.12.1 eslint-plugin-promise@^5.0.0 eslint-plugin-import@^2.22.1 eslint-plugin-node@^11.1.0 @typescript-eslint/eslint-plugin@^4.0.1 eslint-config-standard eslint-config-standard-with-typescript@latest
npm i -D husky
npm i -D lint-staged
```

### 🧩 API
```sh
npm i express
npm i -D @types/express
```

### 🔍 Fast-Glob
Utilizado para busca dinâmica de arquivos de rotas, facilitando o carregamento automático das mesmas.
```sh
npm i fast-glob
```

### 🧹 Limpeza de Diretórios
Utilitário para remover arquivos e pastas de forma segura antes dos builds.
```sh
npm i -D rimraf
```

### 🛠️ Ferramentas de Desenvolvimento
```sh
npm i -D ts-node
npm i -D tsconfig-paths
npm i -D supertest
npm i -D @types/supertest
```

### 🧪 Testes com Jest
```sh
npm i -D jest @types/jest ts-jest
npm i -D @shelf/jest-mongodb
npm i -D mockdate
```

### 🎲 Base de dados
```sh
npm i mongodb
npm i -D @types/mongodb
```

### 🔐 Validação e Criptografia
```sh
npm i validator
npm i @types/validator
npm i bcrypt @types/bcrypt
npm i jsonwebtoken
npm i @types/jsonwebtoken
```

---
### ⚙️ Configuração inicial

 - Instale as dependências do projeto com `npm install`.
 - Instale o MongoDB Community Server localmente, de preferencia a versão `8.0.9` (vira com visualizador Compass).
 - Faça login no MongoDB Atlas (cloud database).

### 🏃 Executando o Projeto

 - Compilar o projeto com o script `build`.
 - Para iniciar a API localmente execute o script `start` ou `start:debug` para debugar.

### 🔬 Rodar os Testes

O script `test` executa o Jest no modo "watch", que reexecuta os testes sempre que um arquivo for alterado. Isso é útil durante o desenvolvimento.

```sh
npm run test
```

O script `test:staged` executa os testes sem o modo "watch", normalmente utilizado em pipelines de **CI/CD**.
Ele roda apenas nos arquivos modificados antes de um commit.

```sh
npm run test:staged
```

### 🕸️ Grafo de dependências

Para gerar um gráfico em SVG das dependências do diretório `src`, execute:

```sh
npm run lint:deps:svg
```

> ⚠️ Use `npm run`, não `npx run`. O comando `npx run lint:deps:svg` tenta instalar/rodar o pacote `run` e falha porque não é um script executável do projeto.

O comando usa a configuração do Dependency Cruiser e grava o resultado em `dependency-graph.svg` na raiz do projeto. A saída JSON do `depcruise` é convertida para um grafo DOT/SVG via [`viz.js`](https://www.npmjs.com/package/viz.js), pulando os arquivos `index.ts` usados como *barrel* e conectando diretamente os módulos que eles reexportam.

---

### 📌 Atualização de Bibliotecas
Para atualizar pacotes de forma interativa:

```sh
npm i -g npm-check
npm-check --skip-unused --update
```

Ou de forma abreviada:

```sh
npm-check -s -u
```

**Opções:**
* `-s, --skip-unused`: Ignora pacotes não referenciados diretamente, mas ainda necessários ao projeto.
* `-u, --update`: Atualização interativa dos pacotes.

---
