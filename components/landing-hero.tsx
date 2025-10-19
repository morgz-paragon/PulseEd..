import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function LandingHero() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
          Student Wellbeing Platform
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
          A Safe Space for Students. <span className="text-primary">Real Insights</span> for Teachers.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty leading-relaxed">
          Students can share how they feel anonymously, and teachers get actionable, AI-powered analytics to better
          support their classes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="text-base px-8">
            <Link href="/login">
              I'm a Student
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base px-8 bg-transparent">
            <Link href="/login">I'm a Teacher</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
