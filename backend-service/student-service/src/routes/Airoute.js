// ai/controllers/geminiController.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);




router.post("/eval/gemini", async (req, res) => {
    try {
      const { questions } = req.body;
  
      let totalLogic = 0;
      let totalOutput = 0;
      const evaluatedQuestions = [];
      let feedbackSummary = [];
  
      for (const q of questions) {
        const prompt = `
  You are an AI evaluator. The student has attempted a coding question.
  
  - Question: ${q.question}
  - Student's Code:
  ${q.studentCode}
  -Run at least 2 test cases:
  
  Evaluate the code logic (not just correctness of output), and provide:
  1. Output correctness (out of ${q.outputWeight})
  2. Basic Logic check whether the question is solved or not (out of ${q.logicWeight})
  3. A one-line feedback on strong/weak parts or improvements.
  
  Return this EXACT JSON format (no explanation, no markdown):
  { "outputMarks": <number>, "logicMarks": <number>, "feedback": "<one line>" }
        `.trim();
  
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }) // Use free model
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
  
        // ✅ Clean the response if Gemini includes markdown
        const clean = response.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
  
        totalLogic += parsed.logicMarks;
        totalOutput += parsed.outputMarks;
        feedbackSummary.push(parsed.feedback);
  
        evaluatedQuestions.push({
          ...q,
          outputMarks: parsed.outputMarks,
          logicMarks: parsed.logicMarks,
          feedback: parsed.feedback,
        });
      }
  
      return res.json({
        evaluatedQuestions,
        overallFeedback: feedbackSummary.join(" | ")
      });
  
    } catch (error) {
      console.error("Gemini Eval Error:", error.message);
      res.status(500).json({ error: "Gemini evaluation failed" });
    }
  });
  
  export default router;
