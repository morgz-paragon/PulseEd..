"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface MoodData {
  mood: string
  count: number
}

interface MoodChartProps {
  data: MoodData[]
}

// 🎨 Define your mood colors here
const moodColors: Record<string, string> = {
  great: "#22c55e",     // green
  good: "#4ade80",      // light green
  okay: "#eab308",      // yellow
  bad: "#ef4444",       // red
  anxious: "#f97316",   // orange
  tired: "#6b7280",     // gray
  excited: "#ec4899",   // pink
  sad: "#3b82f6",       // blue
}

export function MoodChart({ data }: MoodChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Distribution</CardTitle>
        <CardDescription>Overview of student moods submitted</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="mood"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value: number, name: string, props) => {
                const percentage = ((value / total) * 100).toFixed(1)
                return [`${value} (${percentage}%)`, "Responses"]
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => {
                const moodKey = entry.mood.toLowerCase()
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={moodColors[moodKey] || "#8884d8"} // fallback color
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
