"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { StudentLoginForm } from "@/components/student-login-form"
import { TeacherLoginForm } from "@/components/teacher-login-form"
import { TeacherSignupForm } from "@/components/teacher-signup-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const [showTeacherSignup, setShowTeacherSignup] = useState(false)

  useEffect(() => {
    if (!loading && user && role) {
      if (role === "student") {
        router.push("/student-dashboard")
      } else if (role === "teacher") {
        router.push("/teacher-dashboard")
      }
    }
  }, [user, role, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Welcome to MoodSpace</h1>
            <p className="text-lg text-muted-foreground">Choose how you'd like to continue</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <StudentLoginForm />
            <div className="space-y-4">
              {showTeacherSignup ? <TeacherSignupForm /> : <TeacherLoginForm />}
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setShowTeacherSignup(!showTeacherSignup)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {showTeacherSignup ? "Already have an account? Sign in" : "New teacher? Create an account"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
