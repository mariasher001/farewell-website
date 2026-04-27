import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT name, message, updated_at FROM manager_message WHERE id = 1'
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch manager message' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { name, message } = body

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'name and message are required' },
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
      `UPDATE manager_message
       SET name = $1, message = $2, updated_at = now()
       WHERE id = 1
       RETURNING name, message, updated_at`,
      [name.trim(), message.trim()]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Manager message not found' }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch {
    return NextResponse.json({ error: 'Failed to update manager message' }, { status: 500 })
  }
}
