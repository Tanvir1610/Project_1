// Modal system for the MLM platform
class ModalSystem {
  constructor() {
    this.activeModals = new Set()
    this.init()
  }

  init() {
    this.createModalStyles()
    this.setupEventListeners()
    this.createPredefinedModals()
  }

  createModalStyles() {
    const style = document.createElement("style")
    style.textContent = `
            .modal {
                display: none;
                position: fixed;
                z-index: 10000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                background: linear-gradient(135deg, var(--dark-card), var(--dark-surface));
                margin: 5% auto;
                padding: 0;
                border-radius: 15px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            }
            
            .modal-content h2 {
                background: var(--gradient-primary);
                color: var(--dark-bg);
                margin: 0;
                padding: 20px;
                border-radius: 15px 15px 0 0;
                font-weight: 700;
            }
            
            .modal-body {
                padding: 20px;
                color: var(--text-primary);
            }
            
            .modal-body h3 {
                color: var(--primary-color);
                margin-top: 20px;
                margin-bottom: 10px;
            }
            
            .modal-body h4 {
                color: var(--text-primary);
                margin-top: 15px;
                margin-bottom: 8px;
            }
            
            .modal-body ul {
                padding-left: 20px;
                margin-bottom: 15px;
            }
            
            .modal-body li {
                margin-bottom: 5px;
                color: var(--text-secondary);
            }
            
            .income-example {
                background: rgba(0, 212, 255, 0.1);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin-top: 15px;
            }
            
            .faq-item, .rule-item {
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .faq-item:last-child, .rule-item:last-child {
                border-bottom: none;
            }
            
            .close {
                color: var(--dark-bg);
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                line-height: 1;
                margin-top: -5px;
            }
            
            .close:hover {
                opacity: 0.7;
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    margin: 10% auto;
                    max-height: 85vh;
                }
                
                .modal-body {
                    padding: 15px;
                }
            }
        `
    document.head.appendChild(style)
  }

