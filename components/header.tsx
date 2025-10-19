"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { ReactNode } from "react"

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode // 👈 added this
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { signOutUser, role } = useAuth() // 👈 get role

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Title + Subtitle */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* 👇 Only show actions for teachers */}
          {role === "teacher" && actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}

          {/* Sign Out Button */}
          <Button variant="outline" size="sm" onClick={signOutUser}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
