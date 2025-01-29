/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react'
import axios from '../utils/axiosInstance'
import PlateCard from './PlateCard'
import Spinner from './Spinner'
import { IPlateCard } from 'assets/types'

interface PlateOffProps {
  isMuted: boolean
}

const PlateOff = (props: PlateOffProps) => {
  const [indexPairs, setIndexPairs] = useState<number[][]>([[]])
  const [index, setIndex] = useState(0)
  const [plates, setPlates] = useState<IPlateCard[]>([])
  const [isLoading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

  // onMount Call
  useEffect(() => {
    getCards()

    audioRef.current = new Audio('pop.mp3')
    function onResizeListener() {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', onResizeListener)

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
      window.removeEventListener('resize', onResizeListener)
    }
  }, [])

  async function getCards() {
    try {
      const { data } = await axios.get('/plates')
      setPlates(data)
      const len = (data as IPlateCard[]).length
      const tempArray = []
      for (let i = 0; i < len; i++) {
        for (let j = i; j < len; j++) {
          if (i != j) {
            tempArray.push([i, j])
          }
        }
      }
      shuffle(tempArray)
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

  function shuffle(array: Array<unknown>) {
    let currentIndex = array.length

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      const randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--

      // And swap it with the current element.
      ;[array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex]
      ]
    }
  }

  return (
    <div className="min-h-0 shrink sm:grow">
      {indexPairs.length > index + 1 && !isLoading ? (
        <>
          <div
            className={
              windowWidth > 768
                ? 'relative flex h-full max-h-full items-center justify-center py-4 *:sm:w-2/5'
                : 'carousel size-full space-x-4 bg-transparent py-2 *:max-h-full *:w-full *:max-w-full *:justify-center'
            }
          >
            <div id="item1" className="carousel-item flex max-h-full max-w-full items-center justify-center">
              <PlateCard
                card={plates[indexPairs[index][0]]}
                onPlateCardVote={onCardClick}
              />
            </div>
            <div id="item2" className="carousel-item max-h-full max-w-full items-center justify-center">
              <PlateCard
                card={plates[indexPairs[index][1]]}
                onPlateCardVote={onCardClick}
              />
            </div>
          </div>
          {windowWidth <= 768 && (
            <div className="flex w-full justify-center gap-2 py-2">
            <a href="#item1" className="btn btn-xs">&larr;</a>
            <a href="#item2" className="btn btn-xs">&rarr;</a>
          </div>
          )}
          {indexPairs.length > index + 2 && (
            // Thank you browser caching
            <div className="hidden">
              <PlateCard
                card={plates[indexPairs[index + 1][0]]}
                onPlateCardVote={onCardClick}
              />
              <PlateCard
                card={plates[indexPairs[index + 1][1]]}
                onPlateCardVote={onCardClick}
              />
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
