import {Card, CardHeader, CardBody, Image} from '@nextui-org/react'

interface PlateCardProps {
  image: string;
  onPlateCardVote: () => void;
}

const PlateCard = ( {image, onPlateCardVote}: PlateCardProps ) => {
  return(
    <Card className="py-1 ml-3 mr-2" isHoverable isPressable onPress={onPlateCardVote}>
      <CardHeader className="pb-1 pt-2 px-4 flex-col items-center">
        <p className="text-large uppercase font-bold">FSU FSU</p>
        <small className="text-default-500">By garlicgirl</small>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt="Card background"
          className="object-cover rounded-xl"
          src={image}
          width={400}
        />
      </CardBody>
    </Card>
  );
}

export default PlateCard;
