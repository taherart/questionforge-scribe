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
    const newFiles = storageFiles?.filter(file => 
      !existingPaths.includes(file.name) && 
      file.name.toLowerCase().endsWith('.pdf')
    ) || [];
    
    console.log(`Found ${newFiles.length} new PDF files to add to the database`);
    
    // Add new files to the database
    if (newFiles.length > 0) {
      const booksToInsert = newFiles.map(file => ({
        name: file.name,
        file_path: file.name,
        status: 'idle'
      }));
      
      const { data: insertedBooks, error: insertError } = await supabase
        .from('books')
        .insert(booksToInsert)
        .select();
      
      if (insertError) {
        console.error("Error adding new books to database:", insertError);
        throw insertError;
      }
      
      console.log(`Added ${insertedBooks?.length || 0} new books to database`);
    }
    
    return {
      success: true,
      message: `Scan complete. Found and added ${newFiles.length} new PDF files.`,
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
    // Create a form data object to send the file and metadata
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata to the form data if provided
    if (metadata.grade) {
      formData.append('grade', metadata.grade.toString());
    }
    
    if (metadata.subject) {
      formData.append('subject', metadata.subject);
    }
    
    if (metadata.semester) {
      formData.append('semester', metadata.semester.toString());
    }
    
    // Upload the file to Supabase storage
    const fileName = file.name.replace(/[^\x00-\x7F]/g, ''); // Sanitize filename
    const fileExt = fileName.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('books')
      .upload(filePath, file);
      
    if (storageError) {
      console.error("Error uploading to storage:", storageError);
      throw storageError;
    }
    
    // Insert record into the books table
    const { data: bookData, error: dbError } = await supabase
      .from('books')
      .insert({
        name: fileName,
        file_path: filePath,
        grade: metadata.grade,
        subject: metadata.subject,
        semester: metadata.semester,
        status: 'idle',
      })
      .select()
      .single();
    
    if (dbError) {
      console.error("Error inserting book record:", dbError);
      
      // Clean up the uploaded file if database insert fails
      await supabase.storage
        .from('books')
        .remove([filePath]);
        
      throw dbError;
    }
    
    return {
      success: true,
      message: "Book uploaded successfully",
      book: bookData
    };
  } catch (error) {
    console.error("Error in uploadBook:", error);
    return {
      success: false,
      message: "Failed to upload book: " + (error.message || String(error)),
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
