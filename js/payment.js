// Payment Page JavaScript
document.addEventListener("DOMContentLoaded", () => {
  const countdownElement = document.getElementById("countdown-timer")
  const copyUpiBtn = document.getElementById("copy-upi-btn")
  const upiIdElement = document.getElementById("upi-id")
  const paymentForm = document.getElementById("payment-form")

  let timeLeft = 600 // 10 minutes in seconds
  let countdownInterval

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  function startCountdown() {
    countdownInterval = setInterval(() => {
      timeLeft--
      countdownElement.textContent = formatTime(timeLeft)

      if (timeLeft <= 0) {
        clearInterval(countdownInterval)
        countdownElement.textContent = "00:00"
        alert("Payment time has expired. Please refresh the page to generate a new payment request.")
        // Optionally disable form or redirect
        if (paymentForm) {
          paymentForm.querySelector('button[type="submit"]').disabled = true
        }
      }
    }, 1000)
  }

  // Helper to show toast notifications (re-used from dashboard-enchanced.js)
  function showToast(message, type = "info") {
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

    setTimeout(() => toast.classList.add("show"), 100)

    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => {
        if (container.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  // Start countdown when page loads
  if (countdownElement) {
    startCountdown()
  }

  // Copy UPI ID to clipboard
  if (copyUpiBtn && upiIdElement) {
    copyUpiBtn.addEventListener("click", () => {
      const upiId = upiIdElement.textContent.replace("UPI ID: ", "")
      navigator.clipboard
        .writeText(upiId)
        .then(() => {
          showToast("UPI ID copied to clipboard!", "success")
        })
        .catch((err) => {
          console.error("Failed to copy UPI ID: ", err)
          showToast("Failed to copy UPI ID.", "error")
        })
    })
  }

  // Handle payment form submission
  if (paymentForm) {
    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault() // Prevent default form submission

      const transactionIdInput = document.getElementById("transaction-id")
      const paymentScreenshotInput = document.getElementById("payment-screenshot")

      const transactionId = transactionIdInput ? transactionIdInput.value : ""
      const paymentScreenshot =
        paymentScreenshotInput && paymentScreenshotInput.files.length > 0 ? paymentScreenshotInput.files[0] : null

      if (!transactionId || !paymentScreenshot) {
        showToast("Please fill all required fields.", "error")
        return
      }

      // Simulate payment submission
      console.log("Transaction ID:", transactionId)
      console.log("Payment Screenshot:", paymentScreenshot.name)

      showToast("Payment submitted successfully! Awaiting verification.", "success")

      // In a real application, you would send this data to your backend
      // using fetch() or XMLHttpRequest.
      // Example:
      /*
            const formData = new FormData();
            formData.append('transactionId', transactionId);
            formData.append('screenshot', paymentScreenshot);

            fetch('/api/submit-payment', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Payment submitted successfully! Awaiting verification.', 'success');
                    // Redirect or update UI
                } else {
                    showToast('Payment submission failed: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error submitting payment:', error);
                showToast('An error occurred during payment submission.', 'error');
            });
            */

      // Clear form after submission (for simulation)
      paymentForm.reset()
    })
  }
})
