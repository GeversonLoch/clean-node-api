
## Semantic Commit Messages

**Semantic Commit Messages** é uma convenção para escrever mensagens de commit de forma padronizada e descritiva, facilitando a compreensão do histórico do projeto. O formato básico segue a estrutura:

```bash
<tipo>(escopo opcional): descrição
```

---

## Tipos de commit mais comuns:

- **feat**: Adiciona uma nova funcionalidade.  
  _Exemplo:_ `feat(auth): adiciona login com Google`
- **fix**: Corrige um bug.  
  _Exemplo:_ `fix(api): corrige erro ao salvar usuário`
- **refactor**: Refatora o código sem alterar comportamento.  
  _Exemplo:_ `refactor(database): otimiza consultas SQL`
- **chore**: Alterações que não afetam código de produção (build, configs, dependências).  
  _Exemplo:_ `chore(lint): adiciona regras ao ESLint`
- **docs**: Atualiza documentação.  
  _Exemplo:_ `docs(readme): adiciona instruções de instalação`
- **style**: Ajustes de formatação, sem alteração lógica.  
  _Exemplo:_ `style(css): ajusta espaçamento entre botões`
- **test**: Adiciona ou ajusta testes.  
  _Exemplo:_ `test(user-service): adiciona testes unitários`
- **perf**: Melhoria de performance.  
  _Exemplo:_ `perf(algoritmo): reduz complexidade do loop`
- **ci**: Alterações na configuração de CI/CD.  
  _Exemplo:_ `ci(github-actions): ajusta pipeline de deploy`
- **build**: Modificações na estrutura de build.  
  _Exemplo:_ `build(package.json): atualiza dependências`
- **revert**: Reverte um commit anterior.  
  _Exemplo:_ `revert: desfaz atualização de versão`

---

## 🔹 Escopo opcional
O **escopo** indica a área do projeto afetada. Exemplo:

```bash
feat(api): adiciona endpoint de criação de usuário
```

---

## 🔹 Boas práticas
✔️ Escreva a **descrição no presente** (`adiciona`, `corrige`).  
✔️ Seja **claro e objetivo**.  
✔️ Use **inglês** ou padronize com seu time.  
✔️ Use `BREAKING CHANGE:` na descrição se houver mudanças incompatíveis.  

---

## 🔥 Exemplo prático de commits semânticos

```bash
git commit -m "feat(cart): adiciona botão de remover item"
git commit -m "fix(login): corrige erro ao validar senha"
git commit -m "docs(README): adiciona guia de instalação"
```

Esse padrão ajuda no **changelog automático**, rastreamento de mudanças e melhora a colaboração! 🚀
