declare global {
  interface Window {
    ethereum?: any;
  }
}

"use client"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Video, Wallet, Users, Settings, LogOut, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Link from "next/link"
import { Toaster, toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Condiment } from "next/font/google";
import { getDeveloperDetails, getContract } from "@/lib/contract"

export default function Navbar() {
  const [address, setAddress] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState("0")
  // Add this state to track developer status
  const [isDeveloper, setIsDeveloper] = useState(false)

  // Add this useEffect to check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()
          
          if (accounts.length > 0) {
            toast.success("Wallet Connected")
            const address = await accounts[0].getAddress()
            setAddress(address)
            setIsConnected(true)
            
            // Get wallet balance
            const balance = await provider.getBalance(address)
            setBalance(ethers.formatEther(balance))
            
            // Check if developer
            checkIfDeveloper(address)
          }
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }

    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setIsConnected(false)
          setAddress("")
          setBalance("0")
        } else {
          // Account changed
          checkConnection()
        }
      })
    }

    return () => {
      // Cleanup listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
      }
    }
  }, [])

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        setAddress(accounts[0])
        setIsConnected(true)
        
        // Get wallet balance
        const balance = await provider.getBalance(accounts[0])
        setBalance(ethers.formatEther(balance))

        // Here you would check if the address is a registered developer
        // This is just a placeholder - replace with your actual check
        checkIfDeveloper(accounts[0])
      } else {
        toast.error('MetaMask Required', {
          description: 'Please install MetaMask to continue.',
          action: {
            label: 'Install',
            onClick: () => window.open('https://metamask.io/download/', '_blank')
          },
        })
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  // Add this function to check developer status
  const checkIfDeveloper = async (address: string) => {
    try {
      const contract = await getContract();
      const isRegistered = await contract.isDeveloper(address);
      console.log("Developer check:", { address, isRegistered });
      setIsDeveloper(isRegistered);
    } catch (error) {
      console.error("Error checking developer status:", error);
      setIsDeveloper(false);
    }
  }

  

  return (
    <nav className="px-4 border-b bg-background">
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
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-2">
          <Video className="h-6 w-6" />
          <Link href="/">
            <span className="text-xl font-bold">DevConnect</span>
          </Link>   
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                  {isDeveloper && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="flex items-center justify-between">
                  My Account
                  {isDeveloper && (
                    <span className="text-xs text-green-500 flex items-center">
                      Developer <Check className="h-3 w-3 ml-1" />
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-between">
                  Balance
                  <span className="font-mono">{parseFloat(balance).toFixed(4)} ETH</span>
                </DropdownMenuItem>
                {isDeveloper && (
                  <>
                    <DropdownMenuItem className="flex justify-between">
                      Sessions
                      <span>0</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/developer" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}