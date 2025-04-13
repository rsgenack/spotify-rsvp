"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"

interface Track {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  uri: string
  previewUrl: string | null
}

interface SpotifySearchProps {
  onSelect: (track: Track) => void
  selectedTrack: Track | null
}

export function SpotifySearch({ onSelect, selectedTrack }: SpotifySearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Track[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)

  // Clean up audio player on unmount
  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
      }
    };
  }, [audioPlayer]);

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Search for tracks
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      setError("Please enter a search term")
      return
    }

    setIsSearching(true)
    setError("")
    
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}`)
      
      if (!response.ok) {
        throw new Error("Failed to search for songs")
      }
      
      const data = await response.json()
      setSearchResults(data.tracks)
      
      if (data.tracks.length === 0) {
        setError("No songs found. Try a different search term.")
      }
    } catch (err) {
      setError("Error searching for songs. Please try again.")
      console.error("Spotify search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle track selection
  const handleTrackSelect = (track: Track) => {
    onSelect(track)
  }

  // Play/pause preview
  const togglePreview = (track: Track) => {
    if (!track.previewUrl) return;
    
    if (audioPlayer) {
      audioPlayer.pause();
      
      // If we're clicking the currently playing track, stop it
      if (playingTrackId === track.id) {
        setPlayingTrackId(null);
        return;
      }
    }
    
    // Play the new track
    const audio = new Audio(track.previewUrl);
    audio.play();
    setAudioPlayer(audio);
    setPlayingTrackId(track.id);
    
    // When preview ends, reset state
    audio.onended = () => {
      setPlayingTrackId(null);
    };
  }

  return (
    <StyledSpotifySearch>
      <div className="form-group">
        <label htmlFor="song-search">SEARCH FOR A SONG</label>
        <div className="search-container">
          <input
            id="song-search"
            type="text"
            placeholder="Search for a song to request"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button 
            type="button" 
            className="search-button" 
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? "SEARCHING..." : "SEARCH"}
          </button>
        </div>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((track) => (
              <div 
                key={track.id} 
                className={`track-item ${selectedTrack?.id === track.id ? 'selected' : ''}`}
                onClick={() => handleTrackSelect(track)}
              >
                <div className="track-image">
                  {track.albumArt && <img src={track.albumArt} alt={track.album} />}
                </div>
                <div className="track-info">
                  <div className="track-name">{track.name}</div>
                  <div className="track-artist">{track.artist}</div>
                  <div className="track-album">{track.album}</div>
                </div>
                {track.previewUrl && (
                  <button 
                    type="button" 
                    className={`preview-button ${playingTrackId === track.id ? 'playing' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePreview(track);
                    }}
                  >
                    {playingTrackId === track.id ? '◼' : '▶'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {selectedTrack && (
          <div className="selected-track">
            <p>YOU'VE SELECTED:</p>
            <div className="track-item selected">
              <div className="track-image">
                {selectedTrack.albumArt && <img src={selectedTrack.albumArt} alt={selectedTrack.album} />}
              </div>
              <div className="track-info">
                <div className="track-name">{selectedTrack.name}</div>
                <div className="track-artist">{selectedTrack.artist}</div>
              </div>
              <button 
                type="button" 
                className="remove-button"
                onClick={() => onSelect(null as unknown as Track)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </StyledSpotifySearch>
  )
}

const StyledSpotifySearch = styled.div`
  .search-container {
    display: flex;
    gap: 10px;
    margin-bottom: 1rem;
  }
  
  .search-button {
    padding: 0.8rem 1.5rem;
    background-color: #37352f;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Archivo Black', sans-serif;
    transition: background-color 0.2s;
    white-space: nowrap;
    
    &:hover {
      background-color: #2c2b26;
    }
    
    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
  
  .search-results {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-top: 1rem;
  }
  
  .track-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: #f9f9f9;
    }
    
    &.selected {
      background-color: rgba(103, 122, 62, 0.1);
      border-left: 4px solid #677A3E;
    }
  }
  
  .track-image {
    width: 50px;
    height: 50px;
    margin-right: 1rem;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }
  }
  
  .track-info {
    flex: 1;
    text-align: left;
  }
  
  .track-name {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }
  
  .track-artist {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.25rem;
  }
  
  .track-album {
    font-size: 0.8rem;
    color: #999;
  }
  
  .preview-button {
    background: transparent;
    border: 1px solid #ddd;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 0.5rem;
    
    &.playing {
      background-color: #677A3E;
      color: white;
      border-color: #677A3E;
    }
  }
  
  .selected-track {
    margin-top: 1.5rem;
    background-color: rgba(103, 122, 62, 0.1);
    border-radius: 8px;
    padding: 1rem;
    
    p {
      margin-bottom: 0.75rem;
      font-weight: bold;
    }
    
    .track-item {
      padding: 0;
      border: none;
      background-color: transparent;
    }
    
    .remove-button {
      background: transparent;
      border: 1px solid #ff5c5c;
      color: #ff5c5c;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      
      &:hover {
        background-color: #ff5c5c;
        color: white;
      }
    }
  }
  
  .error-message {
    background-color: rgba(220, 38, 38, 0.1);
    color: rgb(220, 38, 38);
    padding: 0.75rem;
    border-radius: 8px;
    margin-top: 0.75rem;
    font-weight: bold;
    font-size: 0.9rem;
  }
` 