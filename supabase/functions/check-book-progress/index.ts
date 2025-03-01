
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
    const { bookId } = await req.json();
    
    if (!bookId) {
      return new Response(
        JSON.stringify({ error: 'Book ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

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

    // If processing, simulate progress update
    if (book.status === 'processing') {
      const totalPages = book.total_pages || 100;
      let processedPages = book.processed_pages || 0;
      
      // Simulate processing more pages
      // In a real implementation, you would check actual progress
      if (processedPages < totalPages) {
        // Advance by 1-5 pages each check
        const newPages = Math.min(Math.floor(Math.random() * 5) + 1, totalPages - processedPages);
        processedPages += newPages;
        
        // Generate some simulated questions (1-3 per page)
        const newQuestions = Math.floor(Math.random() * 3 * newPages) + newPages;
        const questionsCount = (book.questions_count || 0) + newQuestions;
        
        // Update the book progress
        const { data: updatedBook, error: updateError } = await supabase
          .from('books')
          .update({ 
            processed_pages: processedPages,
            questions_count: questionsCount,
            status: processedPages >= totalPages ? 'completed' : 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', bookId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating book progress:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update book progress', details: updateError }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        // Update completed if reached 100%
        if (processedPages >= totalPages) {
          console.log(`Book ${bookId} processing completed!`);
        }

        return new Response(
          JSON.stringify({ 
            message: 'Book progress updated',
            book: updatedBook,
            progress: { 
              processedPages,
              totalPages,
              percentage: Math.round((processedPages / totalPages) * 100)
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    // If not processing or already complete, just return current status
    return new Response(
      JSON.stringify({ 
        message: 'Book progress checked',
        book,
        progress: { 
          processedPages: book.processed_pages || 0,
          totalPages: book.total_pages || 0,
          percentage: book.total_pages 
            ? Math.round(((book.processed_pages || 0) / book.total_pages) * 100) 
            : 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
