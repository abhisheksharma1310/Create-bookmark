"use client";

import { ArrowRight, Bookmark, FolderTree, Share2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-background pt-16 md:pt-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Organize your bookmarks,{" "}
                <span className="text-primary">unlock your potential</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Create unlimited nested categories, organize your bookmarks with ease, and access them from anywhere. The most intuitive bookmark management system you'll ever use.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/app">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">
                    Learn more
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-secondary/5 p-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FolderTree className="h-48 w-48 text-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to organize your digital life
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features that make bookmark management a breeze
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center p-6 bg-background rounded-lg shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Unlimited Nesting</h3>
              <p className="text-center text-muted-foreground">
                Create as many nested categories as you need to perfectly organize your bookmarks
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-lg shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
              <p className="text-center text-muted-foreground">
                Share your bookmark collections with friends and colleagues
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-lg shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
              <p className="text-center text-muted-foreground">
                Your bookmarks are safely stored and encrypted
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-20 shadow-xl sm:px-24 xl:py-32">
            <div className="absolute inset-0 mix-blend-overlay">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
            </div>
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Start organizing your bookmarks today
              </h2>
              <p className="mt-6 text-lg text-primary-foreground/90">
                Join thousands of users who have already transformed their bookmark management experience.
              </p>
              <div className="mt-10">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/app">
                    Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Bookmark className="h-6 w-6" />
              <span className="text-xl font-semibold">BookmarkNest</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BookmarkNest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}