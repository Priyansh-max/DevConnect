"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function VideoCall() {
  const params = useParams()
  const callId = params.id

  useEffect(() => {
    // Initialize video call here
    console.log("Initializing video call:", callId)
  }, [callId])

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-video bg-gray-900 rounded-lg">
          {/* Local video */}
        </div>
        <div className="aspect-video bg-gray-900 rounded-lg">
          {/* Remote video */}
        </div>
      </div>
    </div>
  )
} 