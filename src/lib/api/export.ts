
import { supabase } from "@/integrations/supabase/client";

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
