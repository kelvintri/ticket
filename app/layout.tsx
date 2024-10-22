'use client'

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUserRole } from './hooks/useUserRole'
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./components/ModeToggle";

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <nav className="bg-background border-b">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold">
                IT Ticketing System
              </Link>
              <div>
                <ModeToggle/>
                {user ? (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/tickets">Tickets</Link>
                    </Button>
                    {userRole?.is_admin && (
                      <Button variant="ghost" asChild>
                        <Link href="/admin">Admin</Link>
                      </Button>
                    )}
                    <Button variant="ghost" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/register">Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
