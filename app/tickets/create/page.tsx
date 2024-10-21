import { AuthWrapper } from '@/app/components/AuthWrapper'
import { CreateTicketForm } from '@/app/components/CreateTicketForm'

export const metadata = {
  title: 'Create Ticket | IT Ticketing System',
  description: 'Create a new support ticket',
}

export default function CreateTicketPage() {
  return (
    <AuthWrapper>
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Create a New Ticket</h1>
      <CreateTicketForm />
    </div>
    </AuthWrapper>
  )
}

