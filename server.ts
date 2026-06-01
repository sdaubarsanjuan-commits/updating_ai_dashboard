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
  res.json({ message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
