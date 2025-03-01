
import { Progress } from "@/components/ui/progress";

interface BookProgressBarProps {
  processed_pages?: number;
  total_pages?: number;
}

const BookProgressBar: React.FC<BookProgressBarProps> = ({ processed_pages = 0, total_pages }) => {
  const percentage = total_pages ? Math.round((processed_pages / total_pages) * 100) : 0;
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span>{processed_pages} / {total_pages || '?'} pages</span>
        <span>{percentage}%</span>
      </div>
      <Progress value={total_pages ? (processed_pages / total_pages) * 100 : 0} />
    </div>
  );
};

export default BookProgressBar;
