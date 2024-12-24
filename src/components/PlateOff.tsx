import React, { useState } from "react";
import PlateCard from "./PlateCard";

const images = [
  "plate1.jpg","plate2.jpg","plate3.jpg","plate4.jpg","plate5.jpg",
  "plate6.jpg","plate7.jpg","plate8.jpg","plate9.jpg","plate10.jpg"
];

const PlateOff = () => {

  const [card1Image, setCard1Image] = useState(`src/assets/${images[0]}`);
  const [card2Image, setCard2Image] = useState(`src/assets/${images[1]}`);

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return `src/assets/${images[randomIndex]}`;
  }

  const handleCard1Click = () => {
    handleCardClick(true);
  }

  const handleCard2Click = () => {
    handleCardClick(false);
  }

  const handleCardClick = (card1Won: boolean) => {
    setCard1Image(getRandomImage());
    setCard2Image(getRandomImage());
  }

  return (
    <div className="flex lg:gap-20 md:gap-5 sm:gap-5" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "75vh"}}>
        <PlateCard image={card1Image} onPlateCardVote={handleCard1Click} />
        <PlateCard image={card2Image} onPlateCardVote={handleCard2Click}/>
    </div>
  );
}

export default PlateOff;
