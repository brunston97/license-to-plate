import { Card, CardBody, Image } from '@nextui-org/react'
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
      className="relative h-full w-2/5  py-0"
      isHoverable
      isPressable
      onPress={() => onPlateCardVote(card)}
    >
      <CardBody className="relative mx-auto flex size-full w-fit overflow-hidden">
        <div id="imgContainer" className="relative size-full">
          <Image
            alt="Card background"
            className="z-0 max-h-full rounded-xl object-contain"
            src={`${BUCKET_URL}/plate${card.id}.jpg`}
            classNames={{
              wrapper: 'h-full'
            }}
          />
          <div
            id="nameContainer"
            className="absolute left-2 top-2 leading-none text-white"
          >
            <h3 className="text-large font-bold uppercase leading-none">
              {card.title}
            </h3>
            <p className="text-sm leading-none">{card.uploader}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default PlateCard
