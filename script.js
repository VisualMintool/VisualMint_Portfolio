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
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ==========================================
// PARTICLE CANVAS ANIMATION - NEW FEATURE
// ==========================================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.color = `rgba(0, 255, 204, ${Math.random() * 0.5})`;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
    if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = [];
const particleCount = window.innerWidth < 768 ? 30 : 60;

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();

    // Connect nearby particles
    for (let j = i; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        ctx.strokeStyle = `rgba(0, 255, 204, ${0.2 * (1 - distance / 150)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateParticles);
}

animateParticles();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// ==========================================
// BACK TO TOP BUTTON - NEW FEATURE
// ==========================================
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 500) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
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

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'flex') {
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

const initContactForm = () => {
  console.log("✅ Initializing contact form!");

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
      const BACKEND_URL = "https://visual-mints-backend.vercel.app/send-email";
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
};

// Initialize form when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactForm);
} else {
  initContactForm();
}

// ==========================================
// CURSOR TRAIL EFFECT
// ==========================================
const TRAIL_CONFIG = {
  size: 12,
  color: 'rgba(0, 255, 204, 0.6)',
  frequency: 15,
  duration: 500,
  glow: true,
  glowSize: 10,
  blur: false
};

const trailContainer = document.createElement('div');
trailContainer.className = 'cursor-trail';
document.body.appendChild(trailContainer);

let mouseX = 0;
let mouseY = 0;
let lastTrailTime = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

setInterval(() => {
  const now = Date.now();
  if (mouseX && mouseY && now - lastTrailTime >= TRAIL_CONFIG.frequency) {
    createTrailDot(mouseX, mouseY);
    lastTrailTime = now;
  }
}, TRAIL_CONFIG.frequency);

function createTrailDot(x, y) {
  const dot = document.createElement('div');
  dot.className = 'trail-dot';

  if (TRAIL_CONFIG.blur) {
    dot.classList.add('blur');
  }

  dot.style.left = `${x - TRAIL_CONFIG.size / 2}px`;
  dot.style.top = `${y - TRAIL_CONFIG.size / 2}px`;
  dot.style.width = `${TRAIL_CONFIG.size}px`;
  dot.style.height = `${TRAIL_CONFIG.size}px`;
  dot.style.background = TRAIL_CONFIG.color;

  if (TRAIL_CONFIG.glow) {
    dot.style.boxShadow = `0 0 ${TRAIL_CONFIG.glowSize}px ${TRAIL_CONFIG.color}`;
  }

  dot.style.animationDuration = `${TRAIL_CONFIG.duration / 1000}s`;

  trailContainer.appendChild(dot);

  setTimeout(() => {
    dot.remove();
  }, TRAIL_CONFIG.duration);
}

if (window.innerWidth <= 768) {
  trailContainer.style.display = 'none';
}

// ==========================================
// SCROLL REVEAL ANIMATIONS - NEW FEATURE
// ==========================================
const revealElements = document.querySelectorAll('.about-card, .serviceCard, .portfolio-item, .stat-item, .skill-tag');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(element => {
  element.style.opacity = '0';
  element.style.transform = 'translateY(30px)';
  element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(element);
});

// ==========================================
// TEXT TYPING EFFECT - NEW FEATURE
// ==========================================
const typedTextElement = document.querySelector('.typed-text');
if (typedTextElement) {
  const originalText = typedTextElement.textContent;
  typedTextElement.textContent = '';

  let i = 0;
  function typeWriter() {
    if (i < originalText.length) {
      typedTextElement.textContent += originalText.charAt(i);
      i++;
      setTimeout(typeWriter, 100);
    }
  }

  setTimeout(typeWriter, 500);
}

// ==========================================
// MAGNETIC BUTTON EFFECT - NEW FEATURE
// ==========================================
const magneticButtons = document.querySelectorAll('.cta-primary, .cta-secondary, .submit-btn');

magneticButtons.forEach(button => {
  button.addEventListener('mousemove', (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translate(0, 0)';
  });
});

// ==========================================
// LAZY LOADING IMAGES - NEW FEATURE
// ==========================================
const images = document.querySelectorAll('img');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.classList.add('loaded');
      imageObserver.unobserve(img);
    }
  });
});

images.forEach(img => {
  imageObserver.observe(img);
});

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
window.addEventListener('load', () => {
  console.log('✨ Page fully loaded!');
  console.log('🎨 All animations initialized');
  console.log('⚡ Performance optimized');
});

console.log('✨ Cursor trail effect loaded!');
console.log('💡 To customize: Edit TRAIL_CONFIG in script.js');
