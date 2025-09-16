// Global variables
let currentLanguage = 'ro';

// Language Management System
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('selectedLanguage') || 'ro';
        this.init();
    }

    init() {
        this.loadLanguage(this.currentLang);
        this.updateLanguageDisplay();
        this.bindLanguageEvents();
    }

    loadLanguage(lang) {
        currentLanguage = lang;
        this.currentLang = lang;
        localStorage.setItem('selectedLanguage', lang);
        
        // Update all elements with data-lang-key attributes
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (translations[lang] && translations[lang][key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Update page title
        const titles = {
            ro: 'Clinica Dentară - Dr. Universal Dental Clinic',
            en: 'Dental Clinic - Dr. Universal Dental Clinic',
            tr: 'Diş Kliniği - Dr. Universal Dental Clinic',
            ru: 'Стоматологическая клиника - Dr. Universal Dental Clinic'
        };
        document.title = titles[lang] || titles.ro;
    }

    updateLanguageDisplay() {
        const currentLangElement = document.getElementById('current-lang');
        if (currentLangElement) {
            const langCodes = { ro: 'RO', en: 'EN', tr: 'TR', ru: 'RU' };
            currentLangElement.textContent = langCodes[this.currentLang];
        }
    }

    bindLanguageEvents() {
        // Desktop language dropdown
        const langDropdownBtn = document.getElementById('lang-dropdown-btn');
        const langDropdown = document.getElementById('lang-dropdown');
        
        if (langDropdownBtn && langDropdown) {
            langDropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                langDropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                langDropdown.classList.add('hidden');
            });
        }

        // Language option clicks
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = option.getAttribute('data-lang');
                this.loadLanguage(lang);
                this.updateLanguageDisplay();
                
                // Close dropdowns
                if (langDropdown) langDropdown.classList.add('hidden');
                
                // Close mobile menu if open
                mobileNav.closeMenu();
            });
        });
    }
}

// Mobile Navigation Manager
class MobileNavigation {
    constructor() {
        this.menuBtn = document.getElementById('mobile-menu-btn');
        this.closeBtn = document.getElementById('close-menu-btn');
        this.overlay = document.getElementById('mobile-overlay');
        this.menu = document.getElementById('off-canvas-menu');
        this.menuIcon = document.getElementById('menu-icon');
        this.isOpen = false;
        
        this.bindEvents();
    }

    bindEvents() {
        // Open menu
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Close menu
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Close on overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Close on menu link click
        const menuLinks = this.menu?.querySelectorAll('a');
        if (menuLinks) {
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMenu();
                });
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;
        this.overlay?.classList.remove('hidden');
        this.menu?.classList.add('open');
        
        if (this.menuIcon) {
            this.menuIcon.className = 'fas fa-times text-2xl text-gray-800';
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.isOpen = false;
        this.overlay?.classList.add('hidden');
        this.menu?.classList.remove('open');
        
        if (this.menuIcon) {
            this.menuIcon.className = 'fas fa-bars text-2xl text-gray-800';
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Form Validation Manager
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.bindEvents();
    }

    bindEvents() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                return;
            }
            
            // If validation passes, let the form submit normally to W3Forms
            // Remove redirect field to let W3Forms handle it normally, then redirect with JavaScript
            const redirectField = this.form.querySelector('input[name="redirect"]');
            if (redirectField) {
                redirectField.remove();
            }
            
