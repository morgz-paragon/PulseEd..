"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function AIPredictivePanel({ teacherId }: { teacherId: string }) {
  const [prediction, setPrediction] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [insight, setInsight] = useState<string>("")
  const [interventions, setInterventions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrediction = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("📡 Sending teacherId:", teacherId)

      // 🧠 Hit prediction API
      const res = await fetch("/api/predict-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to fetch prediction")
      }

      const data = await res.json()
      console.log("🛰️ Prediction API Response:", data)

      const parsed = data.prediction || {}
      setPrediction(parsed.trend || "No trend")
      setReason(parsed.reason || "No explanation available")
      setInsight(parsed.insight || "")

      // ✨ Optional: hit interventions API
      const intRes = await fetch("/api/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trend: parsed.trend }),
      })

      if (!intRes.ok) {
        console.warn("⚠️ Interventions API returned non-OK")
        setInterventions([])
      } else {
        const intData = await intRes.json()
        setInterventions(intData.interventions || [])
      }
    } catch (err: any) {
      console.error("❌ Error fetching prediction:", err)
      setError(err.message || "Something went wrong")
      setPrediction("")
      setReason("")
      setInsight("")
      setInterventions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>📈 AI Emotional Prediction</CardTitle>
        <button
          onClick={fetchPrediction}
          disabled={loading}
          className="px-3 py-1 bg-primary text-white rounded text-sm disabled:opacity-70"
        >
          {loading ? "Analyzing..." : "Run Prediction"}
        </button>
      </CardHeader>

      <CardContent>
        {error && (
          <p className="text-red-500 font-medium mb-3">
            ❌ {error}
          </p>
        )}

        {prediction ? (
          <>
            <p className="font-semibold text-foreground">🧠 Trend: {prediction}</p>
            <p className="text-sm text-muted-foreground mt-1">
              ℹ️ <strong>Why:</strong> {reason}
            </p>
            {insight && (
              <p className="mt-3 text-muted-foreground whitespace-pre-wrap">
                📝 <strong>Insight:</strong> {insight}
              </p>
            )}
            {interventions.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold text-base mb-1">✨ Suggested Actions:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {interventions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : !loading && !error ? (
          <p className="italic text-muted-foreground">
            Click “Run Prediction” to analyze emotional trends and get actionable suggestions.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
