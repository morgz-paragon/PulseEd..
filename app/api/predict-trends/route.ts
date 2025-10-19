import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    // 🧠 1. Parse body safely
    let body: any = {}
    try {
      body = await req.json()
    } catch (e) {
      console.error("🚨 Invalid JSON body:", e)
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const teacherId = body?.teacherId
    if (!teacherId || typeof teacherId !== "string") {
      console.error("❌ Missing or invalid teacherId:", body)
      return NextResponse.json({ error: "Missing or invalid teacherId" }, { status: 400 })
    }

    // 🔐 2. Check API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("❌ Missing OPENAI_API_KEY")
      return NextResponse.json({ error: "Missing API key" }, { status: 500 })
    }

    // 🪵 3. Supabase setup
    const supabase = createClient()
    if (!supabase) {
      console.error("❌ Supabase client is undefined")
      return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 })
    }

    console.log("📩 Incoming teacherId:", teacherId)

    const { data: feedback, error: supabaseError } = await supabase
      .from("feedback")
      .select("mood, message")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })
      .limit(100)

    if (supabaseError) {
      console.error("❌ Supabase error:", supabaseError)
      return NextResponse.json({ error: supabaseError.message }, { status: 500 })
    }

    console.log(`🧾 Retrieved ${feedback?.length || 0} feedback records`)

    // 🧼 4. Build text for AI
    const text =
      feedback && feedback.length > 0
        ? feedback
            .map((f) => `Mood: ${f.mood || "Unknown"} | Message: ${f.message || "None"}`)
            .join("\n")
        : "No actual mood or message data is available. Generate a realistic, empathetic emotional prediction based on typical classroom moods."

    const prompt = `
You are an emotional data analyst for teachers.
You will receive student mood data and short messages.

---
${text}
---

Your task:
1. Analyze the emotional tone and describe it in a clear, human-friendly paragraph (at least 4 sentences).
2. Predict the overall emotional trend (e.g. "stressed", "anxious", "positive", "mixed", etc.).
3. Explain your reasoning shortly.

Return your answer as valid JSON:
{
  "trend": "short label for the emotional trend",
  "reason": "short explanation for why you chose this trend",
  "insight": "a full paragraph with your analysis and emotional insights"
}
Important: Only return valid JSON. Do not include markdown, explanations, or notes.
`

    // 🤖 5. OpenAI call with error handling
    const openai = new OpenAI({ apiKey })
    console.log("🧠 Sending prompt to OpenAI...")

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    const raw = completion?.choices?.[0]?.message?.content?.trim() || ""
    console.log("🧠 RAW GPT RESPONSE:", raw)

    if (!raw) {
      throw new Error("Empty response from OpenAI")
    }

    // 🪄 6. Parse JSON safely
    let prediction: { trend: string; reason: string; insight: string } | null = null
    try {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) {
        prediction = JSON.parse(match[0])
      } else {
        throw new Error("No JSON object found in GPT response")
      }
    } catch (parseError) {
      console.error("❌ JSON parse failed:", parseError)
    }

    // 🩹 7. Fallback if invalid output
    if (!prediction || !prediction.trend) {
      console.warn("⚠️ Fallback triggered. Invalid or no AI output.")
      prediction = {
        trend: "Neutral",
        reason:
          "The system could not extract structured AI output. This is a fallback response.",
        insight:
          "Based on the limited data, the emotional state of the class appears to be relatively stable. No significant signs of stress or negativity were detected. This is a placeholder analysis to ensure the teacher still receives an insight summary.",
      }
    }

    console.log("✅ FINAL PREDICTION SENT TO FRONTEND:", prediction)
    return NextResponse.json({ prediction })
  } catch (err: any) {
    console.error("🔥 Fatal error in /api/predict-trends:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
