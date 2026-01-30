import http from 'k6/http';
import { BASE_URL } from './baseURL.js';

// Helper para gerar dados aleatórios (Simulando Faker)
export function generateRandomData() {
    return {
        item: `Produto_${Math.floor(Math.random() * 1000)}`,
        qtd: Math.floor(Math.random() * 10) + 1
    };
}

export function login(userEmail, userPassword) {
    const payload = JSON.stringify({
        email: userEmail,
        password: userPassword,
    });

    const res = http.post(`${BASE_URL}/api/users/login`, payload, {
        headers: { 'Content-Type': 'application/json' },
    });

    // Retorna o token extraído do JSON de resposta
    return res.json('token'); 
}

