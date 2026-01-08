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
        ;[shuffledArray[i], shuffledArray[j]] = [
            shuffledArray[j],
            shuffledArray[i]
        ]
    }

    return shuffledArray
}
