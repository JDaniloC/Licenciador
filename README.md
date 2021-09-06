# [Licenciador para Bots](http://www.chaukbot.tk/)

<p align="center">
  <img alt="ADM" src=".github/licenciador.gif" width="100%">
</p>

## 💻 O que é o projeto?

  <image alt="Vendedor" align="left" width=60%, src=".github/img1.png"/> 
<p> Desenvolvimento web com sistema de login ADM que cadastra os vendedores, onde irá decidir o número de licenças e quais 'softwares' o vendedor conseguirá revender. Possibilitando a visibilidade ou não dos demais softwares através do botão de 'mostrar demais bots'. <br>
  Os vendedores controlam a base de dados dos clientes, cadastrando-os, de forma que o vendedor disponibiliza os softwares para ser utilizado por um periodo de tempo determinado (3 dias, se escolhido teste grátis. 31 dias, se escolhido renovar licença) de acordo com as licenças outorgadas pelo ADM. <br> 
  Tanto o ADM quanto o vendedor tem a possiblidade de deletar os elementos que cadastraram. </p>
<p>

## :rocket: Tecnologias

Esse projeto desenvolvido com as seguintes tecnologias:
  <image  align='right' width = "60%" src=".github/img2.png"/>
- HTML, CSS e JavaScript
- [Crypto.js](https://yarnpkg.com/package/crypto.js)
- [Mongoose](https://yarnpkg.com/package/mongoose)
- [Express](https://yarnpkg.com/package/express)


## Como rodar o projeto?

Clone o projeto em seu computador, crie no frontend um arquivo `.env` com a conexão do seu MongoDB para a conexão: 
```bash
MONGODB_URI = mongodb+srv://
```

Por fim, inicie o projeto:
```bash
cd frontend
yarn install
yarn dev
```

Assim que o processo terminar, abra no seu navegador a página `localhost:3000`.
</p>

