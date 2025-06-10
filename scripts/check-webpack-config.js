#!/usr/bin/env node

/**
 * Webpack Configuration Validator
 * Verifies that webpack optimizations are correctly applied
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking webpack configuration optimizations...\n');

// Check if next.config.ts exists and has our optimizations
const configPath = path.join(process.cwd(), 'next.config.ts');
if (!fs.existsSync(configPath)) {
  console.error('❌ next.config.ts not found');
  process.exit(1);
}

const config = fs.readFileSync(configPath, 'utf8');

const checks = [
  {
    name: 'Source map optimization',
    pattern: /eval-cheap-module-source-map/,
    description: 'Uses optimized source maps for development',
  },
  {
    name: 'Memory cache configuration',
    pattern: /type:\s*['"]memory['"]/,
    description: 'Uses memory cache to avoid serialization issues',
  },
  {
    name: 'Chunk size optimization',
    pattern: /maxSize:\s*100000/,
    description: 'Limits chunk size to prevent large string serialization',
  },
  {
    name: 'Symlinks optimization',
    pattern: /symlinks:\s*false/,
    description: 'Disables symlinks for faster module resolution',
  },
  {
    name: 'Cache groups configuration',
    pattern: /cacheGroups:\s*{/,
    description: 'Configures cache groups for better chunk splitting',
  },
];

let allPassed = true;

checks.forEach((check) => {
  const passed = check.pattern.test(config);
  console.log(`${passed ? '✅' : '❌'} ${check.name}: ${check.description}`);
  if (!passed) allPassed = false;
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('🎉 All webpack optimizations are properly configured!');
  console.log('\nNext steps:');
  console.log('1. Run `npm run dev` to test the optimizations');
  console.log('2. Check that no webpack cache warnings appear');
  console.log('3. Monitor build performance improvements');
} else {
  console.log('⚠️  Some optimizations are missing or misconfigured');
  console.log('Please review the next.config.ts file and ensure all optimizations are applied');
}

console.log('\n📚 For more details, see docs/WEBPACK_OPTIMIZATION.md');
