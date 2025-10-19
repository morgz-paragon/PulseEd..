import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    title: "Students Share",
    description: "Students log in anonymously and share their current mood with an optional message.",
  },
  {
    number: "02",
    title: "Data Collected",
    description: "All feedback is securely stored and aggregated in real-time for analysis.",
  },
  {
    number: "03",
    title: "Teachers Gain Insights",
    description: "Teachers view mood trends, patterns, and summaries to better understand their class.",
  },
  {
    number: "04",
    title: "Take Action",
    description: "Educators use insights to provide targeted support and create a healthier learning environment.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            A simple four-step process to transform student wellbeing
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="border-border">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4">
                  <div className="text-4xl font-bold text-primary/20">{step.number}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
