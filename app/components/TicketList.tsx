'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useUserRole } from '@/app/hooks/useUserRole'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Ticket {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
}

export const TicketList = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { userRole, loading: roleLoading } = useUserRole()

  useEffect(() => {
    if (!roleLoading) {
      fetchTickets()
    }
  }, [roleLoading])

  const fetchTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

        if (userRole?.role === 'user') {
          // User can only see their own tickets
          query = query.eq('created_by', user.id)
        } else if (userRole?.role === 'support' || userRole?.is_admin) {
          // Support and admin can see all tickets
        }

      const { data, error } = await query

      if (error) throw error

      setTickets(data)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const canEditTicket = userRole?.role === 'support' || userRole?.is_admin

  if (loading || roleLoading) return <p>Loading tickets...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell>{ticket.title}</TableCell>
            <TableCell>{ticket.status}</TableCell>
            <TableCell>{ticket.priority}</TableCell>
            <TableCell>{new Date(ticket.created_at).toLocaleString()}</TableCell>
            <TableCell>
              <Button variant="link" asChild>
                <Link href={`/tickets/${ticket.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
