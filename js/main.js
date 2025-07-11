// Main JavaScript file for For Life Trading India
class ForLifeTradingApp {
  constructor() {
    this.currentUser = null
    this.isLoggedIn = false
    this.selectedPlan = "starter"
    this.selectedAmount = 100
    this.init()
  }

  init() {
    this.checkAuthStatus()
    this.setupEventListeners()
    this.initializeParticleBackground()
    this.initializeAnimations()
    this.setupNavigation()
    this.initializeInvestmentCalculator()
  }

  initializeInvestmentCalculator() {
    // Initialize with default values
    this.selectedPlan = "starter"
    this.selectedAmount = 100

    // Set up event listeners for investment calculator
    const investmentSlider = document.getElementById("investmentSlider")
    const investmentAmount = document.getElementById("investmentAmount")

    if (investmentSlider && investmentAmount) {
      investmentSlider.addEventListener("input", () => this.updateSlider())
      investmentAmount.addEventListener("input", () => this.calculateROI())
    }

    // Plan selection radio buttons
    document.querySelectorAll('input[name="planType"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.selectPlanType(e.target.value)
      })
    })

    // Calculate initial ROI
    this.calculateROI()
  }

  checkAuthStatus() {
    try {
      const userData = localStorage.getItem("userData")
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      const sessionActive = localStorage.getItem("sessionActive")

      if (userData && isLoggedIn === "true" && sessionActive === "true") {
        const user = JSON.parse(userData)
        this.currentUser = user
        this.isLoggedIn = true
        console.log("User session found in main.js:", user.id)
      } else {
        this.currentUser = null
        this.isLoggedIn = false
      }
    } catch (error) {
      console.error("Error parsing user data in main.js:", error)
      this.clearSession()
    }
  }

  setupEventListeners() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute("href"))
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      })
    })

    // Mobile navigation toggle
    const hamburger = document.getElementById("hamburger")
    const navMenu = document.getElementById("nav-menu")

    if (hamburger && navMenu) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active")
        navMenu.classList.toggle("active")
      })
    }

    // Close mobile menu when clicking on links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (hamburger && navMenu) {
          hamburger.classList.remove("active")
          navMenu.classList.remove("active")
        }
      })
    })

    // Contact form submission
    const contactForm = document.getElementById("contactForm")
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleContactForm(e.target)
      })
    }

    // Plan selection buttons
    this.setupPlanButtons()

    // Modal controls
    this.setupModalControls()
  }

  setupModalControls() {
    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none"
        document.body.style.overflow = "auto"
      }
    })

    // Close buttons
    document.querySelectorAll(".close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal")
        if (modal) {
          modal.style.display = "none"
          document.body.style.overflow = "auto"
        }
      })
    })
  }

  setupPlanButtons() {
    const planButtons = document.querySelectorAll(".plan-card .btn-primary")
    planButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const planCard = e.target.closest(".plan-card")
        const planName = planCard.querySelector("h3").textContent
        const planPrice = planCard.querySelector(".plan-price").textContent.replace("$", "")

        this.redirectToPayment(planName, planPrice)
      })
    })
  }

  selectPlanType(planType) {
    this.selectedPlan = planType

    // Update visual selection
    document.querySelectorAll(".plan-option").forEach((option) => {
      option.classList.remove("selected")
    })

    const selectedOption = document.querySelector(`[data-plan="${planType}"]`)
    if (selectedOption) {
      selectedOption.classList.add("selected")
    }

    this.calculateROI()
  }

  proceedWithInvestment() {
    const amount = Number.parseFloat(document.getElementById("investmentAmount")?.value || 100)

    if (amount < 20 || amount > 1000) {
      this.showNotification("Investment amount must be between $20 and $1000", "error")
      return
    }

    // Always redirect to payment page regardless of login status
    this.redirectToPayment(this.selectedPlan, amount)
  }

  redirectToPayment(planName, amount) {
    // Store plan selection for payment page
    localStorage.setItem("selectedPlan", planName)
    localStorage.setItem("selectedAmount", amount.toString())

    // Get ROI based on plan
    let roi = "7%"
    let planDisplayName = "Starter"

    if (typeof planName === "string") {
      const lowerPlan = planName.toLowerCase()
      if (lowerPlan.includes("professional") || lowerPlan === "professional") {
        roi = "8%"
        planDisplayName = "Professional"
      } else if (lowerPlan.includes("enterprise") || lowerPlan === "enterprise") {
        roi = "10%"
        planDisplayName = "Enterprise"
      }
    }

    localStorage.setItem("selectedROI", roi)

    this.showNotification(
      `${planDisplayName} plan selected with $${amount} investment! Redirecting to payment...`,
      "success",
    )

    // Redirect to payment page after short delay
    setTimeout(() => {
      window.location.href = `payment.html?plan=${planDisplayName}&amount=${amount}&roi=${roi}`
    }, 1500)
  }

  calculateROI() {
    const amount = Number.parseFloat(document.getElementById("investmentAmount")?.value || 100)
    this.selectedAmount = amount

    // Get selected plan ROI
    let roiRate = 0.07 // Default starter
    let roiPercentage = "7%"

    if (this.selectedPlan === "professional") {
      roiRate = 0.08
      roiPercentage = "8%"
    } else if (this.selectedPlan === "enterprise") {
      roiRate = 0.1
      roiPercentage = "10%"
    }

    const dailyReturn = amount * roiRate
    const weeklyReturn = dailyReturn * 7
    const monthlyReturn = dailyReturn * 30

    // Update display
    const dailyReturnEl = document.getElementById("dailyReturn")
    const weeklyReturnEl = document.getElementById("weeklyReturn")
    const monthlyReturnEl = document.getElementById("monthlyReturn")
    const roiPercentageEl = document.getElementById("roiPercentage")

    if (dailyReturnEl) dailyReturnEl.textContent = `$${dailyReturn.toFixed(2)}`
    if (weeklyReturnEl) weeklyReturnEl.textContent = `$${weeklyReturn.toFixed(2)}`
    if (monthlyReturnEl) monthlyReturnEl.textContent = `$${monthlyReturn.toFixed(2)}`
    if (roiPercentageEl) roiPercentageEl.textContent = roiPercentage

    // Update slider if amount was changed via input
    const slider = document.getElementById("investmentSlider")
    if (slider && slider.value != amount) {
      slider.value = amount
    }

    // Update invest button text
    const investBtn = document.getElementById("investNowBtn")
    if (investBtn) {
      const planName = this.selectedPlan.charAt(0).toUpperCase() + this.selectedPlan.slice(1)
      investBtn.innerHTML = `<i class="fas fa-rocket"></i> Invest $${amount} - ${planName}`
    }
  }

  handleContactForm(form) {
    const formData = new FormData(form)
    const contactData = {
      name: formData.get("name") || form.querySelector('input[type="text"]').value,
      email: formData.get("email") || form.querySelector('input[type="email"]').value,
      message: formData.get("message") || form.querySelector("textarea").value,
    }

    if (!contactData.name || !contactData.email || !contactData.message) {
      this.showNotification("Please fill in all fields", "error")
      return
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]')
    const originalText = submitBtn.innerHTML
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'
    submitBtn.disabled = true

    // Simulate form submission
    setTimeout(() => {
      this.showNotification("Message sent successfully! We will get back to you soon.", "success")
      form.reset()

      // Reset button
      submitBtn.innerHTML = originalText
      submitBtn.disabled = false
    }, 2000)
  }

  updateSlider() {
    const slider = document.getElementById("investmentSlider")
    const input = document.getElementById("investmentAmount")

    if (slider && input) {
      input.value = slider.value
      this.calculateROI()
    }
  }

  initializeParticleBackground() {
    const particlesContainer = document.getElementById("particles")
    if (!particlesContainer) return

    // Create particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 1}px;
        height: ${Math.random() * 4 + 1}px;
        background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 10 + 10}s infinite linear;
      `
      particlesContainer.appendChild(particle)
    }
  }

  initializeAnimations() {
    // Animate statistics on scroll
    const observerOptions = {
      threshold: 0.5,
      rootMargin: "0px 0px -100px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateStatNumbers()
          observer.unobserve(entry.target)
        }
      })
    }, observerOptions)

    const statsSection = document.querySelector(".hero-stats")
    if (statsSection) {
      observer.observe(statsSection)
    }
  }

  animateStatNumbers() {
    const statNumbers = document.querySelectorAll(".stat-number")

    statNumbers.forEach((stat) => {
      const target = Number.parseInt(stat.getAttribute("data-target"))
      const duration = 2000
      const step = target / (duration / 16)
      let current = 0

      const timer = setInterval(() => {
        current += step
        if (current >= target) {
          current = target
          clearInterval(timer)
        }

        if (target >= 1000) {
          stat.textContent = Math.floor(current).toLocaleString()
        } else {
          stat.textContent = Math.floor(current)
        }
      }, 16)
    })
  }

  setupNavigation() {
    // Navbar scroll effect
    const navbar = document.getElementById("navbar")
    if (navbar) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
          navbar.classList.add("scrolled")
        } else {
          navbar.classList.remove("scrolled")
        }
      })
    }

    // Update navigation based on auth status
    this.updateNavigation()
  }

  updateNavigation() {
    const navAuth = document.querySelector(".nav-auth")
    if (!navAuth) return

    if (this.isLoggedIn && this.currentUser) {
      navAuth.innerHTML = `
        <span class="user-greeting">Hello, ${this.currentUser.name.split(" ")[0]}</span>
        <button class="btn-primary" onclick="window.location.href='dashboard.html'">Dashboard</button>
        <button class="btn-secondary" onclick="forLifeTradingApp.logout()">Logout</button>
      `
    } else {
      navAuth.innerHTML = `
        <button class="btn-secondary" onclick="showModal('loginModal')">Login</button>
        <button class="btn-primary" onclick="showModal('registerModal')">Register</button>
      `
    }
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "block"
      document.body.style.overflow = "hidden"
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  }

  clearSession() {
    this.currentUser = null
    this.isLoggedIn = false
    localStorage.removeItem("userData")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("sessionActive")
    localStorage.removeItem("loginTime")
    this.updateNavigation()
  }

  logout() {
    const confirmLogout = confirm("Are you sure you want to logout?")

    if (confirmLogout) {
      this.clearSession()
      this.showNotification("Logged out successfully", "success")

      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : type === "warning" ? "exclamation-triangle" : "info-circle"}"></i>
        <span>${message}</span>
      </div>
    `

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

    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  checkReferralCode() {
    const urlParams = new URLSearchParams(window.location.search)
    const referralCode = urlParams.get("ref")

    if (referralCode) {
      const referralInput = document.getElementById("referralCode")
      if (referralInput) {
        referralInput.value = referralCode
        referralInput.readOnly = true
        this.showNotification("Referral code applied successfully!", "success")
      }
    }
  }

  generateUserId() {
    const prefix = "LIFE"
    const number = Math.floor(10000 + Math.random() * 90000)
    return prefix + number
  }

  generateReferralCode() {
    return "REF" + Math.floor(100000 + Math.random() * 900000)
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.forLifeTradingApp = new ForLifeTradingApp()
})

