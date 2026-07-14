document.addEventListener('DOMContentLoaded', () => {
  initCanvasBackground();
  initCursor();
  initAudioSynth();
  initNavigation();
  initWalletConnection();
  initMobileMenu();
  initContactPage();
  init3DTilt();
  initFadeIn();
});

/* --- INTERACTIVE NEURAL NET CANVAS BACKGROUND --- */
function initCanvasBackground() {
  const canvas = document.getElementById('cyber-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  
  let mouse = { x: null, y: null, radius: 160 };
  
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.5 + 1;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Boundary collision
      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;
      
      // Mouse push/pull physics
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          // Slowly push nodes away from the custom cursor
          this.x -= (dx / dist) * force * 1.2;
          this.y -= (dy / dist) * force * 1.2;
        }
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(102, 252, 241, 0.35)';
      ctx.fill();
    }
  }
  
  // Set count proportional to display resolution
  const particleCount = Math.min(90, Math.floor((width * height) / 16000));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    // Draw proximity lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(102, 252, 241, ${0.1 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  
  animate();
}

/* --- CUSTOM PREMIUM CURSOR TRAIL --- */
function initCursor() {
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let dot = document.querySelector('.custom-cursor-dot');
    let ring = document.querySelector('.custom-cursor-ring');
    
    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'custom-cursor-dot';
      document.body.appendChild(dot);
    }
    if (!ring) {
      ring = document.createElement('div');
      ring.className = 'custom-cursor-ring';
      document.body.appendChild(ring);
    }
    
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    });
    
    function render() {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      
      ringX += dx * 0.15;
      ringY += dy * 0.15;
      
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
    
    const interactives = document.querySelectorAll('a, button, input, select, textarea, .portal-card, .game-card, .pipeline-card, .wallet-option');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hovering');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hovering');
      });
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-clicking');
    });
    document.addEventListener('mouseup', () => {
      document.body.classList.remove('cursor-clicking');
    });
  }
}

/* --- CYBER SOUND SYNTHESIZER --- */
let audioCtx = null;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playHoverSound() {
  try {
    initAudioContext();
    if (!audioCtx) return;
    
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, time);
    osc.frequency.exponentialRampToValueAtTime(1900, time + 0.05);
    
    gain.gain.setValueAtTime(0.008, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.06);
  } catch (e) {
    console.warn('Audio synthesis blocked:', e);
  }
}

function playClickSound() {
  try {
    initAudioContext();
    if (!audioCtx) return;
    
    const time = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.08);
    
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.09);
  } catch (e) {
    console.warn('Audio synthesis blocked:', e);
  }
}

function initAudioSynth() {
  const gestures = ['click', 'mousemove', 'mousedown', 'keydown', 'touchstart'];
  const resumeHandler = () => {
    initAudioContext();
    gestures.forEach(g => document.removeEventListener(g, resumeHandler));
  };
  gestures.forEach(g => document.addEventListener(g, resumeHandler));
  
  const hoverElements = document.querySelectorAll('a, button, .portal-card, .game-card, .pipeline-card, .wallet-option');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', playHoverSound);
    el.addEventListener('click', playClickSound);
  });
}

/* --- ACTIVE NAVIGATION --- */
function initNavigation() {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  
  const navItems = document.querySelectorAll('nav li');
  navItems.forEach(item => {
    const link = item.querySelector('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html') || (page === 'index.html' && href === 'index.html')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }
  });
}


