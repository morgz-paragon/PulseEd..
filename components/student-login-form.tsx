"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function StudentLoginForm() {
  const [teacherCode, setTeacherCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { signInAsStudent } = useAuth()
  const { toast } = useToast()

  const handleStudentLogin = async () => {
    if (!teacherCode.trim()) {
      toast({
        title: "Teacher Code Required",
        description: "Please enter your teacher's code to continue.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await signInAsStudent(teacherCode.trim().toUpperCase())
      toast({
        title: "Welcome!",
        description: "You're now logged in as a student.",
      })
    } catch (error: any) {
      let errorMessage = "Failed to sign in. Please try again."

      if (error.message === "Invalid teacher code") {
        errorMessage = "Invalid teacher code. Please check with your teacher."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
          <UserCircle className="h-6 w-6 text-accent" />
        </div>
        <CardTitle className="text-2xl">Student Access</CardTitle>
        <CardDescription className="text-base">Share how you're feeling anonymously and safely</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="teacherCode">Teacher Code</Label>
          <Input
            id="teacherCode"
            type="text"
            placeholder="Enter your teacher's code"
            value={teacherCode}
            onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
            disabled={loading}
            maxLength={6}
            className="text-center text-lg tracking-wider font-mono"
          />
          <p className="text-xs text-muted-foreground">Ask your teacher for this code</p>
        </div>
        <Button onClick={handleStudentLogin} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Continue as Student"
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          No account needed. Your responses are completely anonymous.
        </p>
      </CardContent>
    </Card>
  )
}
