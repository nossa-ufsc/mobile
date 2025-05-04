# Nossa UFSC

## Executando o Projeto Localmente

O projeto utiliza Continuous Native Generation do Expo. As pastas ios e android são geradas por inteiro toda vez que o `expo prebuild` é executado.

### Pré-requisitos

- Node.js
- Expo CLI
- Xcode (para iOS)
- Android Studio (para Android)
- Bun (gerenciador de pacotes)

### Desenvolvimento Local

Durante o desenvolvimento local, como não temos acesso aos secrets do ambiente de produção (CAGR OAuth), o processo de login utiliza dados mockados. Isso é controlado pela variável `isDev` em `features/onboarding/hooks/use-cagr-login.ts`. Os dados mockados incluem:

- Informações do usuário (nome, matrícula)
- Grade de horários
- Disciplinas do semestre

Isso permite que você desenvolva e teste funcionalidades sem precisar de credenciais reais do CAGR.

Além disso, alguns serviços externos também utilizam dados mockados em desenvolvimento:

- **Supabase**: Em modo de desenvolvimento (`__DEV__`), o Supabase não é utilizado pois requer variáveis de ambiente. Em vez disso, dados mockados são retornados (por exemplo, em `features/events/hooks/use-events.ts`).
- **PostHog**: Em modo de desenvolvimento (`__DEV__`), o PostHog é substituído por um wrapper mock que não realiza nenhuma operação de analytics (configurado em `app/_layout.tsx`).

### Comandos

1. Instale as dependências:

```bash
bun install
```

2. Para executar no iOS:

```bash
bun run:ios
```

3. Para executar no Android:

```bash
bun run:android
```

Estes comandos irão:

1. Executar o `expo prebuild` para gerar/atualizar o código nativo
2. Iniciar o aplicativo no dispositivo/emulador selecionado

## Como funcionam os Widgets

O aplicativo inclui recursos de widgets para iOS e Android que exibem o horário das aulas do usuário para o dia atual.

### Widget iOS

