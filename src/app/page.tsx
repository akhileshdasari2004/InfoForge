"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Zap,
  Shield,
  BarChart3,
  Settings,
  Clock,
  Server,
  Users,
  CheckCircle,
  CreditCard,
  ArrowRight,
} from "lucide-react";

import Link from "next/link";

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme("dark");
    setMounted(true);
  }, [setTheme]);

  if (!mounted) return null;

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-purple-400" />,
      title: "SLA‑Aware Scheduling",
      desc: "Meet deadlines with AI that prioritizes tasks by impact, risk, and SLAs.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
      title: "Real‑time Optimization",
      desc: "Continuously tunes allocations based on demand, cost, and performance signals.",
    },
    {
      icon: <Settings className="h-6 w-6 text-purple-400" />,
      title: "Rules + AI",
      desc: "Blend hard rules with AI guidance for transparent, controllable outcomes.",
    },
    {
      icon: <Server className="h-6 w-6 text-purple-400" />,
      title: "Multi‑Queue Orchestration",
      desc: "Route work across teams, regions, and queues with zero friction.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Connect your data",
      desc: "Import clients, tasks, workers, capacity and SLAs in minutes.",
      icon: <Users className="h-5 w-5 text-purple-300" />,
    },
    {
      step: "02",
      title: "Define guardrails",
      desc: "Set rules, budgets, skills and constraints that matter to your business.",
      icon: <Settings className="h-5 w-5 text-purple-300" />,
    },
    {
      step: "03",
      title: "Let AI allocate",
      desc: "Continuously assign and reassign work for the best outcome—automatically.",
      icon: <Zap className="h-5 w-5 text-purple-300" />,
    },
  ];

  const faqs = [
    {
      q: "How does InfoForge decide priorities?",
      a: "We combine your rules (SLA, skills, budgets) with an AI objective function to maximize business outcomes.",
    },
    {
      q: "Can I keep control?",
      a: "Yes. You approve guardrails and can lock assignments, override results, and audit every decision.",
    },
    {
      q: "What does onboarding look like?",
      a: "Connect data via CSV or API, define guardrails, and see optimized allocations in under an hour.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">InfoForge</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="bg-white/5 hover:bg-white/10 border border-white/10"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" asChild className="border-white/20 text-sm">
            <Link href="/auth/signin">Sign in</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-fuchsia-600 border-0 text-sm">
            <Link href="/auth/signup">Start free</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-40 container mx-auto px-6 py-16 text-center">
        <Badge className="mx-auto mb-5 bg-white/5 border border-white/10 text-purple-300">AI Resource Orchestration</Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          Allocate work perfectly. Every minute. Automatically.
        </h1>
        <p className="mt-4 text-base md:text-lg text-white/70 max-w-2xl mx-auto">
          InfoForge uses AI to schedule tasks across your teams, cut costs, and hit every SLA—without micromanagement.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="px-6 py-5 bg-gradient-to-r from-purple-600 to-fuchsia-600 border-0">
            <Link href="/auth/signup" className="flex items-center">
              Start free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="px-6 py-5 border-white/20 bg-white/5 hover:bg-white/10">
            Book a demo
          </Button>
        </div>
        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-white/50">
          <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-purple-400" /> No credit card</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-purple-400" /> Setup in under 1 hour</div>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-purple-400" /> SOC2-ready</div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-40 py-16 border-t border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {f.icon}
                    <h3 className="text-base font-semibold">{f.title}</h3>
                  </div>
                  <p className="text-sm text-white/70">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-40 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How InfoForge Works</h2>
            <p className="mt-3 text-white/70">From data connection to continuous optimization in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/50">Step {s.step}</span>
                    {s.icon}
                  </div>
                  <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-white/70">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="relative z-40 py-16 border-t border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold">Simple, usage‑based pricing</h3>
                </div>
                <p className="text-sm text-white/70 mb-4">
                  Start free. Scale with your team. Only pay for the workloads you orchestrate.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-white/5 border-white/10 text-white/80">Unlimited viewers</Badge>
                  <Badge className="bg-white/5 border-white/10 text-white/80">API access</Badge>
                  <Badge className="bg-white/5 border-white/10 text-white/80">Role-based control</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 border-purple-600/30">
              <CardContent className="p-6 h-full flex flex-col items-start justify-between">
                <div>
                  <h4 className="text-xl font-semibold">Ready to get started?</h4>
                  <p className="text-sm text-white/70 mt-1">Create a workspace and ship your first optimized schedule today.</p>
                </div>
                <Button asChild className="mt-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 border-0">
                  <Link href="/auth/signup">Start free</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-40 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((f, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold">{f.q}</h3>
                  <p className="text-sm text-white/70 mt-1">{f.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-40 border-t border-white/10 py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-r from-purple-600 to-fuchsia-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">InfoForge</span>
            </div>
            <p className="text-xs text-white/50">© {new Date().getFullYear()} InfoForge, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}