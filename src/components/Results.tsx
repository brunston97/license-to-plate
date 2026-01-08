import { Image } from '@nextui-org/react'

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
        <div className="z-0 grow overflow-y-auto p-4">
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {sortedPlateCards.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col justify-center rounded-xl bg-white p-2"
                    >
                        <Image
                            alt={`${item.title}`}
                            src={`${BUCKET_URL}/plate${item.id}.jpg`}
                            className="flex cursor-pointer justify-center"
                            isZoomed
                            onClick={() => {
                                setModalId(item.id)
                                modalRef.current?.showModal()
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
