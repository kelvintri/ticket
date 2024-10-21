'use client'

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUserRole } from './hooks/useUserRole'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { userRole, loading: roleLoading } = useUserRole()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-white text-xl font-bold">
              IT Ticketing System
            </Link>
            <div>
              {user ? (
                <>
                  <Link href="/tickets" className="text-white hover:text-gray-300 mr-4">
                    Tickets
                  </Link>
                  {userRole?.is_admin && (
                    <Link href="/admin" className="text-white hover:text-gray-300 mr-4">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-gray-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-white hover:text-gray-300 mr-4">
                    Login
                  </Link>
                  <Link href="/register" className="text-white hover:text-gray-300">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
