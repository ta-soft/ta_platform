const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const toggle = document.querySelector('[data-menu-toggle]');

const setHeaderState = () => {
  header?.classList.toggle('is-solid', window.scrollY > 24);
};
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

toggle?.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

nav?.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    header.classList.remove('menu-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const form = document.querySelector('[data-contact-form]');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get('name') || '';
  const email = data.get('email') || '';
  const phone = data.get('phone') || '';
  const company = data.get('company') || '';
  const message = data.get('message') || '';
  const subject = encodeURIComponent(`Transport enquiry from ${name}`);
  const body = encodeURIComponent([
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Company: ${company}`,
    '',
    'Message:',
    message,
  ].join('\n'));
  window.location.href = `mailto:info@flashline.com.au?subject=${subject}&body=${body}`;
});

// Discreet client-side logo preview switcher.
const logoSwitcher = document.querySelector('[data-logo-switcher]');
const logoToggle = document.querySelector('[data-logo-toggle]');
const logoButtons = Array.from(document.querySelectorAll('[data-logo-variant]'));
const logoSlots = Array.from(document.querySelectorAll('[data-logo-slot]'));
const speedLogo = logoSlots[0]?.innerHTML || '';
const originalLogo = '<img class="brand-img" src="assets/e8c4e0c8-Flash-Line-Transport-Logo-scaled-1-1024x356.png" alt="Flash Line Transport">';
const monogramLogo = `
  <svg class="brand-svg" viewBox="0 0 264 56" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Flash Line Transport">
    <path d="M0 5h52L38 51H0V5Z" fill="#E2231A"/>
    <text x="14" y="36" fill="#FFFFFF" font-family="DM Sans, Arial, sans-serif" font-size="23" font-weight="900">FL</text>
    <text x="66" y="33" fill="#FFFFFF" font-family="DM Sans, Arial, sans-serif" font-size="24" font-weight="900" letter-spacing="1.4">FLASH LINE</text>
    <text x="67" y="49" fill="#9AA3AD" font-family="DM Sans, Arial, sans-serif" font-size="9" font-weight="800" letter-spacing="3.2">TRANSPORT</text>
  </svg>`;
const logoVariants = {
  original: originalLogo,
  'original-dark': `<span class="brand-chip">${originalLogo}</span>`,
  speed: speedLogo,
  monogram: monogramLogo,
};

function setLogoVariant(name) {
  const key = logoVariants[name] ? name : 'speed';
  logoSlots.forEach((slot) => { slot.innerHTML = logoVariants[key]; });
  logoButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.logoVariant === key));
  });
  try { localStorage.setItem('flashline-logo-variant', key); } catch (_) {}
}

logoToggle?.addEventListener('click', () => {
  const open = logoSwitcher.classList.toggle('is-open');
  logoToggle.setAttribute('aria-expanded', String(open));
});

logoButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setLogoVariant(button.dataset.logoVariant);
    logoSwitcher.classList.remove('is-open');
    logoToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', (event) => {
  if (logoSwitcher && !logoSwitcher.contains(event.target)) {
    logoSwitcher.classList.remove('is-open');
    logoToggle?.setAttribute('aria-expanded', 'false');
  }
});

let savedLogo = 'speed';
try { savedLogo = localStorage.getItem('flashline-logo-variant') || 'speed'; } catch (_) {}
setLogoVariant(savedLogo);
