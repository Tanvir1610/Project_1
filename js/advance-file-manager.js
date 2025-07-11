// Advanced File Manager Controller
class AdvancedFileManager {
  constructor() {
    this.currentTab = "compression"
    this.selectedFiles = new Set()
    this.selectedVersions = new Set()
    this.init()
  }

  init() {
    this.setupTabs()
    this.setupEventListeners()
    this.loadInitialData()
    this.setupDragAndDrop()
  }

  setupTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".tab-content")

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab

        // Update active tab button
        tabBtns.forEach((b) => b.classList.remove("active"))
        btn.classList.add("active")

        // Update active tab content
        tabContents.forEach((content) => {
          content.classList.remove("active")
          if (content.id === `${tabId}-tab`) {
            content.classList.add("active")
          }
        })

        this.currentTab = tabId
        this.loadTabData(tabId)
      })
    })
  }

  setupEventListeners() {
    // Compression events
    document.getElementById("compressionFiles")?.addEventListener("change", (e) => {
      this.handleCompressionUpload(e.target.files)
    })

    // Auto versioning toggle
    document.getElementById("autoVersioning")?.addEventListener("change", (e) => {
      window.fileVersioning.autoVersioning = e.target.checked
    })

    // Max versions setting
    document.getElementById("maxVersions")?.addEventListener("change", (e) => {
      window.fileVersioning.maxVersions = Number.parseInt(e.target.value)
    })

    // CDN optimization toggles
    const cdnToggles = ["cdnImageOptimization", "cdnCompression", "cdnLazyLoading", "cdnWebpConversion"]
    cdnToggles.forEach((toggleId) => {
      document.getElementById(toggleId)?.addEventListener("change", (e) => {
        this.updateCDNSettings(toggleId.replace("cdn", "").toLowerCase(), e.target.checked)
      })
    })

    // Progress events
    window.addEventListener("compressionProgress", (e) => {
      this.updateCompressionProgress(e.detail)
    })

    window.addEventListener("backupProgress", (e) => {
      this.updateBackupProgress(e.detail)
    })

    window.addEventListener("versionCreated", (e) => {
      this.refreshVersionData()
    })
  }

  setupDragAndDrop() {
    const uploadZones = document.querySelectorAll(".upload-zone")

    uploadZones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault()
        zone.classList.add("dragover")
      })

      zone.addEventListener("dragleave", (e) => {
        e.preventDefault()
        zone.classList.remove("dragover")
      })

      zone.addEventListener("drop", (e) => {
        e.preventDefault()
        zone.classList.remove("dragover")

        const files = Array.from(e.dataTransfer.files)
        if (zone.id === "compressionUpload") {
          this.handleCompressionUpload(files)
        }
      })
    })
  }

  async loadInitialData() {
    try {
      await this.loadFileSelects()
      await this.loadSharedFiles()
      await this.loadBackupHistory()
      await this.loadCDNStats()
    } catch (error) {
      console.error("Failed to load initial data:", error)
    }
  }

  async loadTabData(tabId) {
    switch (tabId) {
      case "sharing":
        await this.loadSharedFiles()
        break
      case "versioning":
        await this.loadVersionData()
        break
      case "backup":
        await this.loadBackupHistory()
        break
      case "cdn":
        await this.loadCDNStats()
        break
    }
  }

  // Compression Methods
  async handleCompressionUpload(files) {
    if (!files || files.length === 0) return

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"))
    if (imageFiles.length === 0) {
      this.showMessage("Please select image files for compression.", "warning")
      return
    }

    try {
      document.getElementById("compressionResults").style.display = "block"

      const compressionLevel = document.getElementById("compressionLevel").value
      const maxWidth = Number.parseInt(document.getElementById("maxWidth").value)
      const maxHeight = Number.parseInt(document.getElementById("maxHeight").value)

      const options = {
        ...window.imageCompression.compressionLevels[compressionLevel],
        maxWidth,
        maxHeight,
      }

      const results = await window.imageCompression.compressImages(imageFiles, options)
      this.displayCompressionResults(results)
    } catch (error) {
      console.error("Compression failed:", error)
      this.showMessage("Compression failed: " + error.message, "error")
    }
  }

  displayCompressionResults(results) {
    const grid = document.getElementById("compressionGrid")
    const stats = document.getElementById("compressionStats")

    if (!grid || !stats) return

    // Clear previous results
    grid.innerHTML = ""

    // Display individual results
    results.forEach((result) => {
      const card = document.createElement("div")
      card.className = "result-card"

      if (result.success) {
        const preview = window.imageCompression.createCompressionPreview(result.original, result.compressed)
        card.innerHTML = `
          <div class="file-info">
            <span class="file-name">${result.original.name}</span>
            <span class="savings">${result.savings}% saved</span>
          </div>
          <div class="size-comparison">
            <div>Original: ${preview.originalSize}</div>
            <div>Compressed: ${preview.compressedSize}</div>
          </div>
          <div class="preview-images">
            <img src="${preview.originalPreview}" alt="Original" style="width: 100px; height: 60px; object-fit: cover;">
            <img src="${preview.compressedPreview}" alt="Compressed" style="width: 100px; height: 60px; object-fit: cover;">
          </div>
          <button class="btn btn-sm btn-primary" onclick="advancedFileManager.downloadCompressed('${result.compressed.name}')">
            <i class="fas fa-download"></i> Download
          </button>
        `
      } else {
        card.innerHTML = `
          <div class="file-info">
            <span class="file-name">${result.original.name}</span>
            <span class="error">Failed</span>
          </div>
          <div class="error-message">${result.error}</div>
        `
      }

      grid.appendChild(card)
    })

    // Display statistics
    const compressionStats = window.imageCompression.getCompressionStats(results)
    stats.innerHTML = `
      <div class="stat-item">
        <span class="stat-value">${compressionStats.successfulCompressions}</span>
        <span class="stat-label">Successful</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${compressionStats.totalOriginalSize}</span>
        <span class="stat-label">Original Size</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${compressionStats.totalCompressedSize}</span>
        <span class="stat-label">Compressed Size</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${compressionStats.averageSavings}</span>
        <span class="stat-label">Avg Savings</span>
      </div>
    `
  }

  updateCompressionProgress(detail) {
    const progressBars = document.querySelectorAll(".compression-progress")
    progressBars.forEach((bar) => {
      bar.style.width = `${detail.percentage}%`
    })
  }

  // File Sharing Methods
  async loadFileSelects() {
    try {
      const userId = window.getCurrentUser()?.id
      const files = await window.blobStorage.listFiles(userId)

      const selects = ["shareFileSelect", "versionFileSelect"]
      selects.forEach((selectId) => {
        const select = document.getElementById(selectId)
        if (select) {
          select.innerHTML = '<option value="">Choose a file...</option>'
          files.forEach((file) => {
            const option = document.createElement("option")
            option.value = file.id
            option.textContent = file.name
            select.appendChild(option)
          })
        }
      })
    } catch (error) {
      console.error("Failed to load file selects:", error)
    }
  }

  async createShareLink() {
    try {
      const fileId = document.getElementById("shareFileSelect").value
      const expiry = document.getElementById("shareExpiry").value
      const password = document.getElementById("sharePassword").value
      const permissions = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value)

      if (!fileId) {
        this.showMessage("Please select a file to share.", "warning")
        return
      }

      const options = {
        expiresAt: expiry ? new Date(expiry).toISOString() : undefined,
        password: password || null,
        permissions: permissions,
      }

      const shareResult = await window.fileSharing.createShareLink(fileId, options)

      // Show share modal
      document.getElementById("generatedShareLink").value = shareResult.shareUrl
      document.getElementById("shareExpiryDisplay").textContent = new Date(shareResult.expiresAt).toLocaleString()
      document.getElementById("sharePermissionsDisplay").textContent = shareResult.permissions.join(", ")

      this.showModal("shareModal")

      // Refresh shared files list
      await this.loadSharedFiles()
    } catch (error) {
      console.error("Failed to create share link:", error)
      this.showMessage("Failed to create share link: " + error.message, "error")
    }
  }

  async shareWithUser() {
    try {
      const fileId = document.getElementById("shareFileSelect").value
      const userEmail = document.getElementById("shareUserEmail").value
      const message = document.getElementById("shareMessage").value

      if (!fileId || !userEmail) {
        this.showMessage("Please select a file and enter user email.", "warning")
        return
      }

      // Mock user ID lookup - in real app, would lookup by email
      const userId = `user_${userEmail.replace("@", "_").replace(".", "_")}`

      await window.fileSharing.shareWithUsers(fileId, [userId])

      this.showMessage("File shared successfully with " + userEmail, "success")

      // Clear form
      document.getElementById("shareUserEmail").value = ""
      document.getElementById("shareMessage").value = ""

      await this.loadSharedFiles()
    } catch (error) {
      console.error("Failed to share with user:", error)
      this.showMessage("Failed to share with user: " + error.message, "error")
    }
  }

  async shareWithAdmin() {
    try {
      const fileId = document.getElementById("shareFileSelect").value
      const message = document.getElementById("adminMessage").value

      if (!fileId) {
        this.showMessage("Please select a file to share.", "warning")
        return
      }

      await window.fileSharing.shareWithAdmin(fileId, message)

      this.showMessage("File shared with support team successfully", "success")

      // Clear form
      document.getElementById("adminMessage").value = ""

      await this.loadSharedFiles()
    } catch (error) {
      console.error("Failed to share with admin:", error)
      this.showMessage("Failed to share with admin: " + error.message, "error")
    }
  }

  async loadSharedFiles() {
    try {
      const userId = window.getCurrentUser()?.id
      const sharedFiles = await window.fileSharing.getUserSharedFiles(userId)

      const grid = document.getElementById("sharedFilesGrid")
      if (!grid) return

      grid.innerHTML = ""

      sharedFiles.forEach((share) => {
        const card = document.createElement("div")
        card.className = "shared-file-card"

        const isActive = share.isActive && (!share.expiresAt || new Date(share.expiresAt) > new Date())

        card.innerHTML = `
          <div class="shared-file-header">
            <h4>${share.fileName || "Shared File"}</h4>
            <span class="share-status ${isActive ? "active" : "expired"}">
              ${isActive ? "Active" : "Expired"}
            </span>
          </div>
          <div class="share-details">
            <p><strong>Type:</strong> ${share.shareType || "Link"}</p>
            <p><strong>Created:</strong> ${new Date(share.sharedAt || share.createdAt).toLocaleDateString()}</p>
            ${share.expiresAt ? `<p><strong>Expires:</strong> ${new Date(share.expiresAt).toLocaleDateString()}</p>` : ""}
            <p><strong>Permissions:</strong> ${(share.permissions || []).join(", ")}</p>
          </div>
          <div class="share-actions">
            ${
              share.shareId
                ? `<button class="btn btn-sm btn-info" onclick="advancedFileManager.viewShareAnalytics('${share.shareId}')">
              <i class="fas fa-chart-bar"></i> Analytics
            </button>`
                : ""
            }
            <button class="btn btn-sm btn-warning" onclick="advancedFileManager.revokeShare('${share.shareId || share.fileId}')">
              <i class="fas fa-ban"></i> Revoke
            </button>
          </div>
        `

        grid.appendChild(card)
      })
    } catch (error) {
      console.error("Failed to load shared files:", error)
    }
  }

  async revokeShare(shareId) {
    try {
      await window.fileSharing.revokeShare(shareId)
      this.showMessage("Share access revoked successfully", "success")
      await this.loadSharedFiles()
    } catch (error) {
      console.error("Failed to revoke share:", error)
      this.showMessage("Failed to revoke share: " + error.message, "error")
    }
  }

  copyShareLink() {
    const linkInput = document.getElementById("generatedShareLink")
    linkInput.select()
    document.execCommand("copy")
    this.showMessage("Share link copied to clipboard!", "success")
  }

  // Versioning Methods
  async loadVersionData() {
    await this.loadFileSelects()
  }

  async loadFileVersions() {
    try {
      const fileId = document.getElementById("versionFileSelect").value
      if (!fileId) {
        document.getElementById("versionTimeline").style.display = "none"
        document.getElementById("versionActions").style.display = "none"
        return
      }

      const timeline = window.fileVersioning.getVersionTimeline(fileId)
      const container = document.getElementById("timelineContainer")

      if (!container) return

      container.innerHTML = ""

      timeline.forEach((version) => {
        const item = document.createElement("div")
        item.className = "timeline-item"
        item.innerHTML = `
          <div class="version-info">
            <span class="version-number">Version ${version.version}</span>
            <span class="version-date">${new Date(version.createdAt).toLocaleString()}</span>
          </div>
          <div class="version-details">
            <p><strong>Change Type:</strong> ${version.changeType}</p>
            <p><strong>Size:</strong> ${window.fileVersioning.formatFileSize(version.fileSize)}</p>
            ${version.comment ? `<p><strong>Comment:</strong> ${version.comment}</p>` : ""}
            ${version.tags.length > 0 ? `<p><strong>Tags:</strong> ${version.tags.join(", ")}</p>` : ""}
          </div>
          <div class="version-item-actions">
            <input type="checkbox" value="${version.id}" onchange="advancedFileManager.toggleVersionSelection('${version.id}')">
            <button class="btn btn-sm btn-success" onclick="advancedFileManager.restoreSpecificVersion('${fileId}', '${version.id}')">
              <i class="fas fa-undo"></i> Restore
            </button>
          </div>
        `

        container.appendChild(item)
      })

      document.getElementById("versionTimeline").style.display = "block"
      document.getElementById("versionActions").style.display = "block"
    } catch (error) {
      console.error("Failed to load file versions:", error)
    }
  }

  toggleVersionSelection(versionId) {
    if (this.selectedVersions.has(versionId)) {
      this.selectedVersions.delete(versionId)
    } else {
      this.selectedVersions.add(versionId)
    }
  }

  async restoreSpecificVersion(fileId, versionId) {
    try {
      const result = await window.fileVersioning.restoreVersion(fileId, versionId)
      this.showMessage("Version restored successfully", "success")
      console.log("Restored file URL:", result.restoredUrl)
    } catch (error) {
      console.error("Failed to restore version:", error)
      this.showMessage("Failed to restore version: " + error.message, "error")
    }
  }

  async compareVersions() {
    const selectedVersions = Array.from(this.selectedVersions)
    if (selectedVersions.length !== 2) {
      this.showMessage("Please select exactly 2 versions to compare", "warning")
      return
    }

    try {
      const fileId = document.getElementById("versionFileSelect").value
      const comparison = await window.fileVersioning.compareVersions(fileId, selectedVersions[0], selectedVersions[1])

      this.displayVersionComparison(comparison)
      this.showModal("versionCompareModal")
    } catch (error) {
      console.error("Failed to compare versions:", error)
      this.showMessage("Failed to compare versions: " + error.message, "error")
    }
  }

  displayVersionComparison(comparison) {
    const container = document.getElementById("comparisonContainer")
    if (!container) return

    container.innerHTML = `
      <div class="comparison-grid">
        <div class="version-column">
          <h4>Version ${comparison.version1.version}</h4>
          <p><strong>File:</strong> ${comparison.version1.fileName}</p>
          <p><strong>Size:</strong> ${window.fileVersioning.formatFileSize(comparison.version1.fileSize)}</p>
          <p><strong>Created:</strong> ${new Date(comparison.version1.createdAt).toLocaleString()}</p>
          <p><strong>Checksum:</strong> ${comparison.version1.checksum?.substring(0, 16)}...</p>
        </div>
        <div class="version-column">
          <h4>Version ${comparison.version2.version}</h4>
          <p><strong>File:</strong> ${comparison.version2.fileName}</p>
          <p><strong>Size:</strong> ${window.fileVersioning.formatFileSize(comparison.version2.fileSize)}</p>
          <p><strong>Created:</strong> ${new Date(comparison.version2.createdAt).toLocaleString()}</p>
          <p><strong>Checksum:</strong> ${comparison.version2.checksum?.substring(0, 16)}...</p>
        </div>
      </div>
      <div class="differences">
        <h4>Differences</h4>
        <ul>
          ${comparison.differences.nameChanged ? "<li>File name changed</li>" : ""}
          ${comparison.differences.sizeChanged ? `<li>Size changed by ${window.fileVersioning.formatFileSize(comparison.differences.sizeDifference)}</li>` : ""}
          ${comparison.differences.contentChanged ? "<li>File content changed</li>" : ""}
          <li>Time difference: ${Math.round(comparison.differences.timeDifference / (1000 * 60 * 60 * 24))} days</li>
        </ul>
      </div>
    `
  }

  async exportVersionHistory() {
    try {
      const fileId = document.getElementById("versionFileSelect").value
      if (!fileId) {
        this.showMessage("Please select a file first", "warning")
        return
      }

      const exportData = window.fileVersioning.exportVersionHistory(fileId)

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `version_history_${fileId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      this.showMessage("Version history exported successfully", "success")
    } catch (error) {
      console.error("Failed to export version history:", error)
      this.showMessage("Failed to export version history: " + error.message, "error")
    }
  }

  async refreshVersionData() {
    if (this.currentTab === "versioning") {
      await this.loadFileVersions()
    }
  }

  // Backup Methods
  async createManualBackup() {
    try {
      const description = prompt("Enter backup description (optional):") || "Manual backup"
      await window.backupSystem.createBackup("manual", description)
      this.showMessage("Backup created successfully", "success")
      await this.loadBackupHistory()
    } catch (error) {
      console.error("Manual backup failed:", error)
      this.showMessage("Backup failed: " + error.message, "error")
    }
  }

  async createIncrementalBackup() {
    try {
      const result = await window.backupSystem.createIncrementalBackup()
      if (result) {
        this.showMessage("Incremental backup created successfully", "success")
        await this.loadBackupHistory()
      } else {
        this.showMessage("No changes detected since last backup", "info")
      }
    } catch (error) {
      console.error("Incremental backup failed:", error)
      this.showMessage("Incremental backup failed: " + error.message, "error")
    }
  }

  async loadBackupHistory() {
    try {
      const backups = window.backupSystem.backupHistory
      const stats = window.backupSystem.getBackupStats()

      // Update backup list
      const list = document.getElementById("backupList")
      if (list) {
        list.innerHTML = ""

        backups.forEach((backup) => {
          const item = document.createElement("div")
          item.className = "backup-item"
          item.innerHTML = `
            <div class="backup-info">
              <h4>${backup.description || `${backup.type} backup`}</h4>
              <div class="backup-meta">
                <span>Created: ${new Date(backup.createdAt).toLocaleString()}</span>
                ${backup.size ? ` • Size: ${window.backupSystem.formatFileSize(backup.size)}` : ""}
                ${backup.fileCount ? ` • Files: ${backup.fileCount}` : ""}
              </div>
            </div>
            <div class="backup-actions-item">
              <span class="backup-status-badge ${backup.status}">${backup.status}</span>
              ${
                backup.status === "completed"
                  ? `
                <button class="btn btn-sm btn-success" onclick="advancedFileManager.restoreBackup('${backup.id}')">
                  <i class="fas fa-undo"></i> Restore
                </button>
              `
                  : ""
              }
              <button class="btn btn-sm btn-danger" onclick="advancedFileManager.deleteBackup('${backup.id}')">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          `
          list.appendChild(item)
        })
      }

      // Update backup stats
      if (stats) {
        document.getElementById("totalBackups").textContent = stats.totalBackups
        document.getElementById("successfulBackups").textContent = stats.completedBackups
        document.getElementById("backupSize").textContent = stats.totalSize
        document.getElementById("lastBackup").textContent = stats.lastBackup
          ? new Date(stats.lastBackup.createdAt).toLocaleDateString()
          : "Never"
      }
    } catch (error) {
      console.error("Failed to load backup history:", error)
    }
  }

  async restoreBackup(backupId) {
    if (!confirm("Are you sure you want to restore from this backup? This will overwrite current data.")) {
      return
    }

    try {
      await window.backupSystem.restoreFromBackup(backupId)
      this.showMessage("Backup restored successfully", "success")
    } catch (error) {
      console.error("Backup restore failed:", error)
      this.showMessage("Backup restore failed: " + error.message, "error")
    }
  }

  async deleteBackup(backupId) {
    if (!confirm("Are you sure you want to delete this backup?")) {
      return
    }

    try {
      await window.backupSystem.deleteBackup(backupId)
      this.showMessage("Backup deleted successfully", "success")
      await this.loadBackupHistory()
    } catch (error) {
      console.error("Failed to delete backup:", error)
      this.showMessage("Failed to delete backup: " + error.message, "error")
    }
  }

  updateBackupProgress(detail) {
    const progressElement = document.getElementById("backupProgress")
    if (progressElement) {
      progressElement.style.display = detail.percentage > 0 && detail.percentage < 100 ? "block" : "none"
    }

    const progressBars = document.querySelectorAll(".backup-progress")
    const statusElements = document.querySelectorAll(".backup-status")

    progressBars.forEach((bar) => {
      bar.style.width = `${detail.percentage}%`
    })

    statusElements.forEach((status) => {
      status.textContent = detail.message
    })
  }

  showBackupSettings() {
    this.showModal("backupSettingsModal")
  }

  saveBackupSettings() {
    try {
      // Get settings from form
      const settings = {
        daily: {
          enabled: document.getElementById("dailyBackupEnabled").checked,
          time: document.getElementById("dailyBackupTime").value,
          retention: Number.parseInt(document.getElementById("dailyRetention").value),
        },
        weekly: {
          enabled: document.getElementById("weeklyBackupEnabled").checked,
          day: document.getElementById("weeklyBackupDay").value,
          retention: Number.parseInt(document.getElementById("weeklyRetention").value),
        },
        monthly: {
          enabled: document.getElementById("monthlyBackupEnabled").checked,
          date: Number.parseInt(document.getElementById("monthlyBackupDate").value),
          retention: Number.parseInt(document.getElementById("monthlyRetention").value),
        },
      }

      // Update backup system settings
      window.backupSystem.backupSchedule = settings

      this.showMessage("Backup settings saved successfully", "success")
      this.closeModal("backupSettingsModal")
    } catch (error) {
      console.error("Failed to save backup settings:", error)
      this.showMessage("Failed to save backup settings: " + error.message, "error")
    }
  }

  // CDN Methods
  async loadCDNStats() {
    try {
      const stats = window.cdnIntegration.getCDNStats()

      document.getElementById("cdnProvider").textContent = stats.activeProvider
      document.getElementById("cacheHitRate").textContent = stats.hitRate + "%"
      document.getElementById("optimizedImages").textContent = stats.cacheSize

      // Update optimization toggles
      const settings = window.cdnIntegration.optimizationSettings
      document.getElementById("cdnImageOptimization").checked = settings.imageOptimization
      document.getElementById("cdnCompression").checked = settings.compression
      document.getElementById("cdnLazyLoading").checked = settings.lazyLoading
      document.getElementById("cdnWebpConversion").checked = settings.webpConversion
    } catch (error) {
      console.error("Failed to load CDN stats:", error)
    }
  }

  updateCDNSettings(setting, enabled) {
    const newSettings = {}
    newSettings[setting] = enabled
    window.cdnIntegration.updateSettings(newSettings)
    this.showMessage(`CDN ${setting} ${enabled ? "enabled" : "disabled"}`, "success")
  }

  async optimizeAllImages() {
    try {
      this.showMessage("Starting image optimization...", "info")

      // Mock optimization process
      const images = document.querySelectorAll("img")
      let optimized = 0

      for (const img of images) {
        if (img.src && !img.src.includes("optimized")) {
          const optimizedUrl = window.cdnIntegration.getOptimizedUrl(img.src, {
            quality: 85,
            format: "webp",
          })
          img.src = optimizedUrl
          optimized++
        }
      }

      this.showMessage(`Optimized ${optimized} images`, "success")
      await this.loadCDNStats()
    } catch (error) {
      console.error("Image optimization failed:", error)
      this.showMessage("Image optimization failed: " + error.message, "error")
    }
  }

  async purgeCDNCache() {
    try {
      await window.cdnIntegration.purgeCDNCache()
      this.showMessage("CDN cache purged successfully", "success")
      await this.loadCDNStats()
    } catch (error) {
      console.error("Failed to purge CDN cache:", error)
      this.showMessage("Failed to purge CDN cache: " + error.message, "error")
    }
  }

  async preloadCriticalAssets() {
    try {
      await window.cdnIntegration.preloadCriticalAssets()
      this.showMessage("Critical assets preloaded successfully", "success")
    } catch (error) {
      console.error("Failed to preload assets:", error)
      this.showMessage("Failed to preload assets: " + error.message, "error")
    }
  }

  // Utility Methods
  showModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "block"
      document.body.style.overflow = "hidden"
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  }

  showMessage(message, type = "info") {
    // Create toast notification
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-${this.getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `

    // Add to page
    document.body.appendChild(toast)

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100)

    // Remove toast
    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 3000)
  }

  getToastIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-circle",
      warning: "exclamation-triangle",
      info: "info-circle",
    }
    return icons[type] || "info-circle"
  }

  downloadCompressed(filename) {
    // Mock download - in real app, would trigger actual download
    this.showMessage(`Downloading ${filename}...`, "info")
  }

  viewShareAnalytics(shareId) {
    const analytics = window.fileSharing.getShareAnalytics(shareId)
    if (analytics) {
      alert(
        `Share Analytics:\nViews: ${analytics.totalViews}\nDownloads: ${analytics.totalDownloads}\nLast Accessed: ${analytics.lastAccessed || "Never"}`,
      )
    }
  }
}

