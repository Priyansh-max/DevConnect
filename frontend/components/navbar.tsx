declare global {
  interface Window {
    ethereum?: any;
  }
}

"use client"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Video, Code } from "lucide-react"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Link from "next/link"

export default function Navbar() {
  const [address, setAddress] = useState("")
  const [isConnected, setIsConnected] = useState(false)

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        setAddress(accounts[0])
        setIsConnected(true)
      } else {
        alert("Please install MetaMask!")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  return (
    <nav className="px-4 border-b bg-background">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-2">
          <Video className="h-6 w-6" />
          <Link href="/">
            <span className="text-xl font-bold">DevConnect</span>
          </Link>   
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <Button
            onClick={connectWallet}
            variant={isConnected ? "outline" : "default"}
          >
            {isConnected ? 
              `${address.slice(0, 6)}...${address.slice(-4)}` : 
              "Connect Wallet"
            }
          </Button>
          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}