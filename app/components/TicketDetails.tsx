'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/app/hooks/useUserRole'
import { TicketComments } from './TicketComments'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  const canEditTicket = userRole?.role === 'admin' || userRole?.role === 'support'

  if (loading || roleLoading) return <p>Loading ticket details...</p>
  if (error) return <p>Error: {error}</p>
  if (!ticket) return <p>Ticket not found</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Ticket' : ticket.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing && canEditTicket ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              value={ticket.title}
              onChange={(e) => setTicket({ ...ticket, title: e.target.value })}
              placeholder="Title"
            />
            <Textarea
              value={ticket.description}
              onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
              placeholder="Description"
            />
            <Select
              value={ticket.status}
              onValueChange={(value) => setTicket({ ...ticket, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={ticket.priority}
              onValueChange={(value) => setTicket({ ...ticket, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-between">
              <Button type="submit">Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <p className="mb-4">{ticket.description}</p>
            <p className="mb-2"><strong>Status:</strong> {ticket.status}</p>
            <p className="mb-2"><strong>Priority:</strong> {ticket.priority}</p>
            <p className="mb-2"><strong>Created at:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
            <p className="mb-4"><strong>Updated at:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
            {canEditTicket && (
              <Button onClick={() => setIsEditing(true)}>Edit Ticket</Button>
            )}
          </>
        )}
        <TicketComments ticketId={id} />
      </CardContent>
    </Card>
  )
}
