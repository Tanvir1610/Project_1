// CDN Integration Service
class CDNIntegrationService {
  constructor() {
    this.cdnProviders = {
      cloudflare: {
        name: "Cloudflare",
        baseUrl: "https://cdn.forlifetrading.com",
        enabled: true,
        regions: ["global"],
      },
      aws: {
        name: "AWS CloudFront",
        baseUrl: "https://d1234567890.cloudfront.net",
        enabled: false,
        regions: ["us-east-1", "eu-west-1", "ap-south-1"],
      },
      vercel: {
        name: "Vercel Edge Network",
        baseUrl: "https://forlifetrading.vercel.app",
        enabled: true,
        regions: ["global"],
      },
    }
    this.cache = new Map()
    this.optimizationSettings = {
      imageOptimization: true,
      compression: true,
      caching: true,
      lazyLoading: true,
      webpConversion: true,
    }
    this.init()
  }

  init() {
    this.setupImageOptimization()
    this.setupLazyLoading()
    this.setupCacheManagement()
    this.preloadCriticalAssets()
  }

  // Get optimized URL for file
  getOptimizedUrl(originalUrl, options = {}) {
    try {
      const provider = this.getActiveProvider()
      if (!provider) return originalUrl

      // Parse original URL
      const url = new URL(originalUrl)
      const filename = url.pathname.split("/").pop()
      const fileExt = filename.split(".").pop().toLowerCase()

      // Build CDN URL
      let cdnUrl = `${provider.baseUrl}${url.pathname}`

      // Add optimization parameters
      const params = new URLSearchParams()

      // Image optimization
      if (this.isImage(fileExt) && this.optimizationSettings.imageOptimization) {
        if (options.width) params.append("w", options.width)
        if (options.height) params.append("h", options.height)
        if (options.quality) params.append("q", options.quality)
        if (options.format) params.append("f", options.format)
        if (this.optimizationSettings.webpConversion && this.supportsWebP()) {
          params.append("f", "webp")
        }
      }

      // Compression
      if (this.optimizationSettings.compression) {
        params.append("compress", "true")
      }

      // Cache control
      if (this.optimizationSettings.caching) {
        params.append("cache", options.cache || "public,max-age=31536000")
      }

      // Add parameters to URL
      if (params.toString()) {
        cdnUrl += `?${params.toString()}`
      }

      return cdnUrl
    } catch (error) {
      console.error("Failed to get optimized URL:", error)
      return originalUrl
    }
  }

  // Upload file to CDN
  async uploadToCDN(file, path = "") {
    try {
      const provider = this.getActiveProvider()
      if (!provider) {
        throw new Error("No active CDN provider")
      }

      // Optimize file before upload
      const optimizedFile = await this.optimizeFile(file)

      // Generate CDN path
      const cdnPath = this.generateCDNPath(file.name, path)

      // Upload to CDN (mock implementation)
      const uploadUrl = await this.performCDNUpload(optimizedFile, cdnPath, provider)

      // Cache the URL
      this.cache.set(file.name, uploadUrl)

      // Preload in multiple regions
      await this.preloadInRegions(uploadUrl, provider.regions)

      return uploadUrl
    } catch (error) {
      console.error("CDN upload failed:", error)
      throw error
    }
  }

  // Optimize file for CDN
  async optimizeFile(file) {
    try {
      if (this.isImage(file.name)) {
        // Use image compression service
        return await window.imageCompression.smartCompress(file)
      }

      // For non-images, return original file
      return file
    } catch (error) {
      console.error("File optimization failed:", error)
      return file
    }
  }

