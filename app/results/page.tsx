import { GuestList } from "@/components/guest-list"
import Link from "next/link"
import Image from "next/image"
import { searchGuests } from "@/lib/airtable"

// Mark this as a server component explicitly
export const runtime = "nodejs" // 'edge' also works

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { phone?: string }
}) {
  const phoneNumber = searchParams.phone || ""
  const guests = await searchGuests(phoneNumber)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="max-w-lg w-full space-y-12">
        <div className="flex justify-between items-center w-full">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Image
              src="/placeholder.svg?height=48&width=48"
              alt="The Gruhins"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <a
            href="#"
            className="bg-[#d2ff4c] text-black font-bold px-6 py-2 rounded-full text-sm uppercase tracking-wide"
          >
            Registry
          </a>
        </div>

        <div className="text-center">
          <h1 className="text-[#b0b3b8] text-5xl font-extrabold tracking-wider uppercase">RSVP</h1>
          {guests.length > 0 ? (
            <p className="mt-6 text-black text-lg">
              We found {guests.length} {guests.length === 1 ? "guest" : "guests"} with this phone number
            </p>
          ) : (
            <p className="mt-6 text-black text-lg">No guests found with this phone number</p>
          )}
        </div>

        {guests.length > 0 ? (
          <GuestList guests={guests} phoneNumber={phoneNumber} />
        ) : (
          <div className="text-center space-y-6">
            <p className="text-gray-600">We couldn't find any guests with the phone number {phoneNumber}.</p>
            <Link href="/">
              <button className="bg-[#d2ff4c] hover:bg-[#c5f235] text-black font-bold py-3 px-6 rounded-md transition-colors">
                Try Again
              </button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
