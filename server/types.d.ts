// TODO, put in own export types tsx file
export interface IPlateCard {
  id: string
  voteCount: number
  uploader: string
  title?: string
}

export interface Image {
  id: number
  text: string
  fileName: string
  correctedText: string
  user: string
}
