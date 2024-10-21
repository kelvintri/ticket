'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
}

export const TicketComments = ({ ticketId }: { ticketId: string }) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComments()
  }, [ticketId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setComments(data)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          content: newComment.trim(),
        })

      if (error) throw error

      setNewComment('')
      fetchComments()
    } catch (error) {
      setError((error as Error).message)
    }
  }

  if (loading) return <p>Loading comments...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Comments</h3>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-100 p-4 rounded">
            <p>{comment.content}</p>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmitComment} className="mt-4">
        <textarea
          className="w-full p-2 border rounded"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Comment
        </button>
      </form>
    </div>
  )
}
