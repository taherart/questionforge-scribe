
import { Badge } from "@/components/ui/badge";

interface BookStatusBadgeProps {
  status: string;
}

const BookStatusBadge: React.FC<BookStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "idle":
      return <Badge variant="outline">Not Started</Badge>;
    case "paused":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Paused</Badge>;
    case "processing":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
    case "completed":
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    case "canceled":
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Canceled</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export default BookStatusBadge;
