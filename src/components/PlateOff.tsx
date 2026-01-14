/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react'
import axios from '../utils/axiosInstance'
import PlateCard from './PlateCard'
import Spinner from './Spinner'
import { IPlateCard } from 'assets/types'
//import allPlateData from '../const/Plate_Zone_Plates.json'

interface PlateOffProps {
  isMuted: boolean
  windowWidth: number
  isManualSideBySideView: boolean
}

const PlateOff = (props: PlateOffProps) => {
  const [indexPairs, setIndexPairs] = useState<number[][]>([[]])
  const [index, setIndex] = useState(0)
  const [plates, setPlates] = useState<IPlateCard[]>([])
  const [isLoading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [cachedPlateInfo, setCachedPlateInfo] = useState<IPlateCard[]>(() => {
    const stored = localStorage.getItem('userPlates')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    getCards()

    audioRef.current = new Audio('pop.mp3')

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('userPlates', JSON.stringify(cachedPlateInfo))
  }, [cachedPlateInfo])

  async function getCards() {
    try {
      const { data } = await axios.get('/plates')
      setPlates(data as IPlateCard[])
      //const len = data.length //(data as IPlateCard[]).length
      const tempArray = formPlatePairsArray(data.length)
      setIndexPairs(tempArray)
      //console.log(data)
      //console.log(tempArray)
      //setLoading(false)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  async function onCardClick(card: IPlateCard) {
    handleCardClickAudio()

    const plateIndexes = indexPairs[index]
    const platesToAdd = plateIndexes
      .map((idx) => plates[idx])
      .filter(
        (plate) => !cachedPlateInfo.some((cached) => cached.id === plate.id)
      )

    if (platesToAdd.length > 0) {
      setCachedPlateInfo((prev) => [...prev, ...platesToAdd])
    }

    try {
      axios.post(`/vote/${card.id}`)
      setIndex((i) => i + 1)
    } catch (error) {
      console.log(error)
    }
  }

  function onCardLike(clickedPlate: IPlateCard) {
    setCachedPlateInfo((prev) => {
      const cachedPlate = prev.find((p) => p.id === clickedPlate.id)
      if (cachedPlate) {
        return prev.map((p) =>
          p.id === clickedPlate.id ? { ...p, isLiked: !p.isLiked } : p
        )
      } else {
        return [...prev, { ...clickedPlate, isLiked: true }]
      }
    })
  }

  function handleCardClickAudio() {
    if (!props.isMuted && audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      audioRef.current
        .play()
        .catch((err) => console.error('Error playing sound:', err))
    }
  }

  function formPlatePairsArray(len: number): number[][] {
    const plateIds = Array.from({ length: len }, (_, i) => i)
    shuffle(plateIds)

    const pairedPlates: number[][] = []
    for (let i = 0; i < plateIds.length; i += 2) {
      pairedPlates.push([plateIds[i], plateIds[i + 1]])
    }

    return pairedPlates
  }

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

  return (
    <div className="flex size-full min-h-0 grow flex-col justify-center py-5 sm:pt-6 xl:max-w-2xl">
      {!isLoading ? (
        <>
          {indexPairs.length > index + 1 ? (
            <>
              <div className="carousel flex size-full min-h-0 grow sm:justify-center">
                {[0, 1].map((key) => {
                  return (
                    <div
                      key={key}
                      className="carousel-item relative size-full max-w-[95%] justify-center p-2 sm:max-w-[45%]"
                    >
                      <PlateCard
                        card={plates[indexPairs[index][key]]}
                        onPlateCardVote={onCardClick}
                        isLiked={
                          cachedPlateInfo.find(
                            (plate) =>
                              plate.id === plates[indexPairs[index][key]].id
                          )?.isLiked ?? false
                        }
                        onLikeButtonClick={onCardLike}
                        windowWidth={props.windowWidth}
                        id={'item' + (key + 1)}
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
                    onPlateCardVote={onCardClick}
                    isLiked={
                      cachedPlateInfo.find(
                        (plate) =>
                          plate.id === plates[indexPairs[index + 1][0]].id
                      )?.isLiked ?? false
                    }
                    onLikeButtonClick={onCardLike}
                    windowWidth={props.windowWidth}
                  />
                  <PlateCard
                    card={plates[indexPairs[index + 1][1]]}
                    onPlateCardVote={onCardClick}
                    isLiked={
                      cachedPlateInfo.find(
                        (plate) =>
                          plate.id === plates[indexPairs[index + 1][1]].id
                      )?.isLiked ?? false
                    }
                    onLikeButtonClick={onCardLike}
                    windowWidth={props.windowWidth}
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
