import { GiCardExchange } from 'react-icons/gi'
import { MOBILE_WIDTH_CUTOFF } from 'const/constants'
import { Button, Spinner } from '@heroui/react'
import { useState } from 'react'
import { usePlateState } from 'hooks/usePlateState'
import PlateCard from 'components/PlateCard'

function PlateOffPage() {
  const [isSideBySideView, setIsSideBySideView] = useState(false)
  const { plates, currentPlatePair, onCardLike, onPlateVote, likedPlateIds } =
    usePlateState()

  const sideBySideClass = ' pb-11 *:w-full *:max-w-[95%] *:max-h-full'
  const stackClass = ' grow flex-col items-center *:max-h-[50%] *:h-full'
  const carouselItemClass =
    isSideBySideView && window.innerWidth < MOBILE_WIDTH_CUTOFF
      ? sideBySideClass
      : stackClass
  return (
    <div className="flex max-h-full min-h-0 grow flex-col items-center justify-center">
      <div
        className={
          'flex size-full min-h-0 grow flex-col justify-center lg:max-w-5xl'
        }
      >
        {plates.length > 1 ? (
          <>
            {currentPlatePair.length == 2 ? (
              <div
                className={
                  'carousel min-h-0 w-full items-center sm:flex-row sm:justify-center' +
                  carouselItemClass
                }
              >
                {currentPlatePair.map((plate) => {
                  return (
                    <div
                      key={plate.id}
                      className={
                        'carousel-item relative aspect-[3/4] h-auto  justify-center p-2 sm:size-full sm:max-h-none sm:max-w-[45%]'
                      }
                    >
                      <PlateCard
                        card={plate}
                        onPlateCardClick={onPlateVote}
                        showLikeButton={true}
                        id={'item' + plate.id}
                        isLiked={likedPlateIds.has(plate.id)}
                        centerText
                        isZoomed
                        onCardLike={onCardLike}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="mx-5 mt-10 flex items-center justify-center text-center font-barlow text-2xl font-semibold text-white">
                <h2>
                  You&apos;ve voted on all {plates.length} plates, but your
                  plate journey doesn&apos;t end here!
                  <br />
                  Refresh the page to vote on all new plate pairings!
                </h2>
              </div>
            )}
          </>
        ) : (
          <Spinner />
        )}
      </div>

      {window.innerWidth <= MOBILE_WIDTH_CUTOFF && (
        <Button
          isIconOnly
          variant="light"
          color="default"
          radius="full"
          onPress={() => {
            setIsSideBySideView((s) => !s)
            window.gtag &&
              window.gtag('event', 'select_content', {
                content_type: 'side_by_side_toggle',
                content_id: isSideBySideView
              })
          }}
          className="fixed bottom-2 right-2"
        >
          <GiCardExchange
            size={32}
            color={isSideBySideView ? 'white' : 'gray'}
          />
        </Button>
      )}
    </div>
  )
}

export default PlateOffPage
