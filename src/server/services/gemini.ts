import { GoogleGenAI, Type } from '@google/genai';
import { Response } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Basic in-memory cache for prompt caching
const generationCache = new Map<string, string>();

function generateCacheKey(prompt: string, systemInstruction: string, modelName: string): string {
    const data = JSON.stringify({ prompt, systemInstruction, modelName });
    return crypto.createHash('sha256').update(data).digest('hex');
}

export async function generateStructuredOutput<T>(
    prompt: string, 
    systemInstruction: string, 
    schema: Record<string, any>, 
    modelName: string = 'gemini-2.5-flash'
): Promise<T> {
  const cacheKey = generateCacheKey(prompt, systemInstruction, modelName);
  
  if (generationCache.has(cacheKey)) {
      logger.info({ model: modelName, cached: true }, 'LLM Generation (Cache Hit)');
      return JSON.parse(generationCache.get(cacheKey)!) as T;
  }

  const startTime = performance.now();
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    const durationMs = Math.round(performance.now() - startTime);

    if (!response.text) {
      throw new Error("Failed to generate content");
    }

    generationCache.set(cacheKey, response.text);

    logger.info({ model: modelName, durationMs, cached: false }, 'LLM Generation completed');
    return JSON.parse(response.text) as T;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    logger.error({ model: modelName, durationMs, err: error }, 'LLM Generation failed');
    throw error;
  }
}

export async function streamStructuredOutput(
    prompt: string, 
    systemInstruction: string, 
    schema: Record<string, any>, 
    res: Response,
    modelName: string = 'gemini-2.5-flash'
) {
  const cacheKey = generateCacheKey(prompt, systemInstruction, modelName);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (generationCache.has(cacheKey)) {
      logger.info({ model: modelName, cached: true }, 'LLM Stream (Cache Hit)');
      const cachedText = generationCache.get(cacheKey)!;
      res.write(`data: ${JSON.stringify({ chunk: cachedText })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return cachedText;
  }

  const startTime = performance.now();
  try {
    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });
    
    let fullJson = '';
    let firstTokenTime: number | null = null;

    logger.info({ model: modelName }, 'LLM Stream started');

    for await (const chunk of responseStream) {
      if (chunk.text) {
         if (!firstTokenTime) {
             firstTokenTime = performance.now();
             logger.info({ model: modelName, timeToFirstTokenMs: Math.round(firstTokenTime - startTime) }, 'LLM Stream First Token');
         }
         fullJson += chunk.text;
         res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
      }
    }
    
    generationCache.set(cacheKey, fullJson);

    // We send a final message to ensure the client knows it's done.
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    
    const durationMs = Math.round(performance.now() - startTime);
    logger.info({ model: modelName, durationMs, cached: false }, 'LLM Stream completed');

    return fullJson;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    logger.error({ model: modelName, durationMs, err: error }, 'LLM Stream failed');
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate stream' })}\n\n`);
    res.end();
    throw error;
  }
}
