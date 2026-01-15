import { Card, CardBody, CardHeader, CardProps, Image } from '@heroui/react'
import { IoHeart } from 'react-icons/io5'
import { IPlateCard } from 'assets/types'
import { BUCKET_URL, MOBILE_WIDTH_CUTOFF } from 'const/constants'

interface PlateCardProps extends CardProps {
  card: IPlateCard
  onPlateCardVote: (plate: IPlateCard) => void
  isLiked: boolean
  onLikeButtonClick: (plate: IPlateCard) => void
  windowWidth: number
}

const PlateCard = (props: PlateCardProps) => {
  const { card, onPlateCardVote, isLiked, onLikeButtonClick, windowWidth } =
    props
  //const [imageLoaded, setImageLoaded] = useState(false)

  // fixes an issue where safari would render the first set of cards really small
  // function handleImageLoaded() {
  //   setImageLoaded(true)
  // }

  return (
    <div className="flex max-h-full w-full max-w-full flex-col items-center justify-center light">
      <Card
        className="aspect-[3/4] max-h-full w-full"
        isHoverable
        isPressable
        {...props}
      >
        <CardHeader className="mb-0 flex-col items-center pb-0">
          <div id="nameContainer" className="mb-2 leading-none text-black">
            <h3 className="font-bold uppercase leading-none text-large">
              {card.correctedText}
            </h3>
          </div>
          <div
            id="likeButtonContainer"
            className="absolute right-1 top-2 sm:top-1 md:right-2 xl:right-3"
          >
            <IoHeart
              className="mr-1 mt-1 cursor-pointer"
              size={windowWidth <= MOBILE_WIDTH_CUTOFF ? 22 : 36}
              color={isLiked ? 'red' : 'gray'}
              onClick={() => onLikeButtonClick(card)}
            ></IoHeart>
          </div>
        </CardHeader>
        <CardBody onClick={() => onPlateCardVote(card)}>
          <div id={`imgContainer-${card.id}`} className="h-full max-h-full">
            <Image
              alt="Card background"
              src={`${BUCKET_URL}/${card.fileName}?hi=1`}
              onLoad={() => {}}
              classNames={{
                wrapper: 'size-full max-h-full !max-w-full',
                zoomedWrapper: 'size-full',
                img: 'size-full object-cover'
              }}
              isZoomed={window.innerWidth > 768}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default PlateCard
