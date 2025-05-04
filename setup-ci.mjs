// setup-ci.js
// Ten skrypt zapewnia, że wszystkie niezbędne zależności są zainstalowane poprawnie w CI
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Konfiguracja środowiska CI dla 10x-cards...');

// Upewnij się, że tailwindcss jest zainstalowany poprawnie
console.log('📦 Instaluję wymagane zależności...');
try {
  execSync('npm install -D tailwindcss@3.3.3 postcss@8.4.27 autoprefixer@10.4.14', {
    stdio: 'inherit',
  });
  console.log('✅ Zależności zainstalowane pomyślnie');
} catch (error) {
  console.error('❌ Błąd instalacji zależności:', error);
  process.exit(1);
}

// Sprawdź konfigurację PostCSS
console.log('🔍 Weryfikuję konfigurację PostCSS...');
const postcssConfig = `
const config = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
  },
};

export default config;
`;

try {
  fs.writeFileSync('./postcss.config.mjs', postcssConfig);
  console.log('✅ Konfiguracja PostCSS zaktualizowana');
} catch (error) {
  console.error('❌ Błąd aktualizacji konfiguracji PostCSS:', error);
  process.exit(1);
}

// Sprawdź czy moduły są dostępne - używamy bardziej niezawodnego podejścia
console.log('🔍 Sprawdzam czy moduły są dostępne...');
try {
  // Sprawdzamy czy pliki modułów istnieją w katalogu node_modules
  const nodeModulesPath = path.join(__dirname, 'node_modules');

  // Sprawdzanie tailwindcss
  const tailwindPath = path.join(nodeModulesPath, 'tailwindcss');
  if (fs.existsSync(tailwindPath)) {
    console.log('✅ Moduł tailwindcss znaleziony w:', tailwindPath);
  } else {
    throw new Error('Moduł tailwindcss nie został znaleziony');
  }

  // Sprawdzanie postcss
  const postcssPath = path.join(nodeModulesPath, 'postcss');
  if (fs.existsSync(postcssPath)) {
    console.log('✅ Moduł postcss znaleziony w:', postcssPath);
  } else {
    throw new Error('Moduł postcss nie został znaleziony');
  }

  // Sprawdzanie autoprefixer
  const autoprefixerPath = path.join(nodeModulesPath, 'autoprefixer');
  if (fs.existsSync(autoprefixerPath)) {
    console.log('✅ Moduł autoprefixer znaleziony w:', autoprefixerPath);
  } else {
    throw new Error('Moduł autoprefixer nie został znaleziony');
  }

  // Alternatywna metoda weryfikacji - sprawdź wersję zainstalowanych pakietów
  console.log('📋 Sprawdzam wersje zainstalowanych pakietów:');
  execSync('npm list tailwindcss postcss autoprefixer', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Błąd podczas sprawdzania modułów:', error);
  process.exit(1);
}

console.log('✅ Konfiguracja CI zakończona pomyślnie');
