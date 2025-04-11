"use client"

import { useState } from "react"
import { Loader2, ChevronRight } from "lucide-react"
import { ThemeCheckbox } from "@/components/ui/theme-checkbox"
import { useRouter } from "next/navigation"

interface Guest {
  id: string
  name: string
  type: "primary" | "partner" | "child"
  recordId: string
  attending?: boolean | null
}

interface GuestResponse {
  guestId: string
  name: string
  type: string
  attending: boolean
}

interface RsvpResponse {
  recordId: string
  guestResponses: GuestResponse[]
  notes: string
  songRequest: string
}

export function RSVPForm() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [guests, setGuests] = useState<Guest[]>([])
  const [responses, setResponses] = useState<Record<string, boolean>>({})
  const [songRequest, setSongRequest] = useState("")
  const [notes, setNotes] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"phone" | "guests" | "thanks">("phone")

  // Group guests by recordId (family unit)
  const guestsByRecord = guests.reduce((acc: Record<string, Guest[]>, guest) => {
    if (!acc[guest.recordId]) {
      acc[guest.recordId] = []
    }
    acc[guest.recordId].push(guest)
    return acc
  }, {})

  // Format phone number as it's typed
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    
    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatPhoneNumber(value)
    setPhoneNumber(formatted)
  }

  // Search for guests by phone number
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Validate phone number
    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length < 10) {
      setError("Please enter a complete phone number")
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search-guests?phone=+1${cleaned}`)
      
      if (!response.ok) {
        throw new Error("Failed to find your invitation")
      }
      
      const data = await response.json()
      setGuests(data)
      
      if (data.length === 0) {
        setError("No guests found with that phone number")
        return
      }
      
      setStep("guests")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle attendance response change
  const handleResponseChange = (guestId: string, attending: boolean | undefined) => {
    setResponses((prev) => ({
      ...prev,
      [guestId]: attending as boolean,
    }))
  }

  // Submit RSVP responses
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all guests have responses
    const allAnswered = guests.every((guest) => responses[guest.id] !== undefined)

    if (!allAnswered) {
      setError("Please select whether each guest will attend")
      return
    }

    setIsSubmitting(true)
    try {
      // Format responses by record ID
      const formattedResponses: RsvpResponse[] = Object.keys(guestsByRecord).map((recordId) => {
        return {
          recordId,
          guestResponses: guestsByRecord[recordId].map((guest) => ({
            guestId: guest.id,
            name: guest.name,
            type: guest.type,
            attending: responses[guest.id],
          })),
          notes: notes,
          songRequest: songRequest
        }
      })

      const cleanedPhone = phoneNumber.replace(/\D/g, "")
      
      // Send data to API
      const submitResponse = await fetch('/api/submit-rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: `+1${cleanedPhone}`,
          responses: formattedResponses,
          notes: notes,
          songRequest: songRequest
        }),
      })

      if (!submitResponse.ok) {
        throw new Error("Failed to submit RSVP")
      }

      setStep("thanks")
    } catch (err) {
      setError("There was a problem submitting your RSVP. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset the form
  const handleReset = () => {
    setStep("phone")
    setPhoneNumber("")
    setGuests([])
    setResponses({})
    setSongRequest("")
    setNotes("")
    setError("")
  }

  // Phone Entry Screen
  if (step === "phone") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-12">
          <h1 className="archivo-font text-5xl text-black_olive mb-4">RSVP</h1>
          <p className="text-black_olive text-lg">Please enter your phone number to find your invitation.</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="block archivo-font text-black_olive">PHONE NUMBER</label>
              <input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="w-full p-3 border-2 border-fern_green bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-pear"
              />
              <p className="text-sm text-black_olive opacity-70">
                This should match the number you provided with your invitation.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-pear hover:bg-pear-400 text-black_olive rounded-[20px] archivo-font transition-colors disabled:opacity-70"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SEARCHING...</span>
                </>
              ) : (
                <>
                  <span>FIND MY INVITATION</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Guest Response Screen
  if (step === "guests") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="archivo-font text-5xl text-black_olive mb-4">RSVP</h1>
          <p className="text-black_olive text-lg">
            We found {guests.length} {guests.length === 1 ? "guest" : "guests"} for your party.
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h2 className="archivo-font text-xl text-black_olive border-b border-fern_green pb-2">YOUR PARTY</h2>
              
              {Object.keys(guestsByRecord).map((recordId) => (
                <div key={recordId} className="space-y-6">
                  {guestsByRecord[recordId].map((guest) => (
                    <div key={guest.id} className="space-y-3">
                      <h3 className="font-medium text-lg text-black_olive">{guest.name}</h3>
                      <div className="flex flex-col space-y-3 ml-4">
                        <div className="flex items-center space-x-3">
                          <ThemeCheckbox 
                            variant="pear"
                            checked={responses[guest.id] === true}
                            onCheckedChange={() => handleResponseChange(guest.id, true)}
                            id={`attending-${guest.id}`}
                          />
                          <label htmlFor={`attending-${guest.id}`} className="text-black_olive">
                            Will Attend
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <ThemeCheckbox 
                            variant="fern"
                            checked={responses[guest.id] === false}
                            onCheckedChange={() => handleResponseChange(guest.id, false)}
                            id={`not-attending-${guest.id}`}
                          />
                          <label htmlFor={`not-attending-${guest.id}`} className="text-black_olive">
                            Unable to Attend
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="archivo-font text-xl text-black_olive border-b border-fern_green pb-2">SONG REQUEST</h2>
              <div className="space-y-2">
                <label htmlFor="songRequest" className="block text-black_olive">What song would you like to dance to?</label>
                <textarea
                  id="songRequest"
                  value={songRequest}
                  onChange={(e) => setSongRequest(e.target.value)}
                  className="w-full p-3 border-2 border-fern_green bg-transparent rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-pear"
                  placeholder="Enter your song request here..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="archivo-font text-xl text-black_olive border-b border-fern_green pb-2">ADDITIONAL NOTES</h2>
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-black_olive">Dietary restrictions, questions, etc.</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border-2 border-fern_green bg-transparent rounded-md resize-none h-24 focus:outline-none focus:ring-2 focus:ring-pear"
                  placeholder="Enter any additional notes here..."
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-fern_green text-eggshell rounded-[20px] archivo-font transition-colors"
              >
                BACK
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-pear hover:bg-pear-400 text-black_olive rounded-[20px] archivo-font transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SUBMITTING...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT RSVP</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Thank You Screen
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="archivo-font text-5xl text-black_olive mb-4">THANK YOU</h1>
        <p className="text-black_olive text-lg">
          Your RSVP has been submitted successfully.
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <p className="text-black_olive text-lg mb-8">
          We're looking forward to celebrating with you!
        </p>
        
        <button
          onClick={handleReset}
          className="inline-flex items-center justify-center space-x-2 py-3 px-6 bg-pear hover:bg-pear-400 text-black_olive rounded-[20px] archivo-font transition-colors"
        >
          <span>RETURN HOME</span>
        </button>
      </div>
    </div>
  )
} 