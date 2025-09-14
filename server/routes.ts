import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { logoGenerationRequestSchema, type GeneratedLogo } from "../shared/schema";

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
        max_tokens: 300 // Using standard parameter for GPT-4o
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
      
      const { businessName, businessDescription, siteType, pages, preferences } = validationResult.data;
      
      console.log("Generating content for pages:", pages.map(p => p.name));
      
      const generatedContent = [];
      
      for (const page of pages) {
        try {
          const contentPrompt = buildContentPrompt(
            businessName, 
            businessDescription, 
            siteType, 
            page, 
            preferences
          );
          
          console.log(`Generating content for ${page.name} page...`);
          
          // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
          const response = await openai.chat.completions.create({
            model: "gpt-5",
            messages: [
              {
                role: "system",
                content: "You are a professional web copywriter. Generate engaging, conversion-focused content for website pages. Respond with JSON in this format: { \"content\": \"page content here\", \"suggestions\": [\"tip1\", \"tip2\"] }"
              },
              {
                role: "user",
                content: contentPrompt
              }
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 1000
          });
          
          const result = JSON.parse(response.choices[0].message.content);
          
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

  function buildContentPrompt(
    businessName: string, 
    businessDescription: string, 
    siteType: string, 
    page: { name: string; path: string }, 
    preferences: { style: string; useVideo: boolean; tone: string }
  ): string {
    const businessInfo = `Business: "${businessName}" - ${businessDescription}`;
    const siteInfo = `Website type: ${siteType}`;
    const pageInfo = `Page: ${page.name}`;
    
    const styleGuidance = {
      'text-heavy': 'Focus on detailed, informative content with comprehensive explanations and in-depth information.',
      'visual-focused': 'Keep text concise and mention where images, graphics, or visual elements should be placed. Suggest specific visual elements.',
      'balanced': 'Create a good balance of informative text with suggestions for supporting visuals.'
    }[preferences.style];
    
    const toneGuidance = {
      'professional': 'Use professional, authoritative language',
      'casual': 'Use friendly, conversational language',
      'friendly': 'Use warm, approachable language',
      'authoritative': 'Use confident, expert language'
    }[preferences.tone];
    
    const videoNote = preferences.useVideo ? 
      ' NOTE: Client is interested in using video content - suggest where video content would be most effective.' : 
      '';
    
    return `${businessInfo}. ${siteInfo}. ${pageInfo}.

Content Guidelines:
- ${styleGuidance}
- ${toneGuidance}
- Write content appropriate for a ${page.name.toLowerCase()} page
- Include clear calls-to-action where appropriate
- Make it engaging and conversion-focused${videoNote}

Generate compelling, professional web copy for this page.`;
  }

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
