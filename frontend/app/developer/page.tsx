"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { registerDeveloper } from "@/lib/contract"
import { Loader2 } from "lucide-react"
import { ethers } from "ethers"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  expertise: z.string().min(2, "Expertise is required"),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
})

export default function BecomeDeveloper() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      expertise: "",
      hourlyRate: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      toast({
        title: "Initiating Transaction",
        description: "Please confirm the transaction in your wallet...",
      })

      const tx = await registerDeveloper(
        values.name,
        values.expertise,
        values.hourlyRate
      )

      toast({
        title: "Transaction Sent",
        description: "Your registration is being processed...",
      })

      try {
        const receipt = await tx.wait()
        toast({
          title: "Success!",
          description: "You are now registered as a developer.",
        })
        router.push("/book-call")
      } catch (waitError: any) {
        console.error("Transaction failed:", waitError)
        toast({
          title: "Transaction Failed",
          description: "The registration transaction failed to complete.",
          variant: "destructive",
        })
      }
      
    } catch (error: any) {
      console.error("Error registering developer:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Become a Developer</CardTitle>
          <CardDescription>
            Fill in your details to start offering your expertise on our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expertise"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expertise</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Solidity, React, Node.js" {...field} />
                    </FormControl>
                    <FormDescription>
                      List your main areas of expertise
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate (ETH)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.0001" placeholder="0.0001" {...field} />
                    </FormControl>
                    <FormDescription>
                      Set your hourly rate in ETH (e.g., 0.0001 ETH)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : 
                  "Register as Developer"
                }
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  )
}