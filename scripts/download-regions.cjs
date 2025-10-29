#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const path = require('path');

const targetFiles = [
  'src/assets/regions.json',
  'dist/modern/assets/regions.json',
  'dist/legacy/assets/regions.json'
];

function downloadRegions(targetFile) {
  const targetDir = path.dirname(targetFile);
  
  // Ensure directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const url = 'https://artifacts.contentstack.com/regions.json';
  
  https.get(url, { timeout: 30000 }, (response) => {
    if (response.statusCode === 200) {
      const fileStream = fs.createWriteStream(targetFile);
      response.pipe(fileStream);
      
      fileStream.on('close', () => {
        console.log(`✓ Updated ${targetFile}`);
      });
      
      fileStream.on('error', (err) => {
        console.log(`Warning: Failed to write ${targetFile}, using bundled version`);
      });
    } else {
      console.log(`Warning: HTTP ${response.statusCode}, using bundled regions.json`);
    }
  }).on('error', (err) => {
    console.log(`Warning: Failed to download regions.json (${err.message}), using bundled version`);
  }).setTimeout(30000, function() {
    this.destroy();
    console.log('Warning: Download timeout, using bundled regions.json');
  });
}

// Download to all target locations
targetFiles.forEach(downloadRegions);