A integração do widget iOS é construída usando [expo-apple-targets](https://github.com/EvanBacon/expo-apple-targets).

#### Como funciona

1. **Compartilhamento de Dados**: O aplicativo compartilha os dados do horário com o widget através de um App Group compartilhado usando `ExtensionStorage`. Esses dados são sincronizados automaticamente sempre que o horário é atualizado no aplicativo principal.

2. **Formato dos Dados**: Os dados do horário são convertidos para um formato compatível com o widget usando um adaptador dedicado (`utils/subjects-to-widget-adapter.ts`). A estrutura é a seguinte:

```typescript
interface WidgetData {
  data: {
    [weekDay: number]: Array<{
      name: string; // Nome da disciplina
      classroom: string; // Número da sala
      time: string; // Horário de início
      finishTime: string; // Horário de término
    }>;
  };
}
```

3. **Implementação do Widget**: O widget (`targets/widget/widgets.swift`) lê esses dados e exibe o horário do dia atual. Ele:
   - Atualiza a cada 5 minutos
   - Mostra até 3 próximas aulas do dia
   - Exibe nome da disciplina, sala e informações de horário
   - Atualiza automaticamente quando o aplicativo modifica o horário

### Widget Android

O widget Android é implementado usando [react-native-android-widget](https://github.com/awesomejerry/react-native-android-widget), que permite criar widgets nativos do Android usando componentes React Native.

#### Como funciona

1. **Configuração do Widget**: O widget é configurado no `app.json`.

2. **Implementação**: O widget é implementado usando dois componentes principais:

   - `widget-task-handler.tsx`: Gerencia os dados e o ciclo de vida do widget
   - `android-schedule-widget.tsx`: Lida com a renderização da UI do widget

### Desenvolvimento

#### Desenvolvimento do Widget iOS

O código do widget está localizado no diretório `targets/widget` e é gerenciado fora do diretório principal do projeto iOS. Esta configuração permite:

- Desenvolvimento independente do widget sem afetar o código do aplicativo principal
- Controle de versão do código do widget separado dos arquivos iOS gerados
- Integração perfeita com o processo de build do Expo

Para modificar o widget iOS:

1. Edite os arquivos em `targets/widget`
2. Execute `npx expo prebuild -p ios` para regenerar o código nativo
3. Abra o Xcode para testar o widget no simulador

#### Desenvolvimento do Widget Android

O código do widget Android está localizado no diretório `features/widget`. Para modificar o widget Android:

1. Edite os componentes do widget em `features/widget`
2. Atualize a configuração do widget no `app.json` se necessário
3. Reconstrua e implante o aplicativo para testar as alterações

Para mais detalhes sobre as implementações:

- Widget iOS: Consulte a [documentação do expo-apple-targets](https://github.com/EvanBacon/expo-apple-targets#-how-to-use)
- Widget Android: Consulte a [documentação do react-native-android-widget](https://github.com/awesomejerry/react-native-android-widget)

## Como Contribuir

Agradecemos seu interesse em contribuir com o Nossa UFSC! Este guia ajudará você a entender nosso processo de contribuição.

### Padrão para os commits

Utilizamos o [Conventional Commits](https://www.conventionalcommits.org/) para padronizar nossas mensagens de commit. Cada commit deve seguir o formato:

```
[tipo]: [descrição do commit]
```

#### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações em documentação
- `style`: Alterações que não afetam o código (espaço em branco, formatação, etc)
- `refactor`: Refatoração de código
- `perf`: Melhorias de performance
- `test`: Adição ou modificação de testes
- `chore`: Alterações em arquivos de build, dependências, etc

Exemplos:

```
feat(auth): adiciona login com UFSC ID
fix(horarios): corrige cálculo de conflito de horários
docs: atualiza instruções de instalação
```

### Branches

Siga o padrão abaixo para nomear suas branches:

- `feature/`: Para novas funcionalidades
  - Exemplo: `feature/login-ufsc`
- `fix/`: Para correções de bugs
  - Exemplo: `fix/crash-horarios`
- `docs/`: Para alterações em documentação
  - Exemplo: `docs/api-docs`
- `refactor/`: Para refatorações
  - Exemplo: `refactor/clean-architecture`

### Pull Requests

1. **Título**: Use o mesmo padrão dos commits

   - Exemplo: `feat(auth): implementa autenticação com UFSC ID`

2. **Descrição**: Inclua as seguintes seções:

   ```
   ## Descrição
   [Descreva as alterações realizadas]

   ## Motivação
   [Por que essas alterações são necessárias?]

   ## Como Testar
   [Passo a passo para testar as alterações]

   ## Screenshots (se aplicável)
   [Adicione screenshots das alterações visuais]

   ## Checklist
   - [ ] Testes adicionados/atualizados
   - [ ] Documentação atualizada
   - [ ] Código segue os padrões do projeto
   ```

3. **Review**: Todo PR deve ter pelo menos uma aprovação antes do merge

### Issues

Para reportar bugs ou sugerir novas funcionalidades, crie uma issue seguindo os templates abaixo:

#### Para Bugs

```
## Descrição do Bug
[Descreva o bug de forma clara e concisa]

## Como Reproduzir
1. Vá para '...'
2. Clique em '....'
3. Role até '....'
4. Veja o erro

## Comportamento Esperado
[Descreva o que deveria acontecer]

## Screenshots
[Se aplicável, adicione screenshots]

## Ambiente
- Dispositivo: [ex: iPhone 14, Pixel 7]
- OS: [ex: iOS 17, Android 14]
- Versão do App: [ex: 1.0.0]
```

#### Para Novas Funcionalidades

```
## Funcionalidade Proposta
[Descreva a funcionalidade que você gostaria de ver no app]

## Motivação
[Por que essa funcionalidade seria útil?]

## Possível Implementação
[Se você tiver ideias de como implementar, descreva aqui (opcional)]

## Alternativas Consideradas
[Existem outras maneiras de resolver o mesmo problema?]
```

#### Labels

Utilizamos as seguintes labels para categorizar as issues:

- `bug`: Problemas/erros no app
- `feature`: Novas funcionalidades
- `enhancement`: Melhorias em funcionalidades existentes
- `documentation`: Relacionado à documentação
- `help wanted`: Precisamos de ajuda extra nesta issue
- `good first issue`: Bom para primeiro contato com o projeto

### Processo de Desenvolvimento

1. Fork o repositório
2. Crie uma branch seguindo a convenção de nomenclatura
3. Faça suas alterações seguindo os padrões de código
4. Escreva/atualize testes conforme necessário
5. Certifique-se que todos os testes passam
6. Faça commits seguindo a convenção
7. Abra um Pull Request
8. Aguarde review e faça as alterações solicitadas se necessário