  setupEventListeners() {
    // Close modal when clicking outside
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.hideModal(e.target.id)
      }
    })

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const openModals = document.querySelectorAll('.modal[style*="block"]')
        openModals.forEach((modal) => {
          this.hideModal(modal.id)
        })
      }
    })
  }

  createPredefinedModals() {
    this.createTermsModal()
    this.createFAQModal()
    this.createWithdrawalModal()
    // Removed createDashboardModal() since users go to dashboard.html directly
  }

  createTermsModal() {
    const modal = document.createElement("div")
    modal.id = "termsModal"
    modal.className = "modal"
    modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="hideModal('termsModal')">&times;</span>
                <h2>Terms & Conditions</h2>
                <div class="modal-body">
                    <div class="terms-section">
                        <h3>1. Account Requirements</h3>
                        <ul>
                            <li>One account per person (PAN card verification required)</li>
                            <li>Valid email address and phone number mandatory</li>
                            <li>Minimum age requirement: 18 years</li>
                            <li>Complete KYC verification within 30 days</li>
                        </ul>
                    </div>
                    
                    <div class="terms-section">
                        <h3>2. Investment Terms</h3>
                        <ul>
                            <li>Minimum investment: $20</li>
                            <li>Maximum investment: $1000</li>
                            <li>Daily ROI: 7-10% based on plan</li>
                            <li>Investment period: 365 days</li>
                        </ul>
                    </div>
                    
                    <div class="terms-section">
                        <h3>3. Withdrawal Rules</h3>
                        <ul>
                            <li>Minimum withdrawal: $10</li>
                            <li>At least 1 direct referral required</li>
                            <li>Withdrawal window: Monday-Friday, 10 PM - 10 AM</li>
                            <li>10% TDS deducted by admin</li>
                            <li>Processing time: 24-48 hours</li>
                        </ul>
                    </div>
                    
                    <div class="terms-section">
                        <h3>4. Referral System</h3>
                        <ul>
                            <li>Direct sponsor income: $3 per referral</li>
                            <li>Level income: 8 levels deep</li>
                            <li>Matrix income: 7 levels</li>
                            <li>Daily self income: $0.50 guaranteed</li>
                        </ul>
                    </div>
                    
                    <div class="terms-section">
                        <h3>5. Prohibited Activities</h3>
                        <ul>
                            <li>Multiple accounts creation</li>
                            <li>Fake referrals or manipulation</li>
                            <li>Sharing account credentials</li>
                            <li>Fraudulent activities</li>
                        </ul>
                    </div>
                </div>
            </div>
        `
    document.body.appendChild(modal)
  }

  createFAQModal() {
    const modal = document.createElement("div")
    modal.id = "faqModal"
    modal.className = "modal"
    modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="hideModal('faqModal')">&times;</span>
                <h2>Frequently Asked Questions</h2>
                <div class="modal-body">
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFAQ(this)">
                            <span>How do I start earning?</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>Simply register with a minimum investment of $20, complete your KYC, and start referring others. You'll earn $0.50 daily plus referral bonuses immediately.</p>
                        </div>
                    </div>
                    
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFAQ(this)">
                            <span>What is the minimum withdrawal amount?</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>The minimum withdrawal amount is $10. You need at least 1 direct referral to be eligible for withdrawal.</p>
                        </div>
                    </div>
                    
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFAQ(this)">
                            <span>How does the referral system work?</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>You earn $3 for each direct referral, plus income from 8 levels deep in your network. There's also a matrix system with 7 levels of earning potential.</p>
                        </div>
                    </div>
                    
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFAQ(this)">
                            <span>When can I withdraw my earnings?</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>Withdrawals are processed Monday to Friday between 10 PM and 10 AM. A 10% TDS is deducted by admin.</p>
                        </div>
                    </div>
                    
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFAQ(this)">
                            <span>Is there a maximum earning limit?</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>No, there's no maximum earning limit. Your earnings depend on your investment amount, referrals, and network activity.</p>
                        </div>
                    </div>
                    
                    <div class="faq-item">
                        <div class="faq-question" onclick="toggleFAQ(this)">
                            <span>What documents are required for KYC?</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <p>You need a valid PAN card, Aadhaar card, and bank account details. All documents must be clear and valid.</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    document.body.appendChild(modal)
  }

  createWithdrawalModal() {
    const modal = document.createElement("div")
    modal.id = "withdrawalModal"
    modal.className = "modal"
    modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="hideModal('withdrawalModal')">&times;</span>
                <h2>Withdrawal Rules & Status</h2>
                <div class="modal-body">
                    <div class="terms-section">
                        <h3>Withdrawal Conditions</h3>
                        <ul>
                            <li><strong>Minimum Amount:</strong> $10</li>
                            <li><strong>Required:</strong> At least 1 direct referral</li>
                            <li><strong>Timing:</strong> Monday-Friday, 10 PM - 10 AM</li>
                            <li><strong>TDS:</strong> 10% deducted by admin</li>
                            <li><strong>Processing:</strong> 24-48 hours</li>
                        </ul>
                    </div>
                    
                    <div class="terms-section">
                        <h3>Recent Withdrawal History</h3>
                        <table class="withdrawal-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>TDS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>2024-01-15</td>
                                    <td>$50.00</td>
                                    <td><span class="status-approved">Approved</span></td>
                                    <td>$5.00</td>
                                </tr>
                                <tr>
                                    <td>2024-01-10</td>
                                    <td>$25.00</td>
                                    <td><span class="status-pending">Pending</span></td>
                                    <td>$2.50</td>
                                </tr>
                                <tr>
                                    <td>2024-01-05</td>
                                    <td>$100.00</td>
                                    <td><span class="status-approved">Approved</span></td>
                                    <td>$10.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="terms-section">
                        <h3>Request New Withdrawal</h3>
                        <form id="withdrawalForm">
                            <div class="form-group">
                                <label>Amount ($)</label>
                                <input type="number" min="10" placeholder="Minimum $10" required>
                            </div>
                            <div class="form-group">
                                <label>Bank Account</label>
                                <select required>
                                    <option value="">Select Account</option>
                                    <option value="acc1">HDFC Bank - ****1234</option>
                                    <option value="acc2">SBI Bank - ****5678</option>
                                </select>
                            </div>
                            <button type="submit" class="btn-primary">Request Withdrawal</button>
                        </form>
                    </div>
                </div>
            </div>
        `
    document.body.appendChild(modal)
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "block"
      this.activeModals.add(modalId)
      document.body.style.overflow = "hidden"

      // Add animation
      const modalContent = modal.querySelector(".modal-content")
      if (modalContent) {
        modalContent.style.transform = "scale(0.7)"
        modalContent.style.opacity = "0"

        setTimeout(() => {
          modalContent.style.transform = "scale(1)"
          modalContent.style.opacity = "1"
          modalContent.style.transition = "all 0.3s ease"
        }, 10)
      }
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      const modalContent = modal.querySelector(".modal-content")
      if (modalContent) {
        modalContent.style.transform = "scale(0.7)"
        modalContent.style.opacity = "0"
        modalContent.style.transition = "all 0.3s ease"

        setTimeout(() => {
          modal.style.display = "none"
          this.activeModals.delete(modalId)
          if (this.activeModals.size === 0) {
            document.body.style.overflow = "auto"
          }
        }, 300)
      } else {
        modal.style.display = "none"
        this.activeModals.delete(modalId)
        if (this.activeModals.size === 0) {
          document.body.style.overflow = "auto"
        }
      }
    }
  }
}

// Initialize modal system
const modalSystem = new ModalSystem()

// Global functions for modal interaction
function showModal(modalId) {
  modalSystem.showModal(modalId)
}

function hideModal(modalId) {
  modalSystem.hideModal(modalId)
}

function toggleFAQ(element) {
  const answer = element.nextElementSibling
  const icon = element.querySelector("i")

  answer.classList.toggle("active")
  icon.classList.toggle("fa-chevron-down")
  icon.classList.toggle("fa-chevron-up")
}

// Form submissions
document.addEventListener("DOMContentLoaded", () => {
  // Login form
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Simulate login
      const submitBtn = this.querySelector('button[type="submit"]')
      submitBtn.innerHTML = '<div class="loading"></div> Logging in...'
      submitBtn.disabled = true

      setTimeout(() => {
        hideModal("loginModal")
        // Redirect to dashboard.html instead of showing dashboard modal
        window.location.href = "dashboard.html"
        submitBtn.textContent = "Login"
        submitBtn.disabled = false
        window.showNotification("Login successful!", "success")
      }, 2000)
    })
  }

  // Register form
  const registerForm = document.getElementById("registerForm")
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const submitBtn = this.querySelector('button[type="submit"]')
      submitBtn.innerHTML = '<div class="loading"></div> Registering...'
      submitBtn.disabled = true

      setTimeout(() => {
        hideModal("registerModal")
        // Redirect to dashboard.html instead of showing dashboard modal
        window.location.href = "dashboard.html"
        submitBtn.textContent = "Register"
        submitBtn.disabled = false
        window.showNotification("Registration successful! Welcome to For Life Trading!", "success")
      }, 2000)
    })
  }

  // Withdrawal form
  const withdrawalForm = document.getElementById("withdrawalForm")
  if (withdrawalForm) {
    withdrawalForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const submitBtn = this.querySelector('button[type="submit"]')
      submitBtn.innerHTML = '<div class="loading"></div> Processing...'
      submitBtn.disabled = true

      setTimeout(() => {
        submitBtn.textContent = "Request Withdrawal"
        submitBtn.disabled = false
        this.reset()
        window.showNotification("Withdrawal request submitted successfully!", "success")
      }, 2000)
    })
  }
})

// Terms & Conditions Modal
function showTermsModal() {
  const modal = document.createElement("div")
  modal.id = "termsModal"
  modal.className = "modal"
  modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="hideModal('termsModal')">&times;</span>
            <h2>Terms & Conditions</h2>
            <div class="modal-body">
                <h3>1. Acceptance of Terms</h3>
                <p>By accessing and using For Life Trading India platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
                
                <h3>2. Investment Terms</h3>
                <p>All investments are subject to market risks. Past performance does not guarantee future results.</p>
                
                <h3>3. Referral Program</h3>
                <p>Referral bonuses are paid according to the compensation plan. Misuse of the referral system may result in account suspension.</p>
                
                <h3>4. Withdrawal Policy</h3>
                <p>Withdrawals are processed within 24-48 hours. Minimum withdrawal amount is $10.</p>
                
                <h3>5. Account Security</h3>
                <p>Users are responsible for maintaining the security of their account credentials.</p>
                
                <h3>6. Prohibited Activities</h3>
                <p>Any fraudulent activities, spam, or violation of platform rules will result in immediate account termination.</p>
                
                <h3>7. Limitation of Liability</h3>
                <p>For Life Trading India shall not be liable for any indirect, incidental, or consequential damages.</p>
                
                <h3>8. Modifications</h3>
                <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes.</p>
            </div>
        </div>
    `

  document.body.appendChild(modal)
  showModal("termsModal")

  // Remove modal from DOM when closed
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close")) {
      setTimeout(() => {
        document.body.removeChild(modal)
      }, 300)
    }
  })
}

// FAQ Modal
function showFAQModal() {
  const modal = document.createElement("div")
  modal.id = "faqModal"
  modal.className = "modal"
  modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="hideModal('faqModal')">&times;</span>
            <h2>Frequently Asked Questions</h2>
            <div class="modal-body">
                <div class="faq-item">
                    <h3>How do I start earning?</h3>
                    <p>Simply register, choose an investment plan, and start referring others to build your network.</p>
                </div>
                
                <div class="faq-item">
                    <h3>What is the minimum investment?</h3>
                    <p>The minimum investment is $20 for the Starter plan.</p>
                </div>
                
                <div class="faq-item">
                    <h3>How are referral bonuses calculated?</h3>
                    <p>You earn $3 for each direct referral and additional bonuses from 8 levels deep in your network.</p>
                </div>
                
                <div class="faq-item">
                    <h3>When can I withdraw my earnings?</h3>
                    <p>Withdrawals can be made anytime with a minimum amount of $10. Processing takes 24-48 hours.</p>
                </div>
                
                <div class="faq-item">
                    <h3>Is my investment safe?</h3>
                    <p>We use advanced security measures and transparent business practices to protect your investments.</p>
                </div>
                
                <div class="faq-item">
                    <h3>How do I contact support?</h3>
                    <p>You can reach our support team via email at vhoratanvir1610@gmail.com or phone at +91 6354686821.</p>
                </div>
            </div>
        </div>
    `

  document.body.appendChild(modal)
  showModal("faqModal")

  // Remove modal from DOM when closed
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close")) {
      setTimeout(() => {
        document.body.removeChild(modal)
      }, 300)
    }
  })
}

// Withdrawal Rules Modal
function showWithdrawalModal() {
  const modal = document.createElement("div")
  modal.id = "withdrawalModal"
  modal.className = "modal"
  modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="hideModal('withdrawalModal')">&times;</span>
            <h2>Withdrawal Rules</h2>
            <div class="modal-body">
                <h3>Withdrawal Guidelines</h3>
                
                <div class="rule-item">
                    <h4>Minimum Withdrawal</h4>
                    <p>$10 or ₹750 equivalent</p>
                </div>
                
                <div class="rule-item">
                    <h4>Processing Time</h4>
                    <p>24-48 hours for all withdrawal requests</p>
                </div>
                
                <div class="rule-item">
                    <h4>Withdrawal Methods</h4>
                    <ul>
                        <li>Bank Transfer</li>
                        <li>UPI (India)</li>
                        <li>PayPal</li>
                        <li>Cryptocurrency</li>
                    </ul>
                </div>
                
                <div class="rule-item">
                    <h4>Fees</h4>
                    <p>No withdrawal fees for amounts above $50. Below $50, a $2 processing fee applies.</p>
                </div>
                
                <div class="rule-item">
                    <h4>Verification Required</h4>
                    <p>KYC verification must be completed before first withdrawal.</p>
                </div>
                
                <div class="rule-item">
                    <h4>Daily Limits</h4>
                    <p>Maximum $5,000 per day for verified accounts.</p>
                </div>
                
                <div class="rule-item">
                    <h4>Important Notes</h4>
                    <ul>
                        <li>Ensure your payment details are correct</li>
                        <li>Withdrawals cannot be cancelled once processed</li>
                        <li>Contact support for any withdrawal issues</li>
                    </ul>
                </div>
            </div>
        </div>
    `

  document.body.appendChild(modal)
  showModal("withdrawalModal")

  // Remove modal from DOM when closed
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("close")) {
      setTimeout(() => {
        document.body.removeChild(modal)
      }, 300)
    }
  })
}

// Income Details Modal
function showIncomeDetails(type) {
  const details = {
    direct: {
      title: "Direct Sponsor Income",
      content: `
                <h3>How it works:</h3>
                <ul>
                    <li>Earn $3 for every person you directly refer</li>
                    <li>Instant payment upon successful registration</li>
                    <li>No limit on direct referrals</li>
                    <li>Build your foundation for passive income</li>
                </ul>
                <div class="income-example">
                    <h4>Example:</h4>
                    <p>10 direct referrals = $30 immediate income</p>
                </div>
            `,
    },
    level: {
      title: "Level Income (8 Levels)",
      content: `
                <h3>Level Structure:</h3>
                <ul>
                    <li>Level 1: $1.50 per person</li>
                    <li>Level 2: $1.00 per person</li>
                    <li>Level 3: $0.75 per person</li>
                    <li>Level 4: $0.50 per person</li>
                    <li>Level 5-8: $0.25 per person</li>
                </ul>
                <div class="income-example">
                    <h4>Potential:</h4>
                    <p>Build deep networks for continuous passive income</p>
                </div>
            `,
    },
    matrix: {
      title: "Matrix Level Income (7 Levels)",
      content: `
                <h3>Matrix System:</h3>
                <ul>
                    <li>2x2 matrix structure</li>
                    <li>Auto-placement system</li>
                    <li>Spillover benefits</li>
                    <li>7 levels of earning potential</li>
                </ul>
                <div class="income-example">
                    <h4>Benefits:</h4>
                    <p>Earn from team efforts and spillovers</p>
                </div>
            `,
    },
    daily: {
      title: "Daily Self Income",
      content: `
                <h3>Guaranteed Daily Earnings:</h3>
                <ul>
                    <li>$0.50 per day guaranteed</li>
                    <li>Automatic credit to your account</li>
                    <li>No action required</li>
                    <li>Compounds over time</li>
                </ul>
                <div class="income-example">
                    <h4>Monthly Potential:</h4>
                    <p>$0.50 × 30 days = $15 guaranteed monthly</p>
                </div>
            `,
    },
  }

  const detail = details[type]
  if (detail) {
    const modal = document.createElement("div")
    modal.id = "incomeDetailsModal"
    modal.className = "modal"
    modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="hideModal('incomeDetailsModal')">&times;</span>
                <h2>${detail.title}</h2>
                <div class="modal-body">${detail.content}</div>
            </div>
        `

    document.body.appendChild(modal)
    showModal("incomeDetailsModal")

    // Remove modal from DOM when closed
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("close")) {
        setTimeout(() => {
          document.body.removeChild(modal)
        }, 300)
      }
    })
  }
}

// Declare showNotification function
window.showNotification = (message, type) => {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    document.body.removeChild(notification)
  }, 3000)
}
