// Blob Storage Service for file uploads
class BlobStorageService {
  constructor() {
    this.baseUrl = "/api/blob"
    this.maxFileSize = {
      profile: 5 * 1024 * 1024, // 5MB
      kyc: 10 * 1024 * 1024, // 10MB
      payment: 10 * 1024 * 1024, // 10MB
    }
    this.allowedTypes = {
      profile: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      kyc: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
      payment: ["image/jpeg", "image/jpg", "image/png"],
    }
  }

  // Upload profile image
  async uploadProfileImage(file, userId) {
    return this.uploadFile(file, "profile", userId)
  }

  // Upload KYC document
  async uploadKYCDocument(file, userId, docType) {
    return this.uploadFile(file, "kyc", userId, docType)
  }

  // Upload payment screenshot
  async uploadPaymentScreenshot(file, userId, transactionId) {
    return this.uploadFile(file, "payment", userId, transactionId)
  }

  // Generic file upload method
  async uploadFile(file, category, userId, identifier = null) {
    try {
      // Validate file
      const validation = this.validateFile(file, category)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("category", category)
      formData.append("userId", userId)
      if (identifier) {
        formData.append("identifier", identifier)
      }

      // Show upload progress
      const progressCallback = this.createProgressCallback()

      // Upload file
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: "POST",
        body: formData,
        onUploadProgress: progressCallback,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error("Upload error:", error)
      throw error
    }
  }

  // Validate file before upload
  validateFile(file, category) {
    // Check file size
    if (file.size > this.maxFileSize[category]) {
      return {
        valid: false,
        error: `File size exceeds ${this.maxFileSize[category] / (1024 * 1024)}MB limit`,
      }
    }

    // Check file type
    if (!this.allowedTypes[category].includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} not allowed for ${category}`,
      }
    }

    return { valid: true }
  }

  // Create progress callback
  createProgressCallback() {
    return (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      this.updateProgressBar(percentCompleted)
    }
  }

  // Update progress bar
  updateProgressBar(percent) {
    const progressBars = document.querySelectorAll(".upload-progress")
    progressBars.forEach((bar) => {
      bar.style.width = `${percent}%`
      bar.textContent = `${percent}%`
    })
  }

  // List user files
  async listFiles(userId, category = null) {
    try {
      const url = new URL(`${this.baseUrl}/list`, window.location.origin)
      url.searchParams.append("userId", userId)
      if (category) {
        url.searchParams.append("category", category)
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("List files error:", error)
      throw error
    }
  }

  // Delete file
  async deleteFile(fileUrl, userId) {
    try {
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl, userId }),
      })

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Delete error:", error)
      throw error
    }
  }

  // Get file info
  async getFileInfo(fileUrl) {
    try {
      const response = await fetch(`${this.baseUrl}/info?url=${encodeURIComponent(fileUrl)}`)
      if (!response.ok) {
        throw new Error(`Failed to get file info: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Get file info error:", error)
      throw error
    }
  }
}

// Initialize blob storage service
const blobStorage = new BlobStorageService()
