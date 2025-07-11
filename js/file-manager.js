// File Manager functionality
class FileManager {
  constructor() {
    this.currentUser = null
    this.files = []
    this.selectedFiles = []
    this.currentFilter = "all"
    this.currentView = "grid"
    this.uploadQueue = []
    this.currentPreviewFile = null
    this.init()
  }

  init() {
    this.loadUserData()
    this.setupEventListeners()
    this.loadFiles()
    this.updateStats()
  }

  loadUserData() {
    this.currentUser = window.getCurrentUser() || {
      id: "FLT001234",
      name: "John Doe",
    }
  }

  setupEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll(".filter-btn")
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setFilter(e.target.dataset.filter)
      })
    })

    // View toggle
    const viewBtns = document.querySelectorAll(".view-btn")
    viewBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setView(e.target.dataset.view)
      })
    })

    // Search input
    const searchInput = document.getElementById("fileSearch")
    searchInput.addEventListener("input", (e) => {
      this.searchFiles(e.target.value)
    })

    // File input for upload
    const fileInput = document.getElementById("fileInput")
    fileInput.addEventListener("change", (e) => {
      this.addFilesToQueue(e.target.files)
    })

    // Upload area drag and drop
    this.setupDragAndDrop()
  }

  setupDragAndDrop() {
    const uploadArea = document.getElementById("uploadArea")

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadArea.classList.add("drag-over")
    })

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("drag-over")
    })

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadArea.classList.remove("drag-over")
      this.addFilesToQueue(e.dataTransfer.files)
    })

    uploadArea.addEventListener("click", () => {
      document.getElementById("fileInput").click()
    })
  }

  async loadFiles() {
    try {
      this.showLoadingSkeleton()
      const files = await window.blobStorage.listFiles(this.currentUser.id)
      this.files = files.map((file) => ({
        ...file,
        selected: false,
      }))
      this.displayFiles()
      this.updateStats()
    } catch (error) {
      console.error("Failed to load files:", error)
      this.showEmptyState()
    }
  }

  displayFiles() {
    if (this.files.length === 0) {
      this.showEmptyState()
      return
    }

    this.hideEmptyState()

    if (this.currentView === "grid") {
      this.displayGridView()
    } else {
      this.displayListView()
    }
  }

  displayGridView() {
    const fileGrid = document.getElementById("fileGrid")
    const fileList = document.getElementById("fileList")

    fileGrid.style.display = "grid"
    fileList.style.display = "none"

    fileGrid.innerHTML = ""

    const filteredFiles = this.getFilteredFiles()

    filteredFiles.forEach((file) => {
      const fileItem = this.createGridFileItem(file)
      fileGrid.appendChild(fileItem)
    })
  }

  displayListView() {
    const fileGrid = document.getElementById("fileGrid")
    const fileList = document.getElementById("fileList")
    const tableBody = document.getElementById("fileTableBody")

    fileGrid.style.display = "none"
    fileList.style.display = "block"

    tableBody.innerHTML = ""

    const filteredFiles = this.getFilteredFiles()

    filteredFiles.forEach((file) => {
      const fileRow = this.createListFileItem(file)
      tableBody.appendChild(fileRow)
    })
  }

  createGridFileItem(file) {
    const fileItem = document.createElement("div")
    fileItem.className = `file-item ${file.category} ${file.selected ? "selected" : ""}`
    fileItem.dataset.fileId = file.id

    const isImage = file.type && file.type.startsWith("image/")
    const thumbnail = isImage
      ? `<img src="${file.url}" alt="${file.name}" loading="lazy">`
      : `<i class="fas fa-${this.getFileIcon(file.type)}"></i>`

    fileItem.innerHTML = `
            <input type="checkbox" class="file-checkbox" ${file.selected ? "checked" : ""} 
                   onchange="fileManager.toggleFileSelection('${file.id}')">
            <div class="file-thumbnail" onclick="fileManager.previewFile('${file.id}')">
                ${thumbnail}
            </div>
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-meta">
                    <span>${this.formatFileSize(file.size)}</span>
                    <span>${new Date(file.uploadDate).toLocaleDateString()}</span>
                </div>
                <div class="file-category">${file.category}</div>
                <div class="file-actions">
                    <button class="file-action-btn btn-view" onclick="fileManager.previewFile('${file.id}')" title="Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="file-action-btn btn-download" onclick="fileManager.downloadFile('${file.id}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-action-btn btn-delete" onclick="fileManager.deleteFile('${file.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `

    return fileItem
  }

  createListFileItem(file) {
    const fileRow = document.createElement("tr")
    fileRow.className = file.selected ? "selected" : ""
    fileRow.dataset.fileId = file.id

    const isImage = file.type && file.type.startsWith("image/")
    const icon = `<i class="fas fa-${this.getFileIcon(file.type)}"></i>`

    fileRow.innerHTML = `
            <td>
                <input type="checkbox" ${file.selected ? "checked" : ""} 
                       onchange="fileManager.toggleFileSelection('${file.id}')" style="margin-right: 0.5rem;">
                <div class="table-file-name">
                    <div class="table-file-icon">${icon}</div>
                    <span onclick="fileManager.previewFile('${file.id}')" style="cursor: pointer;">${file.name}</span>
                </div>
            </td>
            <td>${file.category}</td>
            <td>${this.formatFileSize(file.size)}</td>
            <td>${new Date(file.uploadDate).toLocaleDateString()}</td>
            <td>
                <div class="table-actions">
                    <button class="file-action-btn btn-view" onclick="fileManager.previewFile('${file.id}')" title="Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="file-action-btn btn-download" onclick="fileManager.downloadFile('${file.id}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="file-action-btn btn-delete" onclick="fileManager.deleteFile('${file.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `

    return fileRow
  }

  getFilteredFiles() {
    let filtered = this.files

    // Apply category filter
    if (this.currentFilter !== "all") {
      filtered = filtered.filter((file) => file.category === this.currentFilter)
    }

    // Apply search filter
    const searchTerm = document.getElementById("fileSearch").value.toLowerCase()
    if (searchTerm) {
      filtered = filtered.filter((file) => file.name.toLowerCase().includes(searchTerm))
    }

    return filtered
  }

  setFilter(filter) {
    this.currentFilter = filter

    // Update active filter button
    const filterBtns = document.querySelectorAll(".filter-btn")
    filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter)
    })

    this.displayFiles()
  }

  setView(view) {
    this.currentView = view

    // Update active view button
    const viewBtns = document.querySelectorAll(".view-btn")
    viewBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view)
    })

    this.displayFiles()
  }

  searchFiles(searchTerm) {
    this.displayFiles()
  }

  toggleFileSelection(fileId) {
    const file = this.files.find((f) => f.id === fileId)
    if (file) {
      file.selected = !file.selected

      // Update selected files array
      if (file.selected) {
        this.selectedFiles.push(fileId)
      } else {
        this.selectedFiles = this.selectedFiles.filter((id) => id !== fileId)
      }

      this.updateBulkActions()
      this.displayFiles()
    }
  }

  updateBulkActions() {
    const bulkActions = document.getElementById("bulkActions")
    const selectedCount = document.getElementById("selectedCount")

    if (this.selectedFiles.length > 0) {
      bulkActions.style.display = "flex"
      selectedCount.textContent = this.selectedFiles.length
    } else {
      bulkActions.style.display = "none"
    }
  }

  clearSelection() {
    this.selectedFiles = []
    this.files.forEach((file) => (file.selected = false))
    this.updateBulkActions()
    this.displayFiles()
  }

  async downloadSelected() {
    if (this.selectedFiles.length === 0) return

    for (const fileId of this.selectedFiles) {
      const file = this.files.find((f) => f.id === fileId)
      if (file) {
        this.downloadFile(fileId)
        // Add small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
  }

  async deleteSelected() {
    if (this.selectedFiles.length === 0) return

    if (confirm(`Are you sure you want to delete ${this.selectedFiles.length} selected files?`)) {
      try {
        for (const fileId of this.selectedFiles) {
          const file = this.files.find((f) => f.id === fileId)
          if (file) {
            await window.blobStorage.deleteFile(file.url, this.currentUser.id)
          }
        }

        window.showNotification(`${this.selectedFiles.length} files deleted successfully!`, "success")
        this.clearSelection()
        this.loadFiles()
      } catch (error) {
        window.showNotification(`Delete failed: ${error.message}`, "error")
      }
    }
  }

  previewFile(fileId) {
    const file = this.files.find((f) => f.id === fileId)
    if (!file) return

    this.currentPreviewFile = file

    const modal = document.getElementById("filePreviewModal")
    const previewBody = document.getElementById("filePreviewBody")
    const previewFileName = document.getElementById("previewFileName")

    previewFileName.textContent = file.name

    // Determine file type and show appropriate preview
    const isImage = file.type && file.type.startsWith("image/")
    const isPDF = file.name.toLowerCase().endsWith(".pdf")

    if (isImage) {
      previewBody.innerHTML = `<img src="${file.url}" alt="${file.name}">`
    } else if (isPDF) {
      previewBody.innerHTML = `<iframe src="${file.url}" title="${file.name}"></iframe>`
    } else {
      previewBody.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-file"></i>
                    <h3>Preview not available</h3>
                    <p>This file type cannot be previewed in the browser</p>
                    <button class="btn-primary" onclick="fileManager.downloadCurrentFile()">
                        <i class="fas fa-download"></i> Download File
                    </button>
                </div>
            `
    }

    window.showModal("filePreviewModal")
  }

  downloadFile(fileId) {
    const file = this.files.find((f) => f.id === fileId)
    if (!file) return

    const link = document.createElement("a")
    link.href = file.url
    link.download = file.name
    link.click()
  }

  downloadCurrentFile() {
    if (this.currentPreviewFile) {
      this.downloadFile(this.currentPreviewFile.id)
    }
  }

  async deleteFile(fileId) {
    const file = this.files.find((f) => f.id === fileId)
    if (!file) return

    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        await window.blobStorage.deleteFile(file.url, this.currentUser.id)
        window.showNotification("File deleted successfully!", "success")
        this.loadFiles()
      } catch (error) {
        window.showNotification(`Delete failed: ${error.message}`, "error")
      }
    }
  }

  async deleteCurrentFile() {
    if (this.currentPreviewFile) {
      await this.deleteFile(this.currentPreviewFile.id)
      window.hideModal("filePreviewModal")
    }
  }

  addFilesToQueue(files) {
    Array.from(files).forEach((file) => {
      const queueItem = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "pending",
      }
      this.uploadQueue.push(queueItem)
    })

    this.displayUploadQueue()
    this.showUploadQueue()
  }

  displayUploadQueue() {
    const queueList = document.getElementById("queueList")
    queueList.innerHTML = ""

    this.uploadQueue.forEach((item) => {
      const queueItem = this.createQueueItem(item)
      queueList.appendChild(queueItem)
    })
  }

  createQueueItem(item) {
    const queueItem = document.createElement("div")
    queueItem.className = "queue-item"
    queueItem.dataset.itemId = item.id

    const icon = `<i class="fas fa-${this.getFileIcon(item.file.type)}"></i>`

    queueItem.innerHTML = `
            <div class="queue-item-icon">${icon}</div>
            <div class="queue-item-info">
                <div class="queue-item-name">${item.name}</div>
                <div class="queue-item-size">${this.formatFileSize(item.size)}</div>
            </div>
            <div class="queue-item-progress">
                <div class="queue-item-progress-bar" style="width: ${item.progress}%"></div>
            </div>
            <div class="queue-item-status">${item.status}</div>
        `

    return queueItem
  }

  showUploadQueue() {
    const uploadArea = document.getElementById("uploadArea")
    const uploadQueue = document.getElementById("uploadQueue")

    uploadArea.style.display = "none"
    uploadQueue.style.display = "block"
  }

  hideUploadQueue() {
    const uploadArea = document.getElementById("uploadArea")
    const uploadQueue = document.getElementById("uploadQueue")

    uploadArea.style.display = "block"
    uploadQueue.style.display = "none"
    this.uploadQueue = []
  }

  async startUpload() {
    if (this.uploadQueue.length === 0) return

    for (const item of this.uploadQueue) {
      try {
        item.status = "uploading"
        this.updateQueueItem(item)

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          item.progress += 10
          this.updateQueueItem(item)

          if (item.progress >= 100) {
            clearInterval(progressInterval)
          }
        }, 200)

        // Determine category based on file type
        let category = "uploads"
        if (item.file.type.startsWith("image/")) {
          category = "profile"
        }

        const fileUrl = await window.blobStorage.uploadFile(item.file, category, this.currentUser.id)

        item.status = "completed"
        item.progress = 100
        this.updateQueueItem(item)
      } catch (error) {
        item.status = "failed"
        this.updateQueueItem(item)
        console.error("Upload failed:", error)
      }
    }

    // Refresh file list and hide upload queue after a delay
    setTimeout(() => {
      this.loadFiles()
      this.hideUploadQueue()
      window.hideModal("uploadModal")
      window.showNotification("Files uploaded successfully!", "success")
    }, 1000)
  }

  updateQueueItem(item) {
    const queueItem = document.querySelector(`[data-item-id="${item.id}"]`)
    if (queueItem) {
      const progressBar = queueItem.querySelector(".queue-item-progress-bar")
      const status = queueItem.querySelector(".queue-item-status")

      progressBar.style.width = `${item.progress}%`
      status.textContent = item.status

      // Update status color
      status.className = `queue-item-status status-${item.status}`
    }
  }

  clearQueue() {
    this.uploadQueue = []
    this.hideUploadQueue()
  }

  updateStats() {
    const totalFiles = this.files.length
    const totalSize = this.files.reduce((sum, file) => sum + file.size, 0)
    const imageFiles = this.files.filter((file) => file.type && file.type.startsWith("image/")).length
    const documentFiles = this.files.filter((file) => file.type && file.type.includes("pdf")).length

    document.getElementById("totalFiles").textContent = totalFiles
    document.getElementById("totalSize").textContent = this.formatFileSize(totalSize)
    document.getElementById("imageFiles").textContent = imageFiles
    document.getElementById("documentFiles").textContent = documentFiles
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  getFileIcon(fileType) {
    if (!fileType) return "file"
    if (fileType.includes("pdf")) return "file-pdf"
    if (fileType.includes("image")) return "image"
    if (fileType.includes("video")) return "video"
    if (fileType.includes("audio")) return "music"
    if (fileType.includes("text")) return "file-alt"
    if (fileType.includes("zip") || fileType.includes("rar")) return "file-archive"
    return "file"
  }

  showLoadingSkeleton() {
    const fileGrid = document.getElementById("fileGrid")
    fileGrid.innerHTML = ""

    // Create skeleton items
    for (let i = 0; i < 8; i++) {
      const skeleton = document.createElement("div")
      skeleton.className = "file-item loading-skeleton"
      skeleton.style.height = "200px"
      fileGrid.appendChild(skeleton)
    }
  }

  showEmptyState() {
    const fileGrid = document.getElementById("fileGrid")
    const fileList = document.getElementById("fileList")
    const emptyState = document.getElementById("fileManagerEmpty")

    fileGrid.style.display = "none"
    fileList.style.display = "none"
    emptyState.style.display = "block"
  }

  hideEmptyState() {
    const emptyState = document.getElementById("fileManagerEmpty")
    emptyState.style.display = "none"
  }

  refreshFiles() {
    this.loadFiles()
    window.showNotification("Files refreshed!", "success")
  }
}

// Global functions for HTML onclick handlers
function showUploadModal() {
  window.showModal("uploadModal")
}

function refreshFiles() {
  fileManager.refreshFiles()
}

function startUpload() {
  fileManager.startUpload()
}

function clearQueue() {
  fileManager.clearQueue()
}

function downloadSelected() {
  fileManager.downloadSelected()
}

function deleteSelected() {
  fileManager.deleteSelected()
}

function clearSelection() {
  fileManager.clearSelection()
}

function downloadCurrentFile() {
  fileManager.downloadCurrentFile()
}

function deleteCurrentFile() {
  fileManager.deleteCurrentFile()
}

// Initialize file manager
const fileManager = new FileManager()
