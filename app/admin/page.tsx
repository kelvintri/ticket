'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRoleManager } from '@/app/components/UserRoleManager'
import { supabase } from '@/lib/supabase'


export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAdminStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single()

      if (!userRole?.is_admin) {
        router.push('/')
      } else {
        setIsAdmin(true)
      }
      setLoading(false)
    }

    checkAdminStatus()
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return null // This will be briefly shown before redirecting
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <UserRoleManager />
    </div>
  )
}
