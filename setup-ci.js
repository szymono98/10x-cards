// setup-ci.js
// Ten skrypt zapewnia, że wszystkie niezbędne zależności są zainstalowane poprawnie w CI
import * as fs from 'fs';
import { execSync } from 'child_process';

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

// Sprawdź czy moduły są dostępne
console.log('🔍 Sprawdzam czy moduły są dostępne...');
try {
  const tailwindPath = require.resolve('tailwindcss');
  console.log('✅ Moduł tailwindcss znaleziony w:', tailwindPath);

  const postcssPath = require.resolve('postcss');
  console.log('✅ Moduł postcss znaleziony w:', postcssPath);

  const autoprefixerPath = require.resolve('autoprefixer');
  console.log('✅ Moduł autoprefixer znaleziony w:', autoprefixerPath);
} catch (error) {
  console.error('❌ Błąd podczas sprawdzania modułów:', error);
  process.exit(1);
}

console.log('✅ Konfiguracja CI zakończona pomyślnie');
