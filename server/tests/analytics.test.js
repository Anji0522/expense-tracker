import request from 'supertest'
import app from '../src/app.js'

describe('Protected Analytics Endpoints Security', () => {
  it('GET /api/analytics/summary should require authentication', async () => {
    const res = await request(app).get('/api/analytics/summary')
    expect(res.statusCode).toEqual(401)
    expect(res.body.success).toBe(false)
  })

  it('GET /api/reports/monthly should require authentication', async () => {
    const res = await request(app).get('/api/reports/monthly')
    expect(res.statusCode).toEqual(401)
    expect(res.body.success).toBe(false)
  })

  it('GET /api/expenses should require authentication', async () => {
    const res = await request(app).get('/api/expenses')
    expect(res.statusCode).toEqual(401)
    expect(res.body.success).toBe(false)
  })
})
