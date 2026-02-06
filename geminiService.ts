
import { GoogleGenAI, Type } from "@google/genai";
import { StudentLevel, DifficultyLevel, QuizData } from "./types";
import { LESSON_CURRICULUM } from "./lessonContent";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuiz = async (
  level: StudentLevel,
  difficulty: DifficultyLevel,
  chapter: number
): Promise<QuizData> => {
  const modelName = 'gemini-3-pro-preview';
  const chapterSummary = LESSON_CURRICULUM[chapter] || "";
  
  const systemInstruction = `
    You are a professional Bible educator for Theotokos Junior Academy and Holy Sophia University.
    Generate EXACTLY 10 multiple-choice questions for St. Luke Chapter ${chapter}.
    
    Level: ${level}
    Difficulty: ${difficulty}
    
    Curriculum Focus: ${chapterSummary}
    
    CRITICAL REQUIREMENT:
    - All scripture references, quotes, and linguistic styles MUST be based on the New King James Version (NKJV).
    - Provide a specific verse reference (e.g., Luke 1:37 NKJV) in the explanation where applicable.
    
    Theological Guidelines:
    - Beginner: Direct narrative facts.
    - Intermediate: Context, parables, and basic application.
    - Advanced: Theological depth, prophecy (Old Testament links), and Church tradition.
    
    Variety Requirement:
    - Ensure a diverse range of questions that cover different verses and concepts within the chapter.
    - Do not always pick the most obvious facts; vary the focus each time this level is requested.
    
    Format Requirements:
    - Exactly 10 questions.
    - Exactly 4 options per question.
    - Clear "Teacher's Insight" (explanation) for every answer, citing the NKJV.
    - Valid JSON matching the schema.
  `;

  const prompt = `Create a fresh, unique ${difficulty} level study quiz for ${level} on Luke Chapter ${chapter} (NKJV). 
  Focus on these key points: ${chapterSummary}. 
  Ensure questions are different from previous typical sets for this chapter.
  Ensure the tone is encouraging and educational.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts: [{ text: prompt }] },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            minItems: 10,
            maxItems: 10,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  minItems: 4,
                  maxItems: 4
                },
                answerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "answerIndex", "explanation"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as QuizData;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("I couldn't generate the study session. Please try again.");
  }
};
