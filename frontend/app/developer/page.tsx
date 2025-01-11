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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  expertise: z.string().min(2, "Expertise is required"),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  about: z.string().min(50, "About section must be at least 50 characters"),
  github: z.string().url("Must be a valid URL"),
  yearsOfExperience: z.string(),
  timezone: z.string(),
})

const timezones = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00", 
  "UTC-07:00", "UTC-06:00", "UTC-05:00", "UTC-04:00", "UTC-03:00",
  "UTC-02:00", "UTC-01:00", "UTC+00:00", "UTC+01:00", "UTC+02:00",
  "UTC+03:00", "UTC+04:00", "UTC+05:00", "UTC+06:00", "UTC+07:00",
  "UTC+08:00", "UTC+09:00", "UTC+10:00", "UTC+11:00", "UTC+12:00"
]

const experienceLevels = [
  "1-2 years", "3-5 years", "5-7 years", "7-10 years", "10+ years"
]

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
      about: "",
      github: "",
      yearsOfExperience: "",
      timezone: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      // Here you would typically send the data to your backend
      console.log(values)
      
      toast({
        title: "Profile submitted!",
        description: "Your developer profile has been created successfully.",
      })
      
      // Redirect to home page after successful submission
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
                    <FormLabel>Primary Expertise</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Full Stack Developer, Blockchain Expert" {...field} />
                    </FormControl>
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
                      <Input type="number" step="0.01" placeholder="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Set your hourly rate in ETH (e.g., 0.1 ETH)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem key={timezone} value={timezone}>
                            {timezone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Profile</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/yourusername" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About You</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your experience, skills, and what you can offer to clients..."
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 50 characters. Describe your experience and what makes you unique.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  )
}