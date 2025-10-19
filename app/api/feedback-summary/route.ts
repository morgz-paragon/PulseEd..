import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    // 🧠 Check API key first
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Missing OPENAI_API_KEY")
      return NextResponse.json({ error: "Missing API key" }, { status: 500 })
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const { teacherId } = await req.json()
    const supabase = createClient()

    // 🪄 Fetch student feedback
    const { data: feedback, error } = await supabase
      .from("feedback")
      .select("mood, message")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("❌ Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 🧼 Handle empty feedback case
    if (!feedback || feedback.length === 0) {
      return NextResponse.json({
        summary: "No feedback available yet. Once students submit their moods and messages, an AI summary will appear here.",
      })
    }

    // 🧹 Clean prompt text
    const text = feedback
      .map(f => `Mood: ${f.mood?.trim() || "Unknown"} | Message: ${f.message?.trim() || "None"}`)
      .join("\n")

    const prompt = `
You are an emotional analysis assistant for teachers.
Analyze the following student mood data and messages:

---
${text}
---

Give a short, clear summary of:
- the overall emotional state of the class,
- any noticeable patterns or common moods,
- and possible contributing factors.

Keep it under 5 sentences. Be empathetic but professional.
`

    // 🤖 OpenAI call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    })

    const summary = completion.choices[0].message?.content?.trim() || "No summary available."

    // 🪵 Log summary (optional — good for debugging in Vercel)
    console.log(`✅ AI summary generated for teacher ${teacherId}:`, summary)

    return NextResponse.json({ summary })
  } catch (err) {
    console.error("🔥 Unhandled error in /api/feedback-summary:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
