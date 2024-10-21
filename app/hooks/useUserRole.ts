import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface UserRole {
  role: string;
  is_admin: boolean;
}

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role, is_admin')
            .eq('user_id', user.id)
            .single()

          if (error) throw error

          setUserRole(data)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  return { userRole, loading }
}
