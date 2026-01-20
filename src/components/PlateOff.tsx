/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react'
import axios from '../utils/axiosInstance'
import PlateCard from './PlateCard'
import Spinner from './Spinner'
import { IPlateCard } from 'assets/types'
import { BUCKET_URL, MOBILE_WIDTH_CUTOFF } from 'const/constants'
import { usePlateState } from 'hooks/usePlateState'
import { formPlatePairsArray, preloadImage } from 'utils'
//import allPlateData from '../const/Plate_Zone_Plates.json'

interface PlateOffProps {
  isMuted: boolean
  isSideBySideView: boolean
}

const PlateOff = (props: PlateOffProps) => {
  const [indexPairs, setIndexPairs] = useState<number[][]>([[]])
  const [index, setIndex] = useState(0)

  const { plates, audioRef, likeButtonAudioRef, onCardSeen, onCardLike } =
    usePlateState()

  useEffect(() => {
    audioRef.current = new Audio('pop.mp3')
    likeButtonAudioRef.current = new Audio('chime.mp3')

    if (plates.length) {
      // match up the plates
      setIndexPairs(formPlatePairsArray(plates.length))
    }

    return () => {
      audioRef.current?.pause()
      audioRef.current = null
      likeButtonAudioRef.current?.pause()
      likeButtonAudioRef.current = null
    }
  }, [plates, audioRef, likeButtonAudioRef])

  // on initial plates, and every plateOff render, add to seen plates
  useEffect(() => {
    //preload images
    if (index + 1 < indexPairs.length) {
      indexPairs[index + 1].forEach((idx) => {
        const card = plates[idx]
        const src = `${BUCKET_URL}/${card.fileName}`
        preloadImage(src)
      })
    }

    if (index == 0) {
      return
    }

    //after vote index change
    indexPairs[index - 1].forEach((idx) => {
      console.log('index_add', plates[idx])
      onCardSeen(plates[idx])
    })
  }, [index, indexPairs, plates, onCardSeen])

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
      {plates.length > 1 ? (
        <>
          {indexPairs.length > index + 1 ? (
            <div
              className={
                'carousel min-h-0 w-full items-center sm:flex-row sm:justify-center' +
                carouselItemClass
              }
            >
              {[0, 1].map((key) => {
                console.log('render')

                //onCardSeen(plates[indexPairs[index][key]])
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
                      showLikeButton={true}
                      id={'item' + (key + 1)}
                      centerText
                      isZoomed
                      onCardLike={onCardLike}
                    />
                  </div>
                )
              })}
            </div>
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
