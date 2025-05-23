"use client"

import { useState } from "react"
import styled from "styled-components"
import { SpotifySearch } from "./spotify-search"
import Image from "next/image"

interface Guest {
  id: string
  name: string
  type: "primary" | "partner" | "child"
  recordId: string
  attending?: boolean | null
}

interface FamilyGroup {
  recordId: string
  kidsInvited: boolean
  guests: Guest[]
}

interface GuestResponse {
  guestId: string
  name: string
  type: string
  attending: boolean
  dietaryRestrictions?: {
    glutenFree?: boolean
    vegetarian?: boolean
    pescatarian?: boolean
    soyAllergy?: boolean
    sesameAllergy?: boolean
    eggAllergy?: boolean
    nutAllergy?: boolean
  }
}

interface RsvpResponse {
  recordId: string
  guestResponses: GuestResponse[]
  notes: string
  songRequest: string
  spotifyTrackUri?: string
  kidsInvited: boolean
}

interface Track {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  uri: string
  previewUrl: string | null
}

// Define the dietary restriction types
type DietaryRestriction = 'glutenFree' | 'vegetarian' | 'pescatarian' | 'soyAllergy' | 'sesameAllergy' | 'eggAllergy' | 'nutAllergy';

export function RSVPForm() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [guests, setGuests] = useState<Guest[]>([])
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([])
  const [responses, setResponses] = useState<Record<string, boolean>>({})
  const [dietaryRestrictions, setDietaryRestrictions] = useState<Record<string, Record<DietaryRestriction, boolean>>>({})
  const [songRequest, setSongRequest] = useState("")
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [notes, setNotes] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"phone" | "guests" | "thanks">("phone")

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
      
      if (!data.guests || data.guests.length === 0) {
        setError("No guests found with that phone number")
        return
      }
      
      setGuests(data.guests)
      setFamilyGroups(data.familyGroups)

      // Pre-populate responses from existing RSVP data
      const initialResponses: Record<string, boolean> = {}
      let additionalNotes = ""
      let songRequestValue = ""

      // Loop through family groups to find additional data
      data.familyGroups.forEach((family: FamilyGroup) => {
        // Get first record to check for notes and song request
        if (family.recordId && family.guests.length > 0) {
          // Find the records in the original data to get notes and song request
          const record = data.records?.find((r: any) => r.id === family.recordId)
          if (record) {
            console.log("Found record with fields:", record.fields)
            additionalNotes = record.fields.Additional_Notes || ""
            songRequestValue = record.fields.Song_Request || ""
          }
        }

        // Process each guest's attendance
        family.guests.forEach((guest: Guest) => {
          console.log(`Guest ${guest.name} attendance:`, guest.attending)
          // Convert 'Yes'/'No' string values to boolean
          if (guest.attending !== null && guest.attending !== undefined) {
            // If the value is a string 'Yes' or 'No', convert to boolean
            if (typeof guest.attending === 'string') {
              initialResponses[guest.id] = guest.attending === 'Yes'
            } 
            // If it's already a boolean, use directly
            else if (typeof guest.attending === 'boolean') {
              initialResponses[guest.id] = guest.attending
            }
          }
        })
      })

      // Set the pre-populated values
      console.log("Initial responses:", initialResponses)
      console.log("Additional notes:", additionalNotes)
      console.log("Song request:", songRequestValue)
      setResponses(initialResponses)
      setNotes(additionalNotes)
      setSongRequest(songRequestValue)
      
      setStep("guests")
    } catch (err) {
      console.error("Error searching for guests:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle attendance response change
  const handleResponseChange = (guestId: string, attending: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [guestId]: attending,
    }))
  }

  // Handle dietary restriction toggle
  const handleDietaryRestrictionToggle = (guestId: string, restriction: DietaryRestriction) => {
    setDietaryRestrictions((prev) => {
      // Initialize dietary restrictions for this guest if not already set
      const guestRestrictions = prev[guestId] || {
        glutenFree: false,
        vegetarian: false, 
        pescatarian: false,
        soyAllergy: false,
        sesameAllergy: false,
        eggAllergy: false,
        nutAllergy: false
      };
      
      // Toggle the specific restriction
      return {
        ...prev,
        [guestId]: {
          ...guestRestrictions,
          [restriction]: !guestRestrictions[restriction]
        }
      };
    });
  }

  // Handle track selection
  const handleTrackSelect = (track: Track | null) => {
    setSelectedTrack(track)
    // If a track is selected, set the song request to the track name and artist
    if (track) {
      setSongRequest(`${track.name} by ${track.artist}`)
    } else {
      setSongRequest("")
    }
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
      const formattedResponses: RsvpResponse[] = familyGroups.map((family) => {
        return {
          recordId: family.recordId,
          kidsInvited: family.kidsInvited,
          guestResponses: family.guests.map((guest) => ({
            guestId: guest.id,
            name: guest.name,
            type: guest.type,
            attending: responses[guest.id],
            // Include dietary restrictions if guest is attending
            ...(responses[guest.id] && dietaryRestrictions[guest.id] ? {
              dietaryRestrictions: dietaryRestrictions[guest.id]
            } : {})
          })),
          notes: notes,
          songRequest: songRequest,
          spotifyTrackUri: selectedTrack?.uri
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
          songRequest: songRequest,
          spotifyTrackUri: selectedTrack?.uri
        }),
      })

      if (!submitResponse.ok) {
        throw new Error("Failed to submit RSVP")
      }

      // If a track was selected, add it to the playlist
      if (selectedTrack) {
        try {
          const playlistResponse = await fetch('/api/spotify/add-to-playlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              trackUri: selectedTrack.uri
            }),
          })

          // If there was an error adding to the playlist, we'll log it but continue with the submission
          if (!playlistResponse.ok) {
            console.error("Could not add song to playlist, but RSVP was saved successfully")
          }
        } catch (error) {
          console.error("Error adding track to playlist:", error)
          // Don't fail the submission if playlist add fails
        }
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
    setFamilyGroups([])
    setResponses({})
    setDietaryRestrictions({})
    setSongRequest("")
    setSelectedTrack(null)
    setNotes("")
    setError("")
  }

  // Phone Entry Screen
  if (step === "phone") {
    return (
      <StyledWrapper>
        <div className="content-wrapper">
          <h1>RSVP</h1>
          <p className="form-description">PLEASE ENTER YOUR PHONE NUMBER TO FIND YOUR INVITATION.</p>
          
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="phone">PHONE NUMBER</label>
              <input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
              />
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={isSearching}
            >
              {isSearching ? "SEARCHING..." : "FIND MY INVITATION"}
            </button>
          </form>
        </div>
      </StyledWrapper>
    )
  }

  // Guest Response Screen
  if (step === "guests") {
    // Check if this is a previous submission by looking at existing selections
    const hasExistingResponses = Object.keys(responses).length > 0;

    return (
      <StyledWrapper>
        <div className="content-wrapper">
          <h1>RSVP</h1>
          {hasExistingResponses ? (
            <div className="existing-data-message">
              <p className="form-description">WE FOUND YOUR PREVIOUS RSVP! YOU CAN UPDATE YOUR SELECTIONS IF NEEDED.</p>
            </div>
          ) : (
            <p className="form-description">WE FOUND {guests.length} {guests.length === 1 ? "GUEST" : "GUESTS"} FOR YOUR PARTY.</p>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h2>WILL YOU BE ATTENDING?</h2>
              
              {familyGroups.map((family) => (
                <div key={family.recordId} className="guest-group">
                  {family.guests.map((guest) => (
                    // Only show children if kidsInvited is true
                    (guest.type !== 'child' || family.kidsInvited) && (
                      <div key={guest.id} className="guest-card">
                        <div className="guest-info">
                          <p className="guest-name">{guest.name.toUpperCase()}</p>
                          <p className="guest-type">{guest.type === 'child' ? 'CHILD' : ''}</p>
                        </div>
                        <div className="choices-container">
                          <div 
                            className={`choice ${responses[guest.id] === true ? 'selected-yes' : ''}`} 
                            onClick={() => handleResponseChange(guest.id, true)}
                          >
                            <div className="icon-wrapper">
                              <label className="heart-container">
                                <input 
                                  type="radio" 
                                  id={`${guest.id}-yes`}
                                  name={`attendance-${guest.id}`}
                                  checked={responses[guest.id] === true}
                                  onChange={() => handleResponseChange(guest.id, true)}
                                />
                                <div className="svg-container">
                                  <svg viewBox="0 0 24 24" className="svg-outline" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.4,4C14.6,4,13,4.9,12,6.3C11,4.9,9.4,4,7.6,4C4.5,4,2,6.5,2,9.6C2,14,12,22,12,22s10-8,10-12.4C22,6.5,19.5,4,16.4,4z" />
                                  </svg>
                                  <svg viewBox="0 0 24 24" className="svg-filled" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.4,4C14.6,4,13,4.9,12,6.3C11,4.9,9.4,4,7.6,4C4.5,4,2,6.5,2,9.6C2,14,12,22,12,22s10-8,10-12.4C22,6.5,19.5,4,16.4,4z" />
                                  </svg>
                                  <svg className="svg-celebrate" width={100} height={100} xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="10,10 20,20" />
                                    <polygon points="10,50 20,50" />
                                    <polygon points="20,80 30,70" />
                                    <polygon points="90,10 80,20" />
                                    <polygon points="90,50 80,50" />
                                    <polygon points="80,80 70,70" />
                                  </svg>
                                </div>
                              </label>
                            </div>
                            <span className="label">YES</span>
                          </div>
                          
                          <div 
                            className={`choice ${responses[guest.id] === false ? 'selected-no' : ''}`}
                            onClick={() => handleResponseChange(guest.id, false)}
                          >
                            <div className="icon-wrapper">
                              <label className="thumbs-container">
                                <input 
                                  type="radio" 
                                  id={`${guest.id}-no`}
                                  name={`attendance-${guest.id}`}
                                  checked={responses[guest.id] === false}
                                  onChange={() => handleResponseChange(guest.id, false)}
                                />
                                <svg id="Glyph" version="1.1" viewBox="0 0 32 32" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                                  <path className="thumb-path" d="M2.156,14.901l2.489-8.725C5.012,4.895,6.197,4,7.528,4h13.473C21.554,4,22,4.448,22,5v14  c0,0.215-0.068,0.425-0.197,0.597l-5.392,7.24C15.813,27.586,14.951,28,14.027,28c-1.669,0-3.026-1.357-3.026-3.026V20H5.999  c-1.265,0-2.427-0.579-3.188-1.589C2.047,17.399,1.809,16.12,2.156,14.901z" id="XMLID_259_" />
                                  <path className="thumb-handle" d="M25.001,20h4C29.554,20,30,19.552,30,19V5c0-0.552-0.446-1-0.999-1h-4c-0.553,0-1,0.448-1,1v14  C24.001,19.552,24.448,20,25.001,20z M27.001,6.5c0.828,0,1.5,0.672,1.5,1.5c0,0.828-0.672,1.5-1.5,1.5c-0.828,0-1.5-0.672-1.5-1.5  C25.501,7.172,26.173,6.5,27.001,6.5z" id="XMLID_260_" />
                                </svg>
                                <div className="raindrops-container">
                                  <span className="raindrop raindrop1"></span>
                                  <span className="raindrop raindrop2"></span>
                                  <span className="raindrop raindrop3"></span>
                                  <span className="raindrop raindrop4"></span>
                                  <span className="raindrop raindrop5"></span>
                                  <span className="raindrop raindrop6"></span>
                                </div>
                                <div className="cloud-container">
                                  <span className="cloud"></span>
                                </div>
                              </label>
                            </div>
                            <span className="label">NO</span>
                          </div>
                        </div>
                        
                        {/* Display dietary restriction icons only if the guest is attending */}
                        {responses[guest.id] === true && (
                          <div className="dietary-restrictions">
                            <p className="dietary-label">DIETARY RESTRICTIONS:</p>
                            
                            <div className="restriction-icons">
                              {/* Gluten Free */}
                              <div 
                                className={`restriction-icon ${dietaryRestrictions[guest.id]?.glutenFree ? 'active' : 'inactive'}`}
                                onClick={() => handleDietaryRestrictionToggle(guest.id, 'glutenFree')}
                              >
                                <div className="icon-container">
                                  <Image 
                                    src="/images/icons/gluten-free.svg" 
                                    alt="Gluten Free"
                                    width={30}
                                    height={30}
                                  />
                                  <span className="restriction-label">GLUTEN FREE</span>
                                </div>
                              </div>
                              
                              {/* Vegetarian */}
                              <div 
                                className={`restriction-icon ${dietaryRestrictions[guest.id]?.vegetarian ? 'active' : 'inactive'}`}
                                onClick={() => handleDietaryRestrictionToggle(guest.id, 'vegetarian')}
                              >
                                <div className="icon-container">
                                  <Image 
                                    src="/images/icons/vegetarian.svg" 
                                    alt="Vegetarian"
                                    width={30}
                                    height={30}
                                  />
                                  <span className="restriction-label">VEGETARIAN</span>
                                </div>
                              </div>
                              
                              {/* Pescatarian */}
                              <div 
                                className={`restriction-icon ${dietaryRestrictions[guest.id]?.pescatarian ? 'active' : 'inactive'}`}
                                onClick={() => handleDietaryRestrictionToggle(guest.id, 'pescatarian')}
                              >
                                <div className="icon-container">
                                  <Image 
                                    src="/images/icons/pescatarian.svg" 
                                    alt="Pescatarian"
                                    width={30}
                                    height={30}
                                  />
                                  <span className="restriction-label">PESCATARIAN</span>
                                </div>
                              </div>
                              
                              {/* Soy Allergy */}
                              <div 
                                className={`restriction-icon ${dietaryRestrictions[guest.id]?.soyAllergy ? 'active' : 'inactive'}`}
                                onClick={() => handleDietaryRestrictionToggle(guest.id, 'soyAllergy')}
                              >
                                <div className="icon-container">
                                  <Image 
                                    src="/images/icons/soy-allergy.svg" 
                                    alt="Soy Allergy"
                                    width={30}
                                    height={30}
                                  />
                                  <span className="restriction-label">SOY ALLERGY</span>
                                </div>
                              </div>
                              
                              {/* Sesame Allergy */}
                              <div 
                                className={`restriction-icon ${dietaryRestrictions[guest.id]?.sesameAllergy ? 'active' : 'inactive'}`}
                                onClick={() => handleDietaryRestrictionToggle(guest.id, 'sesameAllergy')}
                              >
                                <div className="icon-container">
                                  <Image 
                                    src="/images/icons/sesame-allergy.svg" 
                                    alt="Sesame Allergy"
                                    width={30}
                                    height={30}
                                  />
                                  <span className="restriction-label">SESAME ALLERGY</span>
                                </div>
                              </div>
                              
                              {/* Egg Allergy */}
                              <div 
                                className={`restriction-icon ${dietaryRestrictions[guest.id]?.eggAllergy ? 'active' : 'inactive'}`}
                                onClick={() => handleDietaryRestrictionToggle(guest.id, 'eggAllergy')}
                              >
                                <div className="icon-container">
                                  <Image 
                                    src="/images/icons/egg-allergy.svg" 
                                    alt="Egg Allergy"
                                    width={30}
                                    height={30}
                                  />
                                  <span className="restriction-label">EGG ALLERGY</span>
                                </div>
                              </div>
                              
                              {/* Nut Allergy */}
                              <div 
                                className={`restriction-icon ${dietaryRestrictions[guest.id]?.nutAllergy ? 'active' : 'inactive'}`}
                                onClick={() => handleDietaryRestrictionToggle(guest.id, 'nutAllergy')}
                              >
                                <div className="icon-container">
                                  <Image 
                                    src="/images/icons/nut-allergy.svg" 
                                    alt="Nut Allergy"
                                    width={30}
                                    height={30}
                                  />
                                  <span className="restriction-label">NUT ALLERGY</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              ))}
            </div>
            
            <div className="form-section">
              <h2>SONG REQUEST</h2>
              <p className="section-description" style={{ marginBottom: "1.5rem" }}>HELP US CREATE THE PERFECT PLAYLIST FOR THE RECEPTION!</p>
              
              <SpotifySearch 
                onSelect={handleTrackSelect}
                selectedTrack={selectedTrack}
              />
              
              <div className="form-group">
                <label htmlFor="notes">ADDITIONAL NOTES</label>
                <textarea
                  id="notes"
                  placeholder="Dietary restrictions, accessibility needs, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            {error && (
              <div className="error-message">{error}</div>
            )}

            <div className="button-group">
              <button
                type="button"
                className="secondary-button"
                onClick={handleReset}
              >
                START OVER
              </button>
              
              <button
                type="submit"
                className="primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT RSVP"}
              </button>
            </div>
          </form>
        </div>
      </StyledWrapper>
    )
  }

  // Thank You Screen
  if (step === "thanks") {
    return (
      <StyledWrapper>
        <div className="content-wrapper">
          <h1>THANK YOU</h1>
          <p className="success-message">YOUR RSVP HAS BEEN RECEIVED!</p>
          <p className="form-description">WE LOOK FORWARD TO CELEBRATING WITH YOU.</p>
          
          <div className="button-group thank-you-buttons">
            <a 
              href="https://withjoy.com/thegruhins/registry"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button"
            >
              VIEW OUR REGISTRY
            </a>
            
            <button 
              onClick={handleReset}
              className="secondary-button"
            >
              EDIT MY RESPONSES
            </button>
          </div>
        </div>
      </StyledWrapper>
    )
  }

  return null
}

const StyledWrapper = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap');
  
  font-family: 'Archivo Black', sans-serif;
  width: 100%;
  text-align: center;
  color: #37352f;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    border-radius: 16px;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  
  h1 {
    color: #37352f;
    margin-bottom: 1.5rem;
    font-size: 2.5rem;
    letter-spacing: -0.02em;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .form-description {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
  
  .existing-data-message {
    border-radius: 8px;
    padding: 0.5rem;
    margin-bottom: 2rem;
    
    .form-description {
      margin-bottom: 0;
      color: #677A3E;
      font-weight: bold;
      font-size: 1.25rem;
    }
  }
  
  .form-section {
    margin-bottom: 2rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
    text-align: left;
  }
  
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: 'Archivo Black', sans-serif;
    margin-bottom: 0.5rem;
  }
  
  .input-help {
    font-size: 0.9rem;
    color: #666;
    margin-top: 0.25rem;
  }
  
  .error-message {
    background-color: rgba(220, 38, 38, 0.1);
    color: rgb(220, 38, 38);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-weight: bold;
  }
  
  .success-message {
    font-size: 1.5rem;
    color: #4CAF50;
    margin-bottom: 1rem;
  }
  
  .primary-button {
    display: inline-block;
    background-color: #D2F348;
    color: #000000;
    font-weight: bold;
    padding: 0.8rem 1.5rem;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    font-size: 1rem;
    text-align: center;
    transition: background-color 0.2s;
    letter-spacing: 0.05em;
    font-family: 'Archivo Black', sans-serif;
    text-transform: uppercase;
    
    &:hover {
      background-color: #c2e139;
    }
    
    &:disabled {
      background-color: #bdbab2;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
  
  .secondary-button {
    display: inline-block;
    background-color: #677A3E;
    color: #FFFFFF;
    font-weight: bold;
    padding: 0.8rem 1.5rem;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    font-size: 1rem;
    text-align: center;
    transition: background-color 0.2s;
    letter-spacing: 0.05em;
    font-family: 'Archivo Black', sans-serif;
    text-transform: uppercase;
    
    &:hover {
      background-color: #556731;
    }
  }
  
  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    justify-content: center;
    
    &.thank-you-buttons {
      flex-direction: column;
      max-width: 300px;
      margin-left: auto;
      margin-right: auto;
    }
  }
  
  .guest-group {
    margin-bottom: 2rem;
  }
  
  .guest-card {
    background-color: #f9f9f9;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .guest-info {
    margin-bottom: 1.5rem;
  }
  
  .guest-name {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
  }
  
  .guest-type {
    font-size: 0.9rem;
    color: #666;
    text-transform: capitalize;
  }
  
  /* Yes/No Choice Styles from Heart Component */
  .choices-container {
    display: flex;
    gap: 3.5rem;
    justify-content: center;
    margin-top: 1rem;
  }
  
  .choice {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 1.5rem 2rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .choice:hover {
    background-color: rgba(0, 0, 0, 0.03);
    transform: translateY(-2px);
  }
  
  .selected-yes {
    background-color: rgba(231, 84, 128, 0.1);
    border: 2px solid rgba(231, 84, 128, 0.3);
    transform: translateY(-2px);
  }
  
  .selected-no {
    background-color: rgba(37, 99, 235, 0.1);
    border: 2px solid rgba(37, 99, 235, 0.3);
    transform: translateY(-2px);
  }
  
  .icon-wrapper {
    padding: 0.5rem;
    position: relative;
    margin-bottom: 0.5rem;
    transform: scale(1.2);
  }
  
  .label {
    margin-top: 0.5rem;
    font-weight: bold;
    color: #37352f;
    font-size: 1.2rem;
    letter-spacing: 0.5px;
  }
  
  /* Heart styles */
  .heart-container {
    display: block;
    position: relative;
    cursor: pointer;
    user-select: none;
  }
  
  .heart-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    z-index: 20;
  }
  
  .svg-container {
    position: relative;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .svg-outline,
  .svg-filled {
    position: absolute;
    width: 50px;
    height: 50px;
    transition: all 0.3s;
  }
  
  .svg-outline {
    fill: #666;
  }
  
  .svg-filled {
    fill: #E3474F;
    animation: keyframes-svg-filled 1s;
    display: none;
  }
  
  .svg-celebrate {
    position: absolute;
    animation: keyframes-svg-celebrate .5s;
    animation-fill-mode: forwards;
    display: none;
    stroke: #E3474F;
    fill: #E3474F;
    stroke-width: 2px;
  }
  
  .heart-container input:checked ~ .svg-container .svg-outline {
    opacity: 0;
  }

  .heart-container input:checked ~ .svg-container .svg-filled {
    display: block;
  }

  .heart-container input:checked ~ .svg-container .svg-celebrate {
    display: block;
  }

  .heart-container:hover .svg-outline {
    transform: scale(1.1);
  }

  @keyframes keyframes-svg-filled {
    0% {
      transform: scale(0);
    }
    25% {
      transform: scale(1.2);
    }
    50% {
      transform: scale(1);
      filter: brightness(1.5);
    }
  }

  @keyframes keyframes-svg-celebrate {
    0% {
      transform: scale(0);
    }
    50% {
      opacity: 1;
      filter: brightness(1.5);
    }
    100% {
      transform: scale(1.4);
      opacity: 0;
      display: none;
    }
  }
  
  /* Thumbs down styles */
  .thumbs-container {
    display: block;
    position: relative;
    cursor: pointer;
    user-select: none;
  }
  
  .thumbs-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    z-index: 10;
  }
  
  .thumbs-container svg {
    position: relative;
    top: 0;
    left: 0;
    height: 50px;
    width: 50px;
    transition: all 0.3s;
    fill: #666;
    z-index: 5;
  }
  
  .raindrops-container, .cloud-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
  }
  
  .cloud {
    position: absolute;
    top: -15px;
    width: 25px;
    height: 10px;
    background: rgba(37, 99, 235, 0.3);
    border-radius: 10px;
    opacity: 0;
    transform: scale(0);
  }
  
  .raindrop {
    position: absolute;
    width: 4px;
    height: 10px;
    background: #2563EB;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  
  .raindrop1 {
    left: 10px;
    top: -5px;
  }
  
  .raindrop2 {
    left: 20px;
    top: -2px;
  }
  
  .raindrop3 {
    left: 30px;
    top: -8px;
  }
  
  .raindrop4 {
    left: 12px;
    top: 10px;
  }
  
  .raindrop5 {
    left: 25px;
    top: 15px;
  }
  
  .raindrop6 {
    left: 32px;
    top: 20px;
  }
  
  .selected-no .thumbs-container svg {
    fill: #2563EB;
    animation: sadThumbDown 0.6s forwards;
  }
  
  .selected-no .thumbs-container .cloud {
    animation: cloudAppear 0.3s forwards;
  }
  
  .selected-no .thumbs-container .raindrop1 {
    animation: raindropFall 1.2s 0.1s forwards;
  }
  
  .selected-no .thumbs-container .raindrop2 {
    animation: raindropFall 1s 0.3s forwards;
  }
  
  .selected-no .thumbs-container .raindrop3 {
    animation: raindropFall 1.4s 0.2s forwards;
  }
  
  .selected-no .thumbs-container .raindrop4 {
    animation: raindropFall 1.3s 0.5s forwards;
  }
  
  .selected-no .thumbs-container .raindrop5 {
    animation: raindropFall 1.1s 0.7s forwards;
  }
  
  .selected-no .thumbs-container .raindrop6 {
    animation: raindropFall 1.5s 0.4s forwards;
  }
  
  @keyframes sadThumbDown {
    0% {
      transform: scale(1) rotate(0);
    }
    20% {
      transform: scale(1.05) rotate(-5deg);
    }
    40% {
      transform: scale(1.1) rotate(-15deg) translateY(0);
    }
    60% {
      transform: scale(1.05) rotate(-10deg) translateY(3px);
    }
    80% {
      transform: scale(1) rotate(-12deg) translateY(2px);
    }
    100% {
      transform: scale(1) rotate(-10deg) translateY(3px);
    }
  }
  
  @keyframes cloudAppear {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes raindropFall {
    0% {
      opacity: 0;
      transform: translateY(0) scale(0);
    }
    15% {
      opacity: 1;
      transform: translateY(10px) scale(1);
    }
    85% {
      opacity: 1;
      transform: translateY(45px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(50px) scale(0.5);
    }
  }
  
  .cloud-container {
    position: absolute;
    bottom: 150%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    opacity: 0;
    transition: opacity 0.25s;
  }
  
  /* Dietary Restrictions Styling */
  .dietary-restrictions {
    margin-top: 1rem;
    border-top: 1px solid #eee;
    padding-top: 0.75rem;
    width: 100%;
  }
  
  .dietary-label {
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    text-align: center;
    color: #555;
  }
  
  .restriction-icons {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
    max-width: 100%;
  }
  
  .restriction-icon {
    cursor: pointer;
    transition: all 0.2s;
    padding: 0.5rem;
    border-radius: 8px;
    width: calc(25% - 1rem);
    min-width: 70px;
    margin-bottom: 0.5rem;
  }
  
  .restriction-icon.inactive {
    opacity: 0.5;
    filter: grayscale(100%);
  }
  
  .restriction-icon.active {
    opacity: 1;
    filter: none;
    background-color: rgba(210, 243, 72, 0.2);
  }
  
  .icon-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  
  .restriction-label {
    font-size: 0.7rem;
    text-align: center;
  }
`; 