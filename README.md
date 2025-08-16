# Cobrador Automático WA

Gerenciador de clientes com lembretes automáticos via WhatsApp. O projeto utiliza [Electron](https://www.electronjs.org/), [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) e [node-cron](https://www.npmjs.com/package/node-cron) para oferecer uma interface simples e multiplataforma de cobrança.

## Funcionalidades
- Conexão de múltiplas contas de WhatsApp.
- Cadastro de clientes com telefone, data de compra e data de vencimento.
- Verificação automática se o número do cliente está disponível no WhatsApp.
- Envio de lembretes de cobrança de forma manual ou agendada.
- Envio de mensagens em massa para clientes selecionados.
- Controle de contas vendidas com cálculo automático de receitas e gráficos simples.
- Persistência de dados local com *electron-store*.
- Exibição da quantidade total de clientes e dos resultados filtrados na lista.

## Requisitos
- [Node.js](https://nodejs.org/) 18 ou superior.
- NPM ou Yarn.

## Instalação
```bash
npm install
```

## Uso
1. Inicie o aplicativo em modo desenvolvimento:
   ```bash
   npm start
   ```
2. No primeiro acesso de cada conta de WhatsApp, será exibido um QR Code para pareamento.
3. Cadastre clientes e defina os horários desejados para cobrança automática.

## Build
Gere binários para distribuição com:
```bash
npm run pack   # build sem empacotamento
npm run dist   # executáveis para a plataforma
```
Os artefatos são gerados em `dist_electron/`.

## Estrutura do Projeto
- `main.js` – processo principal do Electron e orquestração da aplicação.
- `whatsapp.js` – gestor de múltiplas sessões do WhatsApp.
- `cronJobs.js` – agendamentos e lógica de cobrança automática.
- `renderer/` – interface gráfica.
- `utils.js` – funções auxiliares.

## Testes
Ainda não há testes automatizados configurados:
```bash
npm test
```

## Licença
Distribuído sob a licença ISC. Consulte o arquivo `package.json` para detalhes.
