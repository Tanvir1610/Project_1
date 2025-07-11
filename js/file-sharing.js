// File Sharing Service
class FileSharingService {
  constructor() {
    this.baseUrl = "/api/share"
    this.sharedFiles = new Map()
    this.shareLinks = new Map()
    this.permissions = {
      VIEW: "view",
      DOWNLOAD: "download",
      EDIT: "edit",
      ADMIN: "admin",
    }
    this.init()
  }

  init() {
    this.loadSharedFiles()
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Listen for share events
    window.addEventListener("shareFile", (e) => {
      this.handleShareRequest(e.detail)
    })

    // Listen for permission changes
    window.addEventListener("permissionChange", (e) => {
      this.updatePermissions(e.detail)
    })
  }

  // Create secure share link
  async createShareLink(fileId, options = {}) {
    try {
      const shareData = {
        fileId: fileId,
        createdBy: window.getCurrentUser()?.id,
        createdAt: new Date().toISOString(),
        expiresAt: options.expiresAt || this.getDefaultExpiry(),
        permissions: options.permissions || [this.permissions.VIEW],
        password: options.password || null,
        allowedUsers: options.allowedUsers || [],
        maxDownloads: options.maxDownloads || null,
        downloadCount: 0,
        isActive: true,
        shareId: this.generateShareId(),
      }

      // Store share data
      this.shareLinks.set(shareData.shareId, shareData)

      // Generate secure URL
      const shareUrl = `${window.location.origin}/share/${shareData.shareId}`

      // Save to storage
      await this.saveShareData(shareData)

      return {
        shareId: shareData.shareId,
        shareUrl: shareUrl,
        expiresAt: shareData.expiresAt,
        permissions: shareData.permissions,
      }
    } catch (error) {
      console.error("Failed to create share link:", error)
      throw error
    }
  }

  // Share file with specific users
  async shareWithUsers(fileId, userIds, permissions = [this.permissions.VIEW]) {
    try {
      const shareData = {
        fileId: fileId,
        sharedBy: window.getCurrentUser()?.id,
        sharedWith: userIds,
        permissions: permissions,
        sharedAt: new Date().toISOString(),
        isActive: true,
        shareType: "direct",
      }

      // Notify users
      await this.notifyUsers(userIds, shareData)

      // Store share record
      this.sharedFiles.set(`${fileId}_${Date.now()}`, shareData)

      return shareData
    } catch (error) {
      console.error("Failed to share with users:", error)
      throw error
    }
  }

  // Share with admin/support
  async shareWithAdmin(fileId, message = "") {
    try {
      const adminUsers = await this.getAdminUsers()
      const shareData = await this.shareWithUsers(
        fileId,
        adminUsers.map((u) => u.id),
        [this.permissions.VIEW, this.permissions.DOWNLOAD],
      )

      // Add admin-specific data
      shareData.message = message
      shareData.priority = "normal"
      shareData.category = "support"

      // Create support ticket
      await this.createSupportTicket(shareData)

      return shareData
    } catch (error) {
      console.error("Failed to share with admin:", error)
      throw error
    }
  }

