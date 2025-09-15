import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { logoGenerationRequestSchema, type GeneratedLogo, contentGenerationRequestSchema, pageRegenerationRequestSchema, projectSubmissionSchema, type ProjectSubmission } from "../shared/schema";

// OpenAI integration - the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function registerRoutes(app: Express): Promise<Server> {
  // Business name generation endpoint
  app.post("/api/generate-names", async (req, res) => {
    try {
      const { description, nameIdea } = req.body;
      
      // Validate input - need at least description OR nameIdea
      if ((!description || description.trim().length === 0) && (!nameIdea || nameIdea.trim().length === 0)) {
        return res.status(400).json({ 
          error: "Business description or name idea is required" 
        });
      }

      let prompt = "";
      
      if (nameIdea && nameIdea.trim().length > 0) {
        // Generate variations based on business name idea
        const businessContext = description && description.trim().length > 0 
          ? `\n\nBusiness Context: "${description.trim()}"`
          : "";
        
        prompt = `Based on this business name idea: "${nameIdea.trim()}"${businessContext}

Generate 5 creative variations and alternatives for this business name. The names should be:
- Similar in style and feeling to the original idea
- Memorable and brandable
- Professional and trustworthy
- Easy to spell and pronounce
- Available as potential domain names (avoid very common words)
- Reflect the business's purpose and values

Respond with JSON in this format:
{
  "names": ["Name 1", "Name 2", "Name 3", "Name 4", "Name 5"]
}`;
      } else {
        // Generate names based on business description only
        prompt = `Based on this business description: "${description.trim()}"

Generate 5 creative, professional business names that would be suitable for this business. The names should be:
- Memorable and brandable
- Professional and trustworthy
- Easy to spell and pronounce
- Available as potential domain names (avoid very common words)
- Reflect the business's purpose and values

Respond with JSON in this format:
{
  "names": ["Name 1", "Name 2", "Name 3", "Name 4", "Name 5"]
}`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a creative business naming expert. Generate professional, memorable business names that would work well for branding and marketing."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8, // Restore creative temperature for name generation
        max_tokens: 300 // Correct parameter for gpt-4o with Chat Completions
      });

      console.log("OpenAI response:", JSON.stringify(response, null, 2));
      
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        console.error("Failed to get content from response:", {
          choices: response.choices,
          hasChoices: !!response.choices,
          choicesLength: response.choices?.length,
          firstChoice: response.choices?.[0],
          message: response.choices?.[0]?.message
        });
        throw new Error("No content received from AI");
      }
      
      const result = JSON.parse(content);
      
      // Validate the response structure
      if (!result.names || !Array.isArray(result.names) || result.names.length === 0) {
        throw new Error("Invalid response format from AI");
      }

      res.json({ 
        names: result.names.slice(0, 5) // Ensure we only return max 5 names
      });

    } catch (error) {
      console.error("Error generating business names:", error);
      
      // Provide fallback names if AI fails
      const fallbackNames = [
        "Prime Solutions",
        "Elite Services",
        "Apex Partners",
        "Summit Group",
        "Pinnacle Co"
      ];

      res.json({ 
        names: fallbackNames,
        fallback: true
      });
    }
  });

  // Logo generation endpoint
  app.post("/api/logo/generate", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validationResult = logoGenerationRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.errors 
        });
      }
      
      const { businessName, description, preferences, referenceImageBase64 } = validationResult.data;
      
      // Build the logo description prompt
      const logoTypes = preferences.types.join(", ");
      const logoStyles = preferences.styles.join(", ");
      const colorInfo = preferences.colors ? ` with ${preferences.colors} colors` : "";
      
      const businessInfo = businessName ? `"${businessName}" ` : "";
      const basePrompt = `Clean logo design for ${businessInfo}business: "${description}"`;
      
      const stylePrompt = `Design style: ${logoStyles}. Logo type: ${logoTypes}${colorInfo}.`;
      
      const formatPrompt = "IMPORTANT: Show ONLY the logo itself - straight-on view, centered, no mockups, no business cards, no letterheads, no stationary, no angled views, no backgrounds with textures. Just the clean logo design isolated on a plain white or transparent background.";
      
      const qualityPrompt = "High-quality, clean, scalable vector-style design ready for tracing and professional use.";
      
      const fullPrompt = `${basePrompt}. ${stylePrompt}. ${formatPrompt} ${qualityPrompt}`;
      
      console.log("Generating logo with prompt:", fullPrompt);
      
      // Generate multiple logo variations (3 logos for better reliability)
      const responses = [];
      const maxRetries = 2;
      
      for (let i = 0; i < 3; i++) {
        let retries = 0;
        let success = false;
        
        while (retries <= maxRetries && !success) {
          try {
            console.log(`Generating logo ${i + 1}/3 (attempt ${retries + 1})`);
            
            const response = await openai.images.generate({
              model: "dall-e-3", 
              prompt: fullPrompt,
              n: 1,
              size: "1024x1024",
              quality: "standard",
              response_format: "b64_json"
            });
            
            responses.push(response);
            success = true;
            console.log(`Logo ${i + 1} generated successfully`);
            
          } catch (error: any) {
            retries++;
            console.error(`Error generating logo ${i + 1}, attempt ${retries}:`, error.message);
            
            if (retries > maxRetries) {
              console.error(`Failed to generate logo ${i + 1} after ${maxRetries + 1} attempts`);
              // Continue with fewer logos rather than failing completely
              break;
            }
            
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // Filter out failed responses and map to GeneratedLogo format
      const generatedLogos: GeneratedLogo[] = [];
      
      responses.forEach((response, index) => {
        const imageData = response.data?.[0];
        if (imageData?.b64_json) {
          generatedLogos.push({
            id: `logo-${Date.now()}-${index}`,
            dataUrl: `data:image/png;base64,${imageData.b64_json}`,
            prompt: fullPrompt
          });
        }
      });
      
      if (generatedLogos.length === 0) {
        return res.status(500).json({ 
          error: "Unable to generate any logos at this time. Please try again with different preferences or check your internet connection."
        });
      }
      
      console.log(`Generated ${generatedLogos.length} logos successfully`);
      
      res.json({ logos: generatedLogos });
      
    } catch (error: any) {
      console.error("Error generating logos:", error);
      
      // Provide helpful error message
      if (error.code === 'insufficient_quota') {
        return res.status(503).json({ 
          error: "Logo generation service temporarily unavailable. Please try again later."
        });
      }
      
      if (error.code === 'content_policy_violation') {
        return res.status(400).json({ 
          error: "Unable to generate logo with the provided description. Please try different preferences or description."
        });
      }
      
      res.status(500).json({ 
        error: "Failed to generate logos. Please try again."
      });
    }
  });

  // Content generation endpoint
  app.post("/api/content/generate", async (req, res) => {
    try {
      const { contentGenerationRequestSchema } = await import("@shared/schema");
      
      // Validate request body
      const validationResult = contentGenerationRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.errors 
        });
      }
      
      const { businessName, businessDescription, siteType, pages, preferences, pageDirections } = validationResult.data;
      
      console.log("Generating content for pages:", pages.map(p => p.name));
      
      const generatedContent = [];
      
      for (const page of pages) {
        try {
          // Find user direction for this page
          const userDirection = pageDirections?.find(d => d.pageId === page.id)?.direction;
          
          const contentPrompt = buildContentPrompt(
            businessName, 
            businessDescription, 
            siteType, 
            page, 
            preferences,
            userDirection
          );
          
          console.log(`Generating content for ${page.name} page...`);
          
          // Generate content with retry logic
          let response: any = null;
          let currentPrompt = contentPrompt;
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`Attempt ${attempt} for ${page.name} page content generation`);
              
              response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  {
                    role: "system",
                    content: "You are a professional web copywriter specializing in comprehensive, conversion-focused website content. Generate full, detailed website copy with multiple substantial paragraphs, compelling headlines, and complete sections. CRITICAL: Always include the business name prominently in the first paragraph and throughout the content. Never provide single sentences - always create comprehensive, ready-to-publish content. Return ONLY valid JSON: { \"content\": \"comprehensive multi-paragraph content with headlines and full sections\", \"suggestions\": [\"specific actionable tip 1\", \"specific actionable tip 2\", \"specific actionable tip 3\"] }"
                  },
                  {
                    role: "user",
                    content: currentPrompt
                  }
                ],
                response_format: { type: "json_object" },
                max_tokens: 1400,
                temperature: attempt > 1 ? 0.2 : 0.7
              });
              
              console.log(`OpenAI usage for ${page.name}:`, response.usage);
              console.log(`Finish reason for ${page.name}:`, response.choices[0].finish_reason);
              break; // Success, exit retry loop
              
            } catch (error: any) {
              console.error(`Attempt ${attempt} failed for ${page.name}:`, error.message);
              if (attempt === 3) throw error; // Final attempt failed
              
              // Shorten prompt for retry
              currentPrompt = `Create website copy for ${page.name} page. Business: ${businessName} - ${businessDescription}. Make it ${preferences.tone} and ${preferences.style === 'text-heavy' ? 'detailed' : 'concise'}.`;
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
            }
          }
          
          const responseContent = response.choices[0].message.content;
          console.log(`Raw OpenAI response for ${page.name} (first 300 chars):`, responseContent?.substring(0, 300));
          
          if (!responseContent || responseContent.trim() === '') {
            throw new Error('OpenAI returned empty response');
          }
          
          // Tolerant JSON parsing
          let result;
          try {
            // Try direct JSON parse first
            result = JSON.parse(responseContent);
          } catch (parseError: any) {
            console.log(`Direct JSON parse failed for ${page.name}, trying tolerant parsing...`);
            
            // Try to extract JSON from ```json fences or find JSON object
            let cleanContent = responseContent.trim();
            
            // Remove markdown fences if present
            cleanContent = cleanContent.replace(/^```json\n?/gi, '').replace(/\n?```$/g, '');
            
            // Try to find the first complete JSON object
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                result = JSON.parse(jsonMatch[0]);
                console.log(`Tolerant JSON parsing succeeded for ${page.name}`);
              } catch (secondParseError) {
                console.log(`Tolerant parsing also failed for ${page.name}, using fallback`);
                // Fallback: wrap the whole content
                result = {
                  content: cleanContent,
                  suggestions: ["Edit and enhance this content", "Add more specific details", "Include calls-to-action"]
                };
              }
            } else {
              console.log(`No JSON structure found for ${page.name}, using fallback`);
              // Fallback: wrap the whole content
              result = {
                content: cleanContent,
                suggestions: ["Edit and enhance this content", "Add more specific details", "Include calls-to-action"]
              };
            }
          }
          
          // Ensure result has required structure
          if (!result.content) {
            result.content = `Welcome to our ${page.name.toLowerCase()} page. ${businessDescription} We're committed to providing excellent service and value to our customers.`;
          }
          if (!result.suggestions || !Array.isArray(result.suggestions)) {
            result.suggestions = ["Add your unique value proposition", "Include customer testimonials", "Add clear call-to-action buttons"];
          }
          
          generatedContent.push({
            pageId: page.id,
            pageName: page.name,
            content: result.content,
            suggestions: result.suggestions || []
          });
          
          console.log(`Content generated for ${page.name} page`);
          
        } catch (error: any) {
          console.error(`Error generating content for ${page.name}:`, error);
          
          // Add fallback content for this page
          generatedContent.push({
            pageId: page.id,
            pageName: page.name,
            content: `Welcome to our ${page.name.toLowerCase()} page. ${businessDescription} We're committed to providing excellent service and value to our customers.`,
            suggestions: ["Add your unique value proposition", "Include customer testimonials", "Add clear call-to-action buttons"]
          });
        }
      }
      
      console.log(`Generated content for ${generatedContent.length} pages`);
      
      res.json({ content: generatedContent });
      
    } catch (error) {
      console.error("Content generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate content", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Individual page regeneration route
  app.post('/api/content/regenerate', async (req, res) => {
    try {
      const validatedData = pageRegenerationRequestSchema.parse(req.body);
      const { businessName, businessDescription, siteType, page, preferences, pageDirection } = validatedData;
      
      console.log(`Regenerating content for ${page.name} page...`);
      
      // Build enhanced prompt with custom direction
      let contentPrompt = buildContentPrompt(businessName, businessDescription, siteType, page, preferences);
      
      if (pageDirection) {
        contentPrompt += `\n\nSPECIAL INSTRUCTIONS: ${pageDirection}`;
      }
      
      console.log(`Regenerating content for ${page.name} page...`);
      
      // Generate content for the specific page with retry logic
      let response: any = null;
      let currentPrompt = contentPrompt;
      let result;
      
      try {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`Regeneration attempt ${attempt} for ${page.name} page`);
            
            response = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: "You are a professional web copywriter specializing in comprehensive, conversion-focused website content. Generate full, detailed website copy with multiple substantial paragraphs, compelling headlines, and complete sections. CRITICAL: Always include the business name prominently in the first paragraph and throughout the content. Never provide single sentences - always create comprehensive, ready-to-publish content. Return ONLY valid JSON: { \"content\": \"comprehensive multi-paragraph content with headlines and full sections\", \"suggestions\": [\"specific actionable tip 1\", \"specific actionable tip 2\", \"specific actionable tip 3\"] }"
                },
                {
                  role: "user",
                  content: currentPrompt
                }
              ],
              response_format: { type: "json_object" },
              max_tokens: 1400,
              temperature: attempt > 1 ? 0.2 : 0.7
            });
            
            console.log(`OpenAI usage for ${page.name} regeneration:`, response.usage);
            console.log(`Finish reason for ${page.name} regeneration:`, response.choices[0].finish_reason);
            break; // Success, exit retry loop
            
          } catch (error: any) {
            console.error(`Regeneration attempt ${attempt} failed for ${page.name}:`, error.message);
            if (attempt === 3) throw error; // Final attempt failed
            
            // Shorten prompt for retry
            currentPrompt = `Create website copy for ${page.name} page. Business: ${businessName} - ${businessDescription}. Make it ${preferences.tone} and ${preferences.style === 'text-heavy' ? 'detailed' : 'concise'}.`;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          }
        }
        
        const responseContent = response.choices[0].message.content;
        console.log(`Raw OpenAI regeneration response for ${page.name} (first 300 chars):`, responseContent?.substring(0, 300));
        
        if (!responseContent || responseContent.trim() === '') {
          throw new Error('OpenAI returned empty response during regeneration');
        }
        
        // Tolerant JSON parsing (same as main route)
        try {
          result = JSON.parse(responseContent);
        } catch (parseError: any) {
          console.log(`Direct JSON parse failed for ${page.name} regeneration, trying tolerant parsing...`);
          
          let cleanContent = responseContent.trim();
          cleanContent = cleanContent.replace(/^```json\n?/gi, '').replace(/\n?```$/g, '');
          
          const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              result = JSON.parse(jsonMatch[0]);
              console.log(`Tolerant JSON parsing succeeded for ${page.name} regeneration`);
            } catch (secondParseError) {
              console.log(`Tolerant parsing also failed for ${page.name} regeneration, using fallback`);
              result = {
                content: cleanContent,
                suggestions: ["Edit and enhance this content", "Add more specific details", "Include calls-to-action"]
              };
            }
          } else {
            console.log(`No JSON structure found for ${page.name} regeneration, using fallback`);
            result = {
              content: cleanContent,
              suggestions: ["Edit and enhance this content", "Add more specific details", "Include calls-to-action"]
            };
          }
        }
        
      } catch (error: any) {
        console.error(`All regeneration attempts failed for ${page.name}:`, error.message);
        // Instead of throwing, use fallback content (graceful degradation)
        result = {
          content: `Welcome to our ${page.name.toLowerCase()} page. ${businessDescription} We're committed to providing excellent service and value to our customers.`,
          suggestions: ["Add your unique value proposition", "Include customer testimonials", "Add clear call-to-action buttons"]
        };
      }
      
      // Ensure result has required structure
      if (!result.content) {
        result.content = `Welcome to our ${page.name.toLowerCase()} page. ${businessDescription} We're committed to providing excellent service and value to our customers.`;
      }
      if (!result.suggestions || !Array.isArray(result.suggestions)) {
        result.suggestions = ["Add your unique value proposition", "Include customer testimonials", "Add clear call-to-action buttons"];
      }
      
      const generatedContent = {
        pageId: page.id,
        pageName: page.name,
        content: result.content,
        suggestions: result.suggestions
      };
      
      console.log(`Content regenerated for ${page.name} page`);
      
      res.json({ content: generatedContent });
      
    } catch (error: any) {
      console.error("Page regeneration error:", error);
      res.status(500).json({ 
        error: "Failed to regenerate content", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  function buildContentPrompt(
    businessName: string, 
    businessDescription: string, 
    siteType: string, 
    page: { name: string; path: string }, 
    preferences: { style: string; useVideo: boolean; tone: string },
    userDirection?: string
  ): string {
    const businessInfo = `Business: "${businessName}" - ${businessDescription}`;
    const siteInfo = `Website type: ${siteType}`;
    const pageInfo = `Page: ${page.name} (${page.path})`;
    
    const styleGuidance = {
      'text-heavy': 'Generate 4-6 substantial paragraphs with detailed explanations, comprehensive information, and thorough coverage of the topic. Include multiple sections with descriptive subheadings.',
      'visual-focused': 'Generate 2-3 concise but compelling paragraphs. Include specific suggestions for images, graphics, charts, or visual elements with detailed descriptions of what should be shown.',
      'balanced': 'Generate 3-4 well-developed paragraphs that balance informative text with clear suggestions for supporting visuals and multimedia elements.'
    }[preferences.style];
    
    const toneGuidance = {
      'professional': 'Use professional, authoritative language with industry expertise and credibility',
      'casual': 'Use friendly, conversational language that feels like talking to a trusted friend',
      'friendly': 'Use warm, approachable language that makes visitors feel welcome and valued',
      'authoritative': 'Use confident, expert language that establishes leadership and trustworthiness'
    }[preferences.tone];
    
    const videoNote = preferences.useVideo ? 
      '\n\nVIDEO INTEGRATION: The client wants to create their own video content. Suggest 2-3 specific places where video would be most effective and describe what type of video content would work best (testimonials, product demos, behind-the-scenes, etc.).' : 
      '';
    
    const pageSpecificGuidance = getPageSpecificGuidance(page.name, siteType);
    
    const userDirectionNote = userDirection ? 
      `\n\nSPECIAL USER DIRECTION: ${userDirection}
IMPORTANT: Follow this specific direction closely and incorporate it prominently into the content.` : '';
    
    return `Create comprehensive website copy for a ${page.name} page.

BUSINESS CONTEXT:
${businessInfo}
Website Type: ${siteType}

CRITICAL REQUIREMENTS:
- MUST include the business name "${businessName}" prominently in the first paragraph and throughout the content
- MUST reference specific services/products mentioned in business description
- MUST create multiple substantial paragraphs (minimum 3-4 paragraphs)
- MUST include compelling headlines and clear section breaks${userDirectionNote}

CONTENT REQUIREMENTS:
${pageSpecificGuidance}

STYLE & TONE:
- ${styleGuidance}
- ${toneGuidance}
- Make it engaging, conversion-focused, and appropriate for the target audience
- Include compelling headlines and clear calls-to-action${videoNote}

Generate complete, ready-to-use web copy with proper structure, headings, and full paragraphs.`;
  }

  function getPageSpecificGuidance(pageName: string, siteType: string): string {
    const guidance: { [key: string]: string } = {
      'Home': `Create a compelling homepage that includes: a powerful headline, value proposition, key benefits/services, social proof elements, and strong call-to-action. This should immediately communicate what the business does and why visitors should care.`,
      'About': `Write an engaging about page that tells the company story, highlights expertise and experience, introduces team members or founder, explains the company mission/values, and builds trust and credibility.`,
      'Services': `Detail the main services offered, explain the benefits of each service, include pricing information if appropriate, address common customer pain points, and provide clear next steps for getting started.`,
      'Products': `Showcase key products with detailed descriptions, highlight unique features and benefits, include technical specifications if relevant, mention pricing and availability, and provide easy purchasing options.`,
      'Contact': `Provide multiple ways to get in touch, include business hours and location details, set expectations for response times, add a compelling reason to contact the business, and make the process as easy as possible.`,
      'Blog': `Create an introduction to the blog section, explain what type of content visitors can expect, highlight recent or popular posts, and encourage subscription or regular visits.`,
      'Portfolio': `Showcase the best work examples, explain the process and approach, highlight results and client satisfaction, demonstrate expertise across different projects, and encourage potential clients to start a conversation.`,
      'FAQ': `Address the most common customer questions, provide detailed helpful answers, anticipate concerns or objections, organize information logically, and guide visitors toward taking action.`,
      'Testimonials': `Present customer success stories and reviews, highlight specific results and benefits, build credibility and trust, show diverse client experiences, and encourage new customers to get started.`,
      'Pricing': `Clearly explain pricing options and packages, highlight value and benefits for each tier, address common concerns about cost, provide easy ways to get started, and include testimonials or guarantees if applicable.`
    };
    
    return guidance[pageName] || `Create compelling content for the ${pageName} page that aligns with the overall ${siteType} website goals and helps convert visitors into customers.`;
  }

  // Project submission endpoint
  app.post("/api/project/submit", async (req, res) => {
    try {
      // Validate the submission data (excluding submittedAt since storage will add it)
      const { submittedAt, ...submissionData } = projectSubmissionSchema.parse(req.body);

      // Store the submission using the storage layer
      const storedSubmission = await storage.createProjectSubmission(submissionData);

      console.log('Project submission received and stored:', {
        id: storedSubmission.id,
        businessName: storedSubmission.businessName,
        submittedAt: storedSubmission.submittedAt,
        pages: storedSubmission.pages.length,
        hasContent: storedSubmission.generatedContent.length > 0,
        hasLogo: !!storedSubmission.selectedLogo || !!storedSubmission.logoFile
      });

      // Here you would typically:
      // 1. Send notification emails
      // 2. Create project in project management system
      // 3. Trigger workflows

      res.json({
        success: true,
        projectId: storedSubmission.id,
        message: "Creative brief submitted successfully! Our team will review it and reach out within 24 hours.",
        submittedAt: storedSubmission.submittedAt
      });

    } catch (error: any) {
      console.error('Project submission error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: "Invalid submission data",
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: "Failed to submit project. Please try again."
      });
    }
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
