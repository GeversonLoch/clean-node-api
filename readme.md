# 📘 Clean Node API

Uma API desenvolvida com uma arquitetura definida e modular, priorizando a manutenibilidade e escalabilidade. O projeto segue a metodologia TDD (Test-Driven Development) para garantir a confiabilidade do código, aplicando os conceitos de Clean Architecture para distribuir responsabilidades em camadas bem definidas. Além disso, adota os princípios do SOLID e utiliza Design Patterns para solucionar desafios comuns de forma eficiente e reutilizável.

---

## 🚀 Configuração do Ambiente

- **Versão do Node.js:** `16.14.2`
- **Gerenciador de pacotes:** NPM ou Yarn

Instale as dependências do projeto:

```sh
npm install
```

---

## 📦 Dependências e Bibliotecas

As seguintes bibliotecas são utilizadas no projeto:

### 🔧 Configuração de Lint e Formatação
```sh
npm i -D git-commit-msg-linter
npm i -D typescript @types/node
npm install -D eslint@^7.12.1 eslint-plugin-promise@^5.0.0 eslint-plugin-import@^2.22.1 eslint-plugin-node@^11.1.0 @typescript-eslint/eslint-plugin@^4.0.1 eslint-config-standard eslint-config-standard-with-typescript@latest
npm i -D husky
npm i -D lint-staged
```

### 🧪 Testes com Jest
```sh
npm i -D jest @types/jest ts-jest
```

### 🔐 Validação e Criptografia
```sh
npm i @types/validator validator
npm i bcrypt @types/bcrypt
```

---

## 🏃 Executando o Projeto

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

---

## 📌 Comandos Adicionais

### 📌 Atualização de Bibliotecas
Para atualizar pacotes de forma interativa:

```sh
npm-check --skip-unused --update
```

Ou de forma abreviada:

```sh
npm-check -s -u
```

**Opções:**
- `-s, --skip-unused`: Ignora pacotes não referenciados diretamente, mas ainda necessários ao projeto.
- `-u, --update`: Atualização interativa dos pacotes.

---
