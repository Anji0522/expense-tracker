import request from 'supertest'
import app from '../src/app.js'

describe('API Health and Root Endpoints', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toEqual(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toMatch(/Welcome/)
  })

  it('GET /api/unknown-route should return 404', async () => {
    const res = await request(app).get('/api/unknown-route-that-does-not-exist')
    expect(res.statusCode).toEqual(404)
    expect(res.body.success).toBe(false)
  })
})

describe('Auth Validation', () => {
  it('POST /api/auth/register should fail on empty body', async () => {
    const res = await request(app).post('/api/auth/register').send({})
    expect(res.statusCode).toEqual(400)
    expect(res.body.success).toBe(false)
  })

  it('POST /api/auth/login should fail on invalid email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'short',
    })
    expect(res.statusCode).toEqual(400)
    expect(res.body.success).toBe(false)
  })

  it('GET /api/auth/me should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.statusCode).toEqual(401)
    expect(res.body.success).toBe(false)
  })
})
