// Profile page functionality
class ProfileManager {
  constructor() {
    this.currentUser = null
    this.editMode = false
    this.currentPreviewFile = null
    this.uploadedFiles = []
    this.init()
  }

  init() {
    this.loadUserData()
    this.setupEventListeners()
    this.loadUserFiles()
  }

  loadUserData() {
    // Load user data from localStorage or API
    const getCurrentUser = () => {
      // Placeholder for actual implementation
      return JSON.parse(localStorage.getItem("userData"))
    }
    this.currentUser = getCurrentUser() || {
      id: "FLT001234",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      dob: "1990-01-01",
      address: "123 Main Street, Mumbai, Maharashtra, India",
      avatar: "/placeholder.svg?height=120&width=120",
      kycStatus: "pending",
    }

    this.updateProfileDisplay()
  }

  updateProfileDisplay() {
    // Update profile form fields
    document.getElementById("fullName").value = this.currentUser.name
    document.getElementById("email").value = this.currentUser.email
    document.getElementById("phone").value = this.currentUser.phone
    document.getElementById("dob").value = this.currentUser.dob
    document.getElementById("address").value = this.currentUser.address

    // Update avatar
    const avatarElements = document.querySelectorAll("#profileAvatar, #navUserAvatar")
    avatarElements.forEach((avatar) => {
      avatar.src = this.currentUser.avatar
    })

    // Update user info in nav
    document.querySelector(".user-name").textContent = this.currentUser.name
    document.querySelector(".user-id").textContent = `ID: ${this.currentUser.id}`
  }

