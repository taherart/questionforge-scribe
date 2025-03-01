
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { 
  Book, Loader2, RefreshCw, FileText, BookOpenCheck
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BookList from "@/components/BookList";
import ProcessLogs from "@/components/ProcessLogs";
import { scanBooks, getBooks } from "@/lib/api";

// Importing necessary interfaces
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

const Dashboard = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  const { 
    data: books = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks
  });

  // Auto scan on component mount for metadata only
  useEffect(() => {
    handleScanBooks();
    
    // Set up interval to scan for new PDFs every 5 minutes, but don't auto-start processing
    const interval = setInterval(() => {
      handleScanBooks(false); // silent scan
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleScanBooks = async (showToast = true) => {
    setIsScanning(true);
    if (showToast) toast.info("Scanning books...");
    
    try {
      const result = await scanBooks();
      await refetch();
      setLastScanTime(new Date());
      
      if (result.success) {
        if (showToast) toast.success(result.message);
        if (result.newFiles && result.newFiles.length > 0 && !showToast) {
          toast.success(`Found and added ${result.newFiles.length} new PDF files.`);
        }
      } else {
        if (showToast) toast.error(result.message);
      }
    } catch (error) {
      console.error("Error scanning books:", error);
      if (showToast) toast.error("Failed to scan books. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex flex-col gap-2">
        <motion.h1 
          variants={itemVariants}
          className="text-3xl font-bold tracking-tight"
        >
          MSQ Creator Dashboard
        </motion.h1>
        <motion.p 
          variants={itemVariants}
          className="text-muted-foreground"
        >
          Create multiple-choice questions from your educational materials.
        </motion.p>
      </div>

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
                books.length
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
                books.reduce((sum, book) => sum + (book.questions_count || 0), 0)
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
                books.filter(book => book.status === 'processing').length
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
                books.filter(book => book.status === 'completed').length
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Exported question sets
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
        <Button 
          onClick={() => handleScanBooks(true)} 
          disabled={isScanning}
          className="group"
        >
          {isScanning ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          )}
          Scan for New PDFs
        </Button>
      </motion.div>

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
              <BookList books={books} onBookUpdate={refetch} />
            )}
          </CardContent>
          <CardFooter className="border-t bg-muted/30 px-6 py-3">
            <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
              <span>Last scan: {lastScanTime ? lastScanTime.toLocaleString() : 'Never'}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleScanBooks(true)}
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

      <motion.div variants={itemVariants}>
        <ProcessLogs />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
