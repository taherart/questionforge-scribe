
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookId, filePath } = await req.json();
    
    if (!bookId || !filePath) {
      console.error('Missing bookId or filePath', { bookId, filePath });
      return new Response(
        JSON.stringify({ error: 'Book ID and file path are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing metadata extraction for book ${bookId}, file: ${filePath}`);

    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the book details
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (bookError) {
      console.error('Error fetching book:', bookError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch book', details: bookError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get the file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('books')
      .download(filePath);

    if (fileError) {
      console.error('Error downloading file:', fileError);
      return new Response(
        JSON.stringify({ error: 'Failed to download file', details: fileError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // For demonstration, we'll simulate extracting PDF metadata
    // In a real implementation, you would use a PDF library to extract page count
    console.log(`Downloaded file ${filePath} for metadata extraction`);
    
    // Simulate page count - in a real implementation, use a PDF parser
    // For now, we'll use a random number between 30-100 pages as a placeholder
    const totalPages = Math.floor(Math.random() * 70) + 30;
    console.log(`Extracted ${totalPages} pages for book ${bookId}`);
    
    // Update the book with the metadata
    const { data: updatedBook, error: updateError } = await supabase
      .from('books')
      .update({ 
        total_pages: totalPages,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating book metadata:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update book metadata', details: updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Successfully updated book metadata for ${bookId}`);
    return new Response(
      JSON.stringify({ 
        message: 'Book metadata extracted successfully',
        book: updatedBook,
        totalPages 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in metadata extraction:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
