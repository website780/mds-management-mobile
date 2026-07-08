// hooks/useHTMLContent.js
import { useMemo } from 'react'
import parse from 'html-react-parser'

export const useHTMLContent = (htmlString, options = {}) => {
  const { maxLength, sanitize = true } = options

  return useMemo(() => {
    if (!htmlString) return null

    let processedHTML = htmlString

    // Truncate if maxLength is provided
    if (maxLength) {
      const textContent = htmlString.replace(/<[^>]*>/g, '')
      if (textContent.length > maxLength) {
        const truncated = htmlString.substring(0, maxLength)
        const lastSpace = truncated.lastIndexOf(' ')
        processedHTML = (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
      }
    }

    // Parse HTML to React elements
    return parse(processedHTML)
  }, [htmlString, maxLength, sanitize])
}