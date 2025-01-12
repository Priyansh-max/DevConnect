"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, PhoneOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface IncomingCallDialogProps {
  isOpen: boolean
  onAccept: () => void
  onReject: () => void
  callerName: string
}

export function IncomingCallDialog({
  isOpen,
  onAccept,
  onReject,
  callerName
}: IncomingCallDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="p-6 w-[300px] shadow-lg border-2">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary animate-pulse" />
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold">Incoming Call</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {callerName} is calling...
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onReject}
                  className="flex items-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  Decline
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onAccept}
                  className="flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Accept
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 