# uniriobot
Messenger bot para divulgação de informações para estudantes da UNIRIO.

## Como colocar o bot online

### Pré-requisitos

- NodeJS
- NPM
- Um servidor externo

### Instalação

Certifique-se que o bot do facebook está *criado e atrelado à página correta*. 
Clone o repositório, e na pasta local do repositório execute `npm install` para instalar os módulos do node utilizados.
É necessário a configuração das seguintes variáveis de ambiente:
- `PAGETOKEN` (token disponibilizado pelo bot para acesso a página)
- `VERIFYTOKEN` (token de verificação utilizado para saber se de fato está enviando com o facebook)

É necessário certificar-se também que as seguintes variáveis estão com o valor correto:
- `receiver.js`
    - URL_SHEET_CARDAPIO
- `sender.js`
    - API_UNIRIO_URL
    - API_UNIRIO_KEY

Certifique-se que o servidor externo também está com uma porta disponível liberada e, caso não seja uma variável de ambiente, certifique-se que o `index.js` corretamente ouve essa porta. 

### Uso

O uso do bot se dá pela conversa de usuários via chat pelo Facebook. O bot automaticamente lê as mensagens enviadas e apropriadamente responde. Exemplo, se o usuário enviar "ajuda", ele receberá os seguintes textos:

```
Abaixo estão as minhas funcionalidades atuais. 
Para utilizá-las, basta digitar o que está em colchetes. 
Eu entendo algumas variações, mas não força a barra (eu sou esperto mas nem tanto!).
    [Cardápio]: mostra o cardápio do bandejão. 
    [WiFi]: mostra todas as senhas de wi-fi públicos.
    [Período]: informações sobre datas dos períodos desse ano: início e término, trancamento, inscrição...
    [Calendario]: datas do Calendário Acadêmico de 2017.
    [TrancamentoDisciplinas]: informações variadas sobre o Trancamento de Disciplinas.
    [InscricaoDisciplinas]: informações variadas sobre a Inscrição em Disciplinas.
    [BilheteUnico]: procedimentos de como cadastrar seu Bilhete Único Universitário."
Teve alguma ideia de algo que pode ser melhorado? 
Envie sua sugestão digitando [Sugestao], que nós vamos recebê-la diretamente e tratá-la com carinho! 
Pshhhaw.

```
### Site

Para informações complementares, pode se visitar o site.
Url: https://jonnyguio.github.io/uniriobot/
