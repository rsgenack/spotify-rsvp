"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { submitRsvp } from "@/lib/airtable"
import { Loader2 } from "lucide-react"

interface Guest {
  id: string
  name: string
  type: "primary" | "partner" | "child"
  recordId: string
  attending?: boolean | null
}

interface GuestListProps {
  guests: Guest[]
  phoneNumber: string
}

export function GuestList({ guests, phoneNumber }: GuestListProps) {
  const [responses, setResponses] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  // Group guests by recordId (family unit)
  const guestsByRecord = guests.reduce((acc: Record<string, Guest[]>, guest) => {
    if (!acc[guest.recordId]) {
      acc[guest.recordId] = []
    }
    acc[guest.recordId].push(guest)
    return acc
  }, {})

  const handleResponseChange = (guestId: string, attending: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [guestId]: attending,
    }))
  }

  const handleSubmit = async () => {
    // Make sure all guests have responses
    const allAnswered = guests.every((guest) => responses[guest.id] !== undefined)

    if (!allAnswered) {
      toast({
        title: "Missing responses",
        description: "Please indicate whether each guest will be attending.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Format responses by record ID for the API
      const formattedResponses = Object.keys(guestsByRecord).map((recordId) => {
        return {
          recordId,
          guestResponses: guestsByRecord[recordId].map((guest) => ({
            guestId: guest.id,
            name: guest.name,
            type: guest.type,
            attending: responses[guest.id],
          })),
        }
      })

      await submitRsvp(phoneNumber, formattedResponses, notes)

      setSubmitted(true)
      toast({
        title: "RSVP Submitted",
        description: "Thank you for your response!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your RSVP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="pt-6 text-center space-y-6">
          <h2 className="text-3xl font-bold text-[#b0b3b8]">Thank You!</h2>
          <p className="text-black text-lg">
            Your RSVP has been successfully submitted. We look forward to celebrating with you!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-0">
      <CardContent className="pt-6 space-y-8">
        {/* Display guests grouped by family */}
        {Object.keys(guestsByRecord).map((recordId) => (
          <div key={recordId} className="space-y-6">
            <h3 className="font-medium text-xl border-b pb-2">Family Group</h3>

            {guestsByRecord[recordId].map((guest) => (
              <div key={guest.id} className="space-y-3 ml-4">
                <h4 className="font-medium text-lg">{guest.name}</h4>
                <RadioGroup
                  value={responses[guest.id]?.toString()}
                  onValueChange={(value) => handleResponseChange(guest.id, value === "true")}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id={`attending-${guest.id}`} />
                    <Label htmlFor={`attending-${guest.id}`} className="text-base">
                      Will Attend
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id={`not-attending-${guest.id}`} />
                    <Label htmlFor={`not-attending-${guest.id}`} className="text-base">
                      Unable to Attend
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-base">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Dietary restrictions, questions, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-[#d2ff4c] hover:bg-[#c5f235] text-black font-bold py-3 px-6 rounded-md transition-colors disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting
            </>
          ) : (
            "Submit RSVP"
          )}
        </button>
      </CardFooter>
    </Card>
  )
}
