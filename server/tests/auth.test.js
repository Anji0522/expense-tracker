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

describe('Auth Validation & Operations', () => {
  const testUser = {
    name: 'Test Tester',
    email: `tester-${Date.now()}@example.com`,
    password: 'password123',
    currency: 'INR',
  }

  let authToken = ''

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

  it('POST /api/auth/register should successfully register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser)
    expect(res.statusCode).toEqual(201)
    expect(res.body.success).toBe(true)
    expect(res.body.user).toHaveProperty('id')
    expect(res.body.user.email).toBe(testUser.email.toLowerCase())
    expect(res.body).toHaveProperty('token')
  })

  it('POST /api/auth/login should successfully authenticate the user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    })
    expect(res.statusCode).toEqual(200)
    expect(res.body.success).toBe(true)
    expect(res.body).toHaveProperty('token')
    authToken = res.body.token
  })

  it('GET /api/auth/me should return user details when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
    expect(res.statusCode).toEqual(200)
    expect(res.body.success).toBe(true)
    expect(res.body.user.email).toBe(testUser.email.toLowerCase())
  })
})
