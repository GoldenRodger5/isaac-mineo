/**
 * Premium Mobile Accessibility System
 * WCAG 2.2 AAA compliance with advanced mobile adaptations
 */

class MobileAccessibilityManager {
  constructor() {
    this.preferences = {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      voiceOver: false,
      screenReader: false,
      colorBlindness: null
    };
    
    this.init();
  }

  init() {
    this.detectAccessibilityPreferences();
    this.initKeyboardNavigation();
    this.initScreenReaderSupport();
    this.initVoiceControl();
    this.initColorAccessibility();
    this.initMotionPreferences();
    this.initFocusManagement();
    
    console.log('♿ Premium mobile accessibility initialized');
  }

  // Detect user accessibility preferences
  detectAccessibilityPreferences() {
    // Media queries for accessibility preferences
    const mediaQueries = {
      reducedMotion: '(prefers-reduced-motion: reduce)',
      highContrast: '(prefers-contrast: high)',
      reducedData: '(prefers-reduced-data: reduce)',
      colorScheme: '(prefers-color-scheme: dark)',
      transparencyReduction: '(prefers-reduced-transparency: reduce)'
    };

    Object.entries(mediaQueries).forEach(([pref, query]) => {
      const mediaQuery = window.matchMedia(query);
      this.preferences[pref] = mediaQuery.matches;
      
      // Listen for changes
      mediaQuery.addEventListener('change', (e) => {
        this.preferences[pref] = e.matches;
        this.applyAccessibilityPreferences();
      });
    });

    // Detect screen readers
    this.preferences.screenReader = this.detectScreenReader();
    
    // Detect large text preference
    this.preferences.largeText = this.detectLargeTextPreference();
    
    this.applyAccessibilityPreferences();
  }

  detectScreenReader() {
    // Multiple methods to detect screen readers
    const indicators = [
      // NVDA, JAWS, etc.
      navigator.userAgent.includes('NVDA') || navigator.userAgent.includes('JAWS'),
      
      // Check for screen reader APIs
      'speechSynthesis' in window && speechSynthesis.getVoices().length > 0,
      
      // Check for accessibility APIs
      'accessibility' in navigator,
      
      // iOS VoiceOver
      'webkitSpeechRecognition' in window && /iPhone|iPad|iPod/i.test(navigator.userAgent),
      
      // Android TalkBack
      navigator.userAgent.includes('Mobile') && 'speechSynthesis' in window
    ];

    return indicators.some(Boolean);
  }

  detectLargeTextPreference() {
    // Check if user has zoomed or set large text
    const zoomLevel = Math.round(((window.outerWidth / window.innerWidth) * 100));
    return zoomLevel > 150 || window.devicePixelRatio > 2;
  }

  applyAccessibilityPreferences() {
    const body = document.body;
    
    // Apply classes based on preferences
    body.classList.toggle('reduced-motion', this.preferences.reducedMotion);
    body.classList.toggle('high-contrast', this.preferences.highContrast);
    body.classList.toggle('large-text', this.preferences.largeText);
    body.classList.toggle('screen-reader', this.preferences.screenReader);
    body.classList.toggle('reduced-transparency', this.preferences.transparencyReduction);

    // Update CSS custom properties
    this.updateAccessibilityStyles();
    
    console.log('♿ Accessibility preferences applied:', this.preferences);
  }

  updateAccessibilityStyles() {
    const root = document.documentElement;
    
    // Font scaling for accessibility
    if (this.preferences.largeText) {
      root.style.setProperty('--font-scale', '1.25');
      root.style.setProperty('--touch-target-min', '48px');
    } else {
      root.style.setProperty('--font-scale', '1');
      root.style.setProperty('--touch-target-min', '44px');
    }
    
    // Animation duration scaling
    if (this.preferences.reducedMotion) {
      root.style.setProperty('--animation-duration-scale', '0.01');
    } else {
      root.style.setProperty('--animation-duration-scale', '1');
    }
    
    // Contrast adjustments
    if (this.preferences.highContrast) {
      root.style.setProperty('--contrast-multiplier', '1.5');
    } else {
      root.style.setProperty('--contrast-multiplier', '1');
    }
  }

