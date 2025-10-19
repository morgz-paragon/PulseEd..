import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ risk: "low_risk" })
    }

    const lowerMsg = message.toLowerCase().trim()

    // 🛑 1. RULE-BASED CHECK (Instant flag)
    const highRiskKeywords = [
      "kill myself",
      "want to die",
      "end it all",
      "can't go on",
      "worthless",
      "i hate myself",
      "suicidal",
      "jump off",
      "end my life",
      "kill",
    ]
    if (highRiskKeywords.some((kw) => lowerMsg.includes(kw))) {
      console.log("🚨 High-risk detected by keyword match")
      return NextResponse.json({ risk: "high_risk" })
    }

    const mediumRiskKeywords = [
      "depressed",
      "sad",
      "anxious",
      "tired",
      "overwhelmed",
      "hopeless",
      "hurt",
      "lonely",
      "scared",
      "anxiety",
    ]
    if (mediumRiskKeywords.some((kw) => lowerMsg.includes(kw))) {
      console.log("⚠️ Medium-risk detected by keyword match")
      return NextResponse.json({ risk: "medium_risk" })
    }

    // 🧠 2. AI CLASSIFICATION (Backup or nuanced cases)
    const prompt = `
Classify this student's message into one of the following categories:
- "high_risk": signs of suicidal thoughts, self-harm, or severe distress
- "medium_risk": moderate distress, anxiety, sadness
- "low_risk": neutral or positive message

Respond with ONLY one of: high_risk, medium_risk, or low_risk.
Message: "${message}"
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0,
      max_tokens: 10,
    })

    const response = completion.choices[0].message?.content?.trim().toLowerCase()

    console.log("🤖 AI classification result:", response)

    if (response === "high_risk") {
      return NextResponse.json({ risk: "high_risk" })
    }
    if (response === "medium_risk") {
      return NextResponse.json({ risk: "medium_risk" })
    }

    return NextResponse.json({ risk: "low_risk" })
  } catch (err) {
    console.error("❌ classify-message error:", err)
    return NextResponse.json({ risk: "low_risk" })
  }
}