            // Add a brief delay then redirect (W3Forms will process in background)
            setTimeout(() => {
                window.location.href = 'success.html';
            }, 1000);
        });

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('focus', () => this.clearFieldError(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateForm() {
        this.clearAllErrors();
        
        // Handle both consultation and contact forms
        const nume = document.getElementById('nume') || document.getElementById('nume-contact');
        const telefon = document.getElementById('telefon') || document.getElementById('telefon-contact');
        const email = document.getElementById('email') || document.getElementById('email-contact');
        const robot = document.getElementById('robot') || document.getElementById('robot-contact');
        
        let isValid = true;
        
        // Validate name
        if (!nume?.value.trim()) {
            this.showError(nume, translations[currentLanguage]['validation.name']);
            isValid = false;
        }
        
        // Validate phone
        if (!telefon?.value.trim()) {
            this.showError(telefon, translations[currentLanguage]['validation.phone']);
            isValid = false;
        } else if (!/^[\d\s\-\+\(\)]{8,15}$/.test(telefon.value.trim())) {
            this.showError(telefon, translations[currentLanguage]['validation.phone.invalid']);
            isValid = false;
        }
        
        // Validate email
        if (!email?.value.trim()) {
            this.showError(email, translations[currentLanguage]['validation.email']);
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            this.showError(email, translations[currentLanguage]['validation.email.invalid']);
            isValid = false;
        }
        
        // Validate reCAPTCHA
        if (!robot?.checked) {
            this.showError(robot, translations[currentLanguage]['validation.robot']);
            isValid = false;
        }
        
        return isValid;
    }

    validateField(field) {
        this.clearFieldError(field);
        
        if (!field.value.trim() && field.hasAttribute('required')) {
            const fieldName = field.getAttribute('data-lang-key') || field.placeholder;
            this.showError(field, `${fieldName} este obligatoriu`);
        }
    }

    showError(element, message) {
        element.classList.add('border-red-500', 'bg-red-50');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1 animate-fade-in';
        errorDiv.textContent = message;
        errorDiv.setAttribute('data-error', 'true');
        
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
    }

    clearFieldError(element) {
        element.classList.remove('border-red-500', 'bg-red-50');
        const errorMsg = element.parentNode.querySelector('[data-error=\"true\"]');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    clearAllErrors() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this.clearFieldError(input);
        });
        
        const successMsg = document.getElementById('success-message');
        if (successMsg) {
            successMsg.remove();
        }
    }

    showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.id = 'success-message';
        successDiv.className = 'bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mt-6 animate-fade-in';
        successDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                <span>${translations[currentLanguage]['form.success']}</span>
            </div>
        `;
        
        this.form.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 8000);
    }
}

// Scroll Animation Manager
class ScrollAnimations {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in');
                        entry.target.classList.remove('opacity-0');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' }
        );
        
        this.init();
    }

    init() {
        // Observe all elements with animate-on-scroll class
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            this.observer.observe(el);
        });
    }
}

// Smooth Scroll Manager
class SmoothScroll {
    constructor() {
        this.bindEvents();
    }

    bindEvents() {
        document.querySelectorAll('a[href^=\"#\"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
}

// Enhanced Button Effects
class ButtonEffects {
    constructor() {
        this.init();
    }

    init() {
        // Add ripple effect to buttons
        document.querySelectorAll('button, .btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });
    }

    createRipple(event, button) {
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
        
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
}

// WhatsApp Button Manager
class WhatsAppButton {
    constructor() {
        this.button = document.querySelector('a[href*=\"wa.me\"]');
        this.init();
    }

    init() {
        if (!this.button) return;
        
        // Stop initial animation after 3 seconds
        setTimeout(() => {
            this.button.classList.remove('animate-bounce');
        }, 3000);
        
        // Add hover effects
        this.button.addEventListener('mouseenter', () => {
            this.button.classList.add('animate-pulse');
        });
        
        this.button.addEventListener('mouseleave', () => {
            this.button.classList.remove('animate-pulse');
        });
    }
}

// Navbar Scroll Effect
class NavbarScrollEffect {
    constructor() {
        this.header = document.querySelector('header');
        this.topBar = this.header?.querySelector('div:first-child');
        this.mainNav = this.header?.querySelector('nav');
        this.init();
    }

    init() {
        if (!this.header || !this.topBar || !this.mainNav) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                // Hide top bar and make nav fixed
                this.topBar.style.display = 'none';
                this.mainNav.classList.add('fixed', 'top-0', 'left-0', 'right-0', 'bg-white/95', 'backdrop-blur-sm', 'shadow-lg', 'z-50');
                this.mainNav.classList.remove('relative');
                
                // Add margin to body to prevent content jump
                document.body.style.paddingTop = this.mainNav.offsetHeight + 'px';
            } else {
                // Show top bar and make nav relative
                this.topBar.style.display = 'block';
                this.mainNav.classList.remove('fixed', 'top-0', 'left-0', 'right-0', 'bg-white/95', 'backdrop-blur-sm', 'shadow-lg', 'z-50');
                this.mainNav.classList.add('relative');
                
                // Remove margin from body
                document.body.style.paddingTop = '0';
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all managers
    const languageManager = new LanguageManager();
    const mobileNav = new MobileNavigation();
    const formValidator = new FormValidator('consultation-form');
    const scrollAnimations = new ScrollAnimations();
    const smoothScroll = new SmoothScroll();
    const buttonEffects = new ButtonEffects();
    const whatsappButton = new WhatsAppButton();
    const navbarScroll = new NavbarScrollEffect();
    
    // Make mobileNav globally accessible for language manager
    window.mobileNav = mobileNav;
    
    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            background-color: rgba(255, 255, 255, 0.6);
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        button, .btn {
            position: relative;
            overflow: hidden;
        }
        
        .animate-fade-in {
            animation: fadeIn 0.6s ease-out forwards;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .animate-fade-in,
            .animate-slide-up,
            .animate-scale-in,
            .animate-bounce,
            .animate-pulse {
                animation: none;
            }
            
            .service-card:hover,
            .hover\\:scale-105:hover,
            .hover\\:scale-110:hover {
                transform: none;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize scroll-triggered animations with stagger effect
    setTimeout(() => {
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        animateElements.forEach((el, index) => {
            setTimeout(() => {
                if (isElementInViewport(el)) {
                    el.classList.add('animate-fade-in');
                    el.classList.remove('opacity-0');
                }
            }, index * 100);
        });
    }, 500);
});

// Utility Functions
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    // Enable keyboard navigation for dropdowns
    if (e.key === 'Escape') {
        // Close any open dropdowns or modals
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
        
        // Close mobile menu
        if (window.mobileNav) {
            window.mobileNav.closeMenu();
        }
    }
});

// Add focus management for better accessibility
document.addEventListener('DOMContentLoaded', function() {
    // Add focus indicators for keyboard navigation
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
        });
        
        element.addEventListener('blur', function() {
            this.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
        });
    });
});