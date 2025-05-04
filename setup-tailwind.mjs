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
    // Check tailwind.config.ts
    await fs.access(path.join(__dirname, 'tailwind.config.ts'));
    console.log('✅ tailwind.config.ts exists');

    // Check postcss.config.mjs
    await fs.access(path.join(__dirname, 'postcss.config.mjs'));
    console.log('✅ postcss.config.mjs exists');

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
    await runCommand('npm', [
      'install',
      '-D',
      'tailwindcss@3.3.3',
      'postcss@8.4.27',
      'autoprefixer@10.4.14',
    ]);
    console.log('✅ Tailwind CSS dependencies installed');
    return true;
  } catch (error) {
    console.error('❌ Error installing dependencies:', error);
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

    // Try to run tailwindcss CLI
    await runCommand('npx', [
      'tailwindcss',
      '-i',
      tempInputCss,
      '-o',
      tempOutputCss,
      '--config',
      path.join(__dirname, 'tailwind.config.ts'),
    ]);

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
