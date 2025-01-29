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
      className="relative mx-3 h-fit w-full max-w-3xl shrink py-0 sm:mx-6 2xl:mx-10"
      isHoverable
      isPressable
      onPress={() => onPlateCardVote(card)}
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
      <CardBody className="">
        <div
          id="imgContainer"
          className="flex aspect-[3/4] h-fit max-h-full w-full max-w-full justify-center"
        >
          <Image
            alt="Card background"
            className="z-0 max-h-full max-w-full rounded-xl object-contain"
            src={`${BUCKET_URL}/plate${card.id}.jpg`}
            classNames={{
              wrapper: 'size-full flex justify-center items-center'
            }}
          />
        </div>
      </CardBody>
    </Card>
  )
}

export default PlateCard
