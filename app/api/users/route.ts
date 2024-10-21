import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if the user is authenticated and an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (roleError || !userRole?.is_admin) {
    return NextResponse.json({ error: 'User not allowed' }, { status: 403 })
  }

  // Fetch all users (non-admin method)
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email')

  if (usersError) {
    console.error('Error fetching users:', usersError)
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role, is_admin')

  if (rolesError) {
    console.error('Error fetching roles:', rolesError)
    return NextResponse.json({ error: rolesError.message }, { status: 500 })
  }

  const combinedData = users.map(user => ({
    id: user.id,
    email: user.email,
    role: roles.find(role => role.user_id === user.id)?.role || 'user',
    is_admin: roles.find(role => role.user_id === user.id)?.is_admin || false
  }))

  return NextResponse.json(combinedData)
}
