import { PublicRouteWrapper } from '@/app/components/PublicRouteWrapper'
import { AuthForm } from '@/app/components/AuthForm'

export const metadata = {
  title: 'Register | IT Ticketing System',
  description: 'Create a new account',
}

export default function RegisterPage() {
  return (
    <PublicRouteWrapper>
      <div className="container mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-4">Register</h1>
        <AuthForm type="register" />
      </div>
    </PublicRouteWrapper>
  )
}
