import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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
      `UPDATE management_messages SET name = $1, message = $2
       WHERE id = $3
       RETURNING id, name, message, created_at`,
      [name.trim(), message.trim(), id]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
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
    const result = await pool.query(
      'DELETE FROM management_messages WHERE id = $1',
      [id]
    )
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
