"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Smile, Meh, Frown, ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const moods = [
  { value: "great", label: "Great", icon: ThumbsUp, color: "text-green-500" },
  { value: "good", label: "Good", icon: Smile, color: "text-blue-500" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-yellow-500" },
  { value: "bad", label: "Bad", icon: Frown, color: "text-orange-500" },
  { value: "terrible", label: "Terrible", icon: ThumbsDown, color: "text-red-500" },
]

export function MoodForm() {
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const { studentId, teacherId, teacherCode } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose how you're feeling today.",
        variant: "destructive",
      })
      return
    }

    if (!studentId || !teacherId) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to submit your mood.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from("feedback").insert({
        student_id: studentId,
        teacher_id: teacherId,
        teacher_code: teacherCode,
        mood: selectedMood,
        message: message.trim() || null,
      })

      if (error) throw error

      toast({
        title: "Thank you for sharing!",
        description: "Your mood has been recorded anonymously.",
      })

      // Reset form
      setSelectedMood("")
      setMessage("")
    } catch (error) {
      console.error("Error submitting mood:", error)
      toast({
        title: "Submission failed",
        description: "There was an error recording your mood. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
        <CardDescription>
          Your response is completely anonymous and helps your teachers support you better
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Select your mood</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {moods.map((mood) => {
                const Icon = mood.icon
                return (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setSelectedMood(mood.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105",
                      selectedMood === mood.value
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-card hover:border-primary/50",
                    )}
                  >
                    <Icon className={cn("h-8 w-8", selectedMood === mood.value ? "text-primary" : mood.color)} />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        selectedMood === mood.value ? "text-primary" : "text-foreground",
                      )}
                    >
                      {mood.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Anything you'd like to share? (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell us more about how you're feeling..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button type="submit" disabled={loading || !selectedMood} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Mood"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
