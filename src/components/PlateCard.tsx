import { Card, CardBody, CardHeader, CardProps, Image } from '@nextui-org/react'
import { IoHeart } from 'react-icons/io5'
import { IPlateCard } from 'assets/types'
import { MOBILE_WIDTH_CUTOFF } from 'const/constants'
import { useState } from 'react'

interface PlateCardProps extends CardProps {
  card: IPlateCard
  onPlateCardVote: (plate: IPlateCard) => void
  isLiked: boolean
  onLikeButtonClick: (plate: IPlateCard) => void
  windowWidth: number
}

const BUCKET_URL = import.meta.env.VITE_BUCKET_URL

const PlateCard = (props: PlateCardProps) => {
  const { card, onPlateCardVote, isLiked, onLikeButtonClick, windowWidth } =
    props
  const [imageLoaded, setImageLoaded] = useState(false)

  // fixes an issue where safari would render the first set of cards really small
  function handleImageLoaded() {
    setImageLoaded(true)
  }

  return (
    <div className="carousel-item flex max-h-full min-h-0 max-w-full justify-center">
      <Card
        className={`relative mx-3 h-full max-h-full cursor-default py-0 md:mx-6 2xl:mx-10 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        isHoverable
        isPressable
        classNames={{
          body: 'max-h-full max-w-full'
        }}
        {...props}
      >
        <CardHeader className="mb-0 flex-col items-center pb-0">
          <div
            id="nameContainer"
            className="relative mb-2 leading-none text-black"
          >
            <h3 className="text-large font-bold uppercase leading-none">
              {card.title}
            </h3>
          </div>
          <div
            id="likeButtonContainer"
            className={`${
              windowWidth <= MOBILE_WIDTH_CUTOFF
                ? 'absolute right-1 top-2'
                : 'absolute right-4 top-1'
            }`}
          >
            <IoHeart
              className="mr-1 mt-1 cursor-pointer"
              size={windowWidth <= MOBILE_WIDTH_CUTOFF ? 18 : 36}
              color={isLiked ? 'red' : 'gray'}
              onClick={() => onLikeButtonClick(card)}
            ></IoHeart>
          </div>
        </CardHeader>
        <CardBody
          className="flex aspect-[3/4] h-fit cursor-pointer justify-center"
          onClick={() => onPlateCardVote(card)}
        >
          <div
            id={`imgContainer-${card.id}`}
            className={`flex max-h-full ${
              props.windowWidth <= MOBILE_WIDTH_CUTOFF
                ? 'max-w-[400px]'
                : 'max-w-[600px] 2xl:max-w-[700px]'
            } justify-center`}
          >
            <Image
              alt="Card background"
              className="z-0 max-h-full max-w-full rounded-xl object-contain"
              src={`${BUCKET_URL}/plate${card.id}.jpg`}
              onLoad={handleImageLoaded}
              classNames={{
                wrapper: 'flex h-full justify-center items-center',
                zoomedWrapper: 'h-full'
              }}
              isZoomed
            />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default PlateCard
