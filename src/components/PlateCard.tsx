import { Card, CardBody, CardHeader, CardProps, Image } from '@nextui-org/react'
import { IPlateCard } from 'assets/types'
import { MOBILE_WIDTH_CUTOFF } from 'const/constants'
import { useState } from 'react'

interface PlateCardProps extends CardProps {
  card: IPlateCard
  onPlateCardVote: (plate: IPlateCard) => void
  windowWidth: number
}

const BUCKET_URL = import.meta.env.VITE_BUCKET_URL

const PlateCard = (props: PlateCardProps) => {
  const { card, onPlateCardVote } = props
  const [imageLoaded, setImageLoaded] = useState(false)

  // fixes an issue where safari would render the first set of cards really small
  function handleImageLoaded() {
    setImageLoaded(true)
  }

  console.log(card)
  return (
    <div className="carousel-item flex size-full max-h-full max-w-full items-center justify-center lg:w-2/5">
      <Card
        className={`relative mx-3 h-full max-h-full shrink grow-0 py-0 md:mx-6 2xl:mx-10 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        isHoverable
        isPressable
        onPress={() => onPlateCardVote(card)}
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
        </CardHeader>
        <CardBody className="flex aspect-[3/4] h-fit shrink grow-0 justify-center">
          <div
            id={`imgContainer-${card.id}`}
            className={`flex max-h-full ${
              props.windowWidth <= MOBILE_WIDTH_CUTOFF
                ? 'max-w-[400px]'
                : 'max-w-[600px] 2xl:max-w-[700px]'
            } shrink justify-center`}
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