/* --- CONNECT WALLET SYSTEM --- */
function initWalletConnection() {
  const connectBtn = document.getElementById('connect-wallet-btn');
  if (!connectBtn) return;
  
  const isConnected = localStorage.getItem('kivar_wallet_connected');
  const savedAddress = localStorage.getItem('kivar_wallet_address');
  
  if (isConnected === 'true' && savedAddress) {
    setWalletConnected(savedAddress);
  }
  
  let modalOverlay = document.getElementById('wallet-modal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'wallet-modal';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-card">
        <button class="close-modal" id="close-wallet-modal">&times;</button>
        <h3 class="modal-title">CONNECT CRYPTO WALLET</h3>
        <p class="modal-subtitle">Select your preferred Web3 provider to authenticate anonymously.</p>
        <button class="wallet-option" data-wallet="MetaMask">
          <svg class="wallet-icon" viewBox="0 0 24 24"><path d="M22,11.6C22,12.2,21.5,12.7,20.8,12.7H13.6V20.1C13.6,20.7,13.1,21.2,12.5,21.2H11.5C10.9,21.2,10.4,20.7,10.4,20.1V12.7H3.2C2.5,12.7,2,12.2,2,11.6V10.6C2,10,2.5,9.5,3.2,9.5H10.4V2.1C10.4,1.5,10.9,1,11.5,1H12.5C13.1,1,13.6,1.5,13.6,2.1V9.5H20.8C21.5,9.5,22,10,22,10.6V11.6Z" /></svg>
          MetaMask
        </button>
        <button class="wallet-option" data-wallet="Coinbase">
          <svg class="wallet-icon" viewBox="0 0 24 24"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/></svg>
          Coinbase Wallet
        </button>
        <button class="wallet-option" data-wallet="WalletConnect">
          <svg class="wallet-icon" viewBox="0 0 24 24"><path d="M19.1,12.9L12.5,17.7C12.2,17.9,11.8,17.9,11.5,17.7L4.9,12.9C4.5,12.6,4.5,12.1,4.8,11.8L5.7,11C6,10.7,6.5,10.7,6.8,11L11.5,14.4C11.8,14.6,12.2,14.6,12.5,14.4L17.2,11C17.5,10.7,18,10.7,18.3,11L19.2,11.8C19.5,12.1,19.5,12.6,19.1,12.9Z"/></svg>
          WalletConnect
        </button>
      </div>
    `;
    document.body.appendChild(modalOverlay);
    
    const optButtons = modalOverlay.querySelectorAll('.wallet-option');
    optButtons.forEach(b => {
      b.addEventListener('mouseenter', playHoverSound);
      b.addEventListener('click', playClickSound);
    });
    document.getElementById('close-wallet-modal').addEventListener('mouseenter', playHoverSound);
    document.getElementById('close-wallet-modal').addEventListener('click', playClickSound);
  }
  
  const closeBtn = document.getElementById('close-wallet-modal');
  const walletOptions = modalOverlay.querySelectorAll('.wallet-option');
  
  connectBtn.addEventListener('click', () => {
    const isConnected = localStorage.getItem('kivar_wallet_connected') === 'true';
    if (isConnected) {
      localStorage.removeItem('kivar_wallet_connected');
      localStorage.removeItem('kivar_wallet_address');
      connectBtn.textContent = 'CONNECT WALLET';
      connectBtn.style.borderColor = 'var(--accent-cyan)';
      connectBtn.style.color = 'var(--accent-cyan)';
      connectBtn.style.background = 'transparent';
      showNotification('Wallet disconnected.');
    } else {
      modalOverlay.classList.add('active');
    }
  });
  
  closeBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });
  
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });
  
  walletOptions.forEach(option => {
    option.addEventListener('click', () => {
      const walletName = option.getAttribute('data-wallet');
      modalOverlay.classList.remove('active');
      
      connectBtn.textContent = 'CONNECTING...';
      connectBtn.disabled = true;
      
      setTimeout(() => {
        const characters = '0123456789abcdef';
        let fakeAddrSuffix = '';
        for (let i = 0; i < 4; i++) {
          fakeAddrSuffix += characters[Math.floor(Math.random() * 16)];
        }
        const fullAddress = `0x7a${fakeAddrSuffix}8a...b4d1`;
        
        localStorage.setItem('kivar_wallet_connected', 'true');
        localStorage.setItem('kivar_wallet_address', fullAddress);
        
        setWalletConnected(fullAddress);
        connectBtn.disabled = false;
        
        showNotification(`Connected to ${walletName}!`);
      }, 1500);
    });
  });
  
  function setWalletConnected(address) {
    connectBtn.textContent = address;
    connectBtn.style.background = 'rgba(102, 252, 241, 0.08)';
    connectBtn.style.color = 'var(--accent-cyan)';
    connectBtn.style.borderColor = 'rgba(102, 252, 241, 0.6)';
  }
}

/* --- MOBILE HAMBURGER MENU --- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const nav = document.querySelector('nav');
  
  if (!hamburger || !nav) return;
  
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('active');
  });
  
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('active') && !nav.contains(e.target) && e.target !== hamburger) {
      nav.classList.remove('active');
    }
  });
}

/* --- DUAL PIPELINE SUPPORT & CONTACT PAGE --- */
function initContactPage() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const emailText = btn.getAttribute('data-email');
      if (!emailText) return;
      
      navigator.clipboard.writeText(emailText).then(() => {
        const originalText = btn.textContent;
        btn.textContent = 'COPIED!';
        btn.style.color = '#39FF14';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = 'var(--accent-cyan)';
        }, 2000);
      });
    });
  });
  
  const contactForm = document.getElementById('support-contact-form');
  const formFeedback = document.getElementById('form-feedback-msg');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    const inputs = contactForm.querySelectorAll('.form-input');
    inputs.forEach(input => input.disabled = true);
    
    submitBtn.textContent = 'TRANSMITTING...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      inputs.forEach(input => {
        input.disabled = false;
        if (input.tagName !== 'SELECT') {
          input.value = '';
        }
      });
      
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
      
      if (formFeedback) {
        formFeedback.className = 'form-feedback success';
        formFeedback.textContent = 'MESSAGE TRANSMITTED SECURELY TO THE DECENTRALIZED PIPELINE.';
        
        setTimeout(() => {
          formFeedback.style.display = 'none';
        }, 5000);
      }
    }, 1500);
  });
}

/* --- INTERACTIVE 3D TILT EFFECT --- */
function init3DTilt() {
  const cards = document.querySelectorAll('.portal-card, .game-card, .pipeline-card');
  
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const width = rect.width;
        const height = rect.height;
        
        const percentX = (x / width) * 2 - 1;
        const percentY = (y / height) * 2 - 1;
        
        const rotateX = -10 * percentY;
        const rotateY = 10 * percentX;
        
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        
        card.style.setProperty('--mouse-x', `${(x / width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / height) * 100}%`);
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }
}

/* --- TRIGGER MOTION FADE-INS --- */
function initFadeIn() {
  const hero = document.querySelector('.hero');
  const sections = document.querySelectorAll('.grid-portals, .pillars-section, .games-grid, .crypto-panel, .hiring-intro, .careers-columns, .contact-split, .contact-form-panel');
  
  if (hero) {
    hero.classList.add('fade-in-section');
  }
  
  sections.forEach((sec, idx) => {
    sec.classList.add('fade-in-section');
    sec.classList.add(`delay-${(idx % 3) + 1}`);
  });
}

/* --- UTILITY: NOTIFICATION TOASTER --- */
function showNotification(message) {
  let toaster = document.getElementById('kivar-toaster');
  if (!toaster) {
    toaster = document.createElement('div');
    toaster.id = 'kivar-toaster';
    toaster.style.position = 'fixed';
    toaster.style.bottom = '30px';
    toaster.style.right = '30px';
    toaster.style.background = 'var(--bg-tertiary)';
    toaster.style.color = 'var(--accent-cyan)';
    toaster.style.border = '1px solid var(--accent-cyan)';
    toaster.style.padding = '12px 24px';
    toaster.style.borderRadius = '30px';
    toaster.style.fontFamily = 'var(--font-display)';
    toaster.style.fontSize = '0.8rem';
    toaster.style.letterSpacing = '1px';
    toaster.style.boxShadow = '0 0 15px var(--accent-cyan-glow)';
    toaster.style.zIndex = '200';
    toaster.style.opacity = '0';
    toaster.style.transform = 'translateY(20px)';
    toaster.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
    document.body.appendChild(toaster);
  }
  
  toaster.textContent = message.toUpperCase();
  toaster.style.opacity = '1';
  toaster.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    toaster.style.opacity = '0';
    toaster.style.transform = 'translateY(20px)';
  }, 3000);
}
