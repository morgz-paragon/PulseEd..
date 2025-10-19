import { NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    // 🧠 1. Parse request
    const { teacherId, studentName, message, mood } = await req.json()

    if (!teacherId || !message) {
      console.error("❌ Missing required fields:", { teacherId, message })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error("❌ Missing OPENAI_API_KEY")
      return NextResponse.json({ error: "Missing API key" }, { status: 500 })
    }

    const supabase = createClient()
    if (!supabase) {
      console.error("❌ Supabase client is undefined")
      return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 })
    }

    // 🧼 2. Run AI classification
    const openai = new OpenAI({ apiKey })
    const prompt = `
Classify this student's message into one of: "high_risk", "medium_risk", "low_risk".
The message is:
"${message}"

Only respond with the label.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
    })

    const risk = completion.choices[0].message?.content?.trim().toLowerCase() || "low_risk"
    console.log("🤖 AI classified message as:", risk)

    // 🚨 3. Insert into alerts table if high or medium risk
    if (risk === "high_risk" || risk === "medium_risk") {
      const { error: alertError } = await supabase.from("alerts").insert({
        teacher_id: teacherId,
        student_name: studentName || "Anonymous",
        message,
        mood: mood || null,
        risk_level: risk,
      })

      if (alertError) {
        console.error("❌ Failed to insert alert:", alertError)
        return NextResponse.json({ error: "Failed to insert alert" }, { status: 500 })
      }

      console.log("🚨 Alert stored in Supabase:", {
        teacherId,
        studentName,
        message,
        risk,
      })
    }

    return NextResponse.json({ success: true, risk })
  } catch (err) {
    console.error("🔥 Fatal error in /api/send-teacher-alert:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
