"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface AIPredictivePanelProps {
  teacherId: string
}

export function AIPredictivePanel({ teacherId }: AIPredictivePanelProps) {
  const supabase = createClient()
  const [prediction, setPrediction] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function fetchPrediction() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from("feedback")
        .select("mood, created_at")
        .eq("teacher_id", teacherId)
        .eq("archived", false)

      // Simple heuristic: predict based on mood trajectory
      const moodCounts: Record<string, number> = {}
      data?.forEach((f) => {
        if (f.mood) moodCounts[f.mood] = (moodCounts[f.mood] || 0) + 1
      })

      const happy = moodCounts["Happy"] || 0
      const sad = moodCounts["Sad"] || 0
      const total = Object.values(moodCounts).reduce((a, b) => a + b, 0)
      const positivity = total > 0 ? (happy / total) * 100 : 0
      const negativity = total > 0 ? (sad / total) * 100 : 0

      let predictionText = "🧭 Emotional forecast for the next few days: "
      if (negativity > 40) {
        predictionText += "⚠️ Negative sentiment likely to increase. Consider intervention."
      } else if (positivity > 60) {
        predictionText += "🟢 Mood likely to remain positive and stable."
      } else {
        predictionText += "🟡 Mixed mood expected. Keep monitoring trends."
      }

      setPrediction(predictionText)
    } catch (err) {
      console.error("Prediction error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrediction()
    const channel = supabase
      .channel("ai-predict-watch")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedback", filter: `teacher_id=eq.${teacherId}` },
        () => fetchPrediction()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [teacherId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Emotional Forecast
        </CardTitle>
        <CardDescription>Short-term mood prediction based on trend</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="animate-pulse text-muted-foreground">Analyzing trends...</p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-foreground"
          >
            {prediction}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
