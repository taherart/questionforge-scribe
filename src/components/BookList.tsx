
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  processBook, 
  pauseProcessing, 
  cancelProcessing, 
  updateBookProgress,
  extractBookMetadata
} from "@/lib/api";
import { Book } from "@/types/book";
import BookEmptyState from "./book/BookEmptyState";
import BookListRow from "./book/BookListRow";

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

  if (!books || books.length === 0) {
    return <BookEmptyState />;
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
            <BookListRow
              key={book.id}
              book={book}
              isLoading={isLoading[book.id] || false}
              onProcess={handleProcess}
              onCancel={handleCancel}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookList;
