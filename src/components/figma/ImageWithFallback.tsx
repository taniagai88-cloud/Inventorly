import React, { useState, useEffect } from 'react'
import { Package } from 'lucide-react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

// Helper function to ensure image URL is properly resolved
function resolveImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  
  // If it's already a full URL (http/https) or data URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  
  // Vite processes image imports and returns URLs that should work directly
  // Return the URL as-is since Vite handles the resolution
  return url
}

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setDidError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const { src, alt, style, className, ...rest } = props

  // Reset error state when src changes
  useEffect(() => {
    setDidError(false)
    setIsLoading(true)
  }, [src])

  const resolvedSrc = resolveImageUrl(src)

  if (!resolvedSrc) {
    return (
    <div
        className={`inline-block bg-muted text-center align-middle flex items-center justify-center ${className ?? ''}`}
      style={style}
    >
        <Package className="w-8 h-8 text-muted-foreground" />
      </div>
    )
  }

  if (didError) {
    return (
      <div
        className={`inline-block bg-muted text-center align-middle flex items-center justify-center ${className ?? ''}`}
        style={style}
      >
        <Package className="w-8 h-8 text-muted-foreground" />
    </div>
    )
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
      onLoad={handleLoad}
    />
  )
}
