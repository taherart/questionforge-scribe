
import { motion } from "framer-motion";
import { Book, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookList from "@/components/BookList";
import { Book as BookType } from "@/types/book";

interface BooksCardProps {
  books: BookType[];
  isLoading: boolean;
  isScanning: boolean;
  lastScanTime: Date | null;
  onRefetch: () => void;
  onScan: (showToast: boolean) => Promise<void>;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const BooksCard: React.FC<BooksCardProps> = ({
  books,
  isLoading,
  isScanning,
  lastScanTime,
  onRefetch,
  onScan
}) => {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book className="mr-2 h-5 w-5 text-primary" />
            Books
          </CardTitle>
          <CardDescription>
            PDF books detected in your storage that can be processed for questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <BookList books={books} onBookUpdate={onRefetch} />
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/30 px-6 py-3">
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
            <span>Last scan: {lastScanTime ? lastScanTime.toLocaleString() : 'Never'}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onScan(true)}
              disabled={isScanning}
            >
              {isScanning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Scan Now
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default BooksCard;
