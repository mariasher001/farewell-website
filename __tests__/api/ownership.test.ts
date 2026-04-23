jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}))

import pool from '@/lib/db'
import { PUT, DELETE } from '@/app/api/messages/[id]/route'

const mockQuery = pool.query as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe('PUT /api/messages/[id]', () => {
  it('returns 403 when token does not match stored token', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ token: 'correct-token' }] })

    const req = new Request('http://localhost/api/messages/abc', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', message: 'Hi', token: 'wrong-token' }),
    })
    const res = await PUT(req, { params: { id: 'abc' } })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })

  it('returns 404 when message does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const req = new Request('http://localhost/api/messages/missing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', message: 'Hi', token: 'any' }),
    })
    const res = await PUT(req, { params: { id: 'missing' } })

    expect(res.status).toBe(404)
  })

  it('updates and returns the message when token matches', async () => {
    const token = 'valid-token'
    mockQuery
      .mockResolvedValueOnce({ rows: [{ token }] })
      .mockResolvedValueOnce({
        rows: [{ id: 'abc', name: 'Alice', message: 'Updated!', created_at: '2026-04-29' }],
      })

    const req = new Request('http://localhost/api/messages/abc', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', message: 'Updated!', token }),
    })
    const res = await PUT(req, { params: { id: 'abc' } })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toBe('Updated!')
  })
})

describe('DELETE /api/messages/[id]', () => {
  it('returns 403 when token does not match stored token', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ token: 'correct-token' }] })

    const req = new Request('http://localhost/api/messages/abc', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'wrong-token' }),
    })
    const res = await DELETE(req, { params: { id: 'abc' } })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })

  it('deletes and returns success when token matches', async () => {
    const token = 'valid-token'
    mockQuery
      .mockResolvedValueOnce({ rows: [{ token }] })
      .mockResolvedValueOnce({ rows: [] })

    const req = new Request('http://localhost/api/messages/abc', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const res = await DELETE(req, { params: { id: 'abc' } })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
