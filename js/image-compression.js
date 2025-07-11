// Image Compression Service
class ImageCompressionService {
  constructor() {
    this.defaultOptions = {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      format: "jpeg",
      progressive: true,
    }
    this.compressionLevels = {
      low: { quality: 0.9, maxWidth: 2048, maxHeight: 1536 },
      medium: { quality: 0.8, maxWidth: 1920, maxHeight: 1080 },
      high: { quality: 0.6, maxWidth: 1280, maxHeight: 720 },
      ultra: { quality: 0.4, maxWidth: 800, maxHeight: 600 },
    }
  }

  // Main compression method
  async compressImage(file, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isImage(file)) {
        resolve(file) // Return original if not an image
        return
      }

      const settings = { ...this.defaultOptions, ...options }
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        try {
          // Calculate new dimensions
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            settings.maxWidth,
            settings.maxHeight,
          )

          // Set canvas dimensions
          canvas.width = width
          canvas.height = height

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create new file with compressed data
                const compressedFile = new File([blob], this.getCompressedFileName(file.name, settings.format), {
                  type: `image/${settings.format}`,
                  lastModified: Date.now(),
                })

                // Add compression metadata
                compressedFile.originalSize = file.size
                compressedFile.compressedSize = blob.size
                compressedFile.compressionRatio = (((file.size - blob.size) / file.size) * 100).toFixed(1)

                resolve(compressedFile)
              } else {
                reject(new Error("Compression failed"))
              }
            },
            `image/${settings.format}`,
            settings.quality,
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  // Batch compression
  async compressImages(files, options = {}) {
    const results = []
    const total = files.length
    let completed = 0

    for (const file of files) {
      try {
        const compressed = await this.compressImage(file, options)
        results.push({
          original: file,
          compressed: compressed,
          success: true,
          savings: compressed.compressionRatio || 0,
        })
      } catch (error) {
        results.push({
          original: file,
          compressed: null,
          success: false,
          error: error.message,
        })
      }

      completed++
      this.updateCompressionProgress(completed, total)
    }

    return results
  }

  // Smart compression based on file size
  async smartCompress(file) {
    const fileSizeMB = file.size / (1024 * 1024)
    let compressionLevel = "medium"

    if (fileSizeMB > 10) {
      compressionLevel = "ultra"
    } else if (fileSizeMB > 5) {
      compressionLevel = "high"
    } else if (fileSizeMB > 2) {
      compressionLevel = "medium"
    } else {
      compressionLevel = "low"
    }

    return this.compressImage(file, this.compressionLevels[compressionLevel])
  }

  // Calculate optimal dimensions
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let { width, height } = { width: originalWidth, height: originalHeight }

    // Calculate scaling factor
    const widthRatio = maxWidth / width
    const heightRatio = maxHeight / height
    const ratio = Math.min(widthRatio, heightRatio, 1)

    width = Math.round(width * ratio)
    height = Math.round(height * ratio)

    return { width, height }
  }

  // Check if file is an image
  isImage(file) {
    return file && file.type && file.type.startsWith("image/")
  }

  // Generate compressed filename
  getCompressedFileName(originalName, format) {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "")
    return `${nameWithoutExt}_compressed.${format}`
  }

  // Update compression progress
  updateCompressionProgress(completed, total) {
    const percentage = Math.round((completed / total) * 100)
    const progressBars = document.querySelectorAll(".compression-progress")

    progressBars.forEach((bar) => {
      bar.style.width = `${percentage}%`
      bar.textContent = `${percentage}%`
    })

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("compressionProgress", {
        detail: { completed, total, percentage },
      }),
    )
  }

  // Get compression statistics
  getCompressionStats(results) {
    const successful = results.filter((r) => r.success)
    const totalOriginalSize = successful.reduce((sum, r) => sum + r.original.size, 0)
    const totalCompressedSize = successful.reduce((sum, r) => sum + r.compressed.size, 0)
    const totalSavings = totalOriginalSize - totalCompressedSize
    const averageSavings = ((totalSavings / totalOriginalSize) * 100).toFixed(1)

    return {
      totalFiles: results.length,
      successfulCompressions: successful.length,
      failedCompressions: results.length - successful.length,
      totalOriginalSize: this.formatFileSize(totalOriginalSize),
      totalCompressedSize: this.formatFileSize(totalCompressedSize),
      totalSavings: this.formatFileSize(totalSavings),
      averageSavings: `${averageSavings}%`,
    }
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Create compression preview
  createCompressionPreview(original, compressed) {
    return {
      originalPreview: URL.createObjectURL(original),
      compressedPreview: URL.createObjectURL(compressed),
      originalSize: this.formatFileSize(original.size),
      compressedSize: this.formatFileSize(compressed.size),
      savings: compressed.compressionRatio + "%",
    }
  }
}

// Initialize compression service
const imageCompression = new ImageCompressionService()
