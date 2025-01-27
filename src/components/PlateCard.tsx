import { Card, CardBody, CardFooter, CardHeader, Image } from '@nextui-org/react'
import { IPlateCard } from 'assets/types'
import { useState } from 'react'

interface PlateCardProps {
  card: IPlateCard
  onPlateCardVote: (plate: IPlateCard) => void
}

const BUCKET_URL = import.meta.env.VITE_BUCKET_URL

const PlateCard = (props: PlateCardProps) => {
  const { card, onPlateCardVote } = props;
  const [isFullscreen, setIsFullscreen] = useState(false);

  function handleImageClick() {
    setIsFullscreen(true);
  }

  function handleCloseImageClick() {
    setIsFullscreen(false);
  }

  function handleOverlayClick() {
    setIsFullscreen(false);
  }
  
  console.log(card)

  return (
    <>
      <Card
        className="relative h-full w-2/5 max-w-3xl py-0 mx-3 sm:mx-6 2xl:mx-10 aspect-[3/4]"
        isHoverable
        isPressable
      >
        <CardHeader className="pb-0 mb-0 flex-col items-center">
          <div id="nameContainer" className="relative leading-none mb-2 text-black">
              <h3 className="text-large font-bold uppercase leading-none">
                {card.title}
              </h3>
          </div>
        </CardHeader>
        <CardBody className="pb-0 mb-0 relative mx-auto flex size-full w-fit justify-items-center overflow-hidden">
          <div id="imgContainer" className="relative size-full aspect-[3/4] flex justify-center items-center">
            <Image
              alt="Card background"
              className="z-0 h-full rounded-xl object-contain"
              src={`${BUCKET_URL}/plate${card.id}.jpg`}
              classNames={{
                wrapper: 'h-full flex justify-center items-center'
              }}
              onClick={handleImageClick}
            />
          </div>
        </CardBody>
        <CardFooter className="relative mx-auto flex size-full w-full justify-items-center">
          <div id="voteContainer" className="relative size-full flex justify-center items-center w-full">
              <button
              className="bg-green-400 text-white font-bold py-2 px-4 rounded-lg object-contain w-full"
              onClick={() => onPlateCardVote(card)}
              >
              VOTE
              </button>
          </div>
        </CardFooter>
      </Card>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={handleOverlayClick}>
          <div className="relative aspect-[3/4] max-h-[80vh] h-full" onClick={(e) => e.stopPropagation()}>
            <img
              alt="Fullscreen Card background"
              className="h-full w-auto object-contain"
              src={`${BUCKET_URL}/plate${card.id}.jpg`}
              style={{ objectFit: 'contain', objectPosition: 'center' }}
            />
          </div>
          <button
              className="absolute top-0 right-0 m-4 text-white text-5xl font-bold bg-transparent cursor-pointer z-10"
              onClick={handleCloseImageClick}
            >
              &times;
            </button>
        </div>
      )}
    </>
  )
}

export default PlateCard
