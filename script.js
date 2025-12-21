// ==========================================
// INITIALIZATION & DEBUG
// ==========================================
console.log("🚀 Script loaded successfully!");

// ==========================================
// SMOOTH SCROLLING
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ==========================================
// NAVBAR SCROLL EFFECT & ACTIVE LINKS
// ==========================================
const header = document.querySelector('header');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Update active nav link
  let current = '';
  document.querySelectorAll('section').forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= (sectionTop - 200)) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
const hamburger = document.querySelector('.hamburger');
const navLinksContainer = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinksContainer.classList.toggle('active');
});

// Close menu when clicking on a link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinksContainer.classList.remove('active');
  });
});

// ==========================================
// COUNTER ANIMATION
// ==========================================
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start);
    }
  }, 16);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = entry.target.querySelectorAll('.stat-number');
      statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        animateCounter(stat, target);
      });
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) observer.observe(heroStats);

// ==========================================
// SERVICE CARDS TOGGLE
// ==========================================
const serviceCards = document.querySelectorAll('.serviceCard');
serviceCards.forEach(card => {
  card.addEventListener('click', () => {
    const isActive = card.classList.contains('active');
    serviceCards.forEach(c => c.classList.remove('active'));
    if (!isActive) {
      card.classList.add('active');
    }
  });
});

// ==========================================
// PORTFOLIO MODAL
// ==========================================
const modal = document.getElementById('fullViewModal');
const modalImg = document.getElementById('fullImage');
const closeModal = document.querySelector('.close-modal');

window.openFullView = function(element) {
  const img = element.querySelector('img');
  modal.style.display = 'flex';
  modalImg.src = img.src;
  document.body.style.overflow = 'hidden';
}

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

// ==========================================
// CONFETTI ANIMATION
// ==========================================
function createConfetti() {
  const colors = ['#00ffcc', '#00b8d4', '#ff00ff', '#ffffff'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.opacity = '1';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.borderRadius = '50%';
    document.body.appendChild(confetti);

    const duration = Math.random() * 3 + 2;
    const xMovement = (Math.random() - 0.5) * 200;

    confetti.animate([
      { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(100vh) translateX(${xMovement}px) rotate(720deg)`, opacity: 0 }
    ], {
      duration: duration * 1000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    setTimeout(() => confetti.remove(), duration * 1000);
  }
}

// ==========================================
// CONTACT FORM WITH BACKEND INTEGRATION
// ==========================================
console.log("🔍 Setting up contact form...");

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM loaded!");

  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");
  const loadingAnimation = document.getElementById("loadingAnimation");

  console.log("Form:", contactForm);
  console.log("Message:", formMessage);
  console.log("Loading:", loadingAnimation);

  if (!contactForm) {
    console.error("❌ Contact form not found!");
    return;
  }

  const submitBtn = contactForm.querySelector(".submit-btn");

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log("🎯 Form submitted!");

    // Reset message
    formMessage.textContent = "";
    formMessage.className = "";

    // Show loading animation
    loadingAnimation.classList.add("active");
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.6";

    // Get form data
    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
    };

    console.log("📤 Sending data:", formData);

    try {
     
      const BACKEND_URL = "https://visual-mints-backend.vercel.app/";

      console.log("🌐 Fetching:", BACKEND_URL);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("📥 Response status:", response.status);

      const result = await response.json();
      console.log("📥 Result:", result);

      // Hide loading
      loadingAnimation.classList.remove("active");
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";

      if (result.success) {
        formMessage.textContent = "Message sent successfully! 🚀 I'll get back to you soon.";
        formMessage.classList.add("success");
        contactForm.reset();
        createConfetti();
      } else {
        formMessage.textContent = result.error || "Failed to send message ❌";
        formMessage.classList.add("error");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      loadingAnimation.classList.remove("active");
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      formMessage.textContent = "Failed to send message ❌ Please try again later.";
      formMessage.classList.add("error");
    }
  });

  console.log("✅ Contact form setup complete!");
});

// ==========================================
// CURSOR TRAIL EFFECT
// ==========================================

// ===== INTENSITY SETTINGS - CUSTOMIZE HERE =====
const TRAIL_CONFIG = {
  // Size of each trail dot (px)
  // Subtle: 6-8, Medium: 10-14, Intense: 16-24
  size: 12,

  // Color and opacity of trail
  // Format: 'rgba(red, green, blue, opacity)'
  // opacity range: 0.1 (very subtle) to 1.0 (very intense)
  color: 'rgba(0, 255, 204, 0.6)', // Current primary color

  // How often to create new dots (milliseconds)
  // Dense: 10-20, Medium: 30-50, Sparse: 60-100
  frequency: 15,

  // How long dots stay visible (milliseconds)
  // Quick: 400-600, Medium: 700-900, Slow: 1000-1500
  duration: 500,

  // Add glow effect (true/false)
  glow: true,

  // Glow intensity (px)
  // Subtle: 5-8, Medium: 10-15, Intense: 20-30
  glowSize: 10,

  // Add blur effect (true/false)
  blur: false
};
// ===== END OF SETTINGS =====

// Create container for trail dots
const trailContainer = document.createElement('div');
trailContainer.className = 'cursor-trail';
document.body.appendChild(trailContainer);

// Track mouse position
let mouseX = 0;
let mouseY = 0;
let lastTrailTime = 0;

// Update mouse position
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Create trail dots at regular intervals
setInterval(() => {
  const now = Date.now();

  // Only create trail if mouse has moved
  if (mouseX && mouseY && now - lastTrailTime >= TRAIL_CONFIG.frequency) {
    createTrailDot(mouseX, mouseY);
    lastTrailTime = now;
  }
}, TRAIL_CONFIG.frequency);

// Function to create a single trail dot
function createTrailDot(x, y) {
  const dot = document.createElement('div');
  dot.className = 'trail-dot';

  // Apply blur if enabled
  if (TRAIL_CONFIG.blur) {
    dot.classList.add('blur');
  }

  // Position and style the dot
  dot.style.left = `${x - TRAIL_CONFIG.size / 2}px`;
  dot.style.top = `${y - TRAIL_CONFIG.size / 2}px`;
  dot.style.width = `${TRAIL_CONFIG.size}px`;
  dot.style.height = `${TRAIL_CONFIG.size}px`;
  dot.style.background = TRAIL_CONFIG.color;

  // Add glow if enabled
  if (TRAIL_CONFIG.glow) {
    dot.style.boxShadow = `0 0 ${TRAIL_CONFIG.glowSize}px ${TRAIL_CONFIG.color}`;
  }

  // Set animation duration
  dot.style.animationDuration = `${TRAIL_CONFIG.duration / 1000}s`;

  trailContainer.appendChild(dot);

  // Remove dot after animation completes
  setTimeout(() => {
    dot.remove();
  }, TRAIL_CONFIG.duration);
}

// Optional: Pause trail on mobile devices (better performance)
if (window.innerWidth <= 768) {
  trailContainer.style.display = 'none';
}

console.log('✨ Cursor trail effect loaded!');
console.log('💡 To customize: Edit TRAIL_CONFIG in script.js');







