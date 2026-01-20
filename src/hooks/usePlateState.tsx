import { useState, useEffect, useRef, useCallback } from 'react'
import { IPlateCard } from 'assets/types'
import { LIKED_PLATES, SEEN_PLATES, STORED_PLATES } from 'const/constants'
import axios from 'utils/axiosInstance'

// Hook to manage plate state: liked, seen, and full plates
export function usePlateState() {
  const [plates, setPlates] = useState<IPlateCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [likedPlateIds, setLikedPlateIds] = useState<Set<number>>(() => {
    const stored = localStorage.getItem(LIKED_PLATES)
    if (stored) {
      return new Set(JSON.parse(stored) as number[])
    }

    // Fallback: extract from stored plates (full objects)
    const storedPlatesRaw: IPlateCard[] = localStorage.getItem('userPlates')
      ? JSON.parse(localStorage.getItem('userPlates')!)
      : []
    const ids = storedPlatesRaw
      .filter((plate) => plate?.isLiked !== undefined && plate?.isLiked)
      .map((plate) => (plate as IPlateCard).id)
    return new Set(ids.filter((id) => typeof id === 'number'))
  })

  const [seenPlateIds, setSeenPlateIds] = useState<Set<number>>(() => {
    const stored = localStorage.getItem(SEEN_PLATES)
    if (stored) {
      return new Set(JSON.parse(stored) as number[])
    }

    // Fallback: extract from stored plates
    const storedPlatesRaw: IPlateCard[] = localStorage.getItem('userPlates')
      ? JSON.parse(localStorage.getItem('userPlates')!)
      : []
    const ids = storedPlatesRaw
      .map((plate) => (plate as IPlateCard).id)
      .filter((id) => typeof id === 'number')
    return new Set(ids)
  })

  // Audio refs (if needed elsewhere)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const likeButtonAudioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch plates from API or load from localStorage
  useEffect(() => {
    const fetchPlates = async () => {
      const localPlates = localStorage.getItem(STORED_PLATES)
      let platesData = localPlates
        ? (JSON.parse(localPlates) as IPlateCard[])
        : []

      if (platesData.length === 0) {
        try {
          const { data } = await axios.get('/plates')
          platesData = data as IPlateCard[]
          localStorage.setItem(STORED_PLATES, JSON.stringify(platesData))
        } catch (error) {
          console.error('Error fetching plates:', error)
        }
      }

      setPlates(platesData)
      setIsLoading(false)
    }

    fetchPlates()
  }, [])

  // Handle like toggle
  const onCardLike = (clickedPlate: IPlateCard) => {
    setLikedPlateIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(clickedPlate.id)) {
        newSet.delete(clickedPlate.id)
      } else {
        newSet.add(clickedPlate.id)
        // Play chime sound
        if (likeButtonAudioRef.current) {
          likeButtonAudioRef.current.play().catch(() => null) // silent on mobile
        }
        // Track event
        window.gtag?.('event', 'select_content', {
          content_type: 'plate_like',
          content_id: clickedPlate.id
        })
      }
      localStorage.setItem(
        LIKED_PLATES,
        JSON.stringify(newSet.values().toArray())
      )
      return newSet
    })
  }

  // Handle mark as seen
  const onCardSeen = useCallback(function (clickedPlate: IPlateCard) {
    setSeenPlateIds((prev) => {
      const newSet = new Set(prev).add(clickedPlate.id)

      localStorage.setItem(
        LIKED_PLATES,
        JSON.stringify(newSet.values().toArray())
      )
      return newSet
      // if (!newSet.has(clickedPlate.id)) {
      //   newSet.add(clickedPlate.id)
      // }
      //return newSet
    })
  }, [])

  // Toggle mute (used for audio)
  const [isMuted, setIsMuted] = useState(true)

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  // Audio handling (for interactive playback)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  // Handle user interaction to trigger audio (e.g., on click)
  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => null)
      }
      document.removeEventListener('click', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
    }
  }, [])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (likeButtonAudioRef.current) {
        likeButtonAudioRef.current.pause()
        likeButtonAudioRef.current = null
      }
    }
  }, [])

  // const likedPlates = useMemo(() => {

  // }, [plates, likedPlateIds])

  return {
    plates,
    isLoading,
    likedPlateIds,
    seenPlateIds,
    onCardLike,
    onCardSeen,
    isMuted,
    toggleMute,
    audioRef,
    likeButtonAudioRef,
    // Optional: add getters for filtered plates
    getLikedPlates: () => plates.filter((p) => likedPlateIds.has(p.id)),
    getSeenPlates: () => plates.filter((p) => seenPlateIds.has(p.id)),
    getUnseenPlates: () => plates.filter((p) => !seenPlateIds.has(p.id)),
    getUnlikedPlates: () => plates.filter((p) => !likedPlateIds.has(p.id))
  }
}
