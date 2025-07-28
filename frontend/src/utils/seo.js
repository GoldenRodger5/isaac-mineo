/* Enhanced SEO optimizations */

/* Add structured data for better search understanding */
function addStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://isaacmineo.com/#person",
        "name": "Isaac Mineo",
        "givenName": "Isaac",
        "familyName": "Mineo",
        "url": "https://isaacmineo.com",
        "image": {
          "@type": "ImageObject",
          "url": "https://isaacmineo.com/isaac-photo.jpg",
          "width": 400,
          "height": 400
        },
        "sameAs": [
          "https://github.com/GoldenRodger5"
        ],
        "jobTitle": "Full-Stack Developer & AI Engineer",
        "worksFor": {
          "@type": "Organization",
          "name": "Freelance Developer"
        },
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "University of Richmond"
        },
        "knowsAbout": [
          "React Development",
          "Node.js",
          "Python Programming",
          "Artificial Intelligence",
          "Machine Learning",
          "Full-Stack Development",
          "Web Development",
          "JavaScript",
          "TypeScript",
          "AI Engineering",
          "Software Engineering",
          "FastAPI",
          "Database Design",
          "Cloud Computing"
        ],
        "hasOccupation": {
          "@type": "Occupation",
          "name": "Software Engineer",
          "occupationLocation": {
            "@type": "Country",
            "name": "United States"
          }
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://isaacmineo.com/#website",
        "url": "https://isaacmineo.com",
        "name": "Isaac Mineo - Full-Stack Developer Portfolio",
        "description": "Professional portfolio of Isaac Mineo, showcasing AI-powered applications, full-stack development projects, and software engineering expertise.",
        "publisher": {
          "@id": "https://isaacmineo.com/#person"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://isaacmineo.com/?s={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": "https://isaacmineo.com/#webpage",
        "url": "https://isaacmineo.com",
        "name": "Isaac Mineo - Full-Stack Developer & AI Engineer",
        "isPartOf": {
          "@id": "https://isaacmineo.com/#website"
        },
        "about": {
          "@id": "https://isaacmineo.com/#person"
        },
        "description": "Isaac Mineo's professional portfolio featuring innovative AI-powered applications, full-stack development projects, and cutting-edge software solutions.",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://isaacmineo.com"
            }
          ]
        }
      }
    ]
  };

  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new enhanced structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

/* Update page title and meta description dynamically */
function updateSEOForTab(tabId) {
  const seoConfig = {
    'about': {
      title: 'About Isaac Mineo - Full-Stack Developer & AI Engineer',
      description: 'Learn about Isaac Mineo, a passionate full-stack developer specializing in AI-powered applications, React, Python, and innovative web solutions.'
    },
    'experience': {
      title: 'Isaac Mineo - Professional Experience & Skills',
      description: 'Explore Isaac Mineo\'s professional experience, technical skills, and expertise in full-stack development, AI engineering, and software solutions.'
    },
    'projects': {
      title: 'Isaac Mineo - Portfolio Projects & AI Applications',
      description: 'Discover Isaac Mineo\'s innovative projects including AI-powered applications, full-stack web development, and cutting-edge software solutions.'
    },
    'code-explainer': {
      title: 'AI Code Explainer by Isaac Mineo - Claude-Powered Tool',
      description: 'Try Isaac Mineo\'s AI-powered code explanation tool. Get instant, intelligent explanations of code using advanced AI technology.'
    },
    'chatbot': {
      title: 'AI Chatbot by Isaac Mineo - Interactive Portfolio Assistant',
      description: 'Chat with Isaac Mineo\'s AI-powered portfolio assistant. Get answers about his experience, projects, and technical expertise.'
    },
    'contact': {
      title: 'Contact Isaac Mineo - Full-Stack Developer for Hire',
      description: 'Get in touch with Isaac Mineo for full-stack development, AI engineering projects, or software consulting opportunities.'
    }
  };

  const config = seoConfig[tabId];
  if (config) {
    document.title = config.title;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = config.description;
    }

    // Update Open Graph title and description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.content = config.title;
    if (ogDesc) ogDesc.content = config.description;

    // Update Twitter Card
    let twitterTitle = document.querySelector('meta[property="twitter:title"]');
    let twitterDesc = document.querySelector('meta[property="twitter:description"]');
    if (twitterTitle) twitterTitle.content = config.title;
    if (twitterDesc) twitterDesc.content = config.description;

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.href = `https://isaacmineo.com/#${tabId}`;
    }
  }
}

/* Track user engagement for SEO signals */
function trackSEOSignals() {
  let timeOnPage = 0;
  const startTime = Date.now();
  
  // Track time on page
  const updateTimeOnPage = () => {
    timeOnPage = Math.floor((Date.now() - startTime) / 1000);
  };
  
  setInterval(updateTimeOnPage, 1000);
  
  // Track scroll depth
  let maxScrollDepth = 0;
  const trackScrollDepth = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);
  };
  
  window.addEventListener('scroll', trackScrollDepth);
  
  // Track engagement before user leaves
  window.addEventListener('beforeunload', () => {
    updateTimeOnPage();
    // Send engagement data (time on page, scroll depth) to analytics
    if (window.gtag) {
      window.gtag('event', 'engagement', {
        time_on_page: timeOnPage,
        scroll_depth: maxScrollDepth,
        page_title: document.title
      });
    }
  });
}

/* Initialize SEO enhancements */
export function initializeSEO() {
  // Add enhanced structured data
  addStructuredData();
  
  // Start tracking engagement
  trackSEOSignals();
  
  // Return the tab update function for use in App.jsx
  return updateSEOForTab;
}

/* Export for use in components */
export { updateSEOForTab, trackSEOSignals };
