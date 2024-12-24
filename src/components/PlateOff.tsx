import React, { useState } from "react";
import PlateCard from "./PlateCard";

const images = [
  "plate1.jpg","plate2.jpg","plate3.jpg","plate4.jpg","plate5.jpg",
  "plate6.jpg","plate7.jpg","plate8.jpg","plate9.jpg","plate10.jpg"
];

const PlateOff = () => {

  const [card1Image, setCard1Image] = useState(`src/assets/${images[0]}`);
  const [card2Image, setCard2Image] = useState(`src/assets/${images[1]}`);
  const [usedIndexes, setUsedIndexes] = useState(new Set().add(0).add(1));
  const [lastIndexPair, setLastIndexPair] = useState<number[]>([0, 1]);

  const handleCard1Click = () => {
    handleCardClick();
  }

  const handleCard2Click = () => {
    handleCardClick();
  }

  const handleCardClick = () => {
    const [image1, image2] = getRandomImages();
    setCard1Image(image1);
    setCard2Image(image2);
  }

  const getRandomImages = () => {
    let randomIndex1, randomIndex2;
    if (images.length - usedIndexes.size < 2) {
      randomIndex1 = 0;
      randomIndex2 = 1;
      setUsedIndexes(new Set().add(randomIndex1).add(randomIndex2));
    } else {
      [randomIndex1, randomIndex2] = getRandomUnusedIndexes();
      setUsedIndexes(new Set([...usedIndexes, randomIndex1, randomIndex2]));
    }

    setLastIndexPair([randomIndex1, randomIndex2]);
    return [`src/assets/${images[randomIndex1]}`,`src/assets/${images[randomIndex2]}`];
  }

  const getRandomUnusedIndexes = () => {
    let index1, index2;

    do {
      index1 = Math.floor(Math.random() * images.length);
    } while (usedIndexes.has(index1));

    do {
      index2 = Math.floor(Math.random() * images.length);
    } while (usedIndexes.has(index2) || index1 === index2);

    return [index1, index2];
  }
  return (
    <div className="flex lg:gap-20 md:gap-5 sm:gap-5" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "75vh"}}>
        <PlateCard image={card1Image} onPlateCardVote={handleCard1Click} />
        <PlateCard image={card2Image} onPlateCardVote={handleCard2Click}/>
    </div>
  );
}

export default PlateOff;
