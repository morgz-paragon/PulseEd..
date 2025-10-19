"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, GraduationCap, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TeacherSignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [teacherCode, setTeacherCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { signUpAsTeacher } = useAuth()
  const { toast } = useToast()

  const handleTeacherSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const code = await signUpAsTeacher(email, password, name)
      setTeacherCode(code)
      toast({
        title: "Account Created!",
        description: "Your teacher account has been created successfully.",
      })
    } catch (error: any) {
      let errorMessage = "Failed to create account. Please try again."

      if (error.message?.includes("already registered")) {
        errorMessage = "This email is already registered."
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Invalid email address."
      } else if (error.message?.includes("Password")) {
        errorMessage = "Password is too weak."
      }

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (teacherCode) {
      navigator.clipboard.writeText(teacherCode)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Teacher code copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (teacherCode) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Your Teacher Code</CardTitle>
          <CardDescription className="text-base">Share this code with your students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Teacher Code</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-2xl font-bold text-primary tracking-wider">{teacherCode}</code>
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Students will use this code to connect to your class</p>
            <p>✓ You can find this code anytime in your dashboard</p>
            <p>✓ Keep this code secure and only share with your students</p>
          </div>
          <Button onClick={() => (window.location.href = "/teacher-dashboard")} className="w-full" size="lg">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Create Teacher Account</CardTitle>
        <CardDescription className="text-base">Set up your account to start tracking student wellbeing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTeacherSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ms. Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
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
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