// Global functions for backward compatibility
function showModal(modalId) {
  if (window.forLifeTradingApp) {
    window.forLifeTradingApp.showModal(modalId)
  }
}

function hideModal(modalId) {
  if (window.forLifeTradingApp) {
    window.forLifeTradingApp.hideModal(modalId)
  }
}

function showToast(message, type) {
  if (window.forLifeTradingApp) {
    window.forLifeTradingApp.showNotification(message, type)
  }
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

function selectPlan(planName, amount, roi) {
  if (window.forLifeTradingApp) {
    window.forLifeTradingApp.redirectToPayment(planName, amount)
  }
}

function calculateROI() {
  if (window.forLifeTradingApp) {
    window.forLifeTradingApp.calculateROI()
  }
}

function updateSlider() {
  if (window.forLifeTradingApp) {
    window.forLifeTradingApp.updateSlider()
  }
}

// Add CSS for floating particles animation
const style = document.createElement("style")
style.textContent = `
  @keyframes float {
    0% {
      transform: translateY(100vh) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100px) rotate(360deg);
      opacity: 0;
    }
  }

  .navbar.scrolled {
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
  }

  .notification {
    font-family: 'Poppins', sans-serif;
  }

  .user-greeting {
    color: var(--text-primary, #fff);
    font-weight: 500;
    margin-right: 1rem;
  }
`
document.head.appendChild(style)

// Global function for the invest button
function proceedWithInvestment() {
  if (window.forLifeTradingApp) {
    window.forLifeTradingApp.proceedWithInvestment()
  }
}
