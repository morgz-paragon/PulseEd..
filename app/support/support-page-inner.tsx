"use client"

import { useSearchParams } from "next/navigation"
import { AiSafetyChat } from "@/components/ai-safety-chat"
import { Header } from "@/components/header"

export function SupportPageInner() {
  const params = useSearchParams()
  const risk = params.get("risk") || "medium_risk"

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Need Some Help?"
        subtitle={`We detected a ${risk.replace("_", " ")} message.`}
      />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <AiSafetyChat onEnd={() => window.location.replace("/student")} />
      </main>
    </div>
  )
}
