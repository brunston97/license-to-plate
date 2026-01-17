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
    <>
      <Navbar maxWidth="full" isMenuOpen={isMenuOpen} isBlurred>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onChange={() => setIsMenuOpen((isOpen) => !isOpen)}
            className="sm:hidden"
          />
        </NavbarContent>
        <NavbarContent justify="center">
          <NavbarBrand>
            <Link
              href="/"
              onPressEnd={() => {
                setIsMenuOpen(false)
              }}
              color="foreground"
            >
              <p className="font-bold text-inherit ">Plate Zone Plate-Off!</p>
            </Link>
          </NavbarBrand>
        </NavbarContent>
        <NavbarContent justify="end">
          {Object.keys(paths).map((key) => {
            return (
              <NavbarItem
                key={key}
                isActive={location.pathname == key}
                className="hidden gap-4 sm:flex"
              >
                <Link color="foreground" href={key}>
                  {paths[key]}
                </Link>
              </NavbarItem>
            )
          })}
          <NavbarItem>
            <Button
              isIconOnly
              color="default"
              variant="bordered"
              onPress={() => dialogRef.current?.showModal()}
            >
              <FaInfoCircle
                color="white"
                //className="absolute right-3 top-4 z-50 size-5 rounded-full bg-transparent hover:bg-gray-200 sm:size-6"
              >
                <span className="text-xl font-bold">i</span>
              </FaInfoCircle>
            </Button>
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu>
          {Object.keys(paths).map((key) => {
            return (
              <NavbarMenuItem key={key} isActive={location.pathname == key}>
                <Link
                  color="foreground"
                  href={key}
                  onPressEnd={() => {
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
      <dialog
        ref={dialogRef}
        id="my_modal_5"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <div className="flex w-full flex-col items-center justify-center">
            <h3 className="mb-4 w-full text-center text-base font-bold text-black dark:text-white md:w-4/5 md:text-xl">
              Welcome to the 2025 Jackbox Plate Zone Plate-Off!
            </h3>
            <h3 className="w-full text-center text-base text-black dark:text-white md:w-4/5 md:text-xl">
              All you need to do is vote on your favorite license plate from
              each random pair that you&apos;re shown - we&apos;ll tally the
              votes for each plate, and announce the winners on March 2
              <sup>nd</sup>!
              <br />
              <br />
              If you see a funny combination of plates, don&apos;t forget to
              take a screenshot and post it in the Plate Zone!
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
    </>
  )
}
