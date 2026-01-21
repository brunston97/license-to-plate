import { Button, Card, CardBody, CardHeader, CardProps } from '@heroui/react'
import { IoHeart } from 'react-icons/io5'
import { IPlateCard } from 'assets/types'
import { BUCKET_URL, MOBILE_WIDTH_CUTOFF } from 'const/constants'
import ImageContainer from './ImageContainer'
import { useState } from 'react'

export interface PlateCardProps extends CardProps {
  card: IPlateCard
  onPlateCardClick?: (plate: IPlateCard) => void
  isLiked: boolean
  showLikeButton?: boolean
  centerText?: boolean
  isZoomed?: boolean
  onCardLike?: (card: IPlateCard) => void
}

const PlateCard = (props: PlateCardProps) => {
  const {
    card,
    onPlateCardClick,
    showLikeButton,
    centerText,
    isZoomed,
    onCardLike
  } = props
  const [isLiked, setIsLiked] = useState(props.isLiked)

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
