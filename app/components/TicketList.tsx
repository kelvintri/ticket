'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useUserRole } from '@/app/hooks/useUserRole'

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
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Title</th>
            <th className="py-3 px-6 text-left">Status</th>
            <th className="py-3 px-6 text-left">Priority</th>
            <th className="py-3 px-6 text-left">Created At</th>
            <th className="py-3 px-6 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left whitespace-nowrap">{ticket.title}</td>
              <td className="py-3 px-6 text-left">{ticket.status}</td>
              <td className="py-3 px-6 text-left">{ticket.priority}</td>
              <td className="py-3 px-6 text-left">{new Date(ticket.created_at).toLocaleString()}</td>
              <td className="py-3 px-6 text-left">
                <Link href={`/tickets/${ticket.id}`} className="text-blue-600 hover:text-blue-900">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