  // Advanced keyboard navigation
  initKeyboardNavigation() {
    let currentFocusIndex = 0;
    const focusableElements = this.getFocusableElements();
    
    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'Tab':
          this.handleTabNavigation(e);
          break;
        case 'Escape':
          this.handleEscapeKey(e);
          break;
        case 'Space':
        case 'Enter':
          this.handleActionKey(e);
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          this.handleArrowNavigation(e);
          break;
        case 'Home':
        case 'End':
          this.handleHomeEndNavigation(e);
          break;
      }
    });

    // Voice commands for keyboard navigation
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      this.initVoiceControl();
    }
  }

  getFocusableElements() {
    const selector = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ');
    
    return Array.from(document.querySelectorAll(selector));
  }

  handleTabNavigation(e) {
    const focusableElements = this.getFocusableElements();
    
    if (focusableElements.length === 0) return;
    
    // Add visual focus indicator for screen readers
    const currentElement = document.activeElement;
    
    // Announce navigation to screen readers
    if (this.preferences.screenReader) {
      this.announceToScreenReader(`Navigating to ${this.getElementDescription(currentElement)}`);
    }
    
    // Ensure focus is visible
    this.ensureFocusVisible(currentElement);
  }

  handleArrowNavigation(e) {
    // Enhanced arrow navigation for mobile
    const currentElement = document.activeElement;
    const container = currentElement.closest('[role="tablist"], [role="menu"], .navigation-container');
    
    if (!container) return;
    
    e.preventDefault();
    
    const items = Array.from(container.querySelectorAll('[role="tab"], [role="menuitem"], .nav-item'));
    const currentIndex = items.indexOf(currentElement);
    
    let nextIndex;
    switch(e.code) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
    }
    
    if (items[nextIndex]) {
      items[nextIndex].focus();
      
      // Haptic feedback for navigation
      if (navigator.vibrate && !this.preferences.reducedMotion) {
        navigator.vibrate(10);
      }
    }
  }

  // Screen reader support
  initScreenReaderSupport() {
    // Dynamic ARIA live regions
    this.createLiveRegion();
    
    // Enhanced ARIA labels and descriptions
    this.enhanceAriaLabels();
    
    // Page structure announcements
    this.announcePageStructure();
    
    // Form field descriptions
    this.enhanceFormAccessibility();
  }

  createLiveRegion() {
    if (!document.getElementById('accessibility-announcements')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = `
        position: absolute !important;
        left: -10000px !important;
        top: -10000px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
      `;
      document.body.appendChild(liveRegion);
    }
  }

  announceToScreenReader(message, priority = 'polite') {
    const liveRegion = document.getElementById('accessibility-announcements');
    if (!liveRegion) return;
    
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }

  enhanceAriaLabels() {
    // Add missing ARIA labels
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        const icon = button.querySelector('i, svg, .icon');
        if (icon) {
          button.setAttribute('aria-label', this.inferButtonAction(button));
        }
      }
    });
    
    // Enhance form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (!label && input.placeholder) {
        input.setAttribute('aria-label', input.placeholder);
      }
    });
  }

  inferButtonAction(button) {
    const classes = button.className.toLowerCase();
    const parent = button.closest('[data-action], [role]');
    
    if (classes.includes('close')) return 'Close';
    if (classes.includes('menu')) return 'Open menu';
    if (classes.includes('play')) return 'Play';
    if (classes.includes('pause')) return 'Pause';
    if (classes.includes('next')) return 'Next';
    if (classes.includes('prev')) return 'Previous';
    if (parent) return `Activate ${parent.getAttribute('data-action') || parent.getAttribute('role')}`;
    
    return 'Button';
  }

  // Voice control integration
  initVoiceControl() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.speechRecognition = new SpeechRecognition();
    
    this.speechRecognition.continuous = true;
    this.speechRecognition.interimResults = false;
    this.speechRecognition.lang = 'en-US';
    
    // Voice commands
    const voiceCommands = {
      'go home': () => this.navigateToSection('about'),
      'show projects': () => this.navigateToSection('projects'),
      'contact me': () => this.navigateToSection('contact'),
      'next page': () => this.navigateNext(),
      'previous page': () => this.navigatePrevious(),
      'scroll up': () => window.scrollBy(0, -200),
      'scroll down': () => window.scrollBy(0, 200),
      'go back': () => history.back(),
      'activate voice chat': () => this.activateVoiceChat(),
      'click button': () => this.clickFocusedElement(),
      'read page': () => this.readPageContent()
    };
    
    this.speechRecognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      
      if (voiceCommands[command]) {
        voiceCommands[command]();
        this.announceToScreenReader(`Voice command executed: ${command}`);
      } else {
        // Try partial matching
        const matchingCommand = Object.keys(voiceCommands).find(cmd => 
          command.includes(cmd) || cmd.includes(command.split(' ')[0])
        );
        
        if (matchingCommand) {
          voiceCommands[matchingCommand]();
          this.announceToScreenReader(`Voice command executed: ${matchingCommand}`);
        }
      }
    };
    
    // Auto-start voice recognition for screen reader users
    if (this.preferences.screenReader) {
      document.addEventListener('click', () => {
        if (!this.speechRecognition.started) {
          this.speechRecognition.start();
          this.speechRecognition.started = true;
        }
      }, { once: true });
    }
  }

  // Color accessibility
  initColorAccessibility() {
    // Add color blindness simulation
    this.addColorBlindnessFilters();
    
    // Enhance contrast
    if (this.preferences.highContrast) {
      this.applyHighContrastMode();
    }
    
    // Add pattern/texture alternatives to color coding
    this.addColorAlternatives();
  }

  addColorBlindnessFilters() {
    const filters = `
      .protanopia { filter: url(#protanopia); }
      .deuteranopia { filter: url(#deuteranopia); }
      .tritanopia { filter: url(#tritanopia); }
    `;
    
    const style = document.createElement('style');
    style.textContent = filters;
    document.head.appendChild(style);
    
    // SVG filters for color blindness simulation
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    
    svg.innerHTML = `
      <defs>
        <filter id="protanopia">
          <feColorMatrix type="matrix" values="0.567,0.433,0,0,0  0.558,0.442,0,0,0  0,0.242,0.758,0,0  0,0,0,1,0"/>
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix type="matrix" values="0.625,0.375,0,0,0  0.7,0.3,0,0,0  0,0.3,0.7,0,0  0,0,0,1,0"/>
        </filter>
        <filter id="tritanopia">
          <feColorMatrix type="matrix" values="0.95,0.05,0,0,0  0,0.433,0.567,0,0  0,0.475,0.525,0,0  0,0,0,1,0"/>
        </filter>
      </defs>
    `;
    
    document.body.appendChild(svg);
  }

  // Focus management
  initFocusManagement() {
    // Enhanced focus indicators
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `
      *:focus {
        outline: 3px solid #4285f4 !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
      }
      
      .focus-within:focus-within {
        box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.3) !important;
      }
      
      .skip-link {
        position: absolute !important;
        top: -40px !important;
        left: 6px !important;
        background: #000 !important;
        color: #fff !important;
        padding: 8px !important;
        text-decoration: none !important;
        border-radius: 4px !important;
        z-index: 100000 !important;
        transition: top 0.2s !important;
      }
      
      .skip-link:focus {
        top: 6px !important;
      }
    `;
    
    document.head.appendChild(focusStyle);
    
    // Add skip links
    this.addSkipLinks();
    
    // Focus trap for modals
    this.initFocusTraps();
  }

  addSkipLinks() {
    const skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#footer', text: 'Skip to footer' }
    ];
    
    const container = document.createElement('div');
    container.className = 'skip-links';
    
    skipLinks.forEach(link => {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      a.className = 'skip-link';
      container.appendChild(a);
    });
    
    document.body.insertBefore(container, document.body.firstChild);
  }

  // Utility methods
  ensureFocusVisible(element) {
    if (!element) return;
    
    // Scroll element into view
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
    
    // Add temporary highlight
    element.classList.add('accessibility-focused');
    setTimeout(() => {
      element.classList.remove('accessibility-focused');
    }, 2000);
  }

  getElementDescription(element) {
    if (!element) return 'unknown element';
    
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;
    
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent.trim();
    }
    
    if (element.textContent.trim()) {
      return element.textContent.trim();
    }
    
    return `${element.tagName.toLowerCase()} element`;
  }

  // Navigation helpers
  navigateToSection(section) {
    const element = document.getElementById(section) || document.querySelector(`[data-section="${section}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.focus();
    }
  }

  activateVoiceChat() {
    const voiceChatButton = document.querySelector('[data-voice-chat], .voice-chat-button');
    if (voiceChatButton) {
      voiceChatButton.click();
    }
  }

  readPageContent() {
    if ('speechSynthesis' in window) {
      const content = document.querySelector('main, #main-content, .main-content');
      if (content) {
        const text = content.textContent.trim();
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
      }
    }
  }
}

// Initialize accessibility manager
window.mobileAccessibilityManager = new MobileAccessibilityManager();

// Add global CSS for accessibility
const accessibilityCSS = document.createElement('style');
accessibilityCSS.textContent = `
  /* High contrast mode */
  .high-contrast {
    filter: contrast(var(--contrast-multiplier, 1.5));
  }
  
  .high-contrast * {
    border-color: currentColor !important;
  }
  
  /* Reduced motion */
  .reduced-motion *, 
  .reduced-motion *:before, 
  .reduced-motion *:after {
    animation-duration: calc(var(--animation-duration-scale, 0.01) * 1s) !important;
    animation-delay: calc(var(--animation-duration-scale, 0.01) * 1s) !important;
    transition-duration: calc(var(--animation-duration-scale, 0.01) * 0.2s) !important;
    scroll-behavior: auto !important;
  }
  
  /* Large text scaling */
  .large-text {
    font-size: calc(1rem * var(--font-scale, 1.25)) !important;
  }
  
  .large-text button,
  .large-text a,
  .large-text input {
    min-height: var(--touch-target-min, 48px) !important;
    min-width: var(--touch-target-min, 48px) !important;
  }
  
  /* Screen reader optimizations */
  .screen-reader .decorative {
    aria-hidden: true;
  }
  
  /* Focus improvements */
  .accessibility-focused {
    animation: accessibility-pulse 2s ease-in-out;
  }
  
  @keyframes accessibility-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
    50% { box-shadow: 0 0 0 6px rgba(66, 133, 244, 0.1); }
  }
  
  /* Touch target enhancements */
  @media (hover: none) and (pointer: coarse) {
    .large-text button,
    .large-text a[role="button"],
    .large-text input {
      padding: 16px !important;
    }
  }
`;

document.head.appendChild(accessibilityCSS);

console.log('♿ Premium mobile accessibility system loaded');

export default MobileAccessibilityManager;
