import { useState, useEffect, useRef, useMemo } from 'react'
import { IPlateCard } from 'assets/types'
import {
  BUCKET_URL,
  LIKED_PLATES,
  VIEWED_PLATES,
  STORED_PLATES
} from 'const/constants'
import axios from 'utils/axiosInstance'
import {
  formPlatePairsArray,
  getLikedPlatesFromLocalStorage,
  getViewedPlateFromLocalStorage,
  preloadImage
} from 'utils'
import { useOutletContext } from 'react-router-dom'

//console.log(VIEWED_PLATES)
//const likedPlates = getLikedPlatesFromLocalStorage()
//const viewedPlates = getViewedPlateFromLocalStorage()
// Hook to manage plate state: liked, seen, and full plates
export function usePlateState() {
  const [plates, setPlates] = useState<IPlateCard[]>([])
  //const [isLoading, setIsLoading] = useState(true)
  const [indexPairs, setIndexPairs] = useState<number[][]>([[]])
  const [index, setIndex] = useState(0)
  //const [isMuted, setIsMuted] = useState(true)
  const [likedPlateIds, setLikedPlateIds] = useState<Set<number>>(
    getLikedPlatesFromLocalStorage
  )
  const [viewedPlateIds, setViewedPlateIds] = useState<Set<number>>(
    getViewedPlateFromLocalStorage()
  )

  const { isMuted } = useOutletContext<{
    windowWidth: number
    isMuted: boolean
  }>()

  //SOUND SECTION*******************************************
  // Audio refs (if needed elsewhere)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const likeButtonAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('pop.mp3')
    likeButtonAudioRef.current = new Audio('chime.mp3')
    return () => {
      audioRef.current?.pause()
      audioRef.current = null
      likeButtonAudioRef.current?.pause()
      likeButtonAudioRef.current = null
    }
  }, [])

  function playSound(isVote: boolean) {
    const ref = isVote ? audioRef.current : likeButtonAudioRef.current
    if (!isMuted && ref) {
      if (!ref.paused) {
        ref.pause()
        ref.currentTime = 0
      }
      ref.play().catch(() => null)
    }
  }

  // // Toggle mute (used for audio)
  // const toggleMute = () => {
  //   setIsMuted((prev) => !prev)
  // }

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

  //GETPLATES AND MAKE PLATE PAIRS

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
      //sort here to prefer unseen
      setIndexPairs(formPlatePairsArray(platesData.length))
      setPlates(platesData)
      //setIsLoading(false)
    }

    fetchPlates()
  }, [])

  // on initial plate load, and every plateOff render, add to seen plates
  useEffect(() => {
    //postAdd plates
    if (index > 0) {
      //after vote index change
      setViewedPlateIds((prev) => {
        const newSet = new Set(prev)
        indexPairs[index - 1].forEach((idx) => {
          const card = plates[idx]
          newSet.add(card.id)
        })

        //store the changes
        localStorage.setItem(
          VIEWED_PLATES,
          JSON.stringify(newSet.values().toArray())
        )
        return newSet
      })
      //preload images
      if (index + 1 < indexPairs.length) {
        indexPairs[index + 1].forEach((idx) => {
          const card = plates[idx]
          const src = `${BUCKET_URL}/${card.fileName}`
          preloadImage(src)
        })
      }
    }
  }, [index, indexPairs, plates])

  // const fetchPlateOffPair = useCallback(
  //   function () {
  //     return indexPairs[index].map((idx) => {
  //       const card = plates[idx]
  //       const src = `${BUCKET_URL}/${card.fileName}`

  //       //preload if possible
  //       if (index + 1 < indexPairs.length) {
  //         preloadImage(src)
  //       }
  //       return card
  //     })
  //   },
  //   [indexPairs, plates, index]
  // )

  //USER INTERACTION FUNCTIONS*****************************************
  // Handle like toggle
  const onCardLike = (clickedPlate: IPlateCard) => {
    setLikedPlateIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(clickedPlate.id)) {
        newSet.delete(clickedPlate.id)
      } else {
        newSet.add(clickedPlate.id)
        // Play chime sound
        playSound(false)
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
  //const onCardView = useCallback(function (clickedPlate: IPlateCard) {}, [])

  async function onPlateVote(card: IPlateCard) {
    playSound(true)
    try {
      axios.post(`/vote/${card.id}`)
      setIndex((i) => i + 1)

      window.gtag &&
        window.gtag('event', 'select_content', {
          content_type: 'plate_vote',
          content_id: card.id
        })
    } catch (error) {
      console.log(error)
    }
  }

  const currentPlatePair = useMemo(() => {
    if (index < indexPairs.length) {
      return [plates[indexPairs[index][0]], plates[indexPairs[index][1]]]
    } else {
      return []
    }
  }, [plates, indexPairs, index])

  return {
    plates,
    likedPlateIds,
    viewedPlateIds,
    onCardLike,
    onPlateVote,
    isMuted,
    currentPlatePair,
    // Optional: add getters for filtered plates
    getLikedPlates: () => plates.filter((p) => likedPlateIds.has(p.id)),
    getSeenPlates: () => plates.filter((p) => viewedPlateIds.has(p.id)),
    getUnseenPlates: () => plates.filter((p) => !viewedPlateIds.has(p.id)),
    getUnlikedPlates: () => plates.filter((p) => !likedPlateIds.has(p.id))
  }
}
