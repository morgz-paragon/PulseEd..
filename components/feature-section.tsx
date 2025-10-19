import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Shield, Sparkles } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Teachers get instant mood summaries and trends to understand classroom wellbeing at a glance.",
  },
  {
    icon: Shield,
    title: "Anonymous Student Feedback",
    description: "Students can share freely in a safe, judgment-free environment without fear of identification.",
  },
  {
    icon: Sparkles,
    title: "Data-Driven Support",
    description: "Helps educators respond more effectively with insights that guide meaningful interventions.",
  },
]

export function FeatureSection() {
  return (
    <section id="features" className="container mx-auto px-4 py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Everything you need to support student wellbeing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            A comprehensive platform designed for both students and educators
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
