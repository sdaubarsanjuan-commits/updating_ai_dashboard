import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Utility to chunk array
const chunk = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Gmail scanning endpoint
app.post("/api/scan", async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized: Missing access token" });
  }

  try {
      // 1. Fetch Gmail messages
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?q=newer_than:7d (AI OR education OR \"AI education\")&maxResults=20",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!listRes.ok) {
      const errorData = await listRes.json();
      throw new Error(`Gmail API Error: ${errorData.error?.message || listRes.statusText}`);
    }

    const { messages = [] } = await listRes.json();
    if (messages.length === 0) {
      return res.json({ insights: [] });
    }

    // 2. Fetch details for each message
    const fullMessages = [];
    for (const msg of messages) {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        
        if (!msgRes.ok) continue;
        
        const msgData = await msgRes.json();
        const headers = msgData.payload.headers;
        const subject = headers.find((h: any) => h.name === "Subject")?.value || "No Subject";
        const from = headers.find((h: any) => h.name === "From")?.value || "Unknown Sender";
        const dateHeader = headers.find((h: any) => h.name === "Date")?.value;
        const snippet = msgData.snippet || "";
        
        fullMessages.push({
          id: msg.id,
          subject,
          from,
          snippet,
          date: dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString()
        });
      } catch (err) {
        console.error(`Failed to fetch message ${msg.id}`, err);
      }
    }

    // 3. Batch analysis with Gemini
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const insights = [];
    const messageBatches = chunk(fullMessages, 10);

    for (const batch of messageBatches) {
      const batchPrompt = `Analyze the following list of emails about AI and Education. For each email that is highly relevant, provide a summary, category, and importance.

Emails to analyze:
${batch.map((m, i) => `[Email ${i}]
Subject: ${m.subject}
Snippet: ${m.snippet}`).join('\n\n')}

Return a list of analysis objects ONLY for the relevant emails.`;

      try {
        const result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: batchPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  emailIndex: { 
                    type: Type.NUMBER, 
                    description: "The index (0-9) of the email in the provided list" 
                  },
                  relevant: { type: Type.BOOLEAN },
                  summary: { type: Type.STRING, description: "A 1-sentence prestige summary" },
                  category: { 
                    type: Type.STRING, 
                    description: "One of: Tool, Research, Policy, News, Other" 
                  },
                  importance: { 
                    type: Type.NUMBER, 
                    description: "Importance score from 1 to 5" 
                  }
                },
                required: ["emailIndex", "relevant", "summary", "category", "importance"]
              }
            }
          }
        });

        const batchResults = JSON.parse(result.text || "[]");
        
        for (const analysis of batchResults) {
          if (analysis.relevant && batch[analysis.emailIndex]) {
            const originalMsg = batch[analysis.emailIndex];
            insights.push({
              id: originalMsg.id,
              subject: originalMsg.subject,
              sender: originalMsg.from,
              summary: analysis.summary,
              category: analysis.category,
              importance: analysis.importance,
              link: `https://mail.google.com/mail/u/0/#inbox/${originalMsg.id}`,
              date: originalMsg.date
            });
          }
        }

        // Cooling period between batches to stay within rate limits (5 RPM for free tier)
        if (messageBatches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 12000));
        }
      } catch (e) {
        console.error("Batch analysis failed", e);
      }
    }

    res.json({ insights });
  } catch (error: any) {
    console.error("Scan error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
