// src/ImageEditor.tsx
import React, { useState, useEffect } from 'react'
import { Image } from '../assets/types'
import axios from '../utils/axiosInstance'

// Mock data (you can replace with API fetch)
// const mockImageTextMap: ImageTextMap = {
//     'sunrise.jpg':
//         'A beautiful sunrise over the mountains. Golden light breaks through the clouds.',
//     'ocean.jpg': 'The ocean waves roll in gently, calm and peaceful.',
//     'forest.jpg':
//         'A quiet forest at dawn, leaves shimmering in the morning mist.',
//     'city.jpg':
//         'A bustling city at night with neon lights reflecting on wet pavement.'
// }

const BUCKET_URL =
    'http://localhost:' + import.meta.env.VITE_PORT + '/api/images/' //import.meta.env.VITE_BUCKET_URL

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
            //const imageName = currentImage.fileName
            setText(currentImage.text ?? '')
        }
    }, [currentImage])

    // Handle image selection
    const handleImageSelect = (image: Image) => {
        //image = 'http://localhost:7001/api/images/' + image.id
        setCurrentImage(image)
    }

    // Handle text edit
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value)
    }

    // Save to backend
    const handleSave = async () => {
        if (!currentImage) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/save-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image_name: currentImage.fileName,
                    text: text
                })
            })

            if (!response.ok) {
                throw new Error(`Failed to save: ${response.status}`)
            }

            console.log('Text saved successfully')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        axios.get('images').then(({ data }) => {
            setImages(data)
            console.log(data)
        })
    }, [])

    // Show image and text
    const renderImage = () => {
        if (!currentImage) return null

        return (
            <div
                style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '20px',
                    alignItems: 'center'
                }}
            >
                <img
                    src={BUCKET_URL + `${currentImage.id}`}
                    alt={currentImage.fileName}
                    style={{
                        maxWidth: '500px',
                        maxHeight: '400px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                    }}
                />
                <div
                    style={{
                        flex: 1,
                        padding: '20px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px'
                    }}
                >
                    <h3>Text for &quot;{currentImage.fileName}&quot;</h3>
                    <textarea
                        value={text}
                        onChange={handleTextChange}
                        style={{
                            width: '100%',
                            height: '150px',
                            padding: '12px',
                            fontSize: '16px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            resize: 'vertical',
                            margin: '10px 0'
                        }}
                        placeholder="Edit the text here..."
                    />
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        style={{
                            padding: '10px 16px',
                            fontSize: '14px',
                            backgroundColor: '#0070e9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    {error && (
                        <p style={{ color: 'red', marginTop: '10px' }}>
                            {error}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    // Image selector
    const renderImageSelector = () => (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Select an Image to View & Edit Text</h2>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    padding: '10px'
                }}
            >
                {images.map((img) => (
                    <div
                        key={img.id}
                        onClick={() => handleImageSelect(img)}
                        style={{
                            cursor: 'pointer',
                            border: '1px solid #ddd',
                            padding: '12px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            backgroundColor:
                                currentImage?.fileName === img.fileName
                                    ? '#e0f7fa'
                                    : '#fff',
                            transition: 'background 0.2s'
                        }}
                    >
                        <img
                            src={BUCKET_URL + `${img.id}`}
                            alt={img.fileName}
                            style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                            }}
                        />
                        <p style={{ fontSize: '12px', marginTop: '6px' }}>
                            {img.fileName}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <div
            style={{
                fontFamily: 'sans-serif',
                padding: '20px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}
        >
            {currentImage ? renderImage() : renderImageSelector()}
        </div>
    )
}
