"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

type UserRole = "student" | "teacher" | null

interface AuthContextType {
  user: User | null
  role: UserRole
  loading: boolean
  teacherCode: string | null
  teacherId: string | null
  studentId: string | null
  signUpAsTeacher: (email: string, password: string, name: string) => Promise<string>
  signInAsTeacher: (email: string, password: string) => Promise<void>
  signInAsStudent: (teacherCode: string) => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  teacherCode: null,
  teacherId: null,
  studentId: null,
  signUpAsTeacher: async () => "",
  signInAsTeacher: async () => {},
  signInAsStudent: async () => {},
  signOutUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

function generateTeacherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [teacherCode, setTeacherCode] = useState<string | null>(null)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // 🧠 Load session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        loadUserRole(currentUser.id)
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        loadUserRole(currentUser.id)
      } else {
        clearAuth()
        setLoading(false)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const clearAuth = () => {
    setRole(null)
    setTeacherCode(null)
    setTeacherId(null)
    setStudentId(null)
  }

  // 🧠 Determine whether user is a teacher or student
  const loadUserRole = async (userId: string) => {
    try {
      // Check if user is a teacher
      const { data: teacherData } = await supabase.from("teachers").select("*").eq("id", userId).maybeSingle()

      if (teacherData) {
        setRole("teacher")
        setTeacherCode(teacherData.teacher_code)
        setTeacherId(teacherData.id)
        setStudentId(null)
        setLoading(false)
        return
      }

      // If not teacher, check if student
      const { data: studentData } = await supabase.from("students").select("*").eq("id", userId).maybeSingle()

      if (studentData) {
        setRole("student")
        setStudentId(studentData.id)
        setTeacherId(studentData.teacher_id)
        setTeacherCode(studentData.teacher_code)
      } else {
        clearAuth()
      }
    } catch (error) {
      console.error("Error loading user role:", error)
      clearAuth()
    } finally {
      setLoading(false)
    }
  }

  // 🧑‍🏫 Teacher sign up
  const signUpAsTeacher = async (email: string, password: string, name: string): Promise<string> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Failed to create user")

      const code = generateTeacherCode()

      const { error: teacherError } = await supabase.from("teachers").insert({
        id: authData.user.id,
        name,
        email,
        teacher_code: code,
      })

      if (teacherError) throw teacherError

      setRole("teacher")
      setTeacherCode(code)
      setTeacherId(authData.user.id)
      router.push("/teacher-dashboard")

      return code
    } catch (error) {
      console.error("Teacher sign up error:", error)
      throw error
    }
  }

  // 🧑‍🏫 Teacher sign in
  const signInAsTeacher = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (!data.user) throw new Error("Failed to sign in")

      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (teacherError || !teacherData) {
        await supabase.auth.signOut()
        throw new Error("Not a teacher account")
      }

      setRole("teacher")
      setTeacherCode(teacherData.teacher_code)
      setTeacherId(teacherData.id)
      router.push("/teacher-dashboard")
    } catch (error) {
      console.error("Teacher sign in error:", error)
      throw error
    }
  }

  // 👨‍🎓 Student sign in (Anonymous)
  const signInAsStudent = async (teacherCode: string) => {
    try {
      // 1️⃣ Verify teacher code
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("id")
        .eq("teacher_code", teacherCode.toUpperCase())
        .single()

      if (teacherError || !teacherData) {
        console.error("Teacher lookup error:", teacherError)
        throw new Error("Invalid teacher code")
      }

      // 2️⃣ Sign in anonymously
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      if (anonError) throw anonError
      if (!anonData.user) throw new Error("Failed to sign in anonymously")

      // 3️⃣ Create student record in DB
      const { error: studentError } = await supabase.from("students").insert({
        id: anonData.user.id,
        teacher_id: teacherData.id,
        teacher_code: teacherCode.toUpperCase(),
      })

      if (studentError) throw studentError

      setRole("student")
      setStudentId(anonData.user.id)
      setTeacherId(teacherData.id)
      setTeacherCode(teacherCode.toUpperCase())

      router.push("/student-dashboard")
    } catch (error) {
      console.error("Student sign in error:", error)
      throw error
    }
  }

  // 🚪 Sign out for both roles
  const signOutUser = async () => {
    try {
      await supabase.auth.signOut()
      clearAuth()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        teacherCode,
        teacherId,
        studentId,
        signUpAsTeacher,
        signInAsTeacher,
        signInAsStudent,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
