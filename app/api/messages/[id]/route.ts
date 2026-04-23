import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, message, token } = body

    if (!name?.trim() || !message?.trim() || !token) {
      return NextResponse.json(
        { error: 'name, message, and token are required' },
        { status: 400 }
      )
    }
    if (message.trim().length > 280) {
      return NextResponse.json(
        { error: 'message must be 280 characters or less' },
        { status: 400 }
      )
    }

    const existing = await pool.query(
      'SELECT token FROM messages WHERE id = $1',
      [id]
    )
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    if (existing.rows[0].token !== token) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { rows } = await pool.query(
      `UPDATE messages SET name = $1, message = $2
       WHERE id = $3
       RETURNING id, name, message, created_at`,
      [name.trim(), message.trim(), id]
    )
    return NextResponse.json(rows[0])
  } catch {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 })
    }

    const existing = await pool.query(
      'SELECT token FROM messages WHERE id = $1',
      [id]
    )
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    if (existing.rows[0].token !== token) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await pool.query('DELETE FROM messages WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
