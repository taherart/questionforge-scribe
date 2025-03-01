
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
    
    // Check if book is in a valid state to start processing
    if (bookData.status !== 'idle' && bookData.status !== 'paused') {
      return {
        success: false,
        message: `Cannot start processing a book with status: ${bookData.status}`,
        book: bookData
      };
    }
    
    // If total_pages is not set, we need to extract metadata first
    if (!bookData.total_pages) {
      console.log("Total pages not set, extracting metadata first...");
      const metadataResult = await extractBookMetadata(bookId);
      if (!metadataResult.success) {
        throw new Error("Failed to extract book metadata");
      }
    }
    
    // Update the book status to processing
    const { error: updateError } = await supabase
      .from('books')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookId);
    
    if (updateError) {
      console.error("Error updating book status:", updateError);
      throw updateError;
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
      book: data?.book || bookData
    };
  } catch (error) {
    console.error("Error processing book:", error);
    return {
      success: false,
      message: "Failed to process book: " + (error.message || String(error)),
      error
    };
  }
};

// Extract metadata (total pages, etc.)
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
    
    const totalPages = data?.totalPages || 0;
    
    // Update the book with metadata
    const { error: updateError } = await supabase
      .from('books')
      .update({
        total_pages: totalPages,
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
      totalPages: totalPages
    };
  } catch (error) {
    console.error("Error extracting book metadata:", error);
    return {
      success: false,
      message: "Failed to extract book metadata: " + (error.message || String(error)),
      error
    };
  }
};

export const pauseProcessing = async (bookId: string) => {
  console.log(`Pausing processing for book ${bookId}...`);
  
  try {
    // First check the current status
    const { data: currentBook, error: checkError } = await supabase
      .from('books')
      .select('status')
      .eq('id', bookId)
      .single();
      
    if (checkError) {
      console.error("Error checking book status:", checkError);
      throw checkError;
    }
    
    // Only attempt to change status if the book is currently in 'processing' state
    if (currentBook.status !== 'processing') {
      console.log(`Book ${bookId} is not in processing state, current state: ${currentBook.status}`);
      // Return early without trying to update status
      return {
        success: false,
        message: `Cannot pause book that is not processing (current status: ${currentBook.status})`,
      };
    }
    
    // Update the book status to paused
    const { error: updateError } = await supabase
      .from('books')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookId);
    
    if (updateError) {
      console.error("Error updating book status:", updateError);
      throw updateError;
    }
    
    // Then call the edge function
    const { data, error } = await supabase.functions.invoke('process-book', {
      body: { bookId, action: 'pause' },
    });
    
    if (error) {
      console.error("Error pausing book processing:", error);
      throw error;
    }
    
    // Fetch the updated book to return
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (bookError) {
      console.error("Error fetching updated book:", bookError);
      throw bookError;
    }
    
    return {
      success: true,
      message: "Book processing paused successfully",
      book: book
    };
  } catch (error) {
    console.error("Error pausing book processing:", error);
    return {
      success: false,
      message: "Failed to pause book processing: " + (error.message || String(error)),
      error
    };
  }
};

export const cancelProcessing = async (bookId: string) => {
  console.log(`Canceling processing for book ${bookId}...`);
  
  try {
    // First check the current status
    const { data: currentBook, error: checkError } = await supabase
      .from('books')
      .select('status')
      .eq('id', bookId)
      .single();
      
    if (checkError) {
      console.error("Error checking book status:", checkError);
      throw checkError;
    }
    
    // Only attempt to change status if the book is currently in 'processing' state
    if (currentBook.status !== 'processing') {
      console.log(`Book ${bookId} is not in processing state, current state: ${currentBook.status}`);
      // Return early without trying to update status
      return {
        success: false,
        message: `Cannot cancel book that is not processing (current status: ${currentBook.status})`,
      };
    }
    
    // Update the book status to canceled
    const { error: updateError } = await supabase
      .from('books')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookId);
    
    if (updateError) {
      console.error("Error updating book status:", updateError);
      throw updateError;
    }
    
    // Then call the edge function
    const { data, error } = await supabase.functions.invoke('process-book', {
      body: { bookId, action: 'cancel' },
    });
    
    if (error) {
      console.error("Error canceling book processing:", error);
      throw error;
    }
    
    // Fetch the updated book to return
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (bookError) {
      console.error("Error fetching updated book:", bookError);
      throw bookError;
    }
    
    return {
      success: true,
      message: "Book processing canceled successfully",
      book: book
    };
  } catch (error) {
    console.error("Error canceling book processing:", error);
    return {
      success: false,
      message: "Failed to cancel book processing: " + (error.message || String(error)),
      error
    };
  }
};

// Add function to check and update book progress
export const updateBookProgress = async (bookId: string) => {
  try {
    // First check if the book is in processing state
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (bookError) {
      console.error("Error fetching book:", bookError);
      throw bookError;
    }
    
    // Only call the function if the book is in processing state
    if (book.status !== 'processing') {
      return {
        success: true,
        progress: book.processed_pages ? (book.processed_pages / book.total_pages) * 100 : 0,
        book: book
      };
    }
    
    // Call the Supabase edge function to check progress
    const { data, error } = await supabase.functions.invoke('check-book-progress', {
      body: { bookId },
    });
    
    if (error) {
      console.error("Error checking book progress:", error);
      throw error;
    }
    
    return {
      success: true,
      progress: data?.progress || 0,
      book: data?.book || book
    };
  } catch (error) {
    console.error("Error checking book progress:", error);
    return {
      success: false,
      message: "Failed to check book progress: " + (error.message || String(error)),
      error
    };
  }
};
