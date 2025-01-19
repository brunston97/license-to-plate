import { Card, CardBody, CardHeader, Image } from '@nextui-org/react'
import { IPlateCard } from 'assets/types'

interface PlateCardProps {
  card: IPlateCard
  onPlateCardVote: (plate: IPlateCard) => void
}

const BUCKET_URL = import.meta.env.VITE_BUCKET_URL

const PlateCard = (props: PlateCardProps) => {
  const { card, onPlateCardVote } = props
  console.log(card)
  return (
    <Card
      className="relative h-full w-2/5 max-w-3xl py-0 mx-3 sm:mx-6 2xl:mx-10"
      isHoverable
      isPressable
      onPress={() => onPlateCardVote(card)}
    >
      <CardHeader className="pb-0 mb-0 flex-col items-center">
        <div id="nameContainer" className="relative leading-none mb-2 text-black">
            <h3 className="text-large font-bold uppercase leading-none">
              {card.title}
            </h3>
        </div>
      </CardHeader>
      <CardBody className="relative mx-auto flex size-full w-fit justify-items-center overflow-hidden">
        <div id="imgContainer" className="relative size-full aspect-[3/4]">
          <Image
            alt="Card background"
            className="z-0 h-full rounded-xl"
            src={`${BUCKET_URL}/plate${card.id}.jpg`}
            classNames={{
              wrapper: 'h-full'
            }}
          />
        </div>
      </CardBody>
    </Card>
  )
}

export default PlateCard
