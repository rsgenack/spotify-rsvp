import { SearchForm } from "@/components/search-form"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center">
          <h1 className="text-[#b0b3b8] text-5xl font-extrabold tracking-wider uppercase">RSVP</h1>
          <p className="mt-6 text-black text-lg">Please enter your phone number to find your invitation</p>
        </div>

        <SearchForm />
      </div>
    </main>
  )
}