  // Validate share access
  async validateShareAccess(shareId, password = null) {
    try {
      const shareData = this.shareLinks.get(shareId)

      if (!shareData) {
        throw new Error("Share link not found")
      }

      if (!shareData.isActive) {
        throw new Error("Share link has been deactivated")
      }

      if (new Date() > new Date(shareData.expiresAt)) {
        throw new Error("Share link has expired")
      }

      if (shareData.password && shareData.password !== password) {
        throw new Error("Invalid password")
      }

      if (shareData.maxDownloads && shareData.downloadCount >= shareData.maxDownloads) {
        throw new Error("Download limit exceeded")
      }

      return {
        valid: true,
        shareData: shareData,
        permissions: shareData.permissions,
      }
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      }
    }
  }

  // Track share access
  async trackShareAccess(shareId, action = "view") {
    try {
      const shareData = this.shareLinks.get(shareId)
      if (!shareData) return

      // Update access count
      if (action === "download") {
        shareData.downloadCount++
      }

      // Log access
      const accessLog = {
        shareId: shareId,
        action: action,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: await this.getUserIP(),
      }

      await this.logShareAccess(accessLog)

      // Update share data
      this.shareLinks.set(shareId, shareData)
      await this.saveShareData(shareData)
    } catch (error) {
      console.error("Failed to track share access:", error)
    }
  }

  // Get user's shared files
  async getUserSharedFiles(userId) {
    try {
      const userShares = []

      for (const [key, shareData] of this.sharedFiles) {
        if (shareData.sharedBy === userId || shareData.sharedWith?.includes(userId)) {
          userShares.push(shareData)
        }
      }

      return userShares
    } catch (error) {
      console.error("Failed to get user shared files:", error)
      return []
    }
  }

  // Revoke share access
  async revokeShare(shareId) {
    try {
      const shareData = this.shareLinks.get(shareId)
      if (shareData) {
        shareData.isActive = false
        shareData.revokedAt = new Date().toISOString()

        this.shareLinks.set(shareId, shareData)
        await this.saveShareData(shareData)

        return true
      }
      return false
    } catch (error) {
      console.error("Failed to revoke share:", error)
      throw error
    }
  }

  // Update share permissions
  async updateSharePermissions(shareId, newPermissions) {
    try {
      const shareData = this.shareLinks.get(shareId)
      if (shareData) {
        shareData.permissions = newPermissions
        shareData.updatedAt = new Date().toISOString()

        this.shareLinks.set(shareId, shareData)
        await this.saveShareData(shareData)

        return true
      }
      return false
    } catch (error) {
      console.error("Failed to update permissions:", error)
      throw error
    }
  }

  // Generate secure share ID
  generateShareId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Get default expiry (7 days from now)
  getDefaultExpiry() {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 7)
    return expiry.toISOString()
  }

  // Get admin users
  async getAdminUsers() {
    // Mock admin users - in real app, fetch from API
    return [
      { id: "admin1", name: "Admin User", email: "admin@forlifetrading.com" },
      { id: "support1", name: "Support Team", email: "support@forlifetrading.com" },
    ]
  }

  // Notify users about shared files
  async notifyUsers(userIds, shareData) {
    try {
      const notifications = userIds.map((userId) => ({
        userId: userId,
        type: "file_shared",
        title: "New File Shared",
        message: `A file has been shared with you`,
        data: shareData,
        timestamp: new Date().toISOString(),
      }))

      // Send notifications (mock implementation)
      console.log("Sending notifications:", notifications)

      return notifications
    } catch (error) {
      console.error("Failed to notify users:", error)
    }
  }

  // Create support ticket
  async createSupportTicket(shareData) {
    try {
      const ticket = {
        id: `TICKET_${Date.now()}`,
        fileId: shareData.fileId,
        userId: shareData.sharedBy,
        message: shareData.message,
        priority: shareData.priority,
        status: "open",
        createdAt: new Date().toISOString(),
      }

      // Save ticket (mock implementation)
      console.log("Creating support ticket:", ticket)

      return ticket
    } catch (error) {
      console.error("Failed to create support ticket:", error)
    }
  }

  // Get user IP (mock implementation)
  async getUserIP() {
    try {
      // In real implementation, use a service to get user IP
      return "127.0.0.1"
    } catch (error) {
      return "unknown"
    }
  }

  // Save share data to storage
  async saveShareData(shareData) {
    try {
      const shares = JSON.parse(localStorage.getItem("fileShares") || "{}")
      shares[shareData.shareId] = shareData
      localStorage.setItem("fileShares", JSON.stringify(shares))
    } catch (error) {
      console.error("Failed to save share data:", error)
    }
  }

  // Load shared files from storage
  loadSharedFiles() {
    try {
      const shares = JSON.parse(localStorage.getItem("fileShares") || "{}")
      for (const [shareId, shareData] of Object.entries(shares)) {
        this.shareLinks.set(shareId, shareData)
      }
    } catch (error) {
      console.error("Failed to load shared files:", error)
    }
  }

  // Log share access
  async logShareAccess(accessLog) {
    try {
      const logs = JSON.parse(localStorage.getItem("shareAccessLogs") || "[]")
      logs.push(accessLog)

      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000)
      }

      localStorage.setItem("shareAccessLogs", JSON.stringify(logs))
    } catch (error) {
      console.error("Failed to log share access:", error)
    }
  }

  // Get share analytics
  getShareAnalytics(shareId) {
    try {
      const logs = JSON.parse(localStorage.getItem("shareAccessLogs") || "[]")
      const shareLogs = logs.filter((log) => log.shareId === shareId)

      return {
        totalViews: shareLogs.filter((log) => log.action === "view").length,
        totalDownloads: shareLogs.filter((log) => log.action === "download").length,
        lastAccessed: shareLogs.length > 0 ? shareLogs[shareLogs.length - 1].timestamp : null,
        accessHistory: shareLogs,
      }
    } catch (error) {
      console.error("Failed to get share analytics:", error)
      return null
    }
  }
}

// Initialize file sharing service
const fileSharing = new FileSharingService()
