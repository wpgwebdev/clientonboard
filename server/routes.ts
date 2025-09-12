import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

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

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
