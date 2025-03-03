
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath } = await req.json();
    console.log(`Extracting metadata for file: ${filePath}`);

    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'No file path provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('books')
      .download(filePath);
    
    if (fileError) {
      console.error("Error downloading file:", fileError);
      return new Response(
        JSON.stringify({ error: 'Failed to download file', details: fileError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Extract first few pages to send to OpenAI
    // For PDFs, we'll get the first few pages as text
    // This is simplified - in a real implementation you'd use a PDF parsing library
    const pdfText = await extractTextFromPDF(fileData);
    
    // Query OpenAI to analyze the PDF content
    const bookInfo = await analyzeBookWithOpenAI(pdfText);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        bookInfo 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in extract-book-metadata function:", error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Function to extract text from PDF (first few pages only)
async function extractTextFromPDF(pdfFile: Blob): Promise<string> {
  // In a real implementation, you would use a PDF parsing library
  // For this example, we'll convert the blob to base64 and send the first part to OpenAI
  const arrayBuffer = await pdfFile.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Convert first 10,000 bytes to base64 (approximate first few pages)
  // This is a simplified approach
  const base64 = btoa(String.fromCharCode(...bytes.slice(0, Math.min(10000, bytes.length))));
  
  return base64;
}

// Function to analyze book content with OpenAI
async function analyzeBookWithOpenAI(pdfContent: string): Promise<any> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an assistant that extracts educational book metadata. 
            Based on the book content, identify the following information:
            1. Grade level (as a number between 1-12)
            2. Subject (e.g., Math, Science, History, etc.)
            3. Semester (1 or 2, if applicable)
            
            Return a JSON object with these fields. If you cannot determine a field, use null.`
          },
          { 
            role: 'user', 
            content: `Analyze this educational book content to extract metadata: ${pdfContent.substring(0, 1000)}` 
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log("OpenAI response received");
    
    // Parse the AI response to extract the structured data
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsedContent = JSON.parse(content);
    
    return {
      grade: typeof parsedContent.grade === 'number' ? parsedContent.grade : null,
      subject: parsedContent.subject || null,
      semester: typeof parsedContent.semester === 'number' ? parsedContent.semester : null
    };
  } catch (error) {
    console.error("Error analyzing with OpenAI:", error);
    return { grade: null, subject: null, semester: null };
  }
}