  // Setup image optimization
  setupImageOptimization() {
    if (!this.optimizationSettings.imageOptimization) return

    // Intercept image loads
    const images = document.querySelectorAll("img[data-src]")
    images.forEach((img) => {
      this.optimizeImageElement(img)
    })

    // Setup mutation observer for dynamic images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const images = node.querySelectorAll ? node.querySelectorAll("img[data-src]") : []
            images.forEach((img) => this.optimizeImageElement(img))
          }
        })
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  // Optimize individual image element
  optimizeImageElement(img) {
    const originalSrc = img.dataset.src
    if (!originalSrc) return

    // Calculate optimal dimensions
    const rect = img.getBoundingClientRect()
    const devicePixelRatio = window.devicePixelRatio || 1
    const width = Math.ceil(rect.width * devicePixelRatio)
    const height = Math.ceil(rect.height * devicePixelRatio)

    // Get optimized URL
    const optimizedUrl = this.getOptimizedUrl(originalSrc, {
      width: width || undefined,
      height: height || undefined,
      quality: 85,
      format: this.supportsWebP() ? "webp" : undefined,
    })

    // Set optimized source
    img.src = optimizedUrl
    img.removeAttribute("data-src")
  }

  // Setup lazy loading
  setupLazyLoading() {
    if (!this.optimizationSettings.lazyLoading) return

    // Use Intersection Observer for lazy loading
    const lazyImageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            if (img.dataset.src) {
              this.optimizeImageElement(img)
              lazyImageObserver.unobserve(img)
            }
          }
        })
      },
      {
        rootMargin: "50px 0px",
        threshold: 0.01,
      },
    )

    // Observe all images with data-src
    document.querySelectorAll("img[data-src]").forEach((img) => {
      lazyImageObserver.observe(img)
    })
  }

  // Setup cache management
  setupCacheManagement() {
    // Clear expired cache entries
    setInterval(
      () => {
        this.cleanupCache()
      },
      60 * 60 * 1000,
    ) // Every hour

    // Preload critical assets
    this.preloadCriticalAssets()
  }

  // Preload critical assets
  async preloadCriticalAssets() {
    try {
      const criticalAssets = ["/images/logo.png", "/images/hero-bg.jpg", "/css/main.css", "/js/main.js"]

      for (const asset of criticalAssets) {
        await this.preloadAsset(asset)
      }
    } catch (error) {
      console.error("Failed to preload critical assets:", error)
    }
  }

  // Preload single asset
  async preloadAsset(url) {
    try {
      const optimizedUrl = this.getOptimizedUrl(url)

      // Create preload link
      const link = document.createElement("link")
      link.rel = "preload"
      link.href = optimizedUrl

      // Determine resource type
      if (this.isImage(url)) {
        link.as = "image"
      } else if (url.endsWith(".css")) {
        link.as = "style"
      } else if (url.endsWith(".js")) {
        link.as = "script"
      }

      document.head.appendChild(link)
    } catch (error) {
      console.error("Failed to preload asset:", error)
    }
  }

  // Preload in multiple regions
  async preloadInRegions(url, regions) {
    try {
      const preloadPromises = regions.map((region) => {
        return this.preloadInRegion(url, region)
      })

      await Promise.allSettled(preloadPromises)
    } catch (error) {
      console.error("Failed to preload in regions:", error)
    }
  }

  // Preload in specific region
  async preloadInRegion(url, region) {
    try {
      // Mock implementation - in real app, would use CDN API
      const response = await fetch(url, { method: "HEAD" })
      console.log(`Preloaded ${url} in region ${region}:`, response.ok)
    } catch (error) {
      console.error(`Failed to preload in region ${region}:`, error)
    }
  }

  // Perform CDN upload (mock implementation)
  async performCDNUpload(file, path, provider) {
    try {
      // In real implementation, would use CDN provider's API
      const formData = new FormData()
      formData.append("file", file)
      formData.append("path", path)

      // Mock upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Return mock CDN URL
      return `${provider.baseUrl}/${path}`
    } catch (error) {
      console.error("CDN upload failed:", error)
      throw error
    }
  }

  // Generate CDN path
  generateCDNPath(filename, basePath = "") {
    const timestamp = Date.now()
    const hash = this.generateHash(filename + timestamp)
    const ext = filename.split(".").pop()
    const name = filename.replace(/\.[^/.]+$/, "")

    return `${basePath}/${hash}/${name}_${timestamp}.${ext}`.replace(/\/+/g, "/")
  }

  // Generate hash for filename
  generateHash(input) {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Get active CDN provider
  getActiveProvider() {
    const activeProviders = Object.values(this.cdnProviders).filter((p) => p.enabled)
    return activeProviders[0] || null
  }

  // Check if file is an image
  isImage(filename) {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"]
    const ext = filename.split(".").pop().toLowerCase()
    return imageExtensions.includes(ext)
  }

  // Check WebP support
  supportsWebP() {
    if (this._webpSupport !== undefined) return this._webpSupport

    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1
    this._webpSupport = canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0
    return this._webpSupport
  }

  // Cleanup expired cache entries
  cleanupCache() {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key)
      }
    }
  }

  // Get CDN statistics
  getCDNStats() {
    const activeProvider = this.getActiveProvider()
    const cacheSize = this.cache.size
    const hitRate = this.calculateCacheHitRate()

    return {
      activeProvider: activeProvider?.name || "None",
      cacheSize: cacheSize,
      hitRate: hitRate,
      optimizationEnabled: this.optimizationSettings.imageOptimization,
      webpSupport: this.supportsWebP(),
      regions: activeProvider?.regions || [],
    }
  }

  // Calculate cache hit rate
  calculateCacheHitRate() {
    // Mock implementation - in real app, would track actual hits/misses
    return Math.floor(Math.random() * 30) + 70 // 70-100%
  }

  // Purge CDN cache
  async purgeCDNCache(urls = []) {
    try {
      const provider = this.getActiveProvider()
      if (!provider) return

      // Mock purge implementation
      console.log(`Purging CDN cache for ${urls.length} URLs`)

      // Clear local cache
      if (urls.length === 0) {
        this.cache.clear()
      } else {
        urls.forEach((url) => {
          const key = url.split("/").pop()
          this.cache.delete(key)
        })
      }

      return true
    } catch (error) {
      console.error("Failed to purge CDN cache:", error)
      throw error
    }
  }

  // Update CDN settings
  updateSettings(newSettings) {
    this.optimizationSettings = { ...this.optimizationSettings, ...newSettings }

    // Reinitialize if needed
    if (newSettings.imageOptimization !== undefined) {
      this.setupImageOptimization()
    }

    if (newSettings.lazyLoading !== undefined) {
      this.setupLazyLoading()
    }
  }

  // Get optimized image srcset
  getResponsiveSrcSet(originalUrl, sizes = [480, 768, 1024, 1200, 1920]) {
    const srcSet = sizes
      .map((size) => {
        const optimizedUrl = this.getOptimizedUrl(originalUrl, { width: size })
        return `${optimizedUrl} ${size}w`
      })
      .join(", ")

    return srcSet
  }
}

// Initialize CDN integration
const cdnIntegration = new CDNIntegrationService()
