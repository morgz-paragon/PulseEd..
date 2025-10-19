"use client"

import { Suspense } from "react"
import { SupportPageInner } from "./support-page-inner"

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading support chat…</div>}>
      <SupportPageInner />
    </Suspense>
  )
}
