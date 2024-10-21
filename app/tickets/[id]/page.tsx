import { AuthWrapper } from '@/app/components/AuthWrapper'
import { TicketDetails } from '../../components/TicketDetails'

export const metadata = {
  title: 'Ticket Details | IT Ticketing System',
  description: 'View and update ticket details',
}

export default function TicketDetailsPage({ params }: { params: { id: string } }) {
  return (
    <AuthWrapper>
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Ticket Details</h1>
      <TicketDetails id={params.id} />
    </div>
    </AuthWrapper>
  )
}
