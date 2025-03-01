
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Book, FileSpreadsheet, Download, Play, Pause, Settings, FileQuestion, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getBookById, processBook, pauseProcessing, exportCSV } from "@/lib/api";

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { 
    data: book, 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => id ? getBookById(id) : null,
    enabled: !!id
  });

  useEffect(() => {
    if (book?.status === "processing") {
      setIsProcessing(true);
    } else {
      setIsProcessing(false);
    }
  }, [book]);

  const handleProcess = async () => {
    if (!id) return;
    
    if (isProcessing) {
      toast.info("Pausing question generation...");
      try {
        const result = await pauseProcessing(id);
        if (result.success) {
          setIsProcessing(false);
          toast.success("Question generation paused!");
          refetch();
        } else {
          toast.error(result.message || "Failed to pause processing");
        }
      } catch (error) {
        console.error("Error pausing processing:", error);
        toast.error("An error occurred. Please try again.");
      }
    } else {
      toast.info("Starting question generation...");
      try {
        const result = await processBook(id);
        if (result.success) {
          setIsProcessing(true);
          toast.success("Question generation started!");
          refetch();
        } else {
          toast.error(result.message || "Failed to start processing");
        }
      } catch (error) {
        console.error("Error starting processing:", error);
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  const handleExportCSV = async () => {
    if (!id) return;
    
    setIsExporting(true);
    toast.info("Exporting CSV...");
    
    try {
      const result = await exportCSV(id);
      if (result.success) {
        toast.success("CSV exported successfully!");
        // In a real app, this would trigger a download
      } else {
        toast.error(result.message || "Failed to export CSV");
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("An error occurred during export. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">Book not found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          The book you're looking for doesn't exist or has been deleted.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link to="/">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // Prepare book metadata for display
  const metadata = {
    fileSize: "Unknown",
    language: "Unknown",
    uploadedAt: new Date(book.created_at).toLocaleDateString(),
    lastProcessed: book.updated_at !== book.created_at 
      ? new Date(book.updated_at).toLocaleString() 
      : '-'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Book className="mr-3 h-7 w-7 text-primary" />
            <span className="truncate">{book.name}</span>
          </h1>
          <p className="text-muted-foreground">
            {book.grade ? `Grade ${book.grade} • ` : ''}
            {book.subject ? `${book.subject} • ` : ''}
            {book.semester ? `Semester ${book.semester}` : ''}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleProcess} 
            className="group"
            disabled={isLoading}
          >
            {isProcessing ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause Processing
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                Start Processing
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            disabled={book.questions_count === 0 || isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">
            Questions
            <Badge variant="secondary" className="ml-2">
              {book.questions_count || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{book.total_pages || "Unknown"}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Processed Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {book.processed_pages || 0} <span className="text-sm text-muted-foreground">/ {book.total_pages || 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Questions Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{book.questions_count || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Questions per Page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {book.processed_pages > 0 
                    ? ((book.questions_count || 0) / book.processed_pages).toFixed(1) 
                    : "0"}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileQuestion className="mr-2 h-5 w-5 text-primary" />
                  Processing Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall progress</span>
                    <span className="font-medium">
                      {book.total_pages ? Math.round(((book.processed_pages || 0) / book.total_pages) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={book.total_pages ? ((book.processed_pages || 0) / book.total_pages) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                
                <div className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Current page</p>
                      <p className="font-medium">
                        {book.processed_pages > 0 ? book.processed_pages : 'Not started'}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Processing status</p>
                      <div>
                        {book.status === "idle" && <Badge variant="outline">Not Started</Badge>}
                        {book.status === "processing" && <Badge variant="secondary" className="bg-blue-100 text-blue-800">Processing</Badge>}
                        {book.status === "completed" && <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>}
                        {book.status === "error" && <Badge variant="destructive">Error</Badge>}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Questions generated</p>
                      <p className="font-medium">{book.questions_count || 0}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Estimated time remaining</p>
                      <p className="font-medium">
                        {isProcessing 
                          ? book.total_pages && book.processed_pages
                            ? `~${Math.round((book.total_pages - book.processed_pages) * 2)} minutes` 
                            : 'Calculating...'
                          : 'Paused'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 px-6 py-3">
                <Button 
                  variant="default" 
                  onClick={handleProcess} 
                  className="w-full group"
                >
                  {isProcessing ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Processing
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      Start Processing
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Book className="mr-2 h-5 w-5 text-primary" />
                  Book Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Grade</p>
                      <p className="font-medium">{book.grade || 'Not specified'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Subject</p>
                      <p className="font-medium">{book.subject || 'Not specified'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Semester</p>
                      <p className="font-medium">{book.semester || 'Not specified'}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">File size</p>
                      <p className="font-medium">{metadata.fileSize}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Language</p>
                      <p className="font-medium">{metadata.language}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Uploaded</p>
                      <p className="font-medium">{metadata.uploadedAt}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Difficulty level</p>
                    <p className="font-medium">
                      Level {book.grade 
                        ? String(book.grade <= 3 ? '01' : book.grade <= 4 ? '02' : book.grade <= 5 ? '03' : 
                                book.grade <= 6 ? '04' : book.grade <= 7 ? '05' : book.grade <= 9 ? '06' : 
                                book.grade <= 11 ? '07' : '08') 
                        : 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {book.grade ? `Based on grade level (${book.grade})` : 'No grade information available'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/30 px-6 py-3">
                <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                  <span>Last processed: {metadata.lastProcessed}</span>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1" asChild>
                    <Link to={`/book/${id}?tab=settings`}>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileSpreadsheet className="mr-2 h-5 w-5 text-primary" />
                Generated Output
              </CardTitle>
              <CardDescription>
                CSV output file will be available here once questions have been generated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {book.questions_count > 0 ? (
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileSpreadsheet className="h-5 w-5 text-primary mr-2" />
                        <div>
                          <p className="font-medium">
                            {book.name.split('.')[0]}_questions.csv
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {book.questions_count} questions • {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExportCSV}
                        disabled={isExporting}
                      >
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No CSV file yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Start processing the book to generate questions and create a CSV export.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Questions Preview</CardTitle>
              <CardDescription>
                Preview of generated multiple-choice questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {book.questions_count === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileQuestion className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No questions generated yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Start processing the book to generate questions.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* In a real implementation, we would fetch and display questions here */}
                  <div className="border rounded-md p-4 animate-pulse">
                    <p className="h-4 bg-muted rounded w-3/4 mb-3"></p>
                    <div className="space-y-2">
                      <p className="h-3 bg-muted rounded w-1/2"></p>
                      <p className="h-3 bg-muted rounded w-1/3"></p>
                      <p className="h-3 bg-muted rounded w-2/3"></p>
                      <p className="h-3 bg-muted rounded w-1/4"></p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Settings</CardTitle>
              <CardDescription>
                Configure how questions are generated from this book.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Settings className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Settings Coming Soon</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Advanced configuration options will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default BookDetails;
