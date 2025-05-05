#!/usr/bin/env node

/**
 * Script to ensure Tailwind CSS is properly installed and configured for CI/CD
 */
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function checkFiles() {
  console.log('Checking configuration files...');

  try {
    // Check tailwind.config.js and postcss.config.js
    const tailwindConfig = path.join(__dirname, 'tailwind.config.js');
    const tailwindConfigTS = path.join(__dirname, 'tailwind.config.ts');
    const postcssConfig = path.join(__dirname, 'postcss.config.js');
    const postcssConfigMJS = path.join(__dirname, 'postcss.config.mjs');

    let tailwindConfigExists = false;
    let postcssConfigExists = false;

    try {
      await fs.access(tailwindConfigTS);
      console.log('✅ tailwind.config.ts exists');
      tailwindConfigExists = true;
    } catch (e) {
      try {
        await fs.access(tailwindConfig);
        console.log('✅ tailwind.config.js exists');
        tailwindConfigExists = true;
      } catch {
        console.log('❌ No tailwind config found', e);
      }
    }

    try {
      await fs.access(postcssConfigMJS);
      console.log('✅ postcss.config.mjs exists');
      postcssConfigExists = true;
    } catch (e) {
      try {
        await fs.access(postcssConfig);
        console.log('✅ postcss.config.js exists', e);
        postcssConfigExists = true;
      } catch (e) {
        console.log('❌ No postcss config found', e);
      }
    }

    if (!tailwindConfigExists || !postcssConfigExists) {
      console.log('❌ Missing required configuration files');
      return false;
    }

    // Check globals.css
    await fs.access(path.join(__dirname, 'src/app/globals.css'));
    console.log('✅ src/app/globals.css exists');

    return true;
  } catch (error) {
    console.error('❌ Error checking files:', error);
    return false;
  }
}

async function ensureDependencies() {
  console.log('\n📦 Ensuring Tailwind CSS dependencies are installed...');

  try {
    // First ensure all project dependencies are installed
    await runCommand('npm', ['ci']);

    // Then explicitly install Tailwind CSS and related packages
    await runCommand('npm', [
      'install',
      '-D',
      'tailwindcss@latest',
      'postcss@latest',
      'autoprefixer@latest',
    ]);
    console.log('✅ Tailwind CSS dependencies installed');
    return true;
  } catch (error) {
    console.error('❌ Error installing dependencies:', error);
    return false;
  }
}

async function createJSConfig() {
  console.log('\n📄 Creating JavaScript versions of config files if needed...');

  try {
    // Check if tailwind.config.ts exists but tailwind.config.js doesn't
    const tailwindTsExists = await fileExists(path.join(__dirname, 'tailwind.config.ts'));
    const tailwindJsExists = await fileExists(path.join(__dirname, 'tailwind.config.js'));

    if (tailwindTsExists && !tailwindJsExists) {
      console.log('Creating tailwind.config.js from tailwind.config.ts...');

      // Create a simple JS version that imports the TS version
      const jsConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', 'dark'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}`;

      await fs.writeFile(path.join(__dirname, 'tailwind.config.js'), jsConfig);
      console.log('✅ Created tailwind.config.js');
    }

    // Check if postcss.config.mjs exists but postcss.config.js doesn't
    const postcssConfigMjsExists = await fileExists(path.join(__dirname, 'postcss.config.mjs'));
    const postcssConfigJsExists = await fileExists(path.join(__dirname, 'postcss.config.js'));

    if (postcssConfigMjsExists && !postcssConfigJsExists) {
      console.log('Creating postcss.config.js from postcss.config.mjs...');

      const jsConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

      await fs.writeFile(path.join(__dirname, 'postcss.config.js'), jsConfig);
      console.log('✅ Created postcss.config.js');
    }

    return true;
  } catch (error) {
    console.error('❌ Error creating JS config files:', error);
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function verifyTailwindInstallation() {
  console.log('\n🔍 Verifying Tailwind CSS installation...');

  try {
    // Create a temporary input file for testing
    const tempInputCss = path.join(__dirname, 'tailwind-test-input.css');
    const tempOutputCss = path.join(__dirname, 'tailwind-test-output.css');

    await fs.writeFile(
      tempInputCss,
      '@tailwind base;\n@tailwind components;\n@tailwind utilities;'
    );

    // Try to run tailwindcss CLI - use relative path to node_modules with npx
    try {
      await runCommand('./node_modules/.bin/tailwindcss', [
        '-i',
        tempInputCss,
        '-o',
        tempOutputCss,
        '--config',
        path.join(__dirname, 'tailwind.config.js'),
      ]);
    } catch (e) {
      console.log('Direct path execution failed, trying npx...', e);
      await runCommand('npx', [
        '--no-install',
        'tailwindcss',
        '-i',
        tempInputCss,
        '-o',
        tempOutputCss,
        '--config',
        path.join(__dirname, 'tailwind.config.js'),
      ]);
    }

    // Check if output file was created
    await fs.access(tempOutputCss);
    console.log('✅ Tailwind CSS CLI works correctly');

    // Clean up temp files
    await fs.unlink(tempInputCss);
    await fs.unlink(tempOutputCss);

    return true;
  } catch (error) {
    console.error('❌ Error verifying Tailwind CSS:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Tailwind CSS setup for CI...');

  const filesOk = await checkFiles();
  if (!filesOk) {
    process.exit(1);
  }

  const dependenciesOk = await ensureDependencies();
  if (!dependenciesOk) {
    process.exit(1);
  }

  const configsOk = await createJSConfig();
  if (!configsOk) {
    process.exit(1);
  }

  const tailwindOk = await verifyTailwindInstallation();
  if (!tailwindOk) {
    process.exit(1);
  }

  console.log('\n✨ Tailwind CSS setup completed successfully!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
