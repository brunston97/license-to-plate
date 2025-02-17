/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react'
import axios from '../utils/axiosInstance'
import PlateCard from './PlateCard'
import Spinner from './Spinner'
import { IPlateCard } from 'assets/types'
import allPlateData from '../const/Plate_Zone_Plates.json'
import { MOBILE_WIDTH_CUTOFF } from 'const/constants'

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

  // onMount Call
  useEffect(() => {
    getCards()

    audioRef.current = new Audio('pop.mp3')

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  async function getCards() {
    try {
      const data: IPlateCard[] = allPlateData;
      setPlates(data)
      const len = (data as IPlateCard[]).length
      const tempArray = formPlatePairsArray(len)
      setIndexPairs(tempArray)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  async function onCardClick(card: IPlateCard) {
    handleCardClickAudio()

    try {
      axios.post(`/vote/${card.id}`)
      setIndex((i) => i + 1)
    } catch (error) {
      console.log(error)
    }
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
    const plateIds = Array.from({ length: len }, (_, i) => i);
    shuffle(plateIds);

    const pairedPlates: number[][]= [];
    for (let i = 0; i < plateIds.length; i += 2) {
      pairedPlates.push([plateIds[i], plateIds[i+1]]);
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
    <div className="flex h-full min-h-0 shrink flex-col sm:grow md:mt-6">
      { !isLoading ? (
        <>
          {indexPairs.length > index + 1 ? (
            <>
              <div
                className={
                  props.windowWidth > MOBILE_WIDTH_CUTOFF || props.isManualSideBySideView
                    ? 'relative flex h-full min-h-0 justify-center py-4 *:shrink'
                    : 'carousel mt-8 max-h-full w-full space-x-4 bg-transparent py-2 *:w-full *:grow'
                }
              >
                  <PlateCard
                    card={plates[indexPairs[index][0]]}
                    onPlateCardVote={onCardClick}
                    windowWidth= {props.windowWidth}
                  />
                  <PlateCard
                    card={plates[indexPairs[index][1]]}
                    onPlateCardVote={onCardClick}
                    windowWidth= {props.windowWidth}
                  />
              </div>
              <div
                className="flex w-full justify-center gap-2 py-2"
                style={{
                  visibility: props.windowWidth > MOBILE_WIDTH_CUTOFF || props.isManualSideBySideView ? 'hidden' : 'visible',
                  display: props.windowWidth > MOBILE_WIDTH_CUTOFF || props.isManualSideBySideView ? 'none' : 'flex'
                }}
              >
                <a href="#item1" className="btn btn-xs">
                  &larr;
                </a>
                <a href="#item2" className="btn btn-xs">
                  &rarr;
                </a>
              </div>

              {indexPairs.length > index + 2 && (
                // Thank you browser caching
                <div className="hidden">
                  <PlateCard
                    card={plates[indexPairs[index + 1][0]]}
                    onPlateCardVote={onCardClick}
                    windowWidth= {props.windowWidth}
                  />
                  <PlateCard
                    card={plates[indexPairs[index + 1][1]]}
                    onPlateCardVote={onCardClick}
                    windowWidth= {props.windowWidth}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="mx-5 mt-10 flex items-center justify-center text-center font-barlow text-2xl font-semibold text-white">
              <h2>
                You&apos;ve voted on all {plates.length} plates, but your plate journey doesn&apos;t end here!
                <br/>
                Refresh the page to vote on all new plate pairings!
              </h2>
            </div>
          )}
        </>
      ) : (
        <Spinner/>
      )}
    </div>
  )
}

export default PlateOff
