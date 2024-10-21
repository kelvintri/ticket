import { PublicRouteWrapper } from '@/app/components/PublicRouteWrapper'
import { AuthForm } from '@/app/components/AuthForm'

export const metadata = {
  title: 'Login | IT Ticketing System',
  description: 'Login to your account',
}

export default function LoginPage() {
  return (
    <PublicRouteWrapper>
      <div className="container mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        <AuthForm type="login" />
      </div>
    </PublicRouteWrapper>
  )
}
