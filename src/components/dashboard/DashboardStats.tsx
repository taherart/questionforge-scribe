
import { motion } from "framer-motion";
import { Loader2, Book, FileText, BookOpenCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book as BookType } from "@/types/book";

interface DashboardStatsProps {
  books: BookType[];
  isLoading: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ books, isLoading }) => {
  // Ensure books array is properly initialized
  const safeBooks = Array.isArray(books) ? books as BookType[] : [];

  return (
    <motion.div 
      variants={itemVariants}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              safeBooks.length
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Uploaded materials
          </p>
        </CardContent>
      </Card>
      
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Questions Created</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              safeBooks.reduce((sum, book) => sum + (book.questions_count || 0), 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total questions generated
          </p>
        </CardContent>
      </Card>
      
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              safeBooks.filter(book => book.status === 'processing').length
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Books in progress
          </p>
        </CardContent>
      </Card>
      
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">CSV Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              safeBooks.filter(book => book.status === 'completed').length
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Exported question sets
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardStats;
