'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  role: string
  is_admin: boolean
}

export const UserRoleManager = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          throw new Error('You must be logged in to access this page')
        } else if (response.status === 403) {
          throw new Error('You do not have permission to access this page')
        } else {
          throw new Error(`Failed to fetch users: ${errorData.error || response.statusText}`)
        }
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error in fetchUsers:', error)
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole, is_admin: isAdmin })

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole, is_admin: isAdmin } : user
      ))
    } catch (error) {
      setError((error as Error).message)
    }
  }

  if (loading) return <p>Loading users...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Email</th>
            <th className="py-3 px-6 text-left">Role</th>
            <th className="py-3 px-6 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left whitespace-nowrap">{user.email}</td>
              <td className="py-3 px-6 text-left">{user.role}</td>
              <td className="py-3 px-6 text-left">
                <select
                  value={user.role}
                  onChange={(e) => {
                    const newRole = e.target.value
                    const isAdmin = newRole === 'admin'
                    updateUserRole(user.id, newRole, isAdmin)
                  }}
                  className="bg-white border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="user">User</option>
                  <option value="support">Support</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
