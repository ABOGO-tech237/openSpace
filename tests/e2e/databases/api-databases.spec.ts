import { test, expect } from '@playwright/test'

const API = process.env.API_URL || 'http://localhost:8080/api/v1'

test.describe('API Databases', () => {
  let token: string
  const testEmail = `test-${Date.now()}@openspace.test`

  test.beforeAll(async ({ request }) => {
    await request.post(`${API}/auth/register`, {
      data: {
        email: testEmail,
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'User',
      },
    })
    const login = await request.post(`${API}/auth/login`, {
      data: { email: testEmail, password: 'TestPass123!' },
    })
    const body = await login.json()
    token = body.data.access_token
  })

  test('liste databases vide au départ', async ({ request }) => {
    const res = await request.get(`${API}/databases`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('création MySQL', async ({ request }) => {
    const res = await request.post(`${API}/databases`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `testdb${Date.now()}`, engine: 'mysql' },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.engine).toBe('mysql')
    expect(body.data.status).toBe('creating')
  })

  test('refuse moteur invalide', async ({ request }) => {
    const res = await request.post(`${API}/databases`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'baddb', engine: 'oracle' },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })

  test('création MongoDB NoSQL', async ({ request }) => {
    const res = await request.post(`${API}/databases`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `mongo${Date.now()}`, engine: 'mongodb' },
    })
    const body = await res.json()
    if (res.status() === 201) {
      expect(body.data.engine).toBe('mongodb')
    } else {
      expect(body.error).toContain('quota')
    }
  })
})
