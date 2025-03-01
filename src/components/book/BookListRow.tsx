
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Book } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import BookProgressBar from "./BookProgressBar";
import BookStatusBadge from "./BookStatusBadge";
import BookActionButtons from "./BookActionButtons";

interface BookData {
  id: string;
  name: string;
  grade?: number;
  subject?: string;
  semester?: number;
  total_pages?: number;
  processed_pages?: number;
  status: string;
  questions_count?: number;
  file_path: string;
  created_at: string;
  updated_at: string;
}

interface BookListRowProps {
  book: BookData;
  isLoading: boolean;
  onProcess: (bookId: string, status: string) => Promise<void>;
  onCancel: (bookId: string) => Promise<void>;
}

const BookListRow: React.FC<BookListRowProps> = ({
  book,
  isLoading,
  onProcess,
  onCancel
}) => {
  return (
    <motion.tr
      key={book.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <TableCell className="font-medium">
        <Link to={`/book/${book.id}`} className="hover:text-primary flex items-center gap-2 transition-colors">
          <Book size={16} className="text-muted-foreground" />
          <span className="truncate max-w-[150px] md:max-w-[200px]">{book.name}</span>
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {book.grade && book.subject ? (
          <div className="flex flex-col">
            <span>Grade {book.grade}</span>
            <span className="text-xs text-muted-foreground">{book.subject}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown</span>
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <BookProgressBar processed_pages={book.processed_pages} total_pages={book.total_pages} />
      </TableCell>
      <TableCell className="text-right">
        <BookStatusBadge status={book.status} />
      </TableCell>
      <TableCell className="text-right">
        <BookActionButtons
          bookId={book.id}
          status={book.status}
          isLoading={isLoading}
          onProcess={onProcess}
          onCancel={onCancel}
        />
      </TableCell>
    </motion.tr>
  );
};

export default BookListRow;
