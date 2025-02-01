import { Card, CardBody, CardHeader, CardProps, Image } from '@nextui-org/react'
import { IPlateCard } from 'assets/types'

interface PlateCardProps extends CardProps {
  card: IPlateCard
  onPlateCardVote: (plate: IPlateCard) => void
}

const BUCKET_URL = import.meta.env.VITE_BUCKET_URL

const PlateCard = (props: PlateCardProps) => {
  const { card, onPlateCardVote } = props
  console.log(card)
  return (
    <Card
      className="relative mx-3 h-fit max-h-full shrink grow-0 py-0 md:mx-6 2xl:mx-10"
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
      <CardBody className="h-fit shrink grow-0 overflow-hidden">
        <div
          id={`imgContainer-${card.id}`}
          className="flex aspect-[3/4] h-fit max-h-full max-w-[650px] shrink items-center justify-center"
        >
          <Image
            alt="Card background"
            className="z-0 size-full rounded-xl object-contain"
            src={`${BUCKET_URL}/plate${card.id}.jpg`}
            classNames={{
              wrapper: 'flex h-fit justify-center items-center'
            }}
          />
        </div>
      </CardBody>
    </Card>
  )
}

export default PlateCard