  setupEventListeners() {
    // Avatar upload
    const avatarUpload = document.getElementById("avatarUpload")
    avatarUpload.addEventListener("change", (e) => {
      this.handleAvatarUpload(e.target.files[0])
    })

    // KYC document uploads
    const kycUploads = ["panUpload", "aadhaarUpload", "bankUpload"]
    kycUploads.forEach((uploadId) => {
      const upload = document.getElementById(uploadId)
      upload.addEventListener("change", (e) => {
        const docType = uploadId.replace("Upload", "")
        this.handleKYCUpload(e.target.files[0], docType)
      })
    })

    // Profile form submission
    const profileForm = document.getElementById("profileForm")
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveProfile()
    })

    // Drag and drop for file uploads
    this.setupDragAndDrop()
  }

  setupDragAndDrop() {
    const dropZones = document.querySelectorAll(".document-upload, .avatar-container")

    dropZones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault()
        zone.classList.add("drag-over")
      })

      zone.addEventListener("dragleave", () => {
        zone.classList.remove("drag-over")
      })

      zone.addEventListener("drop", (e) => {
        e.preventDefault()
        zone.classList.remove("drag-over")

        const files = e.dataTransfer.files
        if (files.length > 0) {
          if (zone.classList.contains("avatar-container")) {
            this.handleAvatarUpload(files[0])
          } else {
            // Determine document type from parent element
            const docCard = zone.closest(".document-card")
            const docType = this.getDocumentType(docCard)
            this.handleKYCUpload(files[0], docType)
          }
        }
      })
    })
  }

  getDocumentType(docCard) {
    const title = docCard.querySelector("h3").textContent.toLowerCase()
    if (title.includes("pan")) return "pan"
    if (title.includes("aadhaar")) return "aadhaar"
    if (title.includes("bank")) return "bank"
    return "unknown"
  }

  async handleAvatarUpload(file) {
    if (!file) return

    try {
      this.showUploadProgress()

      const blobStorage = {
        uploadProfileImage: async (file, userId) => {
          // Placeholder for actual implementation
          return URL.createObjectURL(file)
        },
      }
      const imageUrl = await blobStorage.uploadProfileImage(file, this.currentUser.id)

      // Update avatar display
      const avatarElements = document.querySelectorAll("#profileAvatar, #navUserAvatar")
      avatarElements.forEach((avatar) => {
        avatar.src = imageUrl
      })

      // Update user data
      this.currentUser.avatar = imageUrl
      this.saveUserData()

      this.hideUploadProgress()
      const showNotification = (message, type) => {
        // Placeholder for actual implementation
        alert(`${type.toUpperCase()}: ${message}`)
      }
      showNotification("Profile picture updated successfully!", "success")
    } catch (error) {
      this.hideUploadProgress()
      const showNotification = (message, type) => {
        // Placeholder for actual implementation
        alert(`${type.toUpperCase()}: ${message}`)
      }
      showNotification(`Upload failed: ${error.message}`, "error")
    }
  }

  async handleKYCUpload(file, docType) {
    if (!file) return

    try {
      const blobStorage = {
        uploadKYCDocument: async (file, userId, docType) => {
          // Placeholder for actual implementation
          return URL.createObjectURL(file)
        },
      }
      const uploadBtn = document.querySelector(`#${docType}Upload`).parentElement.querySelector(".upload-btn")
      const progressContainer = document
        .querySelector(`#${docType}Upload`)
        .parentElement.querySelector(".upload-progress-container")
      const previewContainer = document.getElementById(`${docType}Preview`)

      // Show progress
      uploadBtn.disabled = true
      uploadBtn.innerHTML = '<div class="loading"></div> Uploading...'
      progressContainer.style.display = "block"

      const fileUrl = await blobStorage.uploadKYCDocument(file, this.currentUser.id, docType)

      // Update document status
      const statusBadge = uploadBtn.closest(".document-card").querySelector(".status-badge")
      statusBadge.textContent = "Uploaded"
      statusBadge.className = "status-badge pending"

      // Show preview
      this.showDocumentPreview(file, fileUrl, previewContainer)

      // Reset upload button
      uploadBtn.disabled = false
      uploadBtn.innerHTML = '<i class="fas fa-check"></i> Re-upload'
      progressContainer.style.display = "none"

      const showNotification = (message, type) => {
        // Placeholder for actual implementation
        alert(`${type.toUpperCase()}: ${message}`)
      }
      showNotification(`${docType.toUpperCase()} document uploaded successfully!`, "success")
    } catch (error) {
      const uploadBtn = document.querySelector(`#${docType}Upload`).parentElement.querySelector(".upload-btn")
      const progressContainer = document
        .querySelector(`#${docType}Upload`)
        .parentElement.querySelector(".upload-progress-container")

      uploadBtn.disabled = false
      uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Failed - Retry'
      progressContainer.style.display = "none"

      const showNotification = (message, type) => {
        // Placeholder for actual implementation
        alert(`${type.toUpperCase()}: ${message}`)
      }
      showNotification(`Upload failed: ${error.message}`, "error")
    }
  }

  showDocumentPreview(file, fileUrl, container) {
    container.style.display = "block"

    const isImage = file.type.startsWith("image/")
    const fileSize = this.formatFileSize(file.size)

    container.innerHTML = `
            <div class="file-info">
                ${isImage ? `<img src="${fileUrl}" alt="Document preview">` : `<i class="fas fa-file-pdf" style="font-size: 2rem; color: var(--error-color);"></i>`}
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
                <div class="file-actions">
                    <button class="btn-view" onclick="profileManager.previewFile('${fileUrl}', '${file.name}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-delete" onclick="profileManager.deleteDocument('${fileUrl}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  showUploadProgress() {
    const progressContainers = document.querySelectorAll(".upload-progress-container")
    progressContainers.forEach((container) => {
      container.style.display = "block"
    })
  }

  hideUploadProgress() {
    const progressContainers = document.querySelectorAll(".upload-progress-container")
    progressContainers.forEach((container) => {
      container.style.display = "none"
    })
  }

  async loadUserFiles() {
    try {
      const blobStorage = {
        listFiles: async (userId) => {
          // Placeholder for actual implementation
          return JSON.parse(localStorage.getItem("uploadedFiles")) || []
        },
      }
      const files = await blobStorage.listFiles(this.currentUser.id)
      this.uploadedFiles = files
      this.displayFiles(files)
    } catch (error) {
      console.error("Failed to load files:", error)
      this.showEmptyFileManager()
    }
  }

  displayFiles(files) {
    const fileGrid = document.getElementById("fileGrid")
    const emptyState = document.getElementById("fileManagerEmpty")

    if (files.length === 0) {
      this.showEmptyFileManager()
      return
    }

    emptyState.style.display = "none"
    fileGrid.innerHTML = ""

    files.forEach((file) => {
      const fileItem = this.createFileItem(file)
      fileGrid.appendChild(fileItem)
    })
  }

  createFileItem(file) {
    const fileItem = document.createElement("div")
    fileItem.className = `file-item ${file.category}`
    fileItem.onclick = () => this.previewFile(file.url, file.name)

    const isImage = file.type && file.type.startsWith("image/")
    const thumbnail = isImage
      ? `<img src="${file.url}" alt="${file.name}">`
      : `<i class="fas fa-${this.getFileIcon(file.type)}"></i>`

    fileItem.innerHTML = `
            <div class="file-thumbnail">
                ${thumbnail}
            </div>
            <div class="file-name">${file.name}</div>
            <div class="file-meta">
                <div>${this.formatFileSize(file.size)}</div>
                <div>${new Date(file.uploadDate).toLocaleDateString()}</div>
            </div>
        `

    return fileItem
  }

  getFileIcon(fileType) {
    if (!fileType) return "file"
    if (fileType.includes("pdf")) return "file-pdf"
    if (fileType.includes("image")) return "image"
    if (fileType.includes("video")) return "video"
    if (fileType.includes("audio")) return "music"
    return "file"
  }

  showEmptyFileManager() {
    const fileGrid = document.getElementById("fileGrid")
    const emptyState = document.getElementById("fileManagerEmpty")

    fileGrid.innerHTML = ""
    emptyState.style.display = "block"
  }

  previewFile(fileUrl, fileName) {
    this.currentPreviewFile = { url: fileUrl, name: fileName }

    const modal = document.getElementById("filePreviewModal")
    const previewBody = document.getElementById("filePreviewBody")
    const previewFileName = document.getElementById("previewFileName")

    previewFileName.textContent = fileName

    // Determine file type and show appropriate preview
    const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)
    const isPDF = fileName.toLowerCase().endsWith(".pdf")

    if (isImage) {
      previewBody.innerHTML = `<img src="${fileUrl}" alt="${fileName}">`
    } else if (isPDF) {
      previewBody.innerHTML = `<iframe src="${fileUrl}" title="${fileName}"></iframe>`
    } else {
      previewBody.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <i class="fas fa-file" style="font-size: 4rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                    <p>Preview not available for this file type</p>
                    <button class="btn-primary" onclick="profileManager.downloadFile()">
                        <i class="fas fa-download"></i> Download File
                    </button>
                </div>
            `
    }

    const showModal = (modalId) => {
      // Placeholder for actual implementation
      document.getElementById(modalId).style.display = "block"
    }
    showModal("filePreviewModal")
  }

  downloadFile() {
    if (this.currentPreviewFile) {
      const link = document.createElement("a")
      link.href = this.currentPreviewFile.url
      link.download = this.currentPreviewFile.name
      link.click()
    }
  }

  async deleteFile() {
    if (!this.currentPreviewFile) return

    if (confirm("Are you sure you want to delete this file?")) {
      try {
        const blobStorage = {
          deleteFile: async (fileUrl, userId) => {
            // Placeholder for actual implementation
            // Remove file from localStorage or API
          },
        }
        await blobStorage.deleteFile(this.currentPreviewFile.url, this.currentUser.id)
        const hideModal = (modalId) => {
          // Placeholder for actual implementation
          document.getElementById(modalId).style.display = "none"
        }
        hideModal("filePreviewModal")
        this.loadUserFiles() // Refresh file list
        const showNotification = (message, type) => {
          // Placeholder for actual implementation
          alert(`${type.toUpperCase()}: ${message}`)
        }
        showNotification("File deleted successfully!", "success")
      } catch (error) {
        const showNotification = (message, type) => {
          // Placeholder for actual implementation
          alert(`${type.toUpperCase()}: ${message}`)
        }
        showNotification(`Delete failed: ${error.message}`, "error")
      }
    }
  }

  async deleteDocument(fileUrl) {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        const blobStorage = {
          deleteFile: async (fileUrl, userId) => {
            // Placeholder for actual implementation
            // Remove file from localStorage or API
          },
        }
        await blobStorage.deleteFile(fileUrl, this.currentUser.id)
        this.loadUserFiles() // Refresh file list
        const showNotification = (message, type) => {
          // Placeholder for actual implementation
          alert(`${type.toUpperCase()}: ${message}`)
        }
        showNotification("Document deleted successfully!", "success")

        // Reset document status
        // This would need to be implemented based on which document was deleted
      } catch (error) {
        const showNotification = (message, type) => {
          // Placeholder for actual implementation
          alert(`${type.toUpperCase()}: ${message}`)
        }
        showNotification(`Delete failed: ${error.message}`, "error")
      }
    }
  }

  saveProfile() {
    // Get form data
    const formData = {
      name: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      dob: document.getElementById("dob").value,
      address: document.getElementById("address").value,
    }

    // Update current user
    Object.assign(this.currentUser, formData)

    // Save to localStorage (in real app, this would be an API call)
    this.saveUserData()

    // Exit edit mode
    this.toggleEditMode()

    const showNotification = (message, type) => {
      // Placeholder for actual implementation
      alert(`${type.toUpperCase()}: ${message}`)
    }
    showNotification("Profile updated successfully!", "success")
  }

  saveUserData() {
    localStorage.setItem("userData", JSON.stringify(this.currentUser))
  }

  toggleEditMode() {
    this.editMode = !this.editMode

    const inputs = document.querySelectorAll("#profileForm input, #profileForm textarea")
    const formActions = document.querySelector(".form-actions")
    const editBtn = document.querySelector(".section-header .btn-secondary")

    inputs.forEach((input) => {
      input.readOnly = !this.editMode
    })

    formActions.style.display = this.editMode ? "flex" : "none"
    editBtn.innerHTML = this.editMode
      ? '<i class="fas fa-times"></i> Cancel Edit'
      : '<i class="fas fa-edit"></i> Edit Profile'
  }

  cancelEdit() {
    this.editMode = false
    this.updateProfileDisplay() // Reset form to original values
    this.toggleEditMode()
  }
}

// File filtering functionality
function filterFiles(category) {
  const filterBtns = document.querySelectorAll(".filter-btn")
  const fileItems = document.querySelectorAll(".file-item")

  // Update active filter button
  filterBtns.forEach((btn) => btn.classList.remove("active"))
  event.target.classList.add("active")

  // Show/hide files based on category
  fileItems.forEach((item) => {
    if (category === "all" || item.classList.contains(category)) {
      item.classList.remove("hidden")
    } else {
      item.classList.add("hidden")
    }
  })
}

// Global functions for HTML onclick handlers
function triggerAvatarUpload() {
  document.getElementById("avatarUpload").click()
}

function triggerFileUpload(inputId, docType) {
  document.getElementById(inputId).click()
}

function toggleEditMode() {
  profileManager.toggleEditMode()
}

function cancelEdit() {
  profileManager.cancelEdit()
}

function downloadFile() {
  profileManager.downloadFile()
}

function deleteFile() {
  profileManager.deleteFile()
}

// Initialize profile manager
const profileManager = new ProfileManager()
