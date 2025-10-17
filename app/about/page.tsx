"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Leaf, Users, Zap, Globe } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Leaf className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">About Waste to Wish</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforming the way communities share resources and reduce waste through sustainable practices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8">
            <Leaf className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-muted-foreground">
              To create a sustainable community where unwanted items find new homes, reducing waste and building
              meaningful connections between people.
            </p>
          </Card>

          <Card className="p-8">
            <Globe className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-3">Our Vision</h3>
            <p className="text-muted-foreground">
              A world where sharing is the norm, waste is minimized, and communities thrive through collaboration and
              mutual support.
            </p>
          </Card>

          <Card className="p-8">
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-3">Community First</h3>
            <p className="text-muted-foreground">
              We believe in the power of community. Every donation, every request, and every connection strengthens our
              collective impact.
            </p>
          </Card>

          <Card className="p-8">
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-3">Impact Driven</h3>
            <p className="text-muted-foreground">
              Track your environmental impact through eco points and see how your contributions help reduce waste and
              build a better future.
            </p>
          </Card>
        </div>

        <Card className="p-8 mb-8 bg-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Why Waste to Wish?</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Give items a second life instead of sending them to landfills</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Connect with like-minded people in your community</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Earn eco points and recognition for your sustainability efforts</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Make a real difference in reducing environmental waste</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Build a more sustainable and compassionate world</span>
            </li>
          </ul>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground mb-6">Ready to make a difference?</p>
          <Link href="/signup">
            <Button size="lg">Get Started Today</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
