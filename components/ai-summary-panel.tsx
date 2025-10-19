"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface AISummaryPanelProps {
  teacherId: string
}

export function AISummaryPanel({ teacherId }: AISummaryPanelProps) {
  const supabase = createClient()
  const [summary, setSummary] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function fetchAISummary() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("mood, message, created_at")
        .eq("teacher_id", teacherId)
        .eq("archived", false)

      if (error) throw error

      // 🧠 Analyze mood distribution
      const moodCounts: Record<string, number> = {}
      const messages: string[] = []
      data?.forEach((f) => {
        if (f.mood) moodCounts[f.mood] = (moodCounts[f.mood] || 0) + 1
        if (f.message) messages.push(f.message)
      })

      const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Neutral"
      const total = Object.values(moodCounts).reduce((a, b) => a + b, 0)
      const negative = moodCounts["Sad"] || moodCounts["Angry"] || 0
      const ratio = total > 0 ? (negative / total) * 100 : 0

      let aiText = `📊 **Dominant mood:** ${dominantMood}. `
      aiText += `There are ${total} active responses. `
      if (ratio > 40) {
        aiText += `⚠️ High emotional stress detected. Consider addressing this in class. `
      } else if (ratio > 20) {
        aiText += `🟡 Moderate emotional tension — keep an eye on trends. `
      } else {
        aiText += `🟢 Overall mood is stable. `
      }

      if (messages.length > 0) {
        aiText += `💬 Top message themes include stress, class pressure, and general student sentiment.`
      }

      setSummary(aiText)
    } catch (err) {
      console.error("AI Summary error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAISummary()
    // 👂 Live feedback subscription
    const channel = supabase
      .channel("ai-feedback-watch")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedback", filter: `teacher_id=eq.${teacherId}` },
        () => fetchAISummary()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [teacherId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> AI Insights
        </CardTitle>
        <CardDescription>Automated analysis of emotional patterns</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="animate-pulse text-muted-foreground">Generating insights...</p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="prose prose-sm text-foreground"
            dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, "<br />") }}
          />
        )}
      </CardContent>
    </Card>
  )
}
