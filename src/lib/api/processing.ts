
import { supabase } from "@/integrations/supabase/client";

export const processBook = async (bookId: string) => {
  console.log(`Processing book ${bookId}...`);
  
  try {
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
