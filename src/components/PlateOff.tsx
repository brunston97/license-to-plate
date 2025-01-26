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
  const [isLoading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // onMount Call
  useEffect(() => {
    getCards();

    audioRef.current = new Audio('pop.mp3');

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [])

  async function getCards() {
    try {
      const { data } = await axios.get('/plates');
      setPlates(data)
      const len = (data as IPlateCard[]).length
      let tempArray = []
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
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
      setLoading(false);
    }
  }

  async function onCardClick(card: IPlateCard) {
    handleCardClickAudio();

    try {
      axios.post(`/vote/${card.id}`)
      setIndex(i => i + 1)
    } catch (error) {
      console.log(error)
    }
  }

  function handleCardClickAudio() {
    if (!props.isMuted && audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play().catch((err) => console.error('Error playing sound:', err));
    }
  }

  function shuffle(array: Array<any>) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }

  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden py-2">
      {indexPairs.length > index + 1 && !isLoading ? (
        <>
          <PlateCard card={plates[indexPairs[index][0]]} onPlateCardVote={onCardClick} />
          <PlateCard card={plates[indexPairs[index][1]]} onPlateCardVote={onCardClick} />
        </>
      ) : (<Spinner/>)}
    </div>
  )
}

export default PlateOff
