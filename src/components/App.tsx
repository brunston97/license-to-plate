import Avatar from 'components/Avatar'
import logo from 'assets/logo.svg'
import img1 from 'assets/this.jpg'
import img2 from 'assets/that.jpg'


const randoms = [
  [1, 2],
  [3, 4, 5],
  [6, 7]
]

function App() {
  const imgClass = "w-80"
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="h-screen sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
        <div className="fight-row flex items-center justify-around">
          <img src={img1} className={imgClass}></img>
          <span>vs</span>
          <img src={img2} className={imgClass}></img>
        </div>

      </div>
    </div>
  )
}

export default App
