import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('Chat API Route', () => {
  it('debería retornar un error 400 si no hay mensaje', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('debería retornar una respuesta exitosa (mocked)', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hola' }),
    });

    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.reply).toBeDefined();
  });
});
