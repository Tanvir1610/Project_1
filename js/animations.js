// Animation utilities and effects
class AnimationManager {
  constructor() {
    this.observers = []
    this.init()
  }

  init() {
    this.setupIntersectionObserver()
    this.setupParticleBackground()
    this.setupScrollAnimations()
  }

  setupIntersectionObserver() {
    // Create intersection observer for fade-in animations
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in")
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    // Observe all dashboard cards
    const cards = document.querySelectorAll(".dashboard-card")
    cards.forEach((card) => {
      fadeObserver.observe(card)
    })

    this.observers.push(fadeObserver)
  }

  setupParticleBackground() {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Create particle background container
    let particleContainer = document.getElementById("particle-background")
    if (!particleContainer) {
      particleContainer = document.createElement("div")
      particleContainer.id = "particle-background"
      particleContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
                opacity: 0.3;
            `
      document.body.appendChild(particleContainer)
    }

    canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `

    particleContainer.appendChild(canvas)

    // Particle system
    const particles = []
    const particleCount = 50
    let animationId

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.5 ? "#00d4ff" : "#7c3aed",
    })

    const initParticles = () => {
      particles.length = 0
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle())
      }
    }

    const updateParticles = () => {
      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
      })
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`
        ctx.fill()

        // Draw connections between nearby particles
        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `${particle.color}${Math.floor((1 - distance / 100) * 0.2 * 255)
              .toString(16)
              .padStart(2, "0")}`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
    }

    const animate = () => {
      updateParticles()
      drawParticles()
      animationId = requestAnimationFrame(animate)
    }

    // Initialize
    resizeCanvas()
    initParticles()
    animate()

    // Handle resize
    window.addEventListener("resize", () => {
      resizeCanvas()
      initParticles()
    })

    // Cleanup function
    this.cleanupParticles = () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }

  setupScrollAnimations() {
    // Smooth scroll behavior for internal links
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

    // Parallax effect for header
    let ticking = false
    const updateParallax = () => {
      const scrolled = window.pageYOffset
      const header = document.querySelector(".dashboard-header")

      if (header) {
        header.style.transform = `translateY(${scrolled * 0.5}px)`
      }

      ticking = false
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax)
        ticking = true
      }
    })
  }

  // Utility functions for animations
  fadeIn(element, duration = 300) {
    element.style.opacity = "0"
    element.style.display = "block"

    let start = null
    const animate = (timestamp) => {
      if (!start) start = timestamp
      const progress = timestamp - start

      element.style.opacity = Math.min(progress / duration, 1)

      if (progress < duration) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  fadeOut(element, duration = 300) {
    let start = null
    const animate = (timestamp) => {
      if (!start) start = timestamp
      const progress = timestamp - start

      element.style.opacity = Math.max(1 - progress / duration, 0)

      if (progress < duration) {
        requestAnimationFrame(animate)
      } else {
        element.style.display = "none"
      }
    }

    requestAnimationFrame(animate)
  }

  slideIn(element, direction = "left", duration = 300) {
    const transforms = {
      left: "translateX(-100%)",
      right: "translateX(100%)",
      up: "translateY(-100%)",
      down: "translateY(100%)",
    }

    element.style.transform = transforms[direction]
    element.style.display = "block"

    let start = null
    const animate = (timestamp) => {
      if (!start) start = timestamp
      const progress = timestamp - start
      const percentage = Math.min(progress / duration, 1)

      element.style.transform = `${transforms[direction].replace("100%", `${100 - percentage * 100}%`)}`

      if (progress < duration) {
        requestAnimationFrame(animate)
      } else {
        element.style.transform = "translate(0, 0)"
      }
    }

    requestAnimationFrame(animate)
  }

  pulse(element, scale = 1.1, duration = 200) {
    const originalTransform = element.style.transform

    let start = null
    const animate = (timestamp) => {
      if (!start) start = timestamp
      const progress = timestamp - start
      const percentage = progress / duration

      if (percentage < 0.5) {
        // Scale up
        const currentScale = 1 + (scale - 1) * (percentage * 2)
        element.style.transform = `${originalTransform} scale(${currentScale})`
      } else {
        // Scale down
        const currentScale = scale - (scale - 1) * ((percentage - 0.5) * 2)
        element.style.transform = `${originalTransform} scale(${currentScale})`
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        element.style.transform = originalTransform
      }
    }

    requestAnimationFrame(animate)
  }

  // Cleanup function
  destroy() {
    this.observers.forEach((observer) => observer.disconnect())
    if (this.cleanupParticles) {
      this.cleanupParticles()
    }
  }
}

// Initialize animation manager
let animationManager
document.addEventListener("DOMContentLoaded", () => {
  animationManager = new AnimationManager()
})

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (animationManager) {
    animationManager.destroy()
  }
})

// Export for global use
window.AnimationManager = AnimationManager

// Global animation utilities
window.animateElement = (element, animation, options = {}) => {
  if (!animationManager) return

  switch (animation) {
    case "fadeIn":
      animationManager.fadeIn(element, options.duration)
      break
    case "fadeOut":
      animationManager.fadeOut(element, options.duration)
      break
    case "slideIn":
      animationManager.slideIn(element, options.direction, options.duration)
      break
    case "pulse":
      animationManager.pulse(element, options.scale, options.duration)
      break
  }
}
