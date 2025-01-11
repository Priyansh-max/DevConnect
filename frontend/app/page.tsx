import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Code, MessageSquare, Star, Video } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="h-[50rem] w-full bg-background bg-grid  relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <main className="container mx-auto py-8 flex flex-col items-center justify-center min-h-screen">
        <section className="text-center mb-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Book 1-on-1 Video Calls with Expert Developers</h1>
          <p className="text-muted-foreground text-lg mb-8">Get personalized guidance and code reviews from experienced developers</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/book-call">
                <Video className="mr-2 h-4 w-4" /> Book a Call
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/developer">
                <Code className="mr-2 h-4 w-4" /> Become a Developer
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl">
          <Card>
            <CardHeader>
              <Video className="h-8 w-8 mb-2" />
              <CardTitle>Video Consultations</CardTitle>
              <CardDescription>High-quality video calls with screen sharing capabilities</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 mb-2" />
              <CardTitle>Flexible Scheduling</CardTitle>
              <CardDescription>Book calls at times that work best for you</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 mb-2" />
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription>Pay securely using cryptocurrency</CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>

    </div>
   
  )
}