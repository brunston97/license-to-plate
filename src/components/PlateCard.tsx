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
    <Card className="py-1 ml-3 mr-2 max-h-full  relative" isHoverable isPressable onPress={() => onPlateCardVote(card)}>
      <CardHeader className="pb-1 pt-2 px-4 flex-col items-center">
        <p className="text-large uppercase font-bold">{card.title}</p>
        <small className="text-default-500">{card.uploader}</small>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt="Card background"
          className="object-scale-down rounded-xl w-full"
          src={card.url}
          //width={400}
        />
      </CardBody>
    </Card>
  );
}

export default PlateCard;
