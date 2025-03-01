
import { Play, Pause, StopCircle, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BookActionButtonsProps {
  bookId: string;
  status: string;
  isLoading: boolean;
  onProcess: (bookId: string, status: string) => Promise<void>;
  onCancel: (bookId: string) => Promise<void>;
}

const BookActionButtons: React.FC<BookActionButtonsProps> = ({
  bookId,
  status,
  isLoading,
  onProcess,
  onCancel
}) => {
  return (
    <div className="flex items-center justify-end space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onProcess(bookId, status)}
              disabled={isLoading || status === "completed" || status === "canceled"}
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : status === "processing" ? (
                <Pause size={14} />
              ) : (
                <Play size={14} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {status === "processing" ? 'Pause processing' : 'Start processing'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onCancel(bookId)}
              disabled={isLoading || status !== "processing"}
            >
              <StopCircle size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Cancel processing
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <Link to={`/book/${bookId}`}>
                <ArrowRight size={14} />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            View details
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default BookActionButtons;
