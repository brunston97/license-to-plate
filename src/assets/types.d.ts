// TODO, put in own export types tsx file
export interface IPlateCard {
  id: string
  voteCount?: number
  title: string
  isLiked?: boolean
}

// src/types.ts
export interface ImageTextMap {
  [key: string]: string
}

export interface Image {
  id: number
  text: string
  fileName: string
  correctedText?: string
}
