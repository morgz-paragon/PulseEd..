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

    // 🧠 AI CLASSIFICATION PROMPT
    const prompt = `
Classify the student's message into one of the following categories:
- "high_risk": clear or strong signs of suicidal thoughts, self-harm, or extreme distress.
- "medium_risk": moderate distress, sadness, anxiety, or struggling emotionally.
- "low_risk": neutral or positive message.

Respond with ONLY one of these exact values:
high_risk
medium_risk
low_risk

Message:
"${message}"
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0,
      max_tokens: 10,
    })

    const risk = completion.choices[0].message?.content?.trim().toLowerCase()
    console.log("🤖 AI classification result:", risk)

    if (risk === "high_risk" || risk === "medium_risk") {
      // 🚨 Auto-redirect if medium or high risk
      return NextResponse.redirect(new URL(`/support-page-inner?risk=${risk}`, req.url))
    }

    return NextResponse.json({ risk: "low_risk" })
  } catch (err) {
    console.error("❌ classify-message error:", err)
    return NextResponse.json({ risk: "low_risk" })
  }
}
