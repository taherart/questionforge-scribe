
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const scanBooks = async () => {
  console.log("Scanning books from Supabase storage...");
  
  try {
    // First, list all files in the books bucket
    const { data: storageFiles, error: storageError } = await supabase
      .storage
      .from('books')
      .list();
    
    if (storageError) {
      console.error("Error scanning storage:", storageError);
      throw storageError;
    }
    
    // Then get all books already in the database
    const { data: existingBooks, error: dbError } = await supabase
      .from('books')
      .select('file_path');
    
    if (dbError) {
      console.error("Error fetching existing books:", dbError);
      throw dbError;
    }
    
    // Find files that aren't in the database yet
    const existingPaths = existingBooks?.map(book => book.file_path) || [];
    const newFiles = storageFiles?.filter(file => !existingPaths.includes(file.name)) || [];
    
    console.log(`Found ${newFiles.length} new files to add to the database`);
    
    // For demo purposes, we're not automatically adding the new files to the database
    // In a real implementation, you would want to process these files
    
    return {
      success: true,
      message: `Scan complete. Found ${newFiles.length} new files.`,
      newFiles
    };
  } catch (error) {
    console.error("Error scanning books:", error);
    return {
      success: false,
      message: "Failed to scan books",
      error
    };
  }
};

export const getBooks = async () => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching books:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching books:", error);
    toast.error("Failed to fetch books");
    return [];
  }
};

export const getBookById = async (bookId: string) => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (error) {
      console.error("Error fetching book:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching book:", error);
    toast.error("Failed to fetch book details");
    return null;
  }
};

export const uploadBook = async (file: File, metadata: { grade?: number, subject?: string, semester?: number }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata.grade) {
      formData.append('grade', metadata.grade.toString());
    }
    
    if (metadata.subject) {
      formData.append('subject', metadata.subject);
    }
    
    if (metadata.semester) {
      formData.append('semester', metadata.semester.toString());
    }
    
    const { data, error } = await supabase.functions.invoke('upload-book', {
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (error) {
      console.error("Error uploading book:", error);
      throw error;
    }
    
    return {
      success: true,
      message: "Book uploaded successfully",
      book: data.book
    };
  } catch (error) {
    console.error("Error uploading book:", error);
    return {
      success: false,
      message: "Failed to upload book",
      error
    };
  }
};

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

export const exportCSV = async (bookId: string) => {
  console.log(`Exporting CSV for book ${bookId}...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('export-questions', {
      body: { bookId },
    });
    
    if (error) {
      console.error("Error exporting questions:", error);
      throw error;
    }
    
    return {
      success: true,
      message: "CSV exported successfully",
      data: {
        url: data.csvUrl,
        filename: data.filename,
        questions: data.questions
      }
    };
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return {
      success: false,
      message: "Failed to export CSV",
      error
    };
  }
};
