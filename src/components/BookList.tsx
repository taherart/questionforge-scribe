
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Play, Pause, FileQuestion, Loader2, Book, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define Book interface
interface Book {
  id: string;
  name: string;
  grade?: number;
  subject?: string;
  semester?: number;
  totalPages?: number;
  processedPages?: number;
  status: "idle" | "processing" | "completed" | "error";
  questionsCount?: number;
}

interface BookListProps {
  books: Book[];
}

const BookList: React.FC<BookListProps> = ({ books }) => {
  const [processingBooks, setProcessingBooks] = useState<Record<string, boolean>>({});

  const handleProcess = (bookId: string, isProcessing: boolean) => {
    if (isProcessing) {
      toast.info("Pausing question generation...");
      // In a real implementation, this would call an API to pause processing
      setProcessingBooks(prev => ({ ...prev, [bookId]: false }));
      toast.success("Question generation paused!");
    } else {
      toast.info("Starting question generation...");
      // In a real implementation, this would call an API to start processing
      setProcessingBooks(prev => ({ ...prev, [bookId]: true }));
      toast.success("Question generation started!");
    }
  };

  const getStatusBadge = (status: Book["status"]) => {
    switch (status) {
      case "idle":
        return <Badge variant="outline">Not Started</Badge>;
      case "processing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Book className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No books found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Upload books to the 'books' folder in Supabase storage to start generating questions.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Book Name</TableHead>
            <TableHead className="hidden md:table-cell">Grade/Subject</TableHead>
            <TableHead className="hidden md:table-cell">Progress</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* If there are no books yet, we'll display placeholder items */}
          {books.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={5}>
                  <div className="h-12 bg-muted/50 rounded animate-pulse"></div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            // Mock data for demonstration
            [
              {
                id: "1",
                name: "Math_Grade5_S1.pdf",
                grade: 5,
                subject: "Mathematics",
                semester: 1,
                totalPages: 120,
                processedPages: 0,
                status: "idle",
                questionsCount: 0
              },
              {
                id: "2",
                name: "Science_Grade7_S2.pdf",
                grade: 7,
                subject: "Science",
                semester: 2,
                totalPages: 150,
                processedPages: 0,
                status: "idle",
                questionsCount: 0
              }
            ].map((book) => (
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
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{book.processedPages || 0} / {book.totalPages || '?'} pages</span>
                      <span>{Math.round(((book.processedPages || 0) / (book.totalPages || 1)) * 100)}%</span>
                    </div>
                    <Progress value={((book.processedPages || 0) / (book.totalPages || 1)) * 100} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {getStatusBadge(book.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleProcess(book.id, processingBooks[book.id] || false)}
                          >
                            {processingBooks[book.id] ? (
                              <Pause size={14} />
                            ) : (
                              <Play size={14} />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {processingBooks[book.id] ? 'Pause processing' : 'Start processing'}
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
                            <Link to={`/book/${book.id}`}>
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
                </TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookList;
