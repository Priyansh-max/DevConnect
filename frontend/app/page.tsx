"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Code, MessageSquare, Star, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ethers } from "ethers"
import { Toaster, toast } from 'sonner'
import { getDeveloperDetails } from "@/lib/contract"

export default function Home() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)

  const checkIfDeveloper = async (address: string) => {
    try {
      const details = await getDeveloperDetails(address)
      // If the developer exists, their name will be non-empty
      return details && details.name !== ""
    } catch (error) {
      console.error("Error checking developer status:", error)
      return false
    }
  }

  const handleBecomeDeveloper = async () => {
    try {
      // First check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        toast.error('MetaMask Required', {
          description: 'Please install MetaMask to continue.',
          action: {
            label: 'Install',
            onClick: () => window.open('https://metamask.io/download/', '_blank')
          },
        })
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      console.log(provider);
      const accounts = await provider.send("eth_accounts", [])

      console.log(accounts);
      if (accounts.length === 0) {
        // If wallet not connected, show simple toast message
        toast.error('Wallet Not Connected', {
          description: 'Please connect your wallet using the button in the navigation bar.'
        });
        return;
      }

      // Wallet is connected, check if developer
      const isDeveloper = await checkIfDeveloper(accounts[0])
      if (isDeveloper) {
        toast.error('Account Exists', {
          description: 'This wallet is already registered as a developer.'
        })
      } else {
        router.push('/developer')
        console.log("hiii1")
      }
      
    } catch (error) {
      console.error("Error:", error)
      toast.error('Error', {
        description: 'Something went wrong. Please try again.'
      })
    }
  }

  const handleBookCall = async () => {
    router.push("/book-call")
  }

  return (
    <div className="h-[50rem] w-full bg-background bg-grid relative flex items-center justify-center">
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
          className: 'dark:bg-gray-800 dark:text-white',
        }}
      />
      
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <main className="container mx-auto py-8 flex flex-col items-center justify-center min-h-screen">
        <section className="text-center mb-16 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Book 1-on-1 Video Calls with Expert Developers</h1>
          <p className="text-muted-foreground text-lg mb-8">Get personalized guidance and code reviews from experienced developers</p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              onClick={handleBookCall}
            >
              <Video className="mr-2 h-4 w-4" /> 
              Book a Call
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleBecomeDeveloper}
              disabled={isConnecting}
            >
              <Code className="mr-2 h-4 w-4" /> 
              Become a Developer
            </Button>
          </div>
        </section>

        {/* Rest of your component remains the same */}
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