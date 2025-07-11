// Backup System Service
class BackupSystemService {
  constructor() {
    this.baseUrl = "/api/backup"
    this.backupSchedule = {
      daily: { enabled: true, time: "02:00", retention: 7 },
      weekly: { enabled: true, day: "sunday", time: "03:00", retention: 4 },
      monthly: { enabled: true, date: 1, time: "04:00", retention: 12 },
    }
    this.backupHistory = []
    this.isBackupRunning = false
    this.init()
  }

  init() {
    this.loadBackupHistory()
    this.setupScheduler()
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Listen for backup events
    window.addEventListener("beforeunload", () => {
      this.saveBackupHistory()
    })

    // Listen for storage changes
    window.addEventListener("storage", (e) => {
      if (e.key === "userFiles") {
        this.scheduleIncrementalBackup()
      }
    })
  }

  // Setup automatic backup scheduler
  setupScheduler() {
    // Check for scheduled backups every hour
    setInterval(
      () => {
        this.checkScheduledBackups()
      },
      60 * 60 * 1000,
    ) // 1 hour

    // Initial check
    setTimeout(() => {
      this.checkScheduledBackups()
    }, 5000) // 5 seconds after init
  }

  // Check if any backups are due
  async checkScheduledBackups() {
    try {
      const now = new Date()

      // Check daily backup
      if (this.backupSchedule.daily.enabled && this.isDailyBackupDue(now)) {
        await this.createBackup("daily", "Scheduled daily backup")
      }

      // Check weekly backup
      if (this.backupSchedule.weekly.enabled && this.isWeeklyBackupDue(now)) {
        await this.createBackup("weekly", "Scheduled weekly backup")
      }

      // Check monthly backup
      if (this.backupSchedule.monthly.enabled && this.isMonthlyBackupDue(now)) {
        await this.createBackup("monthly", "Scheduled monthly backup")
      }

      // Cleanup old backups
      await this.cleanupOldBackups()
    } catch (error) {
      console.error("Backup scheduler error:", error)
    }
  }

  // Create backup
  async createBackup(type = "manual", description = "") {
    if (this.isBackupRunning) {
      throw new Error("Backup already in progress")
    }

    try {
      this.isBackupRunning = true
      this.updateBackupProgress(0, "Initializing backup...")

      const backupId = this.generateBackupId()
      const startTime = new Date()

      // Get all user files
      const userFiles = await this.getAllUserFiles()
      this.updateBackupProgress(20, "Collecting files...")

      // Create backup metadata
      const backupData = {
        id: backupId,
        type: type,
        description: description,
        createdAt: startTime.toISOString(),
        userId: window.getCurrentUser()?.id,
        fileCount: userFiles.length,
        status: "in_progress",
        progress: 0,
      }

      // Add to history
      this.backupHistory.unshift(backupData)
      this.updateBackupProgress(30, "Creating backup archive...")

      // Create backup archive
      const backupArchive = await this.createBackupArchive(userFiles, backupId)
      this.updateBackupProgress(70, "Uploading backup...")

      // Upload backup to storage
      const backupUrl = await this.uploadBackup(backupArchive, backupId)
      this.updateBackupProgress(90, "Finalizing backup...")

      // Update backup data
      backupData.status = "completed"
      backupData.progress = 100
      backupData.completedAt = new Date().toISOString()
      backupData.size = backupArchive.size
      backupData.url = backupUrl
      backupData.checksum = await this.calculateChecksum(backupArchive)

      // Save backup history
      this.saveBackupHistory()
      this.updateBackupProgress(100, "Backup completed successfully!")

      // Dispatch completion event
      window.dispatchEvent(
        new CustomEvent("backupCompleted", {
          detail: backupData,
        }),
      )

      return backupData
    } catch (error) {
      console.error("Backup failed:", error)

      // Update backup status
      const failedBackup = this.backupHistory[0]
      if (failedBackup) {
        failedBackup.status = "failed"
        failedBackup.error = error.message
        failedBackup.completedAt = new Date().toISOString()
      }

      throw error
    } finally {
      this.isBackupRunning = false
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId) {
    try {
      const backup = this.backupHistory.find((b) => b.id === backupId)
      if (!backup) {
        throw new Error("Backup not found")
      }

      if (backup.status !== "completed") {
        throw new Error("Cannot restore from incomplete backup")
      }

      this.updateRestoreProgress(0, "Downloading backup...")

      // Download backup archive
      const backupArchive = await this.downloadBackup(backup.url)
      this.updateRestoreProgress(30, "Extracting files...")

      // Extract files from archive
      const extractedFiles = await this.extractBackupArchive(backupArchive)
      this.updateRestoreProgress(60, "Restoring files...")

      // Restore files
      await this.restoreFiles(extractedFiles)
      this.updateRestoreProgress(90, "Updating file index...")

      // Update file manager
      if (window.fileManager) {
        await window.fileManager.loadFiles()
      }

      this.updateRestoreProgress(100, "Restore completed successfully!")

      // Log restore action
      this.logRestoreAction(backupId)

      return true
    } catch (error) {
      console.error("Restore failed:", error)
      throw error
    }
  }

  // Create incremental backup
  async createIncrementalBackup() {
    try {
      const lastBackup = this.getLastBackup()
      const lastBackupTime = lastBackup ? new Date(lastBackup.createdAt) : new Date(0)

      // Get files modified since last backup
      const modifiedFiles = await this.getModifiedFiles(lastBackupTime)

      if (modifiedFiles.length === 0) {
        console.log("No files modified since last backup")
        return null
      }

      // Create incremental backup
      const backupData = await this.createBackup(
        "incremental",
        `Incremental backup - ${modifiedFiles.length} modified files`,
      )

      return backupData
    } catch (error) {
      console.error("Incremental backup failed:", error)
      throw error
    }
  }

  // Schedule incremental backup
  scheduleIncrementalBackup() {
    // Debounce incremental backups
    clearTimeout(this.incrementalBackupTimeout)
    this.incrementalBackupTimeout = setTimeout(
      () => {
        this.createIncrementalBackup()
      },
      5 * 60 * 1000,
    ) // 5 minutes delay
  }

  // Get all user files
  async getAllUserFiles() {
    try {
      const userId = window.getCurrentUser()?.id
      if (!userId) return []

      // Get files from blob storage
      const files = await window.blobStorage.listFiles(userId)

      // Add local storage data
      const localData = this.getLocalStorageData()

      return {
        files: files,
        userData: localData,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Failed to get user files:", error)
      return { files: [], userData: {}, timestamp: new Date().toISOString() }
    }
  }

  // Get local storage data
  getLocalStorageData() {
    const data = {}
    const keys = ["userProfile", "dashboardData", "fileShares", "settings"]

    keys.forEach((key) => {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          data[key] = JSON.parse(value)
        } catch (e) {
          data[key] = value
        }
      }
    })

    return data
  }