// Initialize advanced file manager
const advancedFileManager = new AdvancedFileManager()

// Global functions for onclick handlers
window.createShareLink = () => advancedFileManager.createShareLink()
window.shareWithUser = () => advancedFileManager.shareWithUser()
window.shareWithAdmin = () => advancedFileManager.shareWithAdmin()
window.loadFileVersions = () => advancedFileManager.loadFileVersions()
window.compareVersions = () => advancedFileManager.compareVersions()
window.restoreVersion = () => advancedFileManager.restoreVersion()
window.exportVersionHistory = () => advancedFileManager.exportVersionHistory()
window.createManualBackup = () => advancedFileManager.createManualBackup()
window.createIncrementalBackup = () => advancedFileManager.createIncrementalBackup()
window.showBackupSettings = () => advancedFileManager.showBackupSettings()
window.saveBackupSettings = () => advancedFileManager.saveBackupSettings()
window.optimizeAllImages = () => advancedFileManager.optimizeAllImages()
window.purgeCDNCache = () => advancedFileManager.purgeCDNCache()
window.preloadCriticalAssets = () => advancedFileManager.preloadCriticalAssets()
window.copyShareLink = () => advancedFileManager.copyShareLink()
window.closeModal = (modalId) => advancedFileManager.closeModal(modalId)

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none"
    document.body.style.overflow = "auto"
  }
})
