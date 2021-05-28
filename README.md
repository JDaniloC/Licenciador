# [Licenciador para Bots](http://www.chaukbot.tk/)

<p align="center">
  <img alt="ADM" src=".github/licenciador.gif" width="100%">
</p>

## 💻 O que é o projeto?

  <image alt="Vendedor" align="left" width=60%, src=".github/img1.png"/> 
<p> Desenvolvimento web com sistema de login ADM que cadastra os vendedores, onde irá decidir o número de licenças e quais 'softwares' o vendedor conseguirá usar caso o ADM tenha selecionado a opção 'mostrar demais bots', caso contrário irá mostrar apenas os selecionados pelo ADM. <br>
  Os vendedores controla a base de dados dos clientes, cadastrando-os, onde o vendedor disponibiliza os softwares para ser utilizado por um periodo de tempo determinado (3 dias, se escolhido teste grátis. 31 dias, se escolhido renovar licença) por  em troca das licenças ofertadas pelo ADM. <br>
  ADM e vendedor tem a possiblidade de deletar os elementos que cadastraram.</p>
<p>

## :rocket: Tecnologias

Esse projeto desenvolvido com as seguintes tecnologias:
  <image  align='right' width = "60%" src=".github/img2.png"/>
- HTML, CSS e JavaScript
- [Crypto.js](https://yarnpkg.com/package/crypto.js)
- [Mongoose](https://yarnpkg.com/package/mongoose)
- [Express](https://yarnpkg.com/package/express)


## Como rodar o projeto?

Clone o projeto em seu computador, crie no backend um arquivo `.env`, escreva `MONGODB_URI =`.
Configure o MongoDB e atualize o arquivo `.env`, com seu `User:Senha` para conexão.  

```bash
cd frontend
yarn install
yarn dev
```

Assim que o processo terminar, abra no seu navegador a página `localhost:3000`.
</p>

