🚀 API Checkout & Performance Testing (K6)
Este repositório contém a implementação de testes de performance utilizando K6 para a API de Checkout, conforme os requisitos da Pós-Graduação em Automação de Testes de Software.

## Arquitetura dos Testes

A estrutura do projeto de testes de performance está organizada da seguinte forma:

```text
tests/k6/
├── data/
│   └── users.json          # Massa de dados para Data-Driven Testing
├── helpers/
│   ├── baseURL.js          # Definição da URL base
│   └── dadosLogin.js       # Dados de autenticação
├── performance.test.js     # Script principal de testes K6
└── summary.html            # Relatório HTML de execução


# Instalar dependências
npm install

# Iniciar o servidor
node rest/server.js
Acesse o Swagger em: http://localhost:3000/api-docs


## Testes de Performance com K6
Os testes foram desenhados para exercitar os fluxos de autenticação e finalização de compra,
aplicando os seguintes conceitos técnicos:

## Stages & Thresholds
Configuramos o teste com ramping de usuários e metas de performance (SLA).

```js
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp-up
    { duration: '1m', target: 10 },  // Plateau
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições < 500ms
    http_req_failed: ['rate<0.01'],   // Taxa de erro inferior a 1%
  },
};

## Data-Driven Testing (SharedArray)
Utilizamos o SharedArray para carregar a massa de dados de usuários de um arquivo JSON externo.

const users = new SharedArray('usuarios', function () {
  return JSON.parse(open('./data/users.json'));
});

### Helpers

Os helpers em tests/k6/helpers permitem reutilizar código e manter o script principal limpo.
Base URL: O helper baseURL.js permite obter dinamicamente a URL da API.
Token JWT: O token gerado no login é capturado dinamicamente e reutilizado no header do checkout.


// Captura do token
let token = loginRes.json('token');

// Uso no checkout
```js
const params = {
  headers: { 'Authorization': `Bearer ${token}` },
};


### Reaproveitamento de Resposta & Token JWT
O token gerado no login é capturado dinamicamente e reutilizado no header de autorização do checkout.

JavaScript
// Captura do token
token = loginRes.json('token');

// Uso no checkout
```js
const params = {
  headers: { 'Authorization': `Bearer ${token}` },
};

## Checks & Trends
Implementamos verificações de status code e métricas customizadas para o checkout.

JavaScript
```js
const checkoutDuration = new Trend('checkout_duration'); // Trend

check(res, { 'Checkout concluído': (r) => r.status === 201 }); // Check
checkoutDuration.add(res.timings.duration);

## Variável de Ambiente & Faker (Randomização)
A URL base é configurada externamente e os dados da compra são gerados de forma aleatória.

JavaScript
const BASE_URL = __ENV.BASE_URL; // Variável de Ambiente

### Faker / Massa Dinâmica

Foi utilizado o conceito de Faker para simular dados dinâmicos durante a execução do teste,
evitando dados estáticos e garantindo maior realismo na carga aplicada.

Exemplo de uso:

const quantity = Math.floor(Math.random() * 5) + 1;

## Relatório de Execução

O relatório HTML é gerado automaticamente ao final da execução e salvo na raiz do projeto
com o nome `summary.html`.

## Como rodar os testes
Certifique-se de que a API REST está rodando e execute:
Entre na pasta src antes de rodar (se já não estiver nela)
cd src

Bash
k6 run -e BASE_URL=http://localhost:3000 tests/k6/performance.test.js





