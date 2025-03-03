
import { Badge } from "@/components/ui/badge";

// Define valid statuses to match database constraint
export const VALID_STATUSES = {
  IDLE: 'idle',
  PAUSED: 'paused',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
  CANCELED: 'canceled'
};

interface BookStatusBadgeProps {
  status: string;
}

const BookStatusBadge: React.FC<BookStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case VALID_STATUSES.IDLE:
      return <Badge variant="outline">Not Started</Badge>;
    case VALID_STATUSES.PAUSED:
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Paused</Badge>;
    case VALID_STATUSES.PROCESSING:
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
    case VALID_STATUSES.COMPLETED:
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    case VALID_STATUSES.ERROR:
      return <Badge variant="destructive">Error</Badge>;
    case VALID_STATUSES.CANCELED:
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Canceled</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default BookStatusBadge;
