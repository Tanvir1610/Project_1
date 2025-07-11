// Dashboard functionality
class Dashboard {
    constructor() {
        this.currentTab = 'overview';
        this.charts = {};
        this.init();
    }
    
    init() {
        this.initCounters();
        this.initCharts();
        this.initRealTimeUpdates();
        this.setupEventListeners();
        this.loadUserData();
    }
    
    initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    }
    
    animateCounter(element) {
        const target = parseFloat(element.getAttribute('data-counter'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format number based on value
            let displayValue;
            if (target >= 1000) {
                displayValue = Math.floor(current).toLocaleString();
            } else {
                displayValue = current.toFixed(2);
            }
            
            element.textContent = element.textContent.includes('$') ? `$${displayValue}` : displayValue;
        }, 16);
    }
    
    initCharts() {
        // Simulate chart initialization
        const chartContainer = document.getElementById('earningsChart');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary);">
                    <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
                    <p>Earnings chart will be displayed here</p>
                    <p style="font-size: 0.9rem;">Last 7 days: +$105.50</p>
                </div>
            `;
        }
    }
    
    initRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            this.updateEarnings();
        }, 30000); // Update every 30 seconds
        
        // Update activity feed
        setInterval(() => {
            this.addNewActivity();
        }, 60000); // Add new activity every minute
    }
    
    updateEarnings() {
        const todayEarnings = document.querySelector('[data-counter="15.50"]');
        if (todayEarnings) {
            const currentValue = parseFloat(todayEarnings.textContent.replace('$', ''));
            const newValue = currentValue + 0.50;
            todayEarnings.textContent = `$${newValue.toFixed(2)}`;
            
            // Show notification
            this.showNotification('Daily self income credited: +$0.50', 'success');
        }
    }
    
    addNewActivity() {
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            const activities = [
                {
                    icon: 'fas fa-plus',
                    type: 'success',
                    title: 'Daily Self Income',
                    time: 'Just now',
                    amount: '+$0.50'
                },
                {
                    icon: 'fas fa-layer-group',
                    type: 'warning',
                    title: 'Level Income',
                    time: 'Just now',
                    amount: '+$1.00'
                }
            ];
            
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon ${randomActivity.type}">
                    <i class="${randomActivity.icon}"></i>
                </div>
                <div class="activity-info">
                    <div class="activity-title">${randomActivity.title}</div>
                    <div class="activity-time">${randomActivity.time}</div>
                </div>
                <div class="activity-amount">${randomActivity.amount}</div>
            `;
            
            activityList.insertBefore(activityItem, activityList.firstChild);
            
            // Remove last item if more than 4 activities
            if (activityList.children.length > 4) {
                activityList.removeChild(activityList.lastChild);
            }
        }
    }
    
    setupEventListeners() {
        // Chart controls
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                chartBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateChart(btn.textContent);
            });
        });
        
        // Mobile sidebar toggle
        const hamburger = document.createElement('div');
        hamburger.className = 'mobile-hamburger';
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        hamburger.style.cssText = `
            display: none;
            position: fixed;
            top: 15px;
            left: 15px;
            width: 40px;
            height: 40px;
            background: var(--primary-color);
            border-radius: 8px;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            z-index: 1001;
        `;
        
        document.body.appendChild(hamburger);
        
        hamburger.addEventListener('click', () => {
            const sidebar = document.querySelector('.dashboard-sidebar');
            sidebar.classList.toggle('active');
        });
        
        // Show hamburger on mobile
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleMediaQuery = (e) => {
            hamburger.style.display = e.matches ? 'flex' : 'none';
        };
        
        mediaQuery.addListener(handleMediaQuery);
        handleMediaQuery(mediaQuery);
    }
    
    updateChart(period) {
        const chartContainer = document.getElementById('earningsChart');
        if (chartContainer) {
            const data = {
                '7D': 'Last 7 days: +$105.50',
                '30D': 'Last 30 days: +$465.00',
                '90D': 'Last 90 days: +$1,395.00'
            };
            
            chartContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary);">
                    <i class="fas fa-chart-line" style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
                    <p>Earnings chart will be displayed here</p>
                    <p style="font-size: 0.9rem;">${data[period]}</p>
                </div>
            `;
        }
    }
    
    loadUserData() {
        // Simulate loading user data
        const userData = {
            name: 'John Doe',
            id: 'FLT001234',
            balance: 1250.00,
            todayEarnings: 15.50,
            directReferrals: 25,
            totalNetwork: 156,
            investments: [
                {
                    date: '2024-01-01',
                    amount: 100,
                    plan: 'Professional',
                    dailyROI: 8.00,
                    totalEarned: 120.00,
                    status: 'Active'
                }
            ]
        };
        
        // Update UI with user data
        this.updateUserInfo(userData);
    }
    
    updateUserInfo(userData) {
        const userName = document.querySelector('.user-name');
        const userId = document.querySelector('.user-id');
        
        if (userName) userName.textContent = userData.name;
        if (userId) userId.textContent = `ID: ${userData.id}`;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `dashboard-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: var(--dark-card);
            color: var(--text-primary);
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid var(--${type === 'success' ? 'success' : 'primary'}-color);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            max-width: 300px;
            animation: slideInFromRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab content
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to clicked menu item
    const targetMenuItem = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }
    
    // Update mobile nav
    const mobileNavLinks = document.querySelectorAll('.mobile-dashboard-nav a');
    mobileNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${tabName}`) {
            link.classList.add('active');
        }
    });
    
    // Close mobile sidebar
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
    }
}

// Copy referral link functionality
function copyReferralLink() {
    const referralLink = `${window.location.origin}/?ref=FLT001234`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(referralLink).then(() => {
            dashboard.showNotification('Referral link copied to clipboard!', 'success');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        dashboard.showNotification('Referral link copied to clipboard!', 'success');
    }
}

// Investment modal functionality
function showInvestModal() {
    const modal = document.createElement('div');
    modal.id = 'investModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="hideModal('investModal')">&times;</span>
            <h2>New Investment</h2>
            <form id="investmentForm">
                <div class="form-group">
                    <label>Investment Amount ($)</label>
                    <input type="number" min="20" max="1000" placeholder="Minimum $20" required>
                </div>
                <div class="form-group">
                    <label>Investment Plan</label>
                    <select required>
                        <option value="">Select Plan</option>
                        <option value="starter">Starter - 7% Daily ROI</option>
                        <option value="professional">Professional - 8% Daily ROI</option>
                        <option value="enterprise">Enterprise - 10% Daily ROI</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Payment Method</label>
                    <select required>
                        <option value="">Select Method</option>
                        <option value="wallet">Wallet Balance</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="upi">UPI</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary">Invest Now</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Handle form submission
    const form = modal.querySelector('#investmentForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<div class="loading"></div> Processing...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            hideModal('investModal');
            dashboard.showNotification('Investment successful! Your plan is now active.', 'success');
            modal.remove();
        }, 2000);
    });
}

// Initialize dashboard
const dashboard = new Dashboard();

// Add CSS for animations
const dashboardStyle = document.createElement('style');
dashboardStyle.textContent = `
    @keyframes slideInFromRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .dashboard-notification {
        animation: slideInFromRight 0.3s ease;
    }
    
    .loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(dashboardStyle);
