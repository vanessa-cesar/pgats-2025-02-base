import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"


// Conceito: Trend (Métrica Customizada)
const checkoutDuration = new Trend('checkout_duration');

export const options = {
  // Conceito: Stages (Ramping up/down)
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  // Conceito: Thresholds
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

// Conceito: Data-Driven Testing (Uso de massa de dados externa)
const users = new SharedArray('usuarios', function () {
  return JSON.parse(open('./data/users.json'));
});

export default function () {
  // Conceito: Variável de Ambiente
  const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
  const user = users[Math.floor(Math.random() * users.length)];

  let token;

  // Conceito: Groups
  group('Fluxo de Autenticação', function () {
    const loginRes = http.post(`${BASE_URL}/api/users/login`, JSON.stringify({
      email: user.email,
      password: user.password,
    }), { headers: { 'Content-Type': 'application/json' } });

    // Conceito: Checks
    check(loginRes, { 'Login com sucesso': (r) => r.status === 200 });

    // Conceito: Reaproveitamento de Resposta e Token de Autenticação
    token = loginRes.json('token');
  });

  group('Fluxo de Checkout', function () {
    const params = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Conceito: Uso de Token
      },
    };

    const payload = JSON.stringify({

       // Gera um número inteiro aleatório entre 1 e 5 sem precisar de bibliotecas externas
      items: [{ productId: 1, quantity: Math.floor(Math.random() * 5) + 1 }],
      freight: 0,
      paymentMethod: "boleto",
      cardData: { number: "0123456789", name: "chocolate nestle", expiry: "2027", cvv: "717" }
    });

    const res = http.post(`${BASE_URL}/api/checkout`, payload, params);
    
    checkoutDuration.add(res.timings.duration); // Alimentando a Trend
    check(res, { 'Checkout concluído': (r) => r.status === 201 || r.status === 200 });
  });

  sleep(1);
}

export function handleSummary(data) {
  return { "summary.html": htmlReport(data) }; // Entregável: Relatório HTML
}