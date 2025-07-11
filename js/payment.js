// Payment page functionality
class PaymentSystem {
    constructor() {
        this.paymentData = {};
        this.timer = null;
        this.timeLeft = 900; // 15 minutes
        this.init();
    }
    
    init() {
        this.loadPaymentData();
        this.setupEventListeners();
        this.startPaymentTimer();
        this.updatePaymentSummary();
    }
    
    loadPaymentData() {
        // Get payment data from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        
        this.paymentData = {
            plan: urlParams.get('plan') || localStorage.getItem('selectedPlan') || 'Professional',
            amount: parseFloat(urlParams.get('amount')) || parseFloat(localStorage.getItem('selectedAmount')) || 100,
            roi: urlParams.get('roi') || localStorage.getItem('selectedROI') || '8%',
            userId: localStorage.getItem('userId') || 'USER' + Date.now(),
            referralCode: localStorage.getItem('referralCode') || null
        };
        
        // Store in localStorage for persistence
        localStorage.setItem('currentPayment', JSON.stringify(this.paymentData));
    }
    
    updatePaymentSummary() {
        document.getElementById('selectedPlan').textContent = this.paymentData.plan;
        document.getElementById('investmentAmount').textContent = `$${this.paymentData.amount.toFixed(2)}`;
        document.getElementById('dailyROI').textContent = this.paymentData.roi;
        
        const dailyReturn = (this.paymentData.amount * parseFloat(this.paymentData.roi) / 100).toFixed(2);
        document.getElementById('dailyReturn').textContent = `$${dailyReturn}`;
        document.getElementById('totalAmount').textContent = `$${this.paymentData.amount.toFixed(2)}`;
        
        // Update modal amount
        const paidAmountInput = document.getElementById('paidAmount');
        if (paidAmountInput) {
            paidAmountInput.value = this.paymentData.amount.toFixed(2);
        }
    }
    
