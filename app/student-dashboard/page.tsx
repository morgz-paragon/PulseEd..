"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Heart } from "lucide-react"
import { MoodForm } from "@/components/mood-form"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

const supabase = createClient()

export default function StudentDashboard() {
  const { role, loading, teacherId, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [studentMood, setStudentMood] = useState<number | null>(null)
  const [studentMessage, setStudentMessage] = useState<string>("")

  // 🚪 Redirect if not student
  useEffect(() => {
    if (!loading && role !== "student") {
      router.push("/login")
    }
  }, [role, loading, router])

  // 🧠 Risk classifier
  async function classifyMessageRisk(message: string) {
    console.log("📡 classifyMessageRisk sending:", message)
    try {
      const res = await fetch("/api/classify-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) {
        console.error("❌ classify-message API error:", res.status)
        return "low_risk"
      }

      const data = await res.json()
      console.log("🧠 classify-message response:", data)
      return (data.risk || "low_risk").trim().toLowerCase().replace(/\s+/g, "_")
    } catch (err) {
      console.error("❌ classify-message fetch failed:", err)
      return "low_risk"
    }
  }

  // 📝 Handle mood submission
  const handleMoodSubmit = async (mood: number, message: string) => {
    console.log("📝 handleMoodSubmit triggered", { mood, message })
    setStudentMood(mood)
    setStudentMessage(message)

    // Save feedback
    const { error } = await supabase.from("feedback").insert({
      student_id: user?.id,
      teacher_id: teacherId,
      mood,
      message,
      archived: false,
    })
    if (error) console.error("❌ Failed to insert feedback:", error)

    // Classify risk
    const risk = await classifyMessageRisk(message)
    console.log("🚨 Risk level:", risk)

  // 🚪 If risk is high or medium → redirect to support page
  if (mood === 1 || risk === "high_risk" || risk === "medium_risk") {
  console.log("🚨 Redirecting to support page with risk:", risk)
  router.push(`/support-page-inner?risk=${risk}`)
  return
}


    // Otherwise, show normal toast
    toast({ title: "✅ Thanks for sharing. Your response has been recorded." })
  }

  // 🌀 Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (role !== "student") return null

  return (
    <div className="min-h-screen bg-background">
      <Header title="PulseEd — Student Dashboard" subtitle="Share how you're feeling today" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* ℹ️ Info Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-accent/50 bg-accent/5">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-1">Your Privacy Matters</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      All responses are anonymous. Your teacher only sees trends — unless you choose to share your name.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-1">You're Not Alone</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sharing helps your teachers understand and support the class better.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 📝 Mood Form */}
          <MoodForm onSubmit={handleMoodSubmit} disabled={false} />
        </div>
      </main>
    </div>
  )
}
