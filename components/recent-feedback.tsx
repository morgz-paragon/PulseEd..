import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Feedback {
  id: string
  mood: string
  message: string | null
  timestamp: Date
}

interface RecentFeedbackProps {
  feedback: Feedback[]
}

const moodColors: Record<string, string> = {
  happy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  sad: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  anxious: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  tired: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  excited: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
}

export function RecentFeedback({ feedback }: RecentFeedbackProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Student Feedback</CardTitle>
        <CardDescription>Latest anonymous submissions from your students</CardDescription>
      </CardHeader>
      <CardContent>
        {feedback.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No feedback submitted yet.</p>
            <p className="text-sm mt-1">Students will appear here once they start sharing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-center justify-between">
                  <Badge className={moodColors[item.mood.toLowerCase()] || ""}>{item.mood}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </span>
                </div>
                {item.message && <p className="text-sm text-foreground leading-relaxed mt-1">"{item.message}"</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
