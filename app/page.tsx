import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Share2, Zap, Shield, Cloud, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Share2 className="h-4 w-4" />
            </div>
            <span className="font-bold text-xl">ImagePost</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 sm:py-32">
        <div className="flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Powered by Cloudinary</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
            Transform Your Media
            <span className="text-primary"> Effortlessly</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
            Upload, optimize, and transform your videos and images for any
            platform. Built for creators, powered by the cloud.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mt-2">
            No credit card required • Free to start
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features to manage and optimize your media content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Upload className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Video Upload & Processing</CardTitle>
              <CardDescription>
                Upload videos up to 70MB and let Cloudinary handle the
                optimization automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Automatic format conversion</li>
                <li>• Quality optimization</li>
                <li>• Fast CDN delivery</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Social Media Ready</CardTitle>
              <CardDescription>
                Transform images for Instagram, Twitter, Facebook, and more with
                perfect dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Pre-defined social formats</li>
                <li>• Live preview</li>
                <li>• One-click download</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Cloud className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Cloud-Powered</CardTitle>
              <CardDescription>
                Built on Cloudinary&apos;s robust infrastructure for reliability
                and speed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 99.9% uptime</li>
                <li>• Global CDN</li>
                <li>• Automatic backups</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your media is protected with enterprise-grade security and
                authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Clerk authentication</li>
                <li>• Private storage</li>
                <li>• HTTPS encryption</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Optimized performance with Next.js 15 and Convex real-time
                database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time updates</li>
                <li>• Server-side rendering</li>
                <li>• Edge optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Image
                src="/next.svg"
                alt="Next.js"
                width={40}
                height={40}
                className="mb-2 dark:invert"
              />
              <CardTitle>Modern Stack</CardTitle>
              <CardDescription>
                Built with the latest technologies for the best developer and
                user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Next.js 15</li>
                <li>• TypeScript</li>
                <li>• Tailwind CSS</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join creators who trust ImagePost for their media needs
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sign-up">
                Create Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Share2 className="h-3 w-3" />
              </div>
              <span className="font-semibold">ImagePost</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 ImagePost. Built with Next.js, Convex, and Cloudinary.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
