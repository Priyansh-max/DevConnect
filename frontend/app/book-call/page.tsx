"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Star, Video } from "lucide-react"
import { Toaster, toast } from 'sonner'
import { IncomingCallDialog } from "@/components/incoming-call-dialog"
import { ethers } from "ethers"

// In a real app, this would come from your backend
const onlineDevelopers = [
  {
    id: 1,
    name: "Alice Johnson",
    expertise: "Full Stack Developer",
    rate: "0.1 ETH/hour",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop",
    timezone: "UTC+01:00",
    isOnline: true
  },
  {
    id: 2,
    name: "Bob Smith",
    expertise: "Blockchain Developer",
    rate: "0.15 ETH/hour",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&auto=format&fit=crop",
    timezone: "UTC-05:00",
    isOnline: true
  }
]

export default function BookCall() {
  const [developers, setDevelopers] = useState(onlineDevelopers)
  const [showCall, setShowCall] = useState(false)
  const [currentCaller, setCurrentCaller] = useState("")

  const handleBooking = async (developerId: number) => {
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

    // Check if wallet is connected
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.listAccounts()
    
    if (accounts.length === 0) {
      toast.error('Wallet Not Connected', {
        description: 'Please connect your wallet using the button in the navigation bar.'
      });
      return;
    }

    // Proceed with booking if wallet is connected
    const dev = developers.find(d => d.id === developerId)
    if (dev) {
      setCurrentCaller(dev.name)
      setShowCall(true)
    }
  }

  return (
    <main className="container mx-auto py-8">
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Available Developers</h1>
        <p className="text-muted-foreground">
          Book a video call with our online developers right now
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developers.map((dev) => (
          <Card key={dev.id} className="relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-muted-foreground">Online</span>
            </div>

            <CardHeader>
              <div className="flex items-center gap-4">
                <img
                  src={dev.image}
                  alt={dev.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <CardTitle className="text-xl">{dev.name}</CardTitle>
                  <CardDescription>{dev.expertise}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">{dev.rating}</span>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    {dev.timezone}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{dev.rate}</span>
                  <Badge variant="outline">
                    <Video className="h-3 w-3 mr-1" />
                    Available Now
                  </Badge>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleBooking(dev.id)}
              >
                Book a Call
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {developers.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No Developers Online</h2>
          <p className="text-muted-foreground">
            Please check back later or browse all developers
          </p>
        </div>
      )}

      <IncomingCallDialog
        isOpen={showCall}
        onAccept={() => {
          setShowCall(false)
          toast.success("Call Accepted", {
            description: "Redirecting to call room..."
          })
        }}
        onReject={() => {
          setShowCall(false)
          toast.error("Call Rejected", {
            description: "The developer is currently unavailable."
          })
        }}
        callerName={currentCaller}
      />
    </main>
  )
}