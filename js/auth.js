// Authentication system
class AuthSystem {
  constructor() {
    this.currentUser = null
    this.sessionTimeout = 24 * 60 * 60 * 1000 // 24 hours
    this.isLoggingOut = false
    this.init()
  }

  init() {
    this.loadCurrentUser()
    this.setupEventListeners()
    this.updateUIBasedOnAuth()
    this.startSessionMonitoring()
  }

  loadCurrentUser() {
    try {
      const userData = localStorage.getItem("userData")
      const loginTime = localStorage.getItem("loginTime")
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      const sessionActive = localStorage.getItem("sessionActive")

      console.log("Loading user session:", {
        hasUserData: !!userData,
        isLoggedIn,
        sessionActive,
        loginTime,
      })

      if (userData && isLoggedIn === "true" && sessionActive === "true") {
        const user = JSON.parse(userData)
        const currentTime = new Date().getTime()
        const sessionAge = currentTime - Number.parseInt(loginTime || "0")

        // Check if session is still valid (24 hours)
        if (sessionAge < this.sessionTimeout) {
          this.currentUser = user
          // Update login time to extend session
          localStorage.setItem("loginTime", currentTime.toString())
          console.log("User session loaded successfully:", user.id)
          return true
        } else {
          console.log("Session expired, clearing data")
          this.clearSession()
          return false
        }
      } else {
        console.log("No valid session found")
        return false
      }
    } catch (error) {
      console.error("Error loading user session:", error)
      this.clearSession()
      return false
    }
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleLogin(e.target)
      })
    }

    // Register form
    const registerForm = document.getElementById("registerForm")
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleRegister(e.target)
      })
    }

    // Prevent accidental navigation away
    window.addEventListener("beforeunload", (e) => {
      if (this.isAuthenticated() && window.location.pathname.includes("dashboard")) {
        // Don't show confirmation for logout button clicks
        if (!this.isLoggingOut) {
          e.preventDefault()
          e.returnValue = ""
        }
      }
    })

    // Handle page visibility change
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isAuthenticated()) {
        this.extendSession()
      }
    })

    // Handle page focus
    window.addEventListener("focus", () => {
      if (this.isAuthenticated()) {
        this.extendSession()
      }
    })
  }

  handleLogin(form) {
    const email = form.querySelector('input[type="email"]').value
    const password = form.querySelector('input[type="password"]').value

    if (!email || !password) {
      this.showNotification("Please fill in all fields", "error")
      return
    }

    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...'
    submitBtn.disabled = true

    // Simulate login process
    setTimeout(() => {
      try {
        // For demo purposes, accept any email/password combination
        // In real app, this would validate against a backend
        const userData = {
          id: "LIFE10002",
          name: email.split("@")[0].toUpperCase() + " TRADING",
          email: email,
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

        this.loginUser(userData)
        this.hideModal("loginModal")
        this.showNotification("Login successful!", "success")

        // Reset button
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false

        // Clear form
        form.reset()

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      } catch (error) {
        console.error("Login error:", error)
        this.showNotification("Login failed. Please try again.", "error")

        // Reset button
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false
      }
    }, 1500)
  }

  handleRegister(form) {
    const name = form.querySelector('input[placeholder="Full Name"]').value
    const email = form.querySelector('input[type="email"]').value
    const password = form.querySelector('input[type="password"]').value
    const referralCode = form.querySelector("#referralCode")?.value || ""

    if (!name || !email || !password) {
      this.showNotification("Please fill in all required fields", "error")
      return
    }

    // Validate email
    if (!this.isValidEmail(email)) {
      this.showNotification("Please enter a valid email address", "error")
      return
    }

    // Validate password
    if (password.length < 6) {
      this.showNotification("Password must be at least 6 characters long", "error")
      return
    }

    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...'
    submitBtn.disabled = true

    // Simulate registration process
    setTimeout(() => {
      try {
        // Create new user
        const newUser = {
          id: "LIFE" + Date.now().toString().slice(-5),
          name: name,
          email: email,
          referralCode: referralCode || null,
          joinDate: new Date().toISOString(),
          status: "Active",
          totalIncome: 0,
          teamTotal: 0,
          rank: "Newcomer",
          referrals: 0,
          activeDirects: 0,
          dailyIncome: 0,
          dailyBalance: 0,
          dailyTeamIncome: 0,
          teamEarnings: 0,
          rankRewards: 0,
          currentRank: "Newcomer",
          nextRank: "BRONZE",
          selfIncome: 0,
          matrixIncome: 0,
          directBonus: 0,
          incomeWallet: 0,
          investmentWallet: 0,
          cryptoWallet: 0,
        }

        this.loginUser(newUser)
        this.hideModal("registerModal")
        this.showNotification("Registration successful! Welcome to For Life Trading!", "success")

        // Reset button
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false

        // Clear form
        form.reset()

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      } catch (error) {
        console.error("Registration error:", error)
        this.showNotification("Registration failed. Please try again.", "error")

        // Reset button
        submitBtn.innerHTML = originalText
        submitBtn.disabled = false
      }
    }, 2000)
  }

  loginUser(user) {
    const currentTime = new Date().getTime()

    try {
      this.currentUser = user
      localStorage.setItem("userData", JSON.stringify(user))
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("loginTime", currentTime.toString())
      localStorage.setItem("sessionActive", "true")

      console.log("User logged in successfully:", user.id)
      console.log("Session data stored:", {
        userData: !!localStorage.getItem("userData"),
        isLoggedIn: localStorage.getItem("isLoggedIn"),
        sessionActive: localStorage.getItem("sessionActive"),
        loginTime: localStorage.getItem("loginTime"),
      })

      this.updateUIBasedOnAuth()
      return true
    } catch (error) {
      console.error("Error storing user session:", error)
      this.showNotification("Error saving session. Please try again.", "error")
      return false
    }
  }

  logout() {
    // Set flag to prevent beforeunload confirmation
    this.isLoggingOut = true

    // Show confirmation dialog
    const confirmLogout = confirm("Are you sure you want to logout?")

    if (confirmLogout) {
      this.clearSession()
      this.showNotification("Logged out successfully", "success")

      // Redirect to home page after a delay
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1000)
    } else {
      this.isLoggingOut = false
    }
  }

  clearSession() {
    try {
      this.currentUser = null
      localStorage.removeItem("userData")
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("loginTime")
      localStorage.removeItem("sessionActive")

      // Clear other related data
      localStorage.removeItem("currentPayment")
      localStorage.removeItem("selectedPlan")
      localStorage.removeItem("selectedAmount")
      localStorage.removeItem("selectedROI")

      console.log("Session cleared successfully")
      this.updateUIBasedOnAuth()
    } catch (error) {
      console.error("Error clearing session:", error)
    }
  }

  startSessionMonitoring() {
    // Check session every 5 minutes
    setInterval(
      () => {
        if (this.isAuthenticated()) {
          const loginTime = localStorage.getItem("loginTime")
          const currentTime = new Date().getTime()
          const sessionAge = currentTime - Number.parseInt(loginTime || "0")

          // If session is about to expire (23 hours), extend it
          if (sessionAge > this.sessionTimeout - 60 * 60 * 1000) {
            this.extendSession()
          }
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes
  }

  extendSession() {
    if (this.isAuthenticated()) {
      const currentTime = new Date().getTime()
      localStorage.setItem("loginTime", currentTime.toString())
      console.log("Session extended")
    }
  }

  updateUIBasedOnAuth() {
    const isLoggedIn = this.isAuthenticated()

    // Update navigation only if not on dashboard page
    if (!window.location.pathname.includes("dashboard")) {
      const navAuth = document.querySelector(".nav-auth")
      if (navAuth) {
        if (isLoggedIn && this.currentUser) {
          navAuth.innerHTML = `
            <span class="user-greeting">Hello, ${this.currentUser.name.split(" ")[0]}</span>
            <button class="btn-primary" onclick="window.location.href='dashboard.html'">Dashboard</button>
            <button class="btn-secondary" onclick="authSystem.logout()">Logout</button>
          `
        } else {
          navAuth.innerHTML = `
            <button class="btn-secondary" onclick="showModal('loginModal')">Login</button>
            <button class="btn-primary" onclick="showModal('registerModal')">Register</button>
          `
        }
      }
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  isAuthenticated() {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      const sessionActive = localStorage.getItem("sessionActive") === "true"
      const userData = localStorage.getItem("userData")
      const loginTime = localStorage.getItem("loginTime")

      if (!isLoggedIn || !sessionActive || !userData || !loginTime) {
        return false
      }

      // Check session timeout
      const currentTime = new Date().getTime()
      const sessionAge = currentTime - Number.parseInt(loginTime)

      if (sessionAge > this.sessionTimeout) {
        console.log("Session expired due to timeout")
        this.clearSession()
        return false
      }

      // Verify user data is valid
      try {
        const user = JSON.parse(userData)
        if (!user.id || !user.email) {
          console.log("Invalid user data")
          this.clearSession()
          return false
        }
      } catch (error) {
        console.log("Error parsing user data")
        this.clearSession()
        return false
      }

      return true
    } catch (error) {
      console.error("Error checking authentication:", error)
      return false
    }
  }

  requireAuth() {
    if (!this.isAuthenticated()) {
      console.log("Authentication required, redirecting to login")
      this.showNotification("Please login to access this page", "warning")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1500)
      return false
    }
    return true
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : type === "warning" ? "exclamation-triangle" : "info-circle"}"></i>
        <span>${message}</span>
      </div>
    `

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : type === "warning" ? "#ff9800" : "#2196F3"};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      font-family: 'Poppins', sans-serif;
    `

    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  }
}

// Initialize auth system
const authSystem = new AuthSystem()

// Global auth functions
function requireAuthentication() {
  return authSystem.requireAuth()
}

function getCurrentUser() {
  return authSystem.currentUser
}

function isUserLoggedIn() {
  return authSystem.isAuthenticated()
}

// Global modal functions
function showModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "block"
    document.body.style.overflow = "hidden"
  }
}

function hideModal(modalId) {
  authSystem.hideModal(modalId)
}

// Prevent back button issues
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    // Page was loaded from cache, reload to ensure fresh state
    window.location.reload()
  }
})

// Handle browser back/forward navigation
window.addEventListener("popstate", (event) => {
  // Reload the page to ensure proper authentication state
  window.location.reload()
})
