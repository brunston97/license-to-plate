import {Card, CardHeader, CardBody, Image} from '@nextui-org/react'
import { IPlateCard } from './PlateOff';

interface PlateCardProps {
  card: IPlateCard;
  onPlateCardVote: (plate: IPlateCard) => void;
}

const PlateCard = ( props: PlateCardProps ) => {
  const {card, onPlateCardVote} = props
  console.log(card)
  return(
    <Card className="py-1 p-x-2 h-full w-2/5  relative" isHoverable isPressable onPress={() => onPlateCardVote(card)}>
      <CardHeader className="pb-1 pt-2 px-4 flex-col items-center">
        <p className="text-large uppercase font-bold">{card.title}</p>
        <small className="text-default-500">{card.uploader}</small>
      </CardHeader>
      <CardBody className="overflow-hidden py-2 w-full h-full">
        <Image
          alt="Card background"
          className="object-contain rounded-xl max-h-full"
          src={card.url}
          removeWrapper
          //width={400}
        />
      </CardBody>
    </Card>
  );
}

export default PlateCard;
