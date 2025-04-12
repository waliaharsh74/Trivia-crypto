import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    // Generate 15 trivia questions using Groq
    const prompt = `Generate 15 multiple-choice trivia questions about ${topic}. 
    Each question should have 4 options (A, B, C, D) with only one correct answer.
    Format the response as a JSON array with the following structure:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswerIndex": 0 // Index of the correct answer (0-3)
      }
    ]
    Make sure the questions are challenging but fair, and cover a range of difficulty levels.`

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.7,
      maxTokens: 4000,
    })

    // Parse the response as JSON
    const questions = JSON.parse(text)

    return Response.json({ questions })
  } catch (error) {
    console.error("Error generating questions:", error)
    return Response.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
