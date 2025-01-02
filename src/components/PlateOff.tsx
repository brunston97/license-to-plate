import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PlateCard from './PlateCard'
import { IPlateCard } from 'assets/types'

const images = [
  'plate1.jpg',
  'plate2.jpg',
  'plate3.jpg',
  'plate4.jpg',
  'plate5.jpg',
  'plate6.jpg',
  'plate7.jpg',
  'plate8.jpg',
  'plate9.jpg',
  'plate10.jpg'
]
//const PLATE_DB = 'testDb'

// interface ITestDb {
//   cards: IPlateCard[]
//   voteMap: {
//     [id: number]: number // id x voteCount
//   }
//   user?: string
//   userVotesById_DEFINITELY_NOT_FOR_DATA_TRACKING?: IPlateCard['id'][]
// }

const PlateOff = () => {
  //const [card1Image, setCard1Image] = useState(`src/assets/${images[0]}`);
  //const [card2Image, setCard2Image] = useState(`src/assets/${images[1]}`);
  const [card1, setCard1] = useState<IPlateCard>()
  const [card2, setCard2] = useState<IPlateCard>()
  const [usedIndexes, setUsedIndexes] = useState(new Set().add(0).add(1))
  //const [lastIndexPair, setLastIndexPair] = useState<number[]>([0, 1])
  //const [testDb, setTestDb] = useState<ITestDb>(getDb())
  const [plates, setPlates] = useState<IPlateCard[]>([])

  // onMount Call
  useEffect(() => {
    getCards()
  }, [])

  async function getCards() {
    try {
      const { data } = await axios.get('/plates')
      setPlates(data)
      handleCardClick()
    } catch (error) {
      console.log(error)
    }
  }

  async function onCardClick(card: IPlateCard) {
    try {
      axios.post(`/api/vote/${card.id}`)
    } catch (error) {
      console.log(error)
    }
    handleCardClick()
  }

  const handleCardClick = () => {
    const [index1, index2] = getRandomImages()
    setCard1(plates[index1])
    setCard2(plates[index2])
  }

  const getRandomImages = (): number[] => {
    let randomIndex1, randomIndex2
    if (images.length - usedIndexes.size < 2) {
      randomIndex1 = 0
      randomIndex2 = 1
      setUsedIndexes(new Set().add(randomIndex1).add(randomIndex2))
    } else {
      ;[randomIndex1, randomIndex2] = getRandomUnusedIndexes()
      setUsedIndexes(new Set([...usedIndexes, randomIndex1, randomIndex2]))
    }

    //setLastIndexPair([randomIndex1, randomIndex2])
    return [randomIndex1, randomIndex2] //[`src/assets/${images[randomIndex1]}`, `src/assets/${images[randomIndex2]}`];
  }

  const getRandomUnusedIndexes = () => {
    let index1, index2

    do {
      index1 = Math.floor(Math.random() * images.length)
    } while (usedIndexes.has(index1))

    do {
      index2 = Math.floor(Math.random() * images.length)
    } while (usedIndexes.has(index2) || index1 === index2)

    return [index1, index2]
  }

  return (
    <div className="relative flex w-full items-center justify-evenly overflow-hidden py-2">
      {card1 && <PlateCard card={card1} onPlateCardVote={onCardClick} />}
      {card2 && <PlateCard card={card2} onPlateCardVote={onCardClick} />}
    </div>
  )
}

export default PlateOff
