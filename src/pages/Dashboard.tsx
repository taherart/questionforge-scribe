
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import DashboardStats from "@/components/dashboard/DashboardStats";
import ScanBooksButton from "@/components/dashboard/ScanBooksButton";
import BooksCard from "@/components/dashboard/BooksCard";
import ProcessLogs from "@/components/ProcessLogs";
import { scanBooks, getBooks } from "@/lib/api";
import { Book as BookType } from "@/types/book";

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

const Dashboard = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  // Update more frequently to show progress in real-time
  const { 
    data: books = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
    refetchInterval: 5000, // Refetch every 5 seconds to show progress updates
  });

  // Create a memoized refetch function
  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

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
    if (showToast) toast.info("Scanning books and extracting metadata with AI...");
    
    try {
      const result = await scanBooks();
      await refetch();
      setLastScanTime(new Date());
      
      if (result.success) {
        if (showToast) toast.success(result.message);
        if (result.newFiles && result.newFiles.length > 0 && !showToast) {
          toast.success(`Found and added ${result.newFiles.length} new PDF files with AI-extracted metadata.`);
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

  // Ensure books array is properly initialized
  const safeBooks = Array.isArray(books) ? books as BookType[] : [];

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

      <DashboardStats books={safeBooks} isLoading={isLoading} />

      <ScanBooksButton isScanning={isScanning} onScan={handleScanBooks} />

      <BooksCard 
        books={safeBooks}
        isLoading={isLoading}
        isScanning={isScanning}
        lastScanTime={lastScanTime}
        onRefetch={handleRefetch}
        onScan={handleScanBooks}
      />

      <motion.div variants={itemVariants}>
        <ProcessLogs />
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
