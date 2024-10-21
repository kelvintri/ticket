'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function withAuth(WrappedComponent: React.ComponentType) {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter()

    useEffect(() => {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login')
        }
      }

      checkAuth()
    }, [router])

    return <WrappedComponent {...props} />
  }
}

