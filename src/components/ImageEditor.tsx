// src/ImageEditor.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { Image } from '../assets/types'
import axios from '../utils/axiosInstance'
import { Button, Input } from '@heroui/react'
import { useLocation } from 'react-router-dom'
import { BUCKET_URL } from 'const/constants'

// Mock data (you can replace with API fetch)
// const mockImageTextMap: ImageTextMap = { ... }

Button

// Main Component
export const ImageEditor: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<Image | null>(null)
  const [text, setText] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<Image[]>([])

  const location = useLocation()

  // Load text from JSON based on image name
  useEffect(() => {
    if (currentImage) {
      setText(currentImage.correctedText ?? currentImage.text ?? '')
    }
  }, [currentImage, currentImage?.text, currentImage?.correctedText])

  // Handle image selection
  const handleImageSelect = (image: Image) => {
    const url = '/images/info/' + image.id.toLocaleString()
    //console.log(image, url)
    axios.get(url).then(({ data }) => {
      setCurrentImage(data)
    })
  }

  async function getAndSetAllImages() {
    try {
      const { data } = await axios.get('/images')
      setImages(data)
      return data
    } catch (error) {
      console.log(error)
      return []
    }
  }

  // Save to backend
  const handleSave = useCallback(async () => {
    if (!currentImage) return

    setLoading(true)
    setError(null)
    getAndSetAllImages()

    try {
      const response = await axios.post('/save-text', {
        id: currentImage.id,
        text: currentImage.text,
        correctedText: text,
        fileName: currentImage.fileName
      })

      if (response.status != 200) {
        throw new Error(`Failed to save: ${response.status}`)
      }
      console.log('Text saved successfully')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [currentImage, text])

  // Fetch images on mount
  useEffect(() => {
    const imgId = location.pathname.match(/\d+/g)?.at(-1)
    //console.log(location, imgId)
    if (imgId) {
      getAndSetAllImages().then((images) => {
        console.log(images[parseInt(imgId)])
        handleImageSelect(images[parseInt(imgId)])
      })
    } else {
      getAndSetAllImages()
    }
  }, [location, location.pathname])

  // Render image with text (centered, clean)
  const renderImage = () => {
    if (!currentImage) return null

    // Handle text edit
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value.toLocaleUpperCase())
    }

    return (
      <div className="flex flex-col items-center gap-5 p-5">
        <Button
          style={{
            position: 'absolute',
            right: 10,
            top: 10,
            padding: '10px'
          }}
          onPress={() => setCurrentImage(null)}
        >
          close
        </Button>
        <img
          src={`${BUCKET_URL}/${currentImage.fileName}`}
          alt={currentImage.fileName}
          style={{
            //maxWidth: '500px',
            height: '70%',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}
        />
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '30%'
          }}
        >
          <div
            style={{
              flex: 1,
              maxWidth: '500px',
              padding: '20px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              //backgroundColor: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{ marginBottom: '10px' }}>
              Text for &quot;{currentImage.fileName}&quot;
            </h3>
            <span style={{ display: 'flex' }}>
              <Input
                value={text}
                onInput={handleTextChange}
                className="mr-4"
                placeholder="Edit the text here..."
              />
              <Button
                onPress={() => {
                  handleSave()
                  setCurrentImage({ ...currentImage, correctedText: text })
                }}
                isDisabled={loading || currentImage.correctedText == text}
                color="secondary"
                className="px-8"
              >
                Save Changes
              </Button>
            </span>

            {error && (
              <p
                style={{
                  color: 'red',
                  marginTop: '10px',
                  fontSize: '14px'
                }}
              >
                {error}
              </p>
            )}
          </div>
          <span className="flex w-4/5 justify-around p-3">
            <Button
              //style={{ backgroundColor: '#D90368', padding: '10px' }}
              color="primary"
              onPress={() => {
                console.log(currentImage)
                if (currentImage.id > 1) {
                  if (currentImage.correctedText != text) {
                    handleSave()
                  }
                  const data = images.find(
                    ({ id }) => id === currentImage.id - 1
                  )
                  if (data) {
                    handleImageSelect(data)
                  }
                }
              }}
            >
              {'Prev!'}
            </Button>
            <Button
              //style={{ backgroundColor: '#417B5A', padding: '10px' }}
              color="primary"
              onPress={() => {
                console.log(currentImage)
                if (currentImage.id < images.length) {
                  if (currentImage.correctedText != text) {
                    handleSave()
                  }
                  const data = images.find(
                    ({ id }) => id === currentImage.id + 1
                  )
                  if (data) {
                    handleImageSelect(data)
                  }
                }
              }}
            >
              {'Next!'}
            </Button>
          </span>
        </span>
      </div>
    )
  }

  // Uniform, responsive image grid
  const renderImageSelector = () => (
    <div
      style={{
        padding: '20px',
        maxWidth: '1000px',
        margin: '0 auto',
        //backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Select an Image to View & Edit Text
      </h2>
      <h3 className="text-center">
        {images.filter((a) => !a.correctedText).length} / {images.length} To Go
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          padding: '10px',
          width: '100%'
        }}
      >
        {images.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '20px'
            }}
          >
            No images found. Loading...
          </div>
        ) : (
          images
            .sort((a, b) => a.id - b.id)
            .map((img) => (
              <div
                key={img.id}
                onClick={() => handleImageSelect(img)}
                style={{
                  cursor: 'pointer',
                  border: '1px solid #e0e0e0',
                  padding: '8px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  backgroundColor: img.correctedText ? 'white' : 'burlywood',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}
              >
                <img
                  src={`${BUCKET_URL}/${img.fileName}`}
                  alt={img.correctedText}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '6px'
                  }}
                />
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#333',
                    marginTop: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {img.correctedText ?? img.text}
                </p>
              </div>
            ))
        )}
      </div>
    </div>
  )

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        //backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
      }}
    >
      {currentImage ? renderImage() : renderImageSelector()}
    </div>
  )
}
