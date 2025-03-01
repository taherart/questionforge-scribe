
import { Book } from "lucide-react";

const BookEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Book className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium">No books found</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        Upload PDF files to the 'books' folder in Supabase storage to start generating questions.
      </p>
    </div>
  );
};

export default BookEmptyState;
