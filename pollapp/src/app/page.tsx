import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
  Vote,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <Vote className="h-6 w-6" />,
      title: "Easy Poll Creation",
      description:
        "Create engaging polls in minutes with our intuitive interface",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Real-time Results",
      description: "Watch votes come in live and see results update instantly",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Detailed Analytics",
      description: "Get insights with comprehensive analytics and reporting",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Anonymous Voting",
      description: "Support both public and anonymous voting options",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Multiple Choice",
      description:
        "Create single or multiple choice polls with flexible options",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Scheduled Expiry",
      description: "Set expiration dates or create evergreen polls",
    },
  ];

  const stats = [
    { label: "Active Polls", value: "1,234" },
    { label: "Total Votes", value: "45,678" },
    { label: "Happy Users", value: "2,890" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto text-center">
          <Badge className="mb-6" variant="secondary">
            ✨ New: Real-time poll results
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Create Polls That Matter
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gather opinions, make decisions, and engage your audience with
            beautiful, easy-to-use polls. Get started in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/polls/create">
              <Button size="lg" className="w-full sm:w-auto">
                <Vote className="mr-2 h-5 w-5" />
                Create Your First Poll
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/polls">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Polls
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to create amazing polls
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features that make poll creation and management
              effortless
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-none shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get your poll up and running in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Poll</h3>
              <p className="text-muted-foreground">
                Add your question and options. Choose from various poll types
                and settings.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Share & Collect</h3>
              <p className="text-muted-foreground">
                Share your poll link and watch as responses come in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyze Results</h3>
              <p className="text-muted-foreground">
                View detailed analytics and insights to understand your
                audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white border-none">
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of users who are already creating engaging polls
                and gathering valuable insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Sign Up Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/polls">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-primary"
                  >
                    Browse Polls
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-4 mt-8 text-sm opacity-80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Unlimited polls
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BarChart3 className="h-6 w-6" />
              <span className="text-xl font-bold">PollApp</span>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </a>
              <a
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                Support
              </a>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 PollApp. All rights reserved. Built with ❤️ and Next.js
          </div>
        </div>
      </footer>
    </div>
  );
}
