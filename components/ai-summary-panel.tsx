"use client"

import { useState } from "react"

export function AISummaryPanel({ teacherId }: { teacherId: string }) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string>("")

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/feedback-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId }),
      })
      const data = await res.json()
      setSummary(data.summary || "No summary available.")
    } catch (e) {
      setSummary("Failed to load AI summary.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-accent/5 border rounded-lg p-4 mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">🧠 AI Insight</h3>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="px-3 py-1 bg-primary text-white rounded text-sm"
        >
          {loading ? "Analyzing..." : "Regenerate"}
        </button>
      </div>
      {summary ? (
        <p className="text-muted-foreground whitespace-pre-wrap">{summary}</p>
      ) : (
        <p className="italic text-muted-foreground">Click “Regenerate” to get AI insights from feedback.</p>
      )}
    </div>
  )
}
