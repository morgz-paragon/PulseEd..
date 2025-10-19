"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TeacherLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { signInAsTeacher } = useAuth()
  const { toast } = useToast()

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await signInAsTeacher(email, password)
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to your teacher account.",
      })
    } catch (error: any) {
      let errorMessage = "Failed to sign in. Please check your credentials."

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password."
      } else if (error.message === "Not a teacher account") {
        errorMessage = "This account is not registered as a teacher."
      }

      toast({
        title: "Sign In Failed",
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
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Teacher Sign In</CardTitle>
        <CardDescription className="text-base">Access your dashboard and student insights</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTeacherLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="teacher@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
