// TODO, put in own export types tsx file
export interface IPlateCard extends Image {
  voteCount: number
  isLiked: boolean
}

// backend related
export interface Image {
  id: number
  text: string
  fileName: string
  correctedText: string
  user: string
}

// src/types.ts
export interface ImageTextMap {
  [key: string]: string
}
