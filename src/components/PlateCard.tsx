import { Card, CardBody, CardHeader, CardProps, Image } from '@nextui-org/react'
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
    <div className="aspect-[3/4] h-full max-h-full max-w-[50%] p-5">
      <Card
        // className={`relative mx-3 h-auto max-h-full w-fit cursor-default py-0 md:mx-6 2xl:mx-10${
        //   imageLoaded ? 'opacity-100' : 'opacity-0'
        // }`}
        className="!size-full"
        isHoverable
        isPressable
        classNames={
          {
            //body: 'max-h-full max-w-full'
          }
        }
        {...props}
      >
        <CardHeader className="mb-0 flex-col items-center pb-0">
          <div
            id="nameContainer"
            className="relative mb-2 leading-none text-black"
          >
            <h3 className="text-large font-bold uppercase leading-none">
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
        <CardBody
          //className="flex h-full cursor-pointer justify-center"
          className="h-full max-h-full min-h-0 grow"
          onClick={() => onPlateCardVote(card)}
        >
          <div
            id={`imgContainer-${card.id}`}
            //className={` flex aspect-[4/3] max-h-full max-w-md justify-center md:max-w-xl 2xl:max-w-2xl`}
            className="flex h-full max-h-full w-fit justify-center"
          >
            <Image
              alt="Card background"
              //className="h-full"
              //className="z-0 max-h-full max-w-full rounded-xl object-contain"
              src={`${BUCKET_URL}/${card.fileName}?hi=1`}
              onLoad={() => {}}
              classNames={{
                wrapper: 'size-full max-h-full aspect-[3/]',
                zoomedWrapper: 'max-h-full size-full',
                img: 'object-cover max-h-full size-full'
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