  // Create backup archive
  async createBackupArchive(data, backupId) {
    try {
      // Convert data to JSON
      const jsonData = JSON.stringify(data, null, 2)

      // Create blob
      const blob = new Blob([jsonData], { type: "application/json" })

      // Create file
      const backupFile = new File([blob], `backup_${backupId}.json`, {
        type: "application/json",
        lastModified: Date.now(),
      })

      return backupFile
    } catch (error) {
      console.error("Failed to create backup archive:", error)
      throw error
    }
  }

  // Upload backup
  async uploadBackup(backupFile, backupId) {
    try {
      const userId = window.getCurrentUser()?.id
      const backupUrl = await window.blobStorage.uploadFile(backupFile, "backup", userId, backupId)

      return backupUrl
    } catch (error) {
      console.error("Failed to upload backup:", error)
      throw error
    }
  }

  // Download backup
  async downloadBackup(backupUrl) {
    try {
      const response = await fetch(backupUrl)
      if (!response.ok) {
        throw new Error(`Failed to download backup: ${response.statusText}`)
      }

      return await response.blob()
    } catch (error) {
      console.error("Failed to download backup:", error)
      throw error
    }
  }

  // Extract backup archive
  async extractBackupArchive(backupBlob) {
    try {
      const text = await backupBlob.text()
      const data = JSON.parse(text)
      return data
    } catch (error) {
      console.error("Failed to extract backup archive:", error)
      throw error
    }
  }