    setupEventListeners() {
        // Payment confirmation form
        const confirmForm = document.getElementById('paymentConfirmForm');
        if (confirmForm) {
            confirmForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processPaymentConfirmation(e.target);
            });
        }
        
        // QR code click to enlarge
        const qrCode = document.getElementById('paymentQR');
        if (qrCode) {
            qrCode.addEventListener('click', () => {
                this.enlargeQRCode();
            });
        }
    }
    
    startPaymentTimer() {
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'payment-timer';
        timerDisplay.innerHTML = `
            <div>Complete payment within:</div>
            <div class="timer-display" id="timerDisplay">15:00</div>
        `;
        
        const paymentHeader = document.querySelector('.payment-header');
        paymentHeader.appendChild(timerDisplay);
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            
            document.getElementById('timerDisplay').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.timeLeft <= 0) {
                this.handlePaymentTimeout();
            }
        }, 1000);
    }
    
    handlePaymentTimeout() {
        clearInterval(this.timer);
        
        showNotification('Payment session expired. Please try again.', 'error');
        
        setTimeout(() => {
            window.location.href = 'index.html#plans';
        }, 3000);
    }
    
    enlargeQRCode() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                <h3>Scan QR Code</h3>
                <img src="images/WhatsApp Image 2024-11-17 at 09.55.58_2a32c248.jpg" 
                     style="width: 100%; max-width: 300px; border-radius: 12px; margin: 1rem 0;">
                <p style="color: var(--text-secondary);">
                    UPI ID: 6354686821@pthdfc<br>
                    Amount: $${this.paymentData.amount.toFixed(2)}
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    processPaymentConfirmation(form) {
        const formData = new FormData(form);
        const transactionId = formData.get('transactionId') || form.querySelector('input[type="text"]').value;
        
        if (!transactionId) {
            showNotification('Please enter transaction ID', 'error');
            return;
        }
        
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Processing...';
        submitBtn.disabled = true;
        
        // Simulate payment verification
        setTimeout(() => {
            this.completePayment(transactionId);
        }, 3000);
    }
    
    completePayment(transactionId) {
        // Clear timer
        clearInterval(this.timer);
        
        // Store payment record
        const paymentRecord = {
            ...this.paymentData,
            transactionId: transactionId,
            status: 'pending_verification',
            timestamp: new Date().toISOString(),
            paymentId: 'PAY' + Date.now()
        };
        
        // Save to localStorage (in real app, this would go to backend)
        const existingPayments = JSON.parse(localStorage.getItem('userPayments') || '[]');
        existingPayments.push(paymentRecord);
        localStorage.setItem('userPayments', JSON.stringify(existingPayments));
        
        // Update user status
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.hasActiveInvestment = true;
        userData.currentPlan = this.paymentData.plan;
        userData.investmentAmount = this.paymentData.amount;
        userData.joinDate = new Date().toISOString();
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Hide modal and show success
        hideModal('paymentConfirmModal');
        this.showPaymentSuccess(paymentRecord);
    }
    
    showPaymentSuccess(paymentRecord) {
        const paymentSection = document.querySelector('.payment-section .container');
        paymentSection.innerHTML = `
            <div class="payment-success">
                <div class="success-checkmark">
                    <i class="fas fa-check"></i>
                </div>
                <h2>Payment Submitted Successfully!</h2>
                <p>Your payment is being verified. You will receive confirmation within 24 hours.</p>
                
                <div class="success-details">
                    <div class="detail-card">
                        <h3>Payment Details</h3>
                        <div class="detail-item">
                            <span>Payment ID:</span>
                            <span>${paymentRecord.paymentId}</span>
                        </div>
                        <div class="detail-item">
                            <span>Transaction ID:</span>
                            <span>${paymentRecord.transactionId}</span>
                        </div>
                        <div class="detail-item">
                            <span>Plan:</span>
                            <span>${paymentRecord.plan}</span>
                        </div>
                        <div class="detail-item">
                            <span>Amount:</span>
                            <span>$${paymentRecord.amount.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <span>Status:</span>
                            <span class="status-pending">Pending Verification</span>
                        </div>
                    </div>
                </div>
                
                <div class="success-actions">
                    <button class="btn-primary" onclick="window.location.href='dashboard.html'">
                        <i class="fas fa-tachometer-alt"></i>
                        Go to Dashboard
                    </button>
                    <button class="btn-secondary" onclick="window.location.href='index.html'">
                        <i class="fas fa-home"></i>
                        Back to Home
                    </button>
                </div>
            </div>
        `;
        
        // Add success styles
        const style = document.createElement('style');
        style.textContent = `
            .success-details {
                margin: 2rem 0;
            }
            
            .detail-card {
                background: var(--dark-card);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 2rem;
                max-width: 400px;
                margin: 0 auto;
            }
            
            .detail-card h3 {
                color: var(--primary-color);
                margin-bottom: 1rem;
                text-align: center;
            }
            
            .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--border-color);
            }
            
            .detail-item:last-child {
                border-bottom: none;
            }
            
            .success-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-top: 2rem;
            }
            
            @media (max-width: 480px) {
                .success-actions {
                    flex-direction: column;
                    align-items: center;
                }
            }
        `;
        document.head.appendChild(style);
        
        showNotification('Payment submitted for verification!', 'success');
    }
}

// Global functions
function confirmPayment() {
    showModal('paymentConfirmModal');
}

function cancelPayment() {
    if (confirm('Are you sure you want to cancel this payment?')) {
        window.location.href = 'index.html#plans';
    }
}

function copyUPIId() {
    const upiId = '6354686821@pthdfc';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(upiId).then(() => {
            showNotification('UPI ID copied to clipboard!', 'success');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = upiId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('UPI ID copied to clipboard!', 'success');
    }
}

// Initialize payment system when page loads
document.addEventListener('DOMContentLoaded', function() {
    new PaymentSystem();
});
