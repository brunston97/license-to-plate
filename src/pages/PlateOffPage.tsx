import { GiCardExchange } from 'react-icons/gi'
import PlateOff from 'components/PlateOff'
import { MOBILE_WIDTH_CUTOFF } from 'const/constants'
import { useLocation, useOutletContext } from 'react-router-dom'

function PlateOffPage() {
  const { windowWidth, isMuted } = useOutletContext<{
    windowWidth: number
    isMuted: boolean
  }>()
  //const [isManualSideBySideView, setIsManualSideBySideView] = useState(false)

  const location = useLocation()

  // const toggleView = () => {
  //   setIsManualSideBySideView((prevState) => !prevState)
  // }

  return (
    <div className="flex size-full flex-col items-center justify-center overflow-hidden">
      <Header />
      <PlateOff
        isMuted={isMuted}
        windowWidth={windowWidth}
        isManualSideBySideView={false}
      />

      {/* <div
        className="flex w-full justify-center gap-2 py-2 md:hidden"
        // style={{
        //   visibility:
        //     window.innerWidth > MOBILE_WIDTH_CUTOFF ? 'hidden' : 'visible',
        //   display: 'flex'
        // }}
      >
        <a href="#item1" className="btn btn-xs">
          &larr;
        </a>
        <a href="#item2" className="btn btn-xs">
          &rarr;
        </a>
      </div> */}

      {windowWidth <= MOBILE_WIDTH_CUTOFF && (
        <a href={location.hash === '#item1' ? '#item2' : '#item1'}>
          <button
            //onClick={() => {navigator('')}}
            className="fixed bottom-4 right-4 rounded-full bg-transparent p-2 hover:bg-gray-200"
            // title={
            //   isManualSideBySideView
            //     ? 'Switch to Image View'
            //     : 'Switch to Side-By-Side View'
            //}
          >
            <GiCardExchange
              size={32}
              //color={isManualSideBySideView ? 'white' : 'gray'}
            />
          </button>
        </a>
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="py-0 text-center font-barlow text-3xl font-bold uppercase text-white md:text-6xl">
      <h1>Plate Zone Plate-Off!</h1>
    </header>
  )
}

export default PlateOffPage
