// src/ImageEditor.tsx
import React, { useState, useEffect } from 'react'
import { Image } from '../assets/types'
import axios from '../utils/axiosInstance'

// Mock data (you can replace with API fetch)
// const mockImageTextMap: ImageTextMap = { ... }

const BUCKET_URL = `http://localhost:${import.meta.env.VITE_PORT}/api/images/`

// Main Component
export const ImageEditor: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<Image | null>(null)
  const [text, setText] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<Image[]>([])

  // Load text from JSON based on image name
  useEffect(() => {
    if (currentImage) {
      setText(currentImage.correctedText ?? currentImage.text ?? '')
    }
  }, [currentImage])

  // Handle image selection
  const handleImageSelect = (image: Image) => {
    axios.get('/images/info/' + image.id).then(({ data }) => {
      setCurrentImage(data)
    })
  }

  // Handle text edit
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  // Save to backend
  const handleSave = async () => {
    if (!currentImage) return

    setLoading(true)
    setError(null)

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
  }

  // Fetch images on mount
  useEffect(() => {
    axios.get('/images').then(({ data }) => {
      setImages(data)
    })
  }, [])

  // Render image with text (centered, clean)
  const renderImage = () => {
    // let currentIndex = currentImage
    //       images.findIndex((i) => i.id == currentImage.id),
    // if (currentIndex < 0) currentIndex = 0
    if (!currentImage) return null

    return (
      <div
        style={{
          display: 'flex',
          gap: '20px',
          padding: '20px',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          height: '94vh'
        }}
      >
        <button
          style={{
            position: 'absolute',
            right: 10,
            top: 10,
            backgroundColor: 'gray',
            padding: '10px'
          }}
          onClick={() => setCurrentImage(null)}
        >
          close
        </button>
        <img
          src={BUCKET_URL + currentImage.id}
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
            <input
              value={text}
              onChange={handleTextChange}
              style={{
                padding: '12px',
                color: 'black',
                fontSize: '24px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                //resize: 'vertical',
                margin: '10px 0'
                //background: '#f9f9f9'
              }}
              placeholder="Edit the text here..."
            />
            <button
              onClick={handleSave}
              disabled={loading}
              style={{ margin: '10px 10px', backgroundColor: 'grey' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
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
          <span
            style={{
              width: '80%',
              display: 'flex',
              justifyContent: 'space-around'
            }}
          >
            <button
              style={{ backgroundColor: 'red', padding: '10px' }}
              onClick={() => {
                console.log(currentImage)

                axios
                  .get('/images/info/' + (currentImage.id - 1))
                  .then(({ data }) => {
                    handleImageSelect(data)
                  })
              }}
            >
              {'Prev!'}
            </button>
            <button
              style={{ backgroundColor: 'green', padding: '10px' }}
              onClick={() => {
                console.log(currentImage)
                axios
                  .get('/images/info/' + (currentImage.id + 1))
                  .then(({ data }) => {
                    handleImageSelect(data)
                  })
              }}
            >
              {'Next!'}
            </button>
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
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
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  backgroundColor:
                    currentImage?.fileName === img.fileName
                      ? '#e0f7fa'
                      : '#fff',
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
                  src={BUCKET_URL + img.id}
                  alt={img.fileName}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '6px'
                  }}
                />
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#333',
                    marginTop: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {img.fileName}
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
