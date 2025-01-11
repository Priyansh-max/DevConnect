"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Star, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [developers, setDevelopers] = useState(onlineDevelopers)

  const handleBooking = (developerId: number) => {
    toast({
      title: "Booking initiated",
      description: "Please connect your wallet to continue with the booking.",
    })
  }

  return (
    <main className="container mx-auto py-8">
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
    </main>
  )
}