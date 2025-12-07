import { IPlateCard } from 'assets/types'
import PlateCard from './PlateCard'

interface PlateCollectionProps {
  plates: IPlateCard[]
  isPlateSelected: (plateId: string) => boolean
  onCardClick: (plate: IPlateCard) => void
  onCardLike: (plate: IPlateCard) => void
}

const PlateCollection = (props: PlateCollectionProps) => {
  return (
    <div className="flex flex-wrap justify-start gap-4">
      {props.plates.map((lp) => {
        const isSelected = props.isPlateSelected(lp.id)
        return (
          <div key={lp.id}>
            <PlateCard
              className={`max-w-[150px] sm:max-w-[240px] ${
                isSelected ? 'border-4 border-green-500' : 'border-transparent'
              }`}
              card={lp}
              onPlateCardVote={props.onCardClick}
              isLiked={lp.isLiked ?? false}
              onLikeButtonClick={props.onCardLike}
              windowWidth={750} // TODO: change this
            />
          </div>
        )
      })}
    </div>
  )
}

export default PlateCollection
