import { GiCardExchange } from 'react-icons/gi'
import PlateOff from 'components/PlateOff'
import { MOBILE_WIDTH_CUTOFF } from 'const/constants'
import { useOutletContext } from 'react-router-dom'
import { Button } from '@heroui/react'
import { useState } from 'react'

function PlateOffPage() {
  const { windowWidth, isMuted } = useOutletContext<{
    windowWidth: number
    isMuted: boolean
  }>()
  const [isSideBySideView, setIsSideBySideView] = useState(true)

  return (
    <div className="flex max-h-full min-h-0 grow flex-col items-center justify-center">
      <PlateOff isMuted={isMuted} isSideBySideView={isSideBySideView} />

      {windowWidth <= MOBILE_WIDTH_CUTOFF && (
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
          <GiCardExchange size={32} />
        </Button>
      )}
    </div>
  )
}

export default PlateOffPage
