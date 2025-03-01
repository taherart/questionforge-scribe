
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const processBook = async (bookId: string) => {
  console.log(`Processing book ${bookId}...`);
  
  try {
    // First, let's make sure we have the total pages count for accurate progress tracking
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (bookError) {
      console.error("Error fetching book data:", bookError);
      throw bookError;
    }
    
    // If total_pages is not set, we need to extract metadata first
    if (!bookData.total_pages) {
      console.log("Total pages not set, extracting metadata first...");
      await extractBookMetadata(bookId);
    }
    
    // Now start the actual processing
    const { data, error } = await supabase.functions.invoke('process-book', {
      body: { bookId, action: 'start' },
    });
    
    if (error) {
      console.error("Error processing book:", error);
      throw error;
    }
    
    return {
      success: true,
      message: "Book processing started successfully",
      book: data.book
    };
  } catch (error) {
    console.error("Error processing book:", error);
    return {
      success: false,
      message: "Failed to process book",
      error
    };
  }
};

// Add a new function to extract metadata (total pages, etc.)
export const extractBookMetadata = async (bookId: string) => {
  console.log(`Extracting metadata for book ${bookId}...`);
  
  try {
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (bookError) {
      console.error("Error fetching book:", bookError);
      throw bookError;
    }
    
    // Call the Supabase edge function to extract metadata
    const { data, error } = await supabase.functions.invoke('extract-book-metadata', {
      body: { bookId, filePath: book.file_path },
    });
    
    if (error) {
      console.error("Error extracting book metadata:", error);
      throw error;
    }
    
    // Update the book with metadata
    const { error: updateError } = await supabase
      .from('books')
      .update({
        total_pages: data.totalPages || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookId);
    
    if (updateError) {
      console.error("Error updating book metadata:", updateError);
      throw updateError;
    }
    
    return {
      success: true,
      message: "Book metadata extracted successfully",
      totalPages: data.totalPages
    };
  } catch (error) {
    console.error("Error extracting book metadata:", error);
    return {
      success: false,
      message: "Failed to extract book metadata",
      error
    };
  }
};

export const pauseProcessing = async (bookId: string) => {
  console.log(`Pausing processing for book ${bookId}...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('process-book', {
      body: { bookId, action: 'pause' },
    });
    
    if (error) {
      console.error("Error pausing book processing:", error);
      throw error;
    }
    
    return {
      success: true,
      message: "Book processing paused successfully",
      book: data.book
    };
  } catch (error) {
    console.error("Error pausing book processing:", error);
    return {
      success: false,
      message: "Failed to pause book processing",
      error
    };
  }
};

export const cancelProcessing = async (bookId: string) => {
  console.log(`Canceling processing for book ${bookId}...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('process-book', {
      body: { bookId, action: 'cancel' },
    });
    
    if (error) {
      console.error("Error canceling book processing:", error);
      throw error;
    }
    
    return {
      success: true,
      message: "Book processing canceled successfully",
      book: data.book
    };
  } catch (error) {
    console.error("Error canceling book processing:", error);
    return {
      success: false,
      message: "Failed to cancel book processing",
      error
    };
  }
};

// Add function to check and update book progress
export const updateBookProgress = async (bookId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('check-book-progress', {
      body: { bookId },
    });
    
    if (error) {
      console.error("Error checking book progress:", error);
      throw error;
    }
    
    return {
      success: true,
      progress: data.progress,
      book: data.book
    };
  } catch (error) {
    console.error("Error checking book progress:", error);
    return {
      success: false,
      message: "Failed to check book progress",
      error
    };
  }
};
