import fs from 'fs'
import path from 'path'

/**
 * Deletes an image file from the uploads directory
 * @param imageUrl - The image URL (can be relative path like "/uploads/filename.jpg" or just filename)
 * @returns Promise<boolean> - true if deleted successfully, false otherwise
 */
export async function deleteImageFile(imageUrl: string): Promise<boolean> {
  if (!imageUrl) return false

  try {
    // Extract filename from the image URL
    let filename = ''
    
    if (imageUrl.startsWith('/uploads/')) {
      filename = imageUrl.replace('/uploads/', '')
    } else if (imageUrl.startsWith('http')) {
      // Handle full URLs by extracting the filename
      const urlParts = imageUrl.split('/')
      filename = urlParts[urlParts.length - 1]
    } else {
      // If it's just a filename
      filename = imageUrl
    }

    if (!filename) return false

    const imagePath = path.join(process.cwd(), 'public', 'uploads', filename)
    
    // Check if file exists before trying to delete it
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
      console.log(`Successfully deleted image file: ${imagePath}`)
      return true
    } else {
      console.log(`Image file not found: ${imagePath}`)
      return false
    }
  } catch (error) {
    console.error('Failed to delete image file:', error)
    return false
  }
}

/**
 * Deletes an image file asynchronously (for use in async functions)
 * @param imageUrl - The image URL
 * @returns Promise<boolean>
 */
export async function deleteImageFileAsync(imageUrl: string): Promise<boolean> {
  return deleteImageFile(imageUrl)
} 