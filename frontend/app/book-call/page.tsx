"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Star, Video } from "lucide-react"
import { Toaster, toast } from 'sonner'
import { IncomingCallDialog } from "@/components/incoming-call-dialog"
import { ethers } from "ethers"
import { Developer, getAllDevelopers, getContract, bookCall } from "@/lib/contract"

export default function BookCall() {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCall, setShowCall] = useState(false)
  const [currentCaller, setCurrentCaller] = useState("")
  const [currentDeveloper, setCurrentDeveloper] = useState<Developer | null>(null)

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        setLoading(true);
        const devs = await getAllDevelopers();
        console.log("Fetched developers:", devs);
        
        const formattedDevs = devs.map(dev => ({
          ...dev,
          walletAddress: dev.walletAddress,
          isAvailable: dev.isAvailable
        }));
        
        setDevelopers(formattedDevs);
      } catch (error: any) {
        console.error("Error in fetchDevelopers:", error);
        toast.error("Failed to load developers", {
          description: error.message || "Unknown error occurred"
        });
      } finally {
        setLoading(false);
      }
    };

    const listenForCallBooked = async () => {
      const contract = await getContract();
      const checkForEvents = () => {
        contract.on("CallBooked", (developer, client, amount) => {
          console.log("CallBooked event detected:", { developer, client, amount });
          const dev = developers.find(d => d.walletAddress === developer);
          if (dev) {
            setCurrentDeveloper(dev);
            setShowCall(true);
            toast.success(`Call booked with ${dev.name}`, {
              description: "Please join the call."
            });
          }
        });
      };

      checkForEvents();
      const intervalId = setInterval(checkForEvents, 10000); // Check every 10 seconds

      return () => {
        clearInterval(intervalId);
        contract.off("CallBooked");
      };
    };

    listenForCallBooked();
    fetchDevelopers();
  }, []);

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

    // Check if user has sufficient balance
    const balance = await provider.getBalance(accounts[0])
    const dev = developers.find(d => d.walletAddress === developers[developerId].walletAddress)
    if (dev) {
      // const requiredAmount = ethers.parseEther(dev.hourlyRate.toString())
      // if (balance < requiredAmount) {
      //   toast.error('Insufficient Funds', {
      //     description: 'You do not have enough funds to book this call.'
      //   })
      //   return
      // }

      // Proceed with booking if wallet is connected and balance is sufficient
      try {
        await bookCall(dev.walletAddress, ethers.formatEther(dev.hourlyRate.toString()))

        toast.success('Call Booked', {
          description: 'Please wait for the call notification.'
        })
      } catch (error: any) {
        console.error("Error booking call:", error)
        toast.error('Booking Failed', {
          description: error.message || 'Unknown error occurred'
        })
      }
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

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map((dev, index) => (
            <Card key={dev.walletAddress} className="relative">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-sm text-muted-foreground">Online</span>
              </div>

              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/50 flex items-center justify-center text-2xl font-bold text-white">
                    {dev.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{dev.name}</CardTitle>
                    <CardDescription>{dev.expertise}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {ethers.formatEther(dev.hourlyRate)} ETH/hour
                    </span>
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
                  onClick={() => handleBooking(index)}
                >
                  Book a Call
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!loading && developers.length === 0 && (
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