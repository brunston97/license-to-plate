import { Button, Card, CardBody, CardHeader, CardProps } from '@heroui/react'
import { IoHeart } from 'react-icons/io5'
import { IPlateCard } from 'assets/types'
import { BUCKET_URL, MOBILE_WIDTH_CUTOFF } from 'const/constants'
import ImageContainer from './ImageContainer'
import { usePlateState } from 'hooks/usePlateState'
import { useState } from 'react'

interface PlateCardProps extends CardProps {
  card: IPlateCard
  onPlateCardClick?: (plate: IPlateCard) => void
  //isLiked: boolean
  showLikeButton?: boolean
  centerText?: boolean
  isZoomed?: boolean
  onCardLike?: (card: IPlateCard) => void
}

const PlateCard = (props: PlateCardProps) => {
  const {
    card,
    onPlateCardClick,
    //isLiked,
    showLikeButton,
    centerText,
    isZoomed,
    onCardLike
  } = props
  const { likedPlateIds } = usePlateState()
  const [isLiked, setIsLiked] = useState(likedPlateIds.has(card.id))

  // fixes an issue where safari would render the first set of cards really small
  // function handleImageLoaded() {
  //   setImageLoaded(true)
  // }

  // function onCardLike(clickedPlate: IPlateCard) {
  //   setLikedPlateIds((ids) => {
  //     console.log('liked', ids)
  //     if (ids.has(clickedPlate.id)) {
  //       ids.delete(clickedPlate.id)
  //       return new Set(ids)
  //     }
  //     handleClickAudio(false)
  //     window.gtag &&
  //       window.gtag('event', 'select_content', {
  //         content_type: 'plate_like',
  //         content_id: clickedPlate.id
  //       })
  //     //console.log('liked', ids)
  //     return new Set(ids.add(clickedPlate.id))
  //   })
  // }

  console.log('card render')

  return (
    <div className="relative flex h-auto max-h-full min-h-0 w-full max-w-full flex-col items-center justify-center light">
      <Card
        className="aspect-[3/4] h-auto max-h-full w-full max-w-full"
        isHoverable
        {...props}
        isPressable={onPlateCardClick != undefined}
        onPress={() => onPlateCardClick && onPlateCardClick(card)}
      >
        <CardHeader className="mb-0 items-center justify-between pb-0">
          {(window.innerWidth > MOBILE_WIDTH_CUTOFF || centerText) && (
            <div className="aspect-square h-full"></div>
          )}
          <div id="nameContainer" className="leading-none text-black">
            <h3 className="text-center font-bold uppercase leading-none text-large">
              {card.correctedText}
            </h3>
          </div>
          <div className="aspect-square h-full">
            {showLikeButton && (
              <Button
                className="z-20 aspect-square h-full"
                isIconOnly
                variant="light"
                onPress={() => {
                  if (onCardLike) {
                    onCardLike(card)
                    setIsLiked((i) => !i)
                  }
                }}
                as={'div'}
              >
                <IoHeart
                  className="size-full"
                  color={isLiked ? 'red' : 'gray'}
                ></IoHeart>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="h-auto max-h-full min-h-0 w-full cursor-pointer items-stretch overflow-hidden">
          <ImageContainer
            src={`${BUCKET_URL}/${card.fileName}`}
            alt={card.correctedText}
            isZoomed={window.innerWidth > MOBILE_WIDTH_CUTOFF && isZoomed}
          ></ImageContainer>
        </CardBody>
      </Card>
    </div>
  )
}

export default PlateCard
