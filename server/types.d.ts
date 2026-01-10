// TODO, put in own export types tsx file
export interface IPlateCard extends Image {
  //id: string
  voteCount: number
  // uploader: string
  //title?: string
}

// backend related
export interface Image {
  id: number
  text: string
  fileName: string
  correctedText: string
  user: string
}
