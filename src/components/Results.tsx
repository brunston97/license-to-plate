import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Image
} from '@nextui-org/react'

import { IPlateCard } from 'assets/types'
import axios from 'axios'
import { ReactElement, useEffect, useRef, useState } from 'react'

const BUCKET_URL = import.meta.env.VITE_BUCKET_URL

export default function PlateCardTable(): ReactElement {
  const [topTenPlates, setTopTenPlates] = useState<IPlateCard[]>([])
  const [modalId, setModalId] = useState('')
  const sortedPlateCards = [...topTenPlates].sort((a, b) => {
    // Define your ranking logic here, e.g., by a 'score' property
    const scoreA = a.voteCount || 0
    const scoreB = b.voteCount || 0
    return scoreB - scoreA // Sort in descending order of score
  })
  async function getPlates() {
    const { data } = await axios.get('/vote/results')
    setTopTenPlates(
      (data as IPlateCard[]).sort((a, b) => b.id.localeCompare(a.id))
    )
  }
  useEffect(() => {
    getPlates()
  }, [])

  const modalRef = useRef<HTMLDialogElement>(null)

  return (
    <div className="overflow-y-auto">
      <div className="">
        <dialog id="my_modal_2" className="modal" ref={modalRef}>
          <div className="modal-box">
            <Image
              alt={`${modalId}`}
              src={`${BUCKET_URL}/plate${modalId}.jpg`}
            />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
      <Table aria-label="Ranked Plate Cards" className="justify-self-start p-5">
        <TableHeader>
          <TableColumn align="center" key="rank">
            Plate Id
          </TableColumn>
          <TableColumn align="center" key="name">
            Name
          </TableColumn>
          <TableColumn align="center" key="voteCount">
            Image
          </TableColumn>
        </TableHeader>
        <TableBody items={sortedPlateCards}>
          {sortedPlateCards.map((item) => (
            <TableRow key={item.id}>
              <TableCell align="center">{item.id}</TableCell>
              <TableCell align="center">{item.title}</TableCell>
              <TableCell align="center" className="flex justify-center">
                <Image
                  alt={`${item.title}`}
                  src={`${BUCKET_URL}/plate${item.id}.jpg`}
                  className="h-48 cursor-pointer"
                  isZoomed
                  onClick={() => {
                    setModalId(item.id)
                    modalRef.current?.showModal()
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
