/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react'
import axios from '../utils/axiosInstance'
import PlateCard from './PlateCard'
import Spinner from './Spinner'
import { IPlateCard } from 'assets/types'
import {
  LIKED_PLATES,
  MOBILE_WIDTH_CUTOFF,
  SEEN_PLATES,
  STORED_PLATES
} from 'const/constants'
//import allPlateData from '../const/Plate_Zone_Plates.json'

interface PlateOffProps {
  isMuted: boolean
  isSideBySideView: boolean
}

const PlateOff = (props: PlateOffProps) => {
  const [indexPairs, setIndexPairs] = useState<number[][]>([[]])
  const [index, setIndex] = useState(0)
  const [plates, setPlates] = useState<IPlateCard[]>([])
  const [isLoading, setLoading] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const likeButtonAudioRef = useRef<HTMLAudioElement | null>(null)

  const [seenPlateIds, setSeenPlateIds] = useState<Set<number>>(() => {
    // Retrieve the plates array (full objects) from localStorage
    // DO NOT DELETE, just write the new ids

    const storedPlates = localStorage.getItem('userPlates')
    const storedPlateIds = localStorage.getItem(SEEN_PLATES)

    // If we have stored plate IDs, return them as a Set
    if (storedPlateIds) {
      const parsedIds = JSON.parse(storedPlateIds) as number[]
      return new Set(parsedIds)
    }

    // If we don't have plate IDs, try to extract them from the old stored plates (full objects)
    // This assumes that 'userPlates' contains an array of IPlateCard objects
    const storedPlatesRaw = (
      storedPlates ? JSON.parse(storedPlates) : []
    ) as IPlateCard[]
    const plateIds = storedPlatesRaw
      .map((plate) => plate.id)
      .filter((id) => id !== undefined && id !== null)
      .filter((id) => typeof id === 'number')
    return new Set(plateIds)
  })

  const [likedPlateIds, setLikedPlateIds] = useState<Set<number>>(() => {
    // Retrieve the plates array (full objects) from localStorage
    // DO NOT DELETE, just write the new ids

    const storedPlates = localStorage.getItem('userPlates')
    const storedPlateIds = localStorage.getItem(LIKED_PLATES)

    // If we have stored plate IDs, return them as a Set
    if (storedPlateIds) {
      const parsedIds = JSON.parse(storedPlateIds) as number[]
      return new Set(parsedIds)
    }

    // If we don't have plate IDs, try to extract them from the old stored plates (full objects)
    // This assumes that 'userPlates' contains an array of IPlateCard objects
    const storedPlatesRaw = (
      storedPlates ? JSON.parse(storedPlates) : []
    ) as IPlateCard[]
    const likedPlateIds = storedPlatesRaw
      .filter(
        ({ isLiked, id }) =>
          isLiked && id !== undefined && id !== null && typeof id === 'number'
      )
      .map((plate) => plate.id)
    return new Set(likedPlateIds)
  })

  useEffect(() => {
    // match up the plates
    function formPlatePairsArray(len: number): number[][] {
      const plateIds = Array.from({ length: len }, (_, i) => i)
      shuffle(plateIds)

      const pairedPlates: number[][] = []
      for (let i = 0; i < plateIds.length; i += 2) {
        pairedPlates.push([plateIds[i], plateIds[i + 1]])
      }

      return pairedPlates
    }

    // array shuffle function
    function shuffle(array: Array<unknown>) {
      let currentIndex = array.length

      while (currentIndex != 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--
        ;[array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex]
        ]
      }
    }

    //get plates and store in localStorage
    async function getCards() {
      const localPlates = localStorage.getItem(STORED_PLATES)

      try {
        let plates = localPlates
          ? (JSON.parse(localPlates) as IPlateCard[])
          : []

        if (Array.isArray(plates) && plates.length > 0) {
          setPlates(plates)
        } else {
          const { data } = await axios.get('/plates')
          plates = data as IPlateCard[]
          localStorage.setItem(STORED_PLATES, JSON.stringify(plates))
        }

        setPlates(plates)

        const tempArray = formPlatePairsArray(plates.length)
        setIndexPairs(tempArray)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    if (isLoading) {
      getCards()
      audioRef.current = new Audio('pop.mp3')
      likeButtonAudioRef.current = new Audio('chime.mp3')
    }

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
      likeButtonAudioRef.current?.pause()
      likeButtonAudioRef.current = null
    }
  }, [isLoading])

  // on initial plates, and every plateOff render, add to seen plates
  useEffect(() => {
    if (index == 0) {
      return
    }
    console.log(index)
    const plateIndexes = indexPairs[index - 1]
    const plateIdsToAdd = plateIndexes.map((idx) => plates[idx].id)
    console.log('index_add', plateIdsToAdd)

    // has to be two (for now)
    if (plateIdsToAdd.length == 2) {
      setSeenPlateIds((prev) => {
        return new Set(prev.add(plateIdsToAdd[0]).add(plateIdsToAdd[1]))
      })
    }
  }, [index, indexPairs, plates])

  useEffect(() => {
    console.log(seenPlateIds)
    localStorage.setItem(
      SEEN_PLATES,
      JSON.stringify(seenPlateIds.values().toArray())
    )
  }, [seenPlateIds])

  useEffect(() => {
    console.log(likedPlateIds)
    localStorage.setItem(
      LIKED_PLATES,
      JSON.stringify(likedPlateIds.values().toArray())
    )
  }, [likedPlateIds])

  async function onCardClick(card: IPlateCard) {
    handleClickAudio(true)
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

  function onCardLike(clickedPlate: IPlateCard) {
    setLikedPlateIds((ids) => {
      console.log('liked', ids)
      if (ids.has(clickedPlate.id)) {
        ids.delete(clickedPlate.id)
        return new Set(ids)
      }
      handleClickAudio(false)
      window.gtag &&
        window.gtag('event', 'select_content', {
          content_type: 'plate_like',
          content_id: clickedPlate.id
        })
      //console.log('liked', ids)
      return new Set(ids.add(clickedPlate.id))
    })
    // setSeenPlateIds((prev) => {
    //   const cachedPlate = prev.find((p) => p.id === clickedPlate.id)
    //   const isCurrentlyLiked = cachedPlate ? cachedPlate.isLiked : false

    //   if (!isCurrentlyLiked) {
    //     handleClickAudio(false)
    //   }

    //   if (cachedPlate) {
    //     return prev.map((p) =>
    //       p.id === clickedPlate.id ? { ...p, isLiked: !p.isLiked } : p
    //     )
    //   } else {
    //     window.gtag &&
    //       window.gtag('event', 'select_content', {
    //         content_type: 'plate_like',
    //         content_id: clickedPlate.id
    //       })
    //     return [...prev, { ...clickedPlate, isLiked: true }]
    //   }
    // })
  }

  function handleClickAudio(isVote: boolean) {
    const thisRef = isVote ? audioRef : likeButtonAudioRef
    if (!props.isMuted && thisRef.current) {
      if (!thisRef.current.paused) {
        thisRef.current.pause()
        thisRef.current.currentTime = 0
      }
      thisRef.current
        .play()
        .catch((err) => console.error('Error playing sound:', err))
    }
  }
  //const hasItem = likedPlateIds.has.bind(likedPlateIds)
  const sideBySideClass = ' pb-11 *:w-full *:max-w-[95%] *:max-h-full'
  const stackClass = ' grow flex-col items-center *:max-h-[50%] *:h-full'
  const carouselItemClass =
    props.isSideBySideView && window.innerWidth < MOBILE_WIDTH_CUTOFF
      ? sideBySideClass
      : stackClass
  return (
    <div
      className={
        'flex size-full min-h-0 grow flex-col justify-center lg:max-w-5xl'
      }
    >
      {!isLoading ? (
        <>
          {indexPairs.length > index + 1 ? (
            <>
              <div
                className={
                  'carousel min-h-0 w-full items-center sm:flex-row sm:justify-center' +
                  carouselItemClass
                }
              >
                {[0, 1].map((key) => {
                  return (
                    <div
                      key={key}
                      className={
                        'carousel-item relative aspect-[3/4] h-auto  justify-center p-2 sm:size-full sm:max-h-none sm:max-w-[45%]'
                      }
                    >
                      <PlateCard
                        card={plates[indexPairs[index][key]]}
                        onPlateCardClick={onCardClick}
                        isLiked={likedPlateIds.has(
                          plates[indexPairs[index][key]].id
                        )}
                        // {
                        //   likedPlateIds.has(plates[indexPairs[index][key]].id)
                        //   // seenPlateIds.find(
                        //   //   (plate) =>
                        //   //     plate.id === plates[indexPairs[index][key]].id
                        //   // )?.isLiked ?? false
                        // }
                        onLikeButtonClick={onCardLike}
                        id={'item' + (key + 1)}
                        centerText
                        isZoomed
                      />
                    </div>
                  )
                })}
              </div>

              {indexPairs.length > index + 2 && (
                // Thank you browser caching
                <div className="hidden">
                  <PlateCard
                    card={plates[indexPairs[index + 1][0]]}
                    onPlateCardClick={onCardClick}
                    isLiked={
                      true
                      // seenPlateIds.find(
                      //   (plate) =>
                      //     plate.id === plates[indexPairs[index + 1][0]].id
                      // )?.isLiked ?? false
                    }
                    onLikeButtonClick={onCardLike}
                  />
                  <PlateCard
                    card={plates[indexPairs[index + 1][1]]}
                    onPlateCardClick={onCardClick}
                    isLiked={
                      true
                      // seenPlateIds.find(
                      //   (plate) =>
                      //     plate.id === plates[indexPairs[index + 1][1]].id
                      // )?.isLiked ?? false
                    }
                    onLikeButtonClick={onCardLike}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="mx-5 mt-10 flex items-center justify-center text-center font-barlow text-2xl font-semibold text-white">
              <h2>
                You&apos;ve voted on all {plates.length} plates, but your plate
                journey doesn&apos;t end here!
                <br />
                Refresh the page to vote on all new plate pairings!
              </h2>
            </div>
          )}
        </>
      ) : (
        <Spinner />
      )}
    </div>
  )
}

export default PlateOff
