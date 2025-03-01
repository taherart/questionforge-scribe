
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get metadata from form data
    const grade = formData.get('grade') ? parseInt(formData.get('grade') as string) : null;
    const subject = formData.get('subject') as string || null;
    const semester = formData.get('semester') ? parseInt(formData.get('semester') as string) : null;

    // Sanitize file name to remove non-ASCII characters
    const fileName = (file as File).name.replace(/[^\x00-\x7F]/g, '');
    const fileExt = fileName.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    console.log(`Uploading file: ${fileName} to path: ${filePath}`);

    // Upload the file to Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('books')
      .upload(filePath, file, {
        contentType: (file as File).type,
        upsert: false
      });

    if (storageError) {
      console.error('Storage error:', storageError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: storageError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Insert the book record into the database
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .insert({
        name: fileName,
        file_path: filePath,
        grade: grade,
        subject: subject,
        semester: semester,
        total_pages: 0, // Will be updated after processing
        processed_pages: 0,
        status: 'idle',
        questions_count: 0
      })
      .select()
      .single();

    if (bookError) {
      console.error('Database error:', bookError);
      return new Response(
        JSON.stringify({ error: 'Failed to save book metadata', details: bookError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Book uploaded successfully', 
        book: bookData
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
})
