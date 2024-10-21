import { AuthWrapper } from '@/app/components/AuthWrapper'
import { TicketList } from '@/app/components/TicketList'

export const metadata = {
  title: 'Tickets | IT Ticketing System',
  description: 'View all support tickets',
}

export default function TicketsPage() {
  return (
    <AuthWrapper>
      <div className="container mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-4">Support Tickets</h1>
        <TicketList />
      </div>
    </AuthWrapper>
  )
}
