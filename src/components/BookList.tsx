
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Play, Pause, StopCircle, Loader2, Book, ArrowRight } from "lucide-react";

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
import { 
  processBook, 
  pauseProcessing, 
  cancelProcessing, 
  updateBookProgress,
  extractBookMetadata
} from "@/lib/api";

// Define Book interface with string status type to match Supabase response
interface Book {
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

interface BookListProps {
  books: Book[];
  onBookUpdate?: () => void;
}

const BookList: React.FC<BookListProps> = ({ books, onBookUpdate }) => {
  const [processingBooks, setProcessingBooks] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [bookStates, setBookStates] = useState<Record<string, Book>>({});

  // Initialize local book states with the props
  useEffect(() => {
    if (!books || books.length === 0) return;
    
    const bookStateMap: Record<string, Book> = {};
    books.forEach(book => {
      if (book.id) {
        bookStateMap[book.id] = book;
      }
    });
    setBookStates(bookStateMap);
  }, [books]);

  // Periodically update progress for processing books
  useEffect(() => {
    if (!books || books.length === 0) return;
    
    const processingBookIds = books
      .filter(book => book.status === 'processing')
      .map(book => book.id);
    
    if (processingBookIds.length === 0) return;
    
    // Mark books as processing in state
    const newProcessingBooks = { ...processingBooks };
    processingBookIds.forEach(id => {
      newProcessingBooks[id] = true;
    });
    setProcessingBooks(newProcessingBooks);
    
    // Set up progress checking
    const intervalId = setInterval(async () => {
      for (const bookId of processingBookIds) {
        try {
          const result = await updateBookProgress(bookId);
          if (result.success && result.book) {
            // Update the book in local state
            setBookStates(prev => ({
              ...prev,
              [bookId]: result.book
            }));
            
            // If book is completed, notify user and trigger refresh
            if (result.book.status === 'completed' && bookStates[bookId]?.status === 'processing') {
              toast.success(`Processing completed for "${result.book.name}"`);
              if (onBookUpdate) onBookUpdate();
            }
          }
        } catch (error) {
          console.error(`Error updating progress for book ${bookId}:`, error);
        }
      }
    }, 3000); // Check every 3 seconds
    
    return () => clearInterval(intervalId);
  }, [books, bookStates, onBookUpdate, processingBooks]);

  const handleProcess = async (bookId: string, currentStatus: string) => {
    setIsLoading(prev => ({ ...prev, [bookId]: true }));
    
    try {
      if (currentStatus === "processing") {
        toast.info("Pausing question generation...");
        const result = await pauseProcessing(bookId);
        
        if (result.success) {
          setProcessingBooks(prev => ({ ...prev, [bookId]: false }));
          toast.success("Question generation paused!");
          
          // Update local state
          if (result.book) {
            setBookStates(prev => ({
              ...prev,
              [bookId]: result.book
            }));
          }
          
          if (onBookUpdate) onBookUpdate();
        } else {
          toast.error(result.message || "Failed to pause processing");
        }
      } else {
        // If the book doesn't have total_pages set, extract metadata first
        const book = bookStates[bookId];
        if (!book.total_pages) {
          toast.info("Extracting book metadata...");
          const metadataResult = await extractBookMetadata(bookId);
          if (!metadataResult.success) {
            toast.error("Failed to extract book metadata. Please try again.");
            setIsLoading(prev => ({ ...prev, [bookId]: false }));
            return;
          }
          
          // Refresh the book to get updated metadata
          if (onBookUpdate) onBookUpdate();
        }
        
        toast.info("Starting question generation...");
        const result = await processBook(bookId);
        
        if (result.success) {
          setProcessingBooks(prev => ({ ...prev, [bookId]: true }));
          toast.success("Question generation started!");
          
          // Update local state
          if (result.book) {
            setBookStates(prev => ({
              ...prev,
              [bookId]: result.book
            }));
          }
          
          if (onBookUpdate) onBookUpdate();
        } else {
          toast.error(result.message || "Failed to start processing");
        }
      }
    } catch (error) {
      console.error("Error processing book:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const handleCancel = async (bookId: string) => {
    setIsLoading(prev => ({ ...prev, [bookId]: true }));
    
    try {
      toast.info("Canceling question generation...");
      const result = await cancelProcessing(bookId);
      
      if (result.success) {
        setProcessingBooks(prev => ({ ...prev, [bookId]: false }));
        toast.success("Question generation canceled!");
        
        // Update local state
        if (result.book) {
          setBookStates(prev => ({
            ...prev,
            [bookId]: result.book
          }));
        }
        
        if (onBookUpdate) onBookUpdate();
      } else {
        toast.error(result.message || "Failed to cancel processing");
      }
    } catch (error) {
      console.error("Error canceling process:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
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

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Book className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No books found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Upload PDF files to the 'books' folder in Supabase storage to start generating questions.
        </p>
      </div>
    );
  }

  // Use the book states for rendering when available, otherwise fall back to props
  const booksToRender = books.map(book => (book.id && bookStates[book.id]) || book);

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
          {booksToRender.map((book) => (
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
                    <span>{book.processed_pages || 0} / {book.total_pages || '?'} pages</span>
                    <span>{book.total_pages ? Math.round(((book.processed_pages || 0) / book.total_pages) * 100) : 0}%</span>
                  </div>
                  <Progress value={book.total_pages ? ((book.processed_pages || 0) / book.total_pages) * 100 : 0} />
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
                          onClick={() => handleProcess(book.id, book.status)}
                          disabled={isLoading[book.id] || book.status === "completed" || book.status === "canceled"}
                        >
                          {isLoading[book.id] ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : book.status === "processing" ? (
                            <Pause size={14} />
                          ) : (
                            <Play size={14} />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {book.status === "processing" ? 'Pause processing' : 'Start processing'}
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
                          onClick={() => handleCancel(book.id)}
                          disabled={isLoading[book.id] || book.status !== "processing"}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookList;
