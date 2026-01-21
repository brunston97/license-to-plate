import { IPlateCard } from 'assets/types'
import { LIKED_PLATES, VIEWED_PLATES } from 'const/constants'

export function classNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(' ')
}

export function shuffleArray<T>(array: T[]): T[] {
  // Create a copy of the array to avoid modifying the original array directly.
  // This is generally good practice to maintain immutability unless you
  // specifically want to shuffle in place.
  const shuffledArray = [...array]

  // Fisher-Yates (Knuth) Shuffle Algorithm
  // This algorithm is efficient and ensures a uniform distribution of shuffled results.
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    // Generate a random index j between 0 and i (inclusive).
    const j = Math.floor(Math.random() * (i + 1))

    // Swap elements at indices i and j.
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }

  return shuffledArray
}

export function formPlatePairsArray(len: number): number[][] {
  const plateIds = Array.from({ length: len }, (_, i) => i)
  shuffle(plateIds)

  const pairedPlates: number[][] = []
  for (let i = 0; i < plateIds.length; i += 2) {
    pairedPlates.push([plateIds[i], plateIds[i + 1]])
  }

  return pairedPlates
}

// array shuffle function
export function shuffle(array: Array<unknown>) {
  let currentIndex = array.length

  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ]
  }
}

export function preloadImage(url: string) {
  const img = new Image()
  img.src = url
}

export function getLikedPlatesFromLocalStorage(): Set<number> {
  const stored = localStorage.getItem(LIKED_PLATES)
  if (stored) {
    return new Set(JSON.parse(stored) as number[])
  }

  // Fallback: extract from stored plates (full objects)
  const storedPlatesRaw: IPlateCard[] = localStorage.getItem('userPlates')
    ? JSON.parse(localStorage.getItem('userPlates')!)
    : []
  const ids = storedPlatesRaw
    .filter((plate) => plate?.isLiked !== undefined && plate?.isLiked)
    .map((plate) => (plate as IPlateCard).id)
  return new Set(ids.filter((id) => typeof id === 'number'))
}

export function getViewedPlateFromLocalStorage(): Set<number> {
  const stored = localStorage.getItem(VIEWED_PLATES)
  if (stored) {
    return new Set(JSON.parse(stored) as number[])
  }

  // Fallback: extract from stored plates
  const storedPlatesRaw: IPlateCard[] = localStorage.getItem('userPlates')
    ? JSON.parse(localStorage.getItem('userPlates')!)
    : []
  const ids = storedPlatesRaw
    .map((plate) => (plate as IPlateCard).id)
    .filter((id) => typeof id === 'number')
  return new Set(ids)
}
