"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { AnalyticsCard } from "@/components/analytics-card"
import { MoodChart } from "@/components/mood-chart"
import { Users, MessageSquare, TrendingUp, Sparkles, History, Copy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { AISummaryPanel } from "@/components/ai-summary-panel"
import { AIPredictivePanel } from "@/components/ai-predictive-panel"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface Feedback {
  id: string
  student_id: string
  mood: string | null
  message: string | null
  created_at: string | null
  archived?: boolean
}

interface HistoryDay {
  date: string
  count: number
  moods: Record<string, number>
}

export default function PulseEdTeacherDashboard() {
  const { role, loading, teacherId } = useAuth()
  const router = useRouter()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [historyDays, setHistoryDays] = useState<HistoryDay[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  // 🚪 Redirect if not teacher
  useEffect(() => {
    if (!loading && role !== "teacher") {
      router.push("/login")
    }
  }, [role, loading, router])

  // 🔄 Fetch only active (non-archived) feedback
  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("archived", false)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Fetch feedback error:", error)
      return
    }

    setFeedback(data || [])
    setLoadingData(false)
  }

  // 👂 Real-time subscription with archive filtering
  useEffect(() => {
    if (!teacherId || role !== "teacher") return
    fetchFeedback()

    const channel = supabase
      .channel("feedback-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feedback",
          filter: `teacher_id=eq.${teacherId}`,
        },
        (payload) => {
          if (!selectedDate && payload.new?.archived === false) {
            fetchFeedback()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teacherId, role, selectedDate])

  // 🗓️ Fetch history (archived + active)
  const fetchHistory = async () => {
    setLoadingHistory(true)
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch history error:", error)
      setLoadingHistory(false)
      return
    }

    if (!data) return

    const grouped: Record<string, Feedback[]> = {}
    data.forEach((f) => {
      if (!f.created_at) return
      const day = new Date(f.created_at).toLocaleDateString()
      grouped[day] = grouped[day] || []
      grouped[day].push(f)
    })

    const historySummary = Object.entries(grouped).map(([day, entries]) => {
      const moods: Record<string, number> = {}
      entries.forEach((e) => {
        const moodKey = e.mood?.trim() || "Unknown"
        moods[moodKey] = (moods[moodKey] || 0) + 1
      })
      return {
        date: day,
        count: entries.length,
        moods,
      }
    })

    const allMoods = Array.from(
      new Set(historySummary.flatMap((d) => Object.keys(d.moods)))
    )
    const trends = historySummary.map((h) => {
      const base: any = { date: h.date }
      allMoods.forEach((m) => {
        base[m] = h.moods[m] || 0
      })
      return base
    })

    setTrendData(trends)
    setHistoryDays(
      historySummary.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    )
    setLoadingHistory(false)
  }

  // 📆 Load data from a specific day (archived or not)
  const loadHistoryDay = async (day: string) => {
    setSelectedDate(day)
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("teacher_id", teacherId)

    if (error) {
      console.error("Load history day error:", error)
      return
    }

    const filtered = (data || []).filter(
      (f) => f.created_at && new Date(f.created_at).toLocaleDateString() === day
    )
    setFeedback(filtered)
    toast({ title: `Loaded data from ${day}` })
  }

  // 🧹 Archive all current feedback on reset
  const resetDashboard = async () => {
    if (feedback.length > 0) {
      const ids = feedback.map((f) => f.id)
      const { error } = await supabase
        .from("feedback")
        .update({ archived: true })
        .in("id", ids)

      if (error) {
        console.error("Archive error:", error)
        toast({ title: "Failed to archive feedback", variant: "destructive" })
        return
      }
    }

    setSelectedDate(null)
    setFeedback([])
    await fetchFeedback()
    toast({ title: "All current feedback archived and dashboard reset." })
  }

  const copyCode = async () => {
    if (teacherId) {
      await navigator.clipboard.writeText(teacherId)
      toast({ title: "✅ Teacher code copied to clipboard" })
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PulseEd dashboard...</p>
        </div>
      </div>
    )
  }

  if (role !== "teacher") return null

  const totalResponses = feedback.length
  const uniqueStudents = new Set(feedback.map((f) => f.student_id)).size
  const withMessages = feedback.filter((f) => f.message && f.message.trim() !== "").length

  const moodCounts: Record<string, number> = {}
  feedback.forEach((f) => {
    const moodKey = f.mood?.trim() || "Unknown"
    moodCounts[moodKey] = (moodCounts[moodKey] || 0) + 1
  })

  const moodData = Object.entries(moodCounts).map(([mood, count]) => ({
    mood: mood.charAt(0).toUpperCase() + mood.slice(1),
    count,
  }))

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="PulseEd — Teacher Dashboard"
        subtitle="Student wellbeing insights and analytics"
      />

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* 🧑‍🏫 Teacher Code Section */}
        <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your Teacher Code</p>
            <p className="text-xl font-bold">{teacherId}</p>
          </div>
          <Button variant="outline" size="sm" onClick={copyCode}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>

        {/* RESET BUTTON */}
        <div className="flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to archive and reset all current feedback?")) {
                resetDashboard()
              }
            }}
          >
            Archive All & Reset Panel
          </Button>
        </div>

        {/* HISTORY BUTTON */}
        <div className="flex justify-end">
          <Dialog onOpenChange={(open) => open && fetchHistory()}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                View History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>📜 Emotional Trends & History</DialogTitle>
              </DialogHeader>

              {trendData.length > 0 && (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(trendData[0])
                      .filter((k) => k !== "date")
                      .map((mood, idx) => (
                        <Bar
                          key={mood}
                          dataKey={mood}
                          stackId="a"
                          fill={`hsl(${idx * 60}, 70%, 50%)`}
                        />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              )}

              <div className="max-h-[400px] overflow-y-auto space-y-4 mt-4">
                {loadingHistory ? (
                  <p className="text-center text-muted-foreground py-4">Loading...</p>
                ) : historyDays.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No history available yet.
                  </p>
                ) : (
                  historyDays.map((h) => (
                    <Card key={h.date} className="border shadow-sm">
                      <CardHeader>
                        <CardTitle>{h.date}</CardTitle>
                        <CardDescription>
                          {h.count} responses —{" "}
                          {Object.entries(h.moods)
                            .map(([m, c]) => `${m} (${c})`)
                            .join(", ")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadHistoryDay(h.date)}
                        >
                          Load
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ANALYTICS */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard
            title="Total Responses"
            value={totalResponses}
            icon={MessageSquare}
            description="All-time submissions"
          />
          <AnalyticsCard
            title="Active Students"
            value={uniqueStudents}
            icon={Users}
            description="Unique participants"
          />
          <AnalyticsCard
            title="With Messages"
            value={withMessages}
            icon={TrendingUp}
            description="Detailed feedback"
          />
          <AnalyticsCard
            title="Engagement"
            value={
              totalResponses > 0
                ? `${Math.round((withMessages / totalResponses) * 100)}%`
                : "0%"
            }
            icon={Sparkles}
            description="Message rate"
          />
        </div>

        {/* MOOD CHART + FEEDBACK */}
        <div className="grid gap-6 lg:grid-cols-2">
          {moodData.length > 0 ? (
            <MoodChart data={moodData} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
                <CardDescription>
                  Overview of student moods submitted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>No mood data available yet.</p>
                  <p className="text-sm mt-1">
                    Charts will appear once students start sharing.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>
                Most recent submissions from your students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedback.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No feedback yet.
                </p>
              )}
              {feedback.map((f) => {
                const isValidDate =
                  f.created_at && !isNaN(new Date(f.created_at).getTime())
                const formattedDate = isValidDate
                  ? new Date(f.created_at as string).toLocaleString()
                  : "No timestamp"

                return (
                  <div key={f.id} className="border-b pb-2">
                    <p className="font-semibold">{f.mood || "Unknown Mood"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedDate}
                    </p>
                    {f.message && (
                      <p className="text-sm mt-1 text-foreground">
                        “{f.message}”
                      </p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* 🤖 AI Assistant */}
        <h2 className="text-xl font-bold pt-4">🤖 PulseEd AI Assistant</h2>
        <AISummaryPanel teacherId={teacherId!} />
        <AIPredictivePanel teacherId={teacherId!} />
      </main>
    </div>
  )
}