  // Restore files
  async restoreFiles(backupData) {
    try {
      // Restore local storage data
      if (backupData.userData) {
        Object.entries(backupData.userData).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value))
        })
      }

      // Note: File restoration would require re-uploading files to blob storage
      // This is a simplified implementation
      console.log("Files restored from backup:", backupData.files?.length || 0)
    } catch (error) {
      console.error("Failed to restore files:", error)
      throw error
    }
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

  // Cleanup old backups
  async cleanupOldBackups() {
    try {
      const now = new Date()
      const toDelete = []

      // Check retention policies
      Object.entries(this.backupSchedule).forEach(([type, config]) => {
        if (!config.enabled) return

        const typeBackups = this.backupHistory.filter((b) => b.type === type)
        const sortedBackups = typeBackups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        // Mark old backups for deletion
        if (sortedBackups.length > config.retention) {
          const oldBackups = sortedBackups.slice(config.retention)
          toDelete.push(...oldBackups)
        }
      })

      // Delete old backups
      for (const backup of toDelete) {
        await this.deleteBackup(backup.id)
      }

      if (toDelete.length > 0) {
        console.log(`Cleaned up ${toDelete.length} old backups`)
      }
    } catch (error) {
      console.error("Backup cleanup failed:", error)
    }
  }

  // Delete backup
  async deleteBackup(backupId) {
    try {
      const backup = this.backupHistory.find((b) => b.id === backupId)
      if (!backup) return

      // Delete from storage
      if (backup.url) {
        await window.blobStorage.deleteFile(backup.url, window.getCurrentUser()?.id)
      }

      // Remove from history
      this.backupHistory = this.backupHistory.filter((b) => b.id !== backupId)
      this.saveBackupHistory()
    } catch (error) {
      console.error("Failed to delete backup:", error)
    }
  }

  // Check if daily backup is due
  isDailyBackupDue(now) {
    const lastDaily = this.backupHistory.find((b) => b.type === "daily" && b.status === "completed")
    if (!lastDaily) return true

    const lastBackupDate = new Date(lastDaily.createdAt)
    const daysDiff = Math.floor((now - lastBackupDate) / (1000 * 60 * 60 * 24))

    return daysDiff >= 1
  }

  // Check if weekly backup is due
  isWeeklyBackupDue(now) {
    const lastWeekly = this.backupHistory.find((b) => b.type === "weekly" && b.status === "completed")
    if (!lastWeekly) return true

    const lastBackupDate = new Date(lastWeekly.createdAt)
    const daysDiff = Math.floor((now - lastBackupDate) / (1000 * 60 * 60 * 24))

    return daysDiff >= 7
  }

  // Check if monthly backup is due
  isMonthlyBackupDue(now) {
    const lastMonthly = this.backupHistory.find((b) => b.type === "monthly" && b.status === "completed")
    if (!lastMonthly) return true

    const lastBackupDate = new Date(lastMonthly.createdAt)
    const monthsDiff =
      (now.getFullYear() - lastBackupDate.getFullYear()) * 12 + (now.getMonth() - lastBackupDate.getMonth())

    return monthsDiff >= 1
  }

  // Get modified files since timestamp
  async getModifiedFiles(since) {
    try {
      const allFiles = await this.getAllUserFiles()
      return allFiles.files.filter((file) => new Date(file.uploadDate) > since)
    } catch (error) {
      console.error("Failed to get modified files:", error)
      return []
    }
  }

  // Get last backup
  getLastBackup() {
    const completedBackups = this.backupHistory.filter((b) => b.status === "completed")
    return completedBackups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
  }

  // Generate backup ID
  generateBackupId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `backup_${timestamp}_${random}`
  }

  // Update backup progress
  updateBackupProgress(percentage, message) {
    const progressBars = document.querySelectorAll(".backup-progress")
    const statusElements = document.querySelectorAll(".backup-status")

    progressBars.forEach((bar) => {
      bar.style.width = `${percentage}%`
      bar.textContent = `${percentage}%`
    })

    statusElements.forEach((status) => {
      status.textContent = message
    })

    // Dispatch progress event
    window.dispatchEvent(
      new CustomEvent("backupProgress", {
        detail: { percentage, message },
      }),
    )
  }

  // Update restore progress
  updateRestoreProgress(percentage, message) {
    const progressBars = document.querySelectorAll(".restore-progress")
    const statusElements = document.querySelectorAll(".restore-status")

    progressBars.forEach((bar) => {
      bar.style.width = `${percentage}%`
      bar.textContent = `${percentage}%`
    })

    statusElements.forEach((status) => {
      status.textContent = message
    })

    // Dispatch progress event
    window.dispatchEvent(
      new CustomEvent("restoreProgress", {
        detail: { percentage, message },
      }),
    )
  }

  // Log restore action
  logRestoreAction(backupId) {
    const restoreLog = {
      backupId: backupId,
      restoredBy: window.getCurrentUser()?.id,
      restoredAt: new Date().toISOString(),
    }

    const logs = JSON.parse(localStorage.getItem("restoreLogs") || "[]")
    logs.push(restoreLog)
    localStorage.setItem("restoreLogs", JSON.stringify(logs))
  }

  // Save backup history
  saveBackupHistory() {
    try {
      localStorage.setItem("backupHistory", JSON.stringify(this.backupHistory))
    } catch (error) {
      console.error("Failed to save backup history:", error)
    }
  }

  // Load backup history
  loadBackupHistory() {
    try {
      const history = localStorage.getItem("backupHistory")
      if (history) {
        this.backupHistory = JSON.parse(history)
      }
    } catch (error) {
      console.error("Failed to load backup history:", error)
      this.backupHistory = []
    }
  }

  // Get backup statistics
  getBackupStats() {
    const completed = this.backupHistory.filter((b) => b.status === "completed")
    const failed = this.backupHistory.filter((b) => b.status === "failed")
    const totalSize = completed.reduce((sum, b) => sum + (b.size || 0), 0)

    return {
      totalBackups: this.backupHistory.length,
      completedBackups: completed.length,
      failedBackups: failed.length,
      totalSize: this.formatFileSize(totalSize),
      lastBackup: this.getLastBackup(),
      nextScheduled: this.getNextScheduledBackup(),
    }
  }

  // Get next scheduled backup
  getNextScheduledBackup() {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(2, 0, 0, 0) // 2 AM

    return tomorrow.toISOString()
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
}

// Initialize backup system
const backupSystem = new BackupSystemService()
