#!/bin/bash

# Skrypt migracji z @supabase/auth-helpers-nextjs do @supabase/ssr
# Autor: GitHub Copilot
# Data: $(date)

set -e

echo "🚀 Rozpoczynam migrację Supabase do najnowszej wersji..."

# Krok 1: Backup
echo "📦 Tworzę backup package.json..."
cp package.json package.json.backup

# Krok 2: Aktualizacja pakietów
echo "🔄 Aktualizuję pakiety Supabase..."

# Usuń przestarzały pakiet
echo "❌ Usuwam przestarzały @supabase/auth-helpers-nextjs..."
npm uninstall @supabase/auth-helpers-nextjs

# Zaktualizuj istniejące pakiety
echo "⬆️  Aktualizuję @supabase/ssr i @supabase/supabase-js..."
npm install @supabase/ssr@latest @supabase/supabase-js@latest

# Krok 3: Sprawdź aktualne wersje
echo "📋 Sprawdzam zainstalowane wersje:"
npm list | grep supabase

echo ""
echo "✅ Pakiety zostały zaktualizowane!"
echo ""
echo "🔧 NASTĘPNE KROKI (wymagają ręcznej zmiany):"
echo ""
echo "1. Zmień importy w następujących plikach:"
echo "   - src/lib/providers/supabase-provider.tsx"
echo "   - src/middleware.ts"
echo "   - src/app/auth/register/page.tsx"
echo "   - src/app/auth/reset-password/page.tsx"
echo "   - src/lib/supabase/context.tsx"
echo "   - src/hooks/useGetFlashcards.ts"
echo "   - src/components/generate/FlashcardGenerationView.tsx"
echo ""
echo "2. Zamień:"
echo "   import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';"
echo "   NA:"
echo "   import { createBrowserClient } from '@supabase/ssr';"
echo ""
echo "3. Zamień:"
echo "   import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';"
echo "   NA:"
echo "   import { createServerClient } from '@supabase/ssr';"
echo ""
echo "4. Sprawdź plik SUPABASE_MIGRATION.md dla szczegółowych instrukcji"
echo ""
echo "⚠️  UWAGA: Po zmianie importów, przetestuj aplikację!"

# Krok 4: Sprawdź czy są inne przestarzałe pakiety
echo ""
echo "🔍 Sprawdzam inne przestarzałe pakiety..."
npm outdated

echo ""
echo "📚 Więcej informacji: ./SUPABASE_MIGRATION.md"
echo "🔄 Jeśli chcesz przywrócić poprzedni stan: mv package.json.backup package.json && npm install"
