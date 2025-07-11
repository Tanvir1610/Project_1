// File Versioning Service
class FileVersioningService {
  constructor() {
    this.versions = new Map()
    this.maxVersions = 10
    this.versionHistory = []
    this.autoVersioning = true
    this.compressionEnabled = true
    this.init()
  }

  init() {
    this.loadVersionHistory()
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Listen for file uploads
    window.addEventListener("fileUploaded", (e) => {
      if (this.autoVersioning) {
        this.createVersion(e.detail.fileId, e.detail.file)
      }
    })

    // Listen for file updates
    window.addEventListener("fileUpdated", (e) => {
      if (this.autoVersioning) {
        this.createVersion(e.detail.fileId, e.detail.file, "update")
      }
    })
  }

  // Create new version
  async createVersion(fileId, file, changeType = "upload") {
    try {
      const versionId = this.generateVersionId()
      const timestamp = new Date().toISOString()
      const userId = window.getCurrentUser()?.id

      // Get current versions for this file
      const fileVersions = this.getFileVersions(fileId)

      // Create version metadata
      const versionData = {
        id: versionId,
        fileId: fileId,
        version: fileVersions.length + 1,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        changeType: changeType,
        createdBy: userId,
        createdAt: timestamp,
        checksum: await this.calculateChecksum(file),
        tags: [],
        comment: "",
        isActive: true,
      }

      // Store file data
      if (this.compressionEnabled && this.isCompressible(file)) {
        versionData.compressedFile = await this.compressFile(file)
        versionData.compressed = true
      } else {
        versionData.fileData = file
        versionData.compressed = false
      }

      // Add to versions map
      if (!this.versions.has(fileId)) {
        this.versions.set(fileId, [])
      }

      const versions = this.versions.get(fileId)
      versions.push(versionData)

      // Enforce version limit
      if (versions.length > this.maxVersions) {
        const removedVersion = versions.shift()
        await this.cleanupVersion(removedVersion)
      }

      // Update version history
      this.versionHistory.unshift({
        fileId: fileId,
        versionId: versionId,
        action: "created",
        timestamp: timestamp,
        userId: userId,
      })

      // Save to storage
      await this.saveVersionData(fileId, versionData)
      this.saveVersionHistory()

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("versionCreated", {
          detail: versionData,
        }),
      )

      return versionData
    } catch (error) {
      console.error("Failed to create version:", error)
      throw error
    }
  }

  // Get all versions for a file
  getFileVersions(fileId) {
    return this.versions.get(fileId) || []
  }

  // Get specific version
  getVersion(fileId, versionId) {
    const versions = this.getFileVersions(fileId)
    return versions.find((v) => v.id === versionId)
  }

  // Get latest version
  getLatestVersion(fileId) {
    const versions = this.getFileVersions(fileId)
    return versions[versions.length - 1]
  }

  // Restore version
  async restoreVersion(fileId, versionId) {
    try {
      const version = this.getVersion(fileId, versionId)
      if (!version) {
        throw new Error("Version not found")
      }

      // Get file data
      let fileData
      if (version.compressed && version.compressedFile) {
        fileData = await this.decompressFile(version.compressedFile)
      } else {
        fileData = version.fileData
      }

      if (!fileData) {
        throw new Error("Version file data not available")
      }

      // Create new file from version data
      const restoredFile = new File([fileData], version.fileName, {
        type: version.fileType,
        lastModified: Date.now(),
      })

      // Upload restored file
      const userId = window.getCurrentUser()?.id
      const restoredUrl = await window.blobStorage.uploadFile(
        restoredFile,
        "restored",
        userId,
        `${fileId}_restored_${versionId}`,
      )

      // Create restore record
      const restoreRecord = {
        fileId: fileId,
        versionId: versionId,
        restoredUrl: restoredUrl,
        restoredBy: userId,
        restoredAt: new Date().toISOString(),
      }

      // Log restore action
      this.versionHistory.unshift({
        fileId: fileId,
        versionId: versionId,
        action: "restored",
        timestamp: restoreRecord.restoredAt,
        userId: userId,
      })

      this.saveVersionHistory()

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("versionRestored", {
          detail: restoreRecord,
        }),
      )

      return restoreRecord
    } catch (error) {
      console.error("Failed to restore version:", error)
      throw error
    }
  }

  // Compare versions
  async compareVersions(fileId, versionId1, versionId2) {
    try {
      const version1 = this.getVersion(fileId, versionId1)
      const version2 = this.getVersion(fileId, versionId2)

      if (!version1 || !version2) {
        throw new Error("One or both versions not found")
      }

      const comparison = {
        version1: {
          id: version1.id,
          version: version1.version,
          fileName: version1.fileName,
          fileSize: version1.fileSize,
          createdAt: version1.createdAt,
          checksum: version1.checksum,
        },
        version2: {
          id: version2.id,
          version: version2.version,
          fileName: version2.fileName,
          fileSize: version2.fileSize,
          createdAt: version2.createdAt,
          checksum: version2.checksum,
        },
        differences: {
          nameChanged: version1.fileName !== version2.fileName,
          sizeChanged: version1.fileSize !== version2.fileSize,
          contentChanged: version1.checksum !== version2.checksum,
          sizeDifference: version2.fileSize - version1.fileSize,
          timeDifference: new Date(version2.createdAt) - new Date(version1.createdAt),
        },
      }

      return comparison
    } catch (error) {
      console.error("Failed to compare versions:", error)
      throw error
    }
  }

  // Delete version
  async deleteVersion(fileId, versionId) {
    try {
      const versions = this.versions.get(fileId)
      if (!versions) return false

      const versionIndex = versions.findIndex((v) => v.id === versionId)
      if (versionIndex === -1) return false

      const version = versions[versionIndex]

      // Remove from array
      versions.splice(versionIndex, 1)

      // Cleanup version data
      await this.cleanupVersion(version)

      // Log deletion
      this.versionHistory.unshift({
        fileId: fileId,
        versionId: versionId,
        action: "deleted",
        timestamp: new Date().toISOString(),
        userId: window.getCurrentUser()?.id,
      })

      this.saveVersionHistory()

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("versionDeleted", {
          detail: { fileId, versionId },
        }),
      )

      return true
    } catch (error) {
      console.error("Failed to delete version:", error)
      throw error
    }
  }

  // Add version comment/tag
  async updateVersionMetadata(fileId, versionId, metadata) {
    try {
      const version = this.getVersion(fileId, versionId)
      if (!version) {
        throw new Error("Version not found")
      }

      // Update metadata
      if (metadata.comment !== undefined) {
        version.comment = metadata.comment
      }

      if (metadata.tags !== undefined) {
        version.tags = metadata.tags
      }

      version.updatedAt = new Date().toISOString()

      // Save changes
      await this.saveVersionData(fileId, version)

      return version
    } catch (error) {
      console.error("Failed to update version metadata:", error)
      throw error
    }
  }

  // Get version timeline
  getVersionTimeline(fileId) {
    const versions = this.getFileVersions(fileId)
    const timeline = versions.map((version) => ({
      id: version.id,
      version: version.version,
      changeType: version.changeType,
      createdAt: version.createdAt,
      createdBy: version.createdBy,
      comment: version.comment,
      tags: version.tags,
      fileSize: version.fileSize,
    }))

    return timeline.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Get version statistics
  getVersionStats(fileId) {
    const versions = this.getFileVersions(fileId)
    if (versions.length === 0) return null

    const totalSize = versions.reduce((sum, v) => sum + v.fileSize, 0)
    const averageSize = totalSize / versions.length
    const latestVersion = versions[versions.length - 1]
    const oldestVersion = versions[0]

    return {
      totalVersions: versions.length,
      totalSize: this.formatFileSize(totalSize),
      averageSize: this.formatFileSize(averageSize),
      latestVersion: latestVersion.version,
      oldestVersion: oldestVersion.version,
      createdSpan: new Date(latestVersion.createdAt) - new Date(oldestVersion.createdAt),
      changeTypes: this.getChangeTypeStats(versions),
    }
  }

  // Get change type statistics
  getChangeTypeStats(versions) {
    const stats = {}
    versions.forEach((version) => {
      stats[version.changeType] = (stats[version.changeType] || 0) + 1
    })
    return stats
  }

  // Compress file for storage
  async compressFile(file) {
    try {
      // Use compression for text files, images handled separately
      if (this.isTextFile(file)) {
        const text = await file.text()
        const compressed = this.compressText(text)
        return new Blob([compressed], { type: "application/gzip" })
      }

      return file
    } catch (error) {
      console.error("File compression failed:", error)
      return file
    }
  }

  // Decompress file
  async decompressFile(compressedBlob) {
    try {
      // Simple decompression implementation
      const arrayBuffer = await compressedBlob.arrayBuffer()
      return new Blob([arrayBuffer])
    } catch (error) {
      console.error("File decompression failed:", error)
      return compressedBlob
    }
  }

  // Simple text compression
  compressText(text) {
    // Basic compression - in real app, use proper compression library
    return new TextEncoder().encode(text)
  }

  // Check if file is compressible
  isCompressible(file) {
    const compressibleTypes = [
      "text/",
      "application/json",
      "application/xml",
      "application/javascript",
      "application/css",
    ]
    return compressibleTypes.some((type) => file.type.startsWith(type))
  }

  // Check if file is text
  isTextFile(file) {
    return file.type.startsWith("text/") || file.type === "application/json" || file.type === "application/xml"
  }

  // Calculate file checksum
  async calculateChecksum(file) {
    try {
      const buffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      return hashHex
    } catch (error) {
      console.error("Failed to calculate checksum:", error)
      return null
    }
  }

  // Generate version ID
  generateVersionId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `v_${timestamp}_${random}`
  }

  // Cleanup version data
  async cleanupVersion(version) {
    try {
      // Remove from blob storage if needed
      if (version.storageUrl) {
        await window.blobStorage.deleteFile(version.storageUrl, version.createdBy)
      }
    } catch (error) {
      console.error("Failed to cleanup version:", error)
    }
  }

  // Save version data
  async saveVersionData(fileId, versionData) {
    try {
      // Save to blob storage for persistence
      const versionBlob = new Blob([JSON.stringify(versionData)], {
        type: "application/json",
      })

      const storageUrl = await window.blobStorage.uploadFile(
        versionBlob,
        "versions",
        versionData.createdBy,
        `${fileId}_${versionData.id}`,
      )

      versionData.storageUrl = storageUrl
    } catch (error) {
      console.error("Failed to save version data:", error)
    }
  }

  // Save version history
  saveVersionHistory() {
    try {
      localStorage.setItem("versionHistory", JSON.stringify(this.versionHistory))
    } catch (error) {
      console.error("Failed to save version history:", error)
    }
  }

  // Load version history
  loadVersionHistory() {
    try {
      const history = localStorage.getItem("versionHistory")
      if (history) {
        this.versionHistory = JSON.parse(history)
      }
    } catch (error) {
      console.error("Failed to load version history:", error)
      this.versionHistory = []
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

  // Export version history
  exportVersionHistory(fileId) {
    const versions = this.getFileVersions(fileId)
    const timeline = this.getVersionTimeline(fileId)
    const stats = this.getVersionStats(fileId)

    const exportData = {
      fileId: fileId,
      exportedAt: new Date().toISOString(),
      versions: versions.map((v) => ({
        id: v.id,
        version: v.version,
        fileName: v.fileName,
        fileSize: v.fileSize,
        changeType: v.changeType,
        createdAt: v.createdAt,
        createdBy: v.createdBy,
        comment: v.comment,
        tags: v.tags,
        checksum: v.checksum,
      })),
      timeline: timeline,
      statistics: stats,
    }

    return exportData
  }

  // Import version history
  async importVersionHistory(importData) {
    try {
      const fileId = importData.fileId

      // Validate import data
      if (!importData.versions || !Array.isArray(importData.versions)) {
        throw new Error("Invalid import data")
      }

      // Import versions
      this.versions.set(fileId, importData.versions)

      // Update version history
      importData.versions.forEach((version) => {
        this.versionHistory.unshift({
          fileId: fileId,
          versionId: version.id,
          action: "imported",
          timestamp: new Date().toISOString(),
          userId: window.getCurrentUser()?.id,
        })
      })

      this.saveVersionHistory()

      return true
    } catch (error) {
      console.error("Failed to import version history:", error)
      throw error
    }
  }
}

// Initialize file versioning service
const fileVersioning = new FileVersioningService()
