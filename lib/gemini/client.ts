import { GoogleGenerativeAI } from '@google/generative-ai'
import { GEMINI_MODEL } from '@/lib/constants'

let genAI: GoogleGenerativeAI | null = null

export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }
  return genAI
}

export { GEMINI_MODEL }
