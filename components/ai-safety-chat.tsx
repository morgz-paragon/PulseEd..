"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import OpenAI from "openai"

export function AiSafetyChat({ onEnd }: { onEnd: (name: string | null) => void }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hey, I noticed you're not feeling too well. I'm here to talk to you — would you like to share what's on your mind?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [askName, setAskName] = useState(false)
  const [studentName, setStudentName] = useState("")

  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  const sendMessage = async () => {
    if (!input.trim()) return
    const newMessages = [...messages, { sender: "student", text: input }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a kind and empathetic emotional support assistant. Respond with warm, caring language. Encourage talking to a trusted adult or counselor if serious. Never give medical advice.",
          },
          ...newMessages.map((m) => ({
            role: m.sender === "ai" ? "assistant" : "user",
            content: m.text,
          })),
        ],
        max_tokens: 100,
      })

      const aiReply = completion.choices[0].message.content
      setMessages([...newMessages, { sender: "ai", text: aiReply || "" }])

      // After 2 student messages, prompt name sharing
      if (newMessages.filter((m) => m.sender === "student").length >= 2) {
        setAskName(true)
      }
    } catch (err) {
      console.error("AI chat error:", err)
      setMessages([
        ...newMessages,
        {
          sender: "ai",
          text: "I'm really sorry — something went wrong on my end. But you matter, and it's important to talk to someone you trust right away.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-6 bg-accent/5 border-accent/30">
      <CardContent className="p-4 space-y-4">
        <div className="max-h-80 overflow-y-auto space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg ${
                m.sender === "ai"
                  ? "bg-primary/10 text-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {m.text}
            </div>
          ))}

          {loading && (
            <div className="p-2 rounded-lg bg-primary/10 text-muted-foreground italic">
              Typing…
            </div>
          )}
        </div>

        {!askName && (
          <div className="flex gap-2">
            <Input
              placeholder="Type your response..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading}>
              Send
            </Button>
          </div>
        )}

        {askName && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you’d like your teacher to check in on you personally, you can share your name below.
            </p>
            <Input
              placeholder="Your name (optional)"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
            <Button onClick={() => onEnd(studentName || null)} className="w-full">
              Submit & End Chat
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
