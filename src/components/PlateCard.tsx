import { Card, CardBody, CardHeader, CardProps } from '@heroui/react'
import { IoHeart } from 'react-icons/io5'
import { IPlateCard } from 'assets/types'
import { BUCKET_URL, MOBILE_WIDTH_CUTOFF } from 'const/constants'
import ImageContainer from './ImageContainer'

interface PlateCardProps extends CardProps {
  card: IPlateCard
  onPlateCardClick: (plate: IPlateCard) => void
  isLiked: boolean
  onLikeButtonClick: (plate: IPlateCard) => void
  centerText?: boolean
}

const PlateCard = (props: PlateCardProps) => {
  const { card, onPlateCardClick, isLiked, onLikeButtonClick } = props
  //const [imageLoaded, setImageLoaded] = useState(false)

  // fixes an issue where safari would render the first set of cards really small
  // function handleImageLoaded() {
  //   setImageLoaded(true)
  // }

  return (
    <div className="relative aspect-[3/4]  size-auto max-h-full min-h-0 max-w-full flex-col items-center justify-center light">
      <Card
        className="size-full max-h-full max-w-full"
        isHoverable
        {...props}
        isPressable
        onPress={() => onPlateCardClick(card)}
      >
        <CardHeader className="mb-0 flex justify-between pb-0">
          {(window.innerWidth > MOBILE_WIDTH_CUTOFF || props.centerText) && (
            <div className="aspect-square h-full"></div>
          )}
          <div id="nameContainer" className="leading-none text-black">
            <h3 className="text-center font-bold uppercase leading-none text-large">
              {card.correctedText}
            </h3>
          </div>
          <div
            className="aspect-square h-full"
            onClick={(e) => {
              onLikeButtonClick(card)
              e.stopPropagation()
            }}
          >
            <IoHeart
              className="z-20 size-full"
              color={isLiked ? 'red' : 'gray'}
            ></IoHeart>
          </div>
        </CardHeader>
        <CardBody className="block h-full max-h-full min-h-0 cursor-pointer overflow-hidden">
          <ImageContainer
            src={`${BUCKET_URL}/${card.fileName}?hi=1`}
            alt={card.correctedText}
            isZoomed={window.innerWidth > MOBILE_WIDTH_CUTOFF}
          ></ImageContainer>
        </CardBody>
      </Card>
    </div>
  )
}

export default PlateCard
