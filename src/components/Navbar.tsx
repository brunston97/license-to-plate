import { useRef, useState } from 'react'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button
} from '@heroui/react'
import { FaInfoCircle } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  )
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const location = useLocation()

  const paths: { [key: string]: string } = {
    // '/': 'Plate Off',
    '/myPlates': 'My Plates'
  }
  if (import.meta.env.DEV) {
    paths['/results'] = 'Results'
  }

  return (
    <Navbar maxWidth="full">
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          {/* <p className="mr-auto font-bold text-inherit">POPZ</p> */}
          <Link
            href="/"
            // onPress={() => {
            //   navigate('/')
            // }}
          >
            <p className="font-bold">Plate Zone Plate-Off!</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        {Object.keys(paths).map((key) => {
          return (
            <NavbarItem key={key} isActive={location.pathname == key}>
              <Link
                //color="foreground"
                href={key}
                onPress={() => {
                  setIsMenuOpen(false)
                }}
              >
                {paths[key]}
              </Link>
            </NavbarItem>
          )
        })}
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button isIconOnly color="primary" variant="flat">
            <FaInfoCircle
              color="white"
              onClick={() => dialogRef.current?.showModal()}
              //className="absolute right-3 top-4 z-50 size-5 rounded-full bg-transparent hover:bg-gray-200 sm:size-6"
            >
              <span className="text-xl font-bold">i</span>
            </FaInfoCircle>
            <dialog
              ref={dialogRef}
              id="my_modal_5"
              className="modal modal-bottom sm:modal-middle"
            >
              <div className="modal-box">
                <div className="flex w-full flex-col items-center justify-center">
                  <h3 className="mb-4 w-full text-center text-base font-bold text-black dark:text-white md:w-4/5 md:text-xl">
                    Welcome to the 2024 Jackbox Plate Zone Plate-Off!
                  </h3>
                  <h3 className="w-full text-center text-base text-black dark:text-white md:w-4/5 md:text-xl">
                    All you need to do is vote on your favorite license plate
                    from each random pair that you&apos;re shown - we&apos;ll
                    tally the votes for each plate, and announce the winners on
                    March 2<sup>nd</sup>!
                    <br />
                    <br />
                    If you see a funny combination of plates, don&apos;t forget
                    to take a screenshot and post it in the Plate Zone!
                  </h3>
                </div>
                <div className="modal-action flex justify-center">
                  <form method="dialog" className="w-fit">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn">Close</button>
                  </form>
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button>close</button>
              </form>
            </dialog>
          </Button>
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu>
        {Object.keys(paths).map((key) => {
          return (
            <NavbarMenuItem key={key} isActive={location.pathname == key}>
              <Link
                //color="foreground"
                href={key}
                onPress={() => {
                  setIsMenuOpen(false)
                }}
              >
                {paths[key]}
              </Link>
            </NavbarMenuItem>
          )
        })}
      </NavbarMenu>
    </Navbar>
  )
}
