'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/app/hooks/useUserRole'
import { TicketComments } from './TicketComments'

interface Ticket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  created_by: string
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export const TicketDetails = ({ id }: { id: string }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const { userRole, loading: roleLoading } = useUserRole()

  useEffect(() => {
    if (!roleLoading) {
      fetchTicket()
    }
  }, [id, roleLoading])

  const fetchTicket = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (userRole?.role === 'user' && data.created_by !== user.id) {
        throw new Error('You do not have permission to view this ticket')
      }

      setTicket(data)
    } catch (error) {
      setError((error as Error).message)
      if ((error as Error).message === 'You do not have permission to view this ticket') {
        router.push('/tickets')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticket) return

    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
        })
        .eq('id', id)

      if (error) throw error

      setIsEditing(false)
    } catch (error) {
      setError((error as Error).message)
    }
  }

  if (loading || roleLoading) return <p>Loading ticket details...</p>
  if (error) return <p>Error: {error}</p>
  if (!ticket) return <p>Ticket not found</p>

  const canEditTicket = userRole?.role === 'support' || userRole?.is_admin

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {isEditing && canEditTicket ? (
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="title"
              type="text"
              value={ticket.title}
              onChange={(e) => setTicket({ ...ticket, title: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              value={ticket.description}
              onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
              Status
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="status"
              value={ticket.status}
              onChange={(e) => setTicket({ ...ticket, status: e.target.value })}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
              Priority
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="priority"
              value={ticket.priority}
              onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Save Changes
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">{ticket.title}</h2>
          <p className="mb-4">{ticket.description}</p>
          <p className="mb-2"><strong>Status:</strong> {ticket.status}</p>
          <p className="mb-2"><strong>Priority:</strong> {ticket.priority}</p>
          <p className="mb-2"><strong>Created at:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
          <p className="mb-4"><strong>Updated at:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
          {canEditTicket && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => setIsEditing(true)}
            >
              Edit Ticket
            </button>
          )}
        </>
      )}
      <TicketComments ticketId={id} />
    </div>
  )
}
