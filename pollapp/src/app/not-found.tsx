"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Home,
  Search,
  ArrowLeft,
  Vote,
  Compass,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <Card className="border-none shadow-lg">
          <CardContent className="p-12">
            {/* Large 404 with poll chart icon */}
            <div className="mb-8">
              <div className="relative inline-block">
                <h1 className="text-9xl font-bold text-primary/20 select-none">
                  404
                </h1>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <BarChart3 className="h-16 w-16 text-primary" />
                </div>
              </div>
            </div>

            {/* Main message */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Page Not Found
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
              Oops! The poll or page you&apos;re looking for seems to have
              vanished into the digital void. Let&apos;s get you back on track.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/">
                <Button size="lg" className="w-full sm:w-auto">
                  <Home className="mr-2 h-5 w-5" />
                  Go Home
                </Button>
              </Link>
              <Link href="/polls">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Compass className="mr-2 h-5 w-5" />
                  Explore Polls
                </Button>
              </Link>
            </div>

            {/* Helpful suggestions */}
            <div className="border-t pt-8 mt-8">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                What would you like to do?
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 text-left max-w-md mx-auto">
                <Link
                  href="/polls/create"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <Vote className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Create a new poll</span>
                </Link>
                <Link
                  href="/polls"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Search polls</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <BarChart3 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">View dashboard</span>
                </Link>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group text-left"
                >
                  <ArrowLeft className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Go back</span>
                </button>
              </div>
            </div>

            {/* Footer message */}
            <div className="mt-8 text-sm text-muted-foreground">
              If you believe this is an error, please{" "}
              <Link
                href="/support"
                className="text-primary hover:underline font-medium"
              >
                contact support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
