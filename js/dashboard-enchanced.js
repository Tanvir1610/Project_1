// Enhanced Dashboard JavaScript
class DashboardManager {
  constructor() {
    this.userData = null
    this.isInitialized = false
    this.updateInterval = null
    this.init()
  }

  init() {
    this.loadUserData()
    this.setupEventListeners()
    this.startRealTimeUpdates()
    this.addAnimations()
    this.isInitialized = true
  }

  loadUserData() {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      try {
        this.userData = JSON.parse(storedData)
        this.updateDashboard()
      } catch (error) {
        console.error("Error parsing user data:", error)
        this.setDefaultData()
      }
    } else {
      this.setDefaultData()
    }
  }

  setDefaultData() {
    this.userData = {
      id: "LIFE10002",
      name: "4LIFE TRADING INDIA",
      email: "info@forlifetradingindia.com",
      status: "Active",
      totalIncome: 175.0,
      teamTotal: 3,
      rank: "Newcomer",
      referrals: 3,
      activeDirects: 3,
      dailyIncome: 15.0,
      dailyBalance: 175.0,
      dailyTeamIncome: 0.0,
      teamEarnings: 175.0,
      rankRewards: 0.0,
      currentRank: "Newcomer",
      nextRank: "BRONZE",
      selfIncome: 10.0,
      matrixIncome: 0.0,
      directBonus: 150.0,
      incomeWallet: 175.0,
      investmentWallet: 5991.2,
      cryptoWallet: 494.41,
      joinDate: new Date().toISOString(),
    }
    this.updateDashboard()
  }

  updateDashboard() {
    if (!this.userData) return

    // Update header information
    this.updateElement("welcome-text", `Welcome ${this.userData.id}`)
    this.updateElement("company-name", this.userData.name)
    this.updateElement("user-id", this.userData.id)
    this.updateElement("user-email", this.userData.email)
    this.updateElement("account-status", this.userData.status)

    // Update total income banner
    this.updateElement("total-income-amount", `₹${this.userData.totalIncome.toFixed(2)}`)

    // Update dashboard cards
    this.updateElement("team-total", this.userData.teamTotal)
    this.updateElement("user-rank", this.userData.rank)
    this.updateElement("referrals-count", this.userData.referrals)
    this.updateElement("active-directs", this.userData.activeDirects)
    this.updateElement("daily-income", `₹${this.userData.dailyIncome.toFixed(2)}`)
    this.updateElement("daily-balance", this.userData.dailyBalance.toFixed(2))
    this.updateElement("daily-team-income", `₹${this.userData.dailyTeamIncome.toFixed(2)}`)
    this.updateElement("team-earnings", this.userData.teamEarnings.toFixed(2))
    this.updateElement("rank-rewards", `₹${this.userData.rankRewards.toFixed(2)}`)
    this.updateElement("current-rank", this.userData.currentRank)
    this.updateElement("next-rank", this.userData.nextRank)
    this.updateElement("self-income", `₹${this.userData.selfIncome.toFixed(2)}`)
    this.updateElement("matrix-income", `₹${this.userData.matrixIncome.toFixed(2)}`)
    this.updateElement("direct-bonus", `₹${this.userData.directBonus.toFixed(2)}`)
    this.updateElement("income-wallet", `₹${this.userData.incomeWallet.toFixed(2)}`)
    this.updateElement("investment-wallet", `₹${this.userData.investmentWallet.toFixed(2)}`)
    this.updateElement("crypto-wallet", `${this.userData.cryptoWallet.toFixed(2)} FLT Coin`)
  }

  updateElement(id, value) {
    const element = document.getElementById(id)
    if (element) {
      element.textContent = value
    }
  }

  setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn")
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", this.toggleMobileMenu.bind(this))
    }

    // Card hover effects
    const cards = document.querySelectorAll(".dashboard-card")
    cards.forEach((card) => {
      card.addEventListener("mouseenter", this.handleCardHover.bind(this))
      card.addEventListener("mouseleave", this.handleCardLeave.bind(this))
    })

    // Crypto wallet actions
    const buyBtn = document.querySelector(".buy-btn")
    const sellBtn = document.querySelector(".sell-btn")

    if (buyBtn) {
      buyBtn.addEventListener("click", () => this.showToast("Buy crypto functionality coming soon!", "info"))
    }

    if (sellBtn) {
      sellBtn.addEventListener("click", () => this.showToast("Sell crypto functionality coming soon!", "info"))
    }

    // View more button
    const viewMoreBtn = document.querySelector(".view-more-btn")
    if (viewMoreBtn) {
      viewMoreBtn.addEventListener("click", () => this.showToast("Rank details modal coming soon!", "info"))
    }

    // Mobile sidebar specific event listeners
    const closeSidebarBtn = document.getElementById("close-sidebar-btn")
    const mobileSidebar = document.getElementById("mobile-dashboard-sidebar")
    const mobileSidebarOverlay = document.getElementById("mobile-sidebar-overlay")
    const logoutBtnMobile = document.getElementById("logout-btn-mobile")

    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener("click", this.toggleMobileMenu.bind(this))
    }
    if (mobileSidebarOverlay) {
      mobileSidebarOverlay.addEventListener("click", this.toggleMobileMenu.bind(this))
    }
    if (mobileSidebar) {
      // Close sidebar when a menu item is clicked (if it's a link)
      mobileSidebar.querySelectorAll(".sidebar-menu-item").forEach((item) => {
        if (item.tagName === "A") {
          item.addEventListener("click", this.toggleMobileMenu.bind(this))
        }
      })
    }
    if (logoutBtnMobile) {
      logoutBtnMobile.addEventListener("click", this.handleLogout.bind(this))
    }
  }

  toggleMobileMenu() {
    const mobileSidebar = document.getElementById("mobile-dashboard-sidebar")
    const mobileSidebarOverlay = document.getElementById("mobile-sidebar-overlay")

    if (mobileSidebar && mobileSidebarOverlay) {
      mobileSidebar.classList.toggle("active")
      mobileSidebarOverlay.classList.toggle("active")
      // Prevent scrolling when sidebar is open
      document.body.style.overflow = mobileSidebar.classList.contains("active") ? "hidden" : ""
    }
  }

  handleCardHover(event) {
    const card = event.currentTarget
    card.style.transform = "translateY(-8px) scale(1.02)"
  }

  handleCardLeave(event) {
    const card = event.currentTarget
    card.style.transform = "translateY(0) scale(1)"
  }

  startRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    this.updateInterval = setInterval(() => {
      this.simulateDataUpdates()
    }, 30000)
  }

  simulateDataUpdates() {
    if (!this.userData) return

    // Simulate small changes in crypto wallet
    const cryptoChange = (Math.random() - 0.5) * 2 // -1 to +1
    this.userData.cryptoWallet += cryptoChange

    // Simulate investment wallet changes
    const investmentChange = (Math.random() - 0.5) * 10 // -5 to +5
    this.userData.investmentWallet += investmentChange

    // Update display
    this.updateElement("crypto-wallet", `${this.userData.cryptoWallet.toFixed(2)} FLT Coin`)
    this.updateElement("investment-wallet", `₹${this.userData.investmentWallet.toFixed(2)}`)

    // Save updated data
    localStorage.setItem("userData", JSON.stringify(this.userData))
  }

  addAnimations() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll(".dashboard-card")
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`
      card.classList.add("fade-in")
    })

    // Add slide-in animation to header
    const header = document.querySelector(".dashboard-header")
    if (header) {
      header.classList.add("slide-in-right")
    }

    // Add bounce-in animation to total income banner
    const banner = document.querySelector(".total-income-banner")
    if (banner) {
      banner.classList.add("bounce-in")
    }
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-${type === "success" ? "check" : type === "error" ? "times" : "info"}"></i>
        <span>${message}</span>
      </div>
    `

    let container = document.getElementById("toast-container")
    if (!container) {
      container = document.createElement("div")
      container.id = "toast-container"
      document.body.appendChild(container)
    }

    container.appendChild(toast)

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100)

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  handleLogout() {
    // Clear update interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    // Clear all data
    localStorage.clear()

    // Redirect to home page
    window.location.href = "index.html"
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.isInitialized = false
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dashboardManager = new DashboardManager()
})

// Global functions for backward compatibility
function showToast(message, type) {
  if (window.dashboardManager) {
    window.dashboardManager.showToast(message, type)
  }
}

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (window.dashboardManager) {
    if (document.hidden) {
      // Page is hidden, pause updates
      if (window.dashboardManager.updateInterval) {
        clearInterval(window.dashboardManager.updateInterval)
      }
    } else {
      // Page is visible, resume updates
      window.dashboardManager.startRealTimeUpdates()
    }
  }
})

// Handle page unload
window.addEventListener("beforeunload", () => {
  if (window.dashboardManager) {
    window.dashboardManager.destroy()
  }
})
