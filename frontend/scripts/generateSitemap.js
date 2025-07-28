#!/usr/bin/env node

/**
 * Sitemap Generator for isaacmineo.com
 * Automatically generates XML sitemap with current date
 */

import fs from 'fs';
import path from 'path';

const DOMAIN = 'https://isaacmineo.com';
const OUTPUT_PATH = './public/sitemap.xml';

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Site structure - add new pages here
const siteStructure = [
  {
    url: '/',
    priority: '1.0',
    changefreq: 'weekly',
    lastmod: getCurrentDate()
  },
  {
    url: '/#about',
    priority: '0.9',
    changefreq: 'monthly',
    lastmod: getCurrentDate()
  },
  {
    url: '/#experience',
    priority: '0.9',
    changefreq: 'monthly',
    lastmod: getCurrentDate()
  },
  {
    url: '/#projects',
    priority: '0.9',
    changefreq: 'weekly',
    lastmod: getCurrentDate()
  },
  {
    url: '/#code-explainer',
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: getCurrentDate()
  },
  {
    url: '/#chatbot',
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: getCurrentDate()
  },
  {
    url: '/#contact',
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: getCurrentDate()
  },
  {
    url: '/Isaac_Mineo_Resume.pdf',
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: getCurrentDate()
  },
  {
    url: '/manifest.json',
    priority: '0.3',
    changefreq: 'yearly',
    lastmod: getCurrentDate()
  }
];

// Generate XML sitemap
const generateSitemap = () => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  siteStructure.forEach(page => {
    xml += `        
  <url>
    <loc>${DOMAIN}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  xml += `
  
</urlset>`;

  return xml;
};

// Write sitemap to file
const writeSitemap = () => {
  try {
    const sitemap = generateSitemap();
    const outputDir = path.dirname(OUTPUT_PATH);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');
    console.log(`✅ Sitemap generated successfully: ${OUTPUT_PATH}`);
    console.log(`📊 Generated ${siteStructure.length} URLs`);
    console.log(`📅 Last modified: ${getCurrentDate()}`);
    console.log(`🌐 Submit to Google: https://search.google.com/search-console/`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
};

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🗺️  Generating sitemap for isaacmineo.com...');
  writeSitemap();
}

export { generateSitemap, siteStructure };
