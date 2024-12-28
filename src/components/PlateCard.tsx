import { Card, CardHeader, CardBody, Image } from '@nextui-org/react'
import { IPlateCard } from './PlateOff'

interface PlateCardProps {
  card: IPlateCard
  onPlateCardVote: (plate: IPlateCard) => void
}

const PlateCard = (props: PlateCardProps) => {
  const { card, onPlateCardVote } = props
  console.log(card)
  return (
    <Card
      className="relative h-full w-2/5  py-1"
      isHoverable
      isPressable
      onPress={() => onPlateCardVote(card)}
    >
      <CardHeader className="flex-col items-center px-4 pb-1 pt-2">
        <p className="text-large font-bold uppercase">{card.title}</p>
        <small className="text-default-500">{card.uploader}</small>
      </CardHeader>
      <CardBody className="size-full overflow-hidden py-2">
        <Image
          alt="Card background"
          className="max-h-full rounded-xl object-contain"
          src={card.url}
          removeWrapper
          //width={400}
        />
      </CardBody>
    </Card>
  )
}

export default PlateCard
