"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Star, Video } from "lucide-react"
import { Toaster, toast } from 'sonner'
import { IncomingCallDialog } from "@/components/incoming-call-dialog"
import { ethers } from "ethers"
import { Developer, getAllDevelopers, getContract, bookCall, respondToCallRequest } from "@/lib/contract"
import { useRouter } from "next/navigation"

export default function BookCall() {
  const router = useRouter()
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCall, setShowCall] = useState(false)
  const [currentCaller, setCurrentCaller] = useState("")
  const [currentDeveloper, setCurrentDeveloper] = useState<Developer | null>(null)

  useEffect(() => {
    let isSubscribed = true;
    let eventCleanup: (() => void) | null = null;

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

    const listenForCallEvents = async (): Promise<(() => void) | null> => {
      if (eventCleanup) return null;

      const contract = await getContract();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      const userAddress = accounts[0]?.address;
      
      // Store event handlers for cleanup
      const handlers = {
        requested: (developer: string, client: string, requestId: number) => {
          if (!isSubscribed) return; // Don't process events if component is unmounted
          console.log("Call requested:", { developer, client, requestId });
          if (developer.toLowerCase() === userAddress?.toLowerCase()) {
            // Developer view - show accept/reject buttons
            toast(
              <div className="flex flex-col gap-2">
                <div className="font-semibold">New Call Request</div>
                <div>{client} wants to book a call</div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="default" 
                    onClick={async () => {
                      try {
                        await respondToCallRequest(requestId, true);
                        toast.dismiss();
                        toast("Call accepted successfully");
                      } catch (error) {
                        toast("Failed to accept call");
                      }
                    }}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      try {
                        await respondToCallRequest(requestId, false);
                        toast.dismiss();
                        toast("Call rejected");
                      } catch (error) {
                        toast("Failed to reject call");
                      }
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>,
              { duration: Infinity, id: `call-request-${requestId}` } // Add unique ID
            );
          } else if (client.toLowerCase() === userAddress?.toLowerCase()) {
            toast("Call Request Sent", {
              description: "Waiting for developer to respond...",
              id: `call-request-${requestId}` // Add unique ID
            });
          }
        },
        accepted: (developer: string, client: string, requestId: number, roomId: string) => {
          if (client.toLowerCase() === userAddress?.toLowerCase() || 
              developer.toLowerCase() === userAddress?.toLowerCase()) {
            toast.success("Call Accepted", {
              description: "Redirecting to video call..."
            });
            
            // Dismiss any waiting toasts
            toast.dismiss('waiting-toast');
            toast.dismiss(`call-request-${requestId}`);
            
            // Redirect to video call room
            setTimeout(() => {
              router.push(`/call/${requestId}`);
            }, 1500);
          }
        },
        rejected: (developer: string, client: string, requestId: number) => {
          if (client.toLowerCase() === userAddress?.toLowerCase()) {
            toast.error("Call Rejected", {
              description: "Your payment will be refunded."
            });
          }
        }
      };

      contract.on("CallRequested", handlers.requested);
      contract.on("CallAccepted", handlers.accepted);
      contract.on("CallRejected", handlers.rejected);

      eventCleanup = () => {
        contract.off("CallRequested", handlers.requested);
        contract.off("CallAccepted", handlers.accepted);
        contract.off("CallRejected", handlers.rejected);
      };

      return eventCleanup;
    };

    const fetchAndListen = async () => {
      try {
        await fetchDevelopers();
        if (isSubscribed) {
          eventCleanup = await listenForCallEvents();
        }
      } catch (error) {
        console.error("Error in setup:", error);
      }
    };

    fetchAndListen();

    return () => {
      isSubscribed = false;
      if (eventCleanup) {
        eventCleanup();
      }
    };
  }, [router]); // Add router to dependencies

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

    const dev = developers.find(d => d.walletAddress === developers[developerId].walletAddress)
    if (dev) {
      try {
        // Show loading toast
        toast.loading('Booking Call...', {
          description: 'Please confirm the transaction in your wallet',
          duration: Infinity,
          id: 'booking-toast'
        });

        await bookCall(dev.walletAddress, ethers.formatEther(dev.hourlyRate.toString()));
        
        // Update toast after transaction is sent
        toast.dismiss('booking-toast');
        toast.success('Transaction Sent', {
          description: 'Waiting for developer to accept...',
          duration: Infinity,
          id: 'waiting-toast'
        });

      } catch (error: any) {
        toast.dismiss('booking-toast');
        console.error("Error booking call:", error);
        toast.error('Booking Failed', {
          description: error.message || 'Unknown error occurred'
        });
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