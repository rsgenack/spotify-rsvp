"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PhoneIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SearchForm() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+1") // Default to USA
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length < 7) {
      setError("Please enter a valid phone number")
      return
    }

    setIsLoading(true)
    try {
      // Format the full phone number with country code
      const fullPhoneNumber = `${countryCode}${cleaned}`

      // Redirect to results page with the phone number as a query parameter
      router.push(`/results?phone=${encodeURIComponent(fullPhoneNumber)}`)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-md border-0">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-[110px] border-r-0 rounded-r-none focus:ring-0 focus-visible:ring-0">
                  <SelectValue placeholder="+1" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">🇺🇸 +1</SelectItem>
                  <SelectItem value="+972">🇮🇱 +972</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-l-none rounded-r-md focus-within:ring-2 focus-within:ring-[#d2ff4c] px-3 py-2 bg-white flex-1">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                <Input
                  type="tel"
                  placeholder={countryCode === "+1" ? "(555) 123-4567" : "50-123-4567"}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              {countryCode === "+1"
                ? "Enter your US phone number without the country code"
                : "Enter your Israeli phone number without the country code"}
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#d2ff4c] hover:bg-[#c5f235] text-black font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Find My Invitation"}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
