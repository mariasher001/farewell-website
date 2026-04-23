import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, message, created_at FROM messages ORDER BY created_at DESC'
    )
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, message, token } = body

    if (!name?.trim() || !message?.trim() || !token) {
      return NextResponse.json(
        { error: 'name, message, and token are required' },
        { status: 400 }
      )
    }
    if (message.trim().length > 1000) {
      return NextResponse.json(
        { error: 'message must be 1000 characters or less' },
        { status: 400 }
      )
    }

    const { rows } = await pool.query(
      `INSERT INTO messages (name, message, token)
       VALUES ($1, $2, $3)
       RETURNING id, name, message, token, created_at`,
      [name.trim(), message.trim(), token]
    )
    return NextResponse.json(rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
