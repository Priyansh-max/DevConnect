"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng"
import { Button } from "@/components/ui/button"
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react"

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
})

export default function VideoCall() {
  const params = useParams()
  const channelName = `room-${params.id}`
  const [localTracks, setLocalTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)

  useEffect(() => {
    const initCall = async () => {
      if (!process.env.NEXT_PUBLIC_AGORA_APP_ID) {
        console.error("Agora App ID is missing")
        return
      }

      try {
        // Join the channel
        await client.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID,
          channelName,
          null,
          null
        )

        // Create and publish local tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        setLocalTracks([audioTrack, videoTrack])
        await client.publish([audioTrack, videoTrack])

        // Play local video
        videoTrack.play("local-video")

        // Handle remote users
        client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
          await client.subscribe(user, mediaType)
          if (mediaType === "video") {
            setRemoteUsers(prev => [...prev, user])
            user.videoTrack?.play(`remote-video-${user.uid}`)
          }
          if (mediaType === "audio") {
            user.audioTrack?.play()
          }
        })

        client.on("user-unpublished", (user: IAgoraRTCRemoteUser) => {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid))
        })
      } catch (error) {
        console.error("Error initializing call:", error)
      }
    }

    initCall()

    return () => {
      // Cleanup
      localTracks?.[0]?.close()
      localTracks?.[1]?.close()
      client.removeAllListeners()
      client.leave()
    }
  }, [channelName])

  const toggleAudio = async () => {
    if (localTracks?.[0]) {
      if (isAudioMuted) {
        await localTracks[0].setEnabled(true)
      } else {
        await localTracks[0].setEnabled(false)
      }
      setIsAudioMuted(!isAudioMuted)
    }
  }

  const toggleVideo = async () => {
    if (localTracks?.[1]) {
      if (isVideoMuted) {
        await localTracks[1].setEnabled(true)
      } else {
        await localTracks[1].setEnabled(false)
      }
      setIsVideoMuted(!isVideoMuted)
    }
  }

  const endCall = async () => {
    localTracks?.[0]?.close()
    localTracks?.[1]?.close()
    await client.leave()
    window.location.href = "/book-call"
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="aspect-video bg-gray-900 rounded-lg relative">
          <div id="local-video" className="w-full h-full"></div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button
              variant={isAudioMuted ? "destructive" : "default"}
              size="icon"
              onClick={toggleAudio}
            >
              {isAudioMuted ? <MicOff /> : <Mic />}
            </Button>
            <Button
              variant={isVideoMuted ? "destructive" : "default"}
              size="icon"
              onClick={toggleVideo}
            >
              {isVideoMuted ? <VideoOff /> : <Video />}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={endCall}
            >
              <PhoneOff />
            </Button>
          </div>
        </div>
        {remoteUsers.map(user => (
          <div key={user.uid} className="aspect-video bg-gray-900 rounded-lg">
            <div id={`remote-video-${user.uid}`} className="w-full h-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
} 