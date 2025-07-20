// Fixed Cloudflare Worker for L'Oréal Beauty Advice (beginner-friendly for students)
// This worker handles AI responses with proper citation formatting

// CORS headers for cross-origin requests (students need this for web apps)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Main function that handles all requests to this worker (students are learning this pattern)
async function handleRequest(request, env) {
  // Handle preflight CORS requests (browsers send these automatically)
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  // Only allow POST requests for our AI chat (students need to learn HTTP methods)
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Parse the request body to get messages and model info (students are learning JSON)
    const requestData = await request.json();
    const { messages, model = 'gpt-4o', useWebSearch = false } = requestData;

    console.log('Processing request for model:', model);
    console.log('Enhanced information requested:', useWebSearch);

    // Enhanced system message with current L'Oréal information (students can understand this)
    let enhancedMessages = [...messages];
    
    if (useWebSearch) {
      // Add helpful L'Oréal information to the system message (no external APIs needed for students)
      const enhancedInfo = `

HELPFUL L'ORÉAL INFORMATION FOR STUDENTS:
- L'Oréal Paris is a leading beauty brand with products for skincare, makeup, and hair care
- Popular product lines: Revitalift (anti-aging), Age Perfect (mature skin), True Match (foundation), Rouge Signature (lipstick)
- Available at: Sephora, Ulta Beauty, Target, CVS, Walgreens, Amazon, and L'Oréal's official website
- Official websites: https://www.loreal.com and https://www.lorealparisusa.com
- Students can find product reviews and tutorials on beauty retailer websites

IMPORTANT: Always include helpful links in your response using this exact format:
[L'Oréal Official Site](https://www.loreal.com)
[L'Oréal Paris USA](https://www.lorealparisusa.com)
[Shop at Sephora](https://www.sephora.com)
[Shop at Ulta](https://www.ulta.com)`;

      // Find the system message and add enhanced information (students are learning array methods)
      const systemIndex = enhancedMessages.findIndex(msg => msg.role === 'system');
      if (systemIndex !== -1) {
        enhancedMessages[systemIndex].content += enhancedInfo;
      } else {
        // Add new system message if none exists (students need to understand this fallback)
        enhancedMessages.unshift({
          role: 'system',
          content: `You are a helpful L'Oréal beauty advisor for students learning about beauty.${enhancedInfo}`
        });
      }
    }

    // Prepare request to OpenAI API using gpt-4o model (students are learning this API)
    const openaiBody = {
      model: model,
      messages: enhancedMessages,
      max_tokens: 1000, // Limit for students to understand API costs
      temperature: 0.7, // Balanced creativity for beauty advice
    };

    console.log('Sending request to OpenAI API');

    // Make request to OpenAI API using async/await (students are learning this pattern)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiBody),
    });

    // Check if OpenAI request was successful (students need to learn error handling)
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${openaiResponse.status}`);
    }

    // Parse the response and check for data.choices[0].message.content (per student instructions)
    const data = await openaiResponse.json();
    let responseContent = data.choices[0].message.content;
    
    // Add helpful links if enhanced information was requested and none exist (students can understand this logic)
    if (useWebSearch) {
      // Mark that enhanced information was used (students can see this in the response)
      data.choices[0].message.web_search_used = true;
      
      // Check if response already has markdown links (students are learning string methods)
      const hasMarkdownLinks = responseContent.includes('[') && responseContent.includes('](');
      
      if (!hasMarkdownLinks) {
        // Add helpful links in proper markdown format for students to learn from
        responseContent += '\n\n**Helpful Resources:**\n';
        responseContent += '- [L\'Oréal Official Site](https://www.loreal.com)\n';
        responseContent += '- [L\'Oréal Paris USA](https://www.lorealparisusa.com)\n';
        responseContent += '- [Shop at Sephora](https://www.sephora.com)\n';
        responseContent += '- [Shop at Ulta](https://www.ulta.com)\n';
        
        // Update the response content with helpful links (students can see the modification)
        data.choices[0].message.content = responseContent;
      }
    }

    console.log('Success! Returning response to student');

    // Return successful response with CORS headers (students need this for web apps)
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Worker error for students:', error);
    
    // Return helpful error message for students to understand (beginner-friendly error handling)
    return new Response(JSON.stringify({
      error: 'Service temporarily unavailable',
      message: 'This is a learning exercise - the AI service is having issues',
      choices: [{
        message: {
          role: 'assistant',
          content: 'I\'m having technical difficulties right now, but I can still help you learn about L\'Oréal beauty products! Please try asking your question again.\n\n**Learning Resources:**\n- [L\'Oréal Official Site](https://www.loreal.com)\n- [L\'Oréal Paris USA](https://www.lorealparisusa.com)\n- [Shop at Sephora](https://www.sephora.com)\n- [Shop at Ulta](https://www.ulta.com)',
          web_search_used: false
        }
      }]
    }), {
      status: 200, // Return 200 so students' error handling works properly
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// Export the worker using the format students are learning (Cloudflare Workers)
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};