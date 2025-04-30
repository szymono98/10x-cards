# Plan Testów dla Projektu "10x Cards"

## 1. Wprowadzenie i cele testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje strategię, zakres, metody i zasoby wymagane do przeprowadzenia testów aplikacji "10x Cards". Aplikacja jest narzędziem webowym zbudowanym w oparciu o Next.js, React, TypeScript, Supabase (BaaS) i OpenRouter (AI), służącym do generowania fiszek edukacyjnych na podstawie dostarczonego tekstu. Celem planu jest zapewnienie systematycznego podejścia do weryfikacji jakości oprogramowania na wszystkich etapach jego rozwoju.

### 1.2. Cele testowania

Główne cele procesu testowania to:

- Zapewnienie zgodności aplikacji z wymaganiami funkcjonalnymi i niefunkcjonalnymi.
- Weryfikacja poprawności działania kluczowych przepływów użytkownika (autentykacja, generowanie fiszek, zapisywanie fiszek).
- Identyfikacja i raportowanie defektów w oprogramowaniu.
- Ocena stabilności i niezawodności aplikacji, w tym integracji z usługami zewnętrznymi (Supabase, OpenRouter).
- Zapewnienie bezpieczeństwa danych użytkownika i ochrony dostępu do funkcji aplikacji.
- Weryfikacja intuicyjności i użyteczności interfejsu użytkownika.
- Minimalizacja ryzyka wystąpienia błędów na środowisku produkcyjnym.

## 2. Zakres testów

### 2.1. Funkcjonalności objęte testami

- **Moduł Autentykacji:**
  - Rejestracja nowego użytkownika (formularz, walidacja, wysyłka emaila potwierdzającego, obsługa błędów - np. istniejący email).
  - Logowanie użytkownika (formularz, walidacja, obsługa błędów - np. błędne dane, przekierowania).
  - Resetowanie hasła (formularz, walidacja, wysyłka emaila resetującego).
  - Wylogowywanie użytkownika.
  - Ochrona ścieżek (`/sets`, `/profile`) za pomocą middleware (`src/middleware.ts`) - przekierowania dla użytkowników niezalogowanych.
  - Logika przekierowań dla zalogowanych użytkowników (np. z `/auth/login` na `/generate`).
  - Obsługa flagi `registration` w metadata użytkownika podczas logowania (middleware).
- **Moduł Generowania Fiszek:**
  - Wprowadzanie tekstu źródłowego (walidacja długości 1000-10000 znaków w UI).
  - Inicjowanie procesu generowania (przycisk `Generuj fiszki`, stan ładowania).
  - Komunikacja z API `/api/generations` (walidacja backendowa, wywołanie `generationsService`).
  - Integracja z usługą AI (OpenRouter) przez `generationsService` (mockowana i częściowo rzeczywista).
  - Obsługa odpowiedzi z AI (parsowanie JSON, mapowanie na `FlashcardProposalDto`).
  - Wyświetlanie propozycji fiszek (`FlashcardList`, `FlashcardItem`).
  - Obsługa stanu pustego / braku propozycji (`EmptyState`).
  - Obsługa błędów generowania (błędy API AI, błędy sieci, błędy walidacji) i ich komunikacja (`ErrorNotification`).
  - Interakcje z propozycjami fiszek:
    - Akceptacja (`onAccept`).
    - Odrzucenie (`onReject`).
    - Edycja (przełączanie trybu edycji, zapis zmian `onEdit`, walidacja długości pól `front`/`back` w UI - max 200/500).
- **Moduł Zapisywania Fiszek:**
  - Zapisywanie zaakceptowanych fiszek (przycisk `Save accepted`, wywołanie `useSaveFlashcards`).
  - Zapisywanie wszystkich wygenerowanych fiszek (przycisk `Zapisz wszystkie`).
  - Komunikacja z API `/api/flashcards` (walidacja backendowa, wywołanie `flashcardsService`).
  - Zapis danych w bazie Supabase (`flashcardsService`).
  - Poprawność zapisywanych danych (struktura, wartości `source`, `generation_id`).
  - Obsługa stanu ładowania podczas zapisu (`BulkSaveButton`).
  - Obsługa sukcesu zapisu (`SuccessNotification`, czyszczenie stanu UI).
  - Obsługa błędów zapisu (błędy API, błędy bazy danych) i ich komunikacja (`ErrorNotification`).
- **API Backend (Next.js API Routes):**
  - Endpoint `POST /api/generations`: Walidacja requesta, obsługa błędów, poprawność odpowiedzi (struktura `GenerationCreateResponseDto`, status HTTP).
  - Endpoint `POST /api/flashcards`: Walidacja requesta (w tym tablicy fiszek), obsługa błędów, poprawność odpowiedzi (struktura zapisanych fiszek, status HTTP).
- **Interfejs Użytkownika (UI):**
  - Poprawność renderowania kluczowych komponentów (`FlashcardGenerationView`, formularze Auth, Header).
  - Działanie elementów UI (przyciski, pola tekstowe, powiadomienia, tooltipy, skeleton loaders).
  - Responsywność (jeśli dotyczy).
  - Spójność wizualna (ogólny wygląd i działanie zgodnie z biblioteką Shadcn UI i stylami Tailwind).
  - Obsługa stanów ładowania i błędów w UI.
- **Integracje:**
  - Integracja z Supabase Auth.
  - Integracja z Supabase Database.
  - Integracja z OpenRouter API.

### 2.2. Funkcjonalności wyłączone z testów (jeśli dotyczy)

- Szczegółowe testy wydajnościowe (chyba że zostaną zidentyfikowane wąskie gardła w trakcie testów funkcjonalnych).
- Testy użyteczności z udziałem końcowych użytkowników (zalecane jako oddzielna aktywność).
- Testy penetracyjne (zalecane jako oddzielna, specjalistyczna aktywność).
- Testowanie konfiguracji środowiska (zakładane jako część procesu DevOps).
- Szczegółowe testowanie działania samych bibliotek zewnętrznych (np. React, Next.js, Supabase SDK) - zakładamy ich poprawność, testujemy jedynie integrację i wykorzystanie w aplikacji.

## 3. Typy testów do przeprowadzenia

- **Testy jednostkowe (Unit Tests):**
  - **Cel:** Weryfikacja małych, izolowanych fragmentów kodu w celu zapewnienia ich poprawnego działania.
  - **Zakres:** Funkcje pomocnicze (`lib/utils.ts`), logika walidacji (`*.validation.ts`), serwisy (`*.service.ts` - z mockowanymi zależnościami np. Supabase Client, OpenRouter Service), hooki (`hooks/*` - z mockowanym `fetch` lub API clientami), komponenty UI (pojedyncze, w izolacji, np. `AuthInput`, `GenerateButton`, `ErrorNotification`).
  - **Narzędzia:** Jest/Vitest, React Testing Library (RTL), Supabase mock client, MSW (Mock Service Worker).
- **Testy integracyjne (Integration Tests):**
  - **Cel:** Weryfikacja współpracy i interfejsów między różnymi modułami/komponentami aplikacji.
  - **Zakres:**
    - Komponenty React z ich hookami i interakcjami (np. testowanie `FlashcardGenerationView` w połączeniu z `useGenerateFlashcards` i `useSaveFlashcards`, mockując jedynie zewnętrzne API `fetch`).
    - API Routes (testowanie endpointów przez symulowane żądania HTTP, weryfikacja odpowiedzi, interakcji z serwisami i mockowaną/testową bazą danych). Sprawdzenie walidacji, logiki biznesowej i odpowiedzi dla różnych scenariuszy.
    - Middleware (`src/middleware.ts`) - testowanie logiki przekierowań dla różnych ścieżek i stanów sesji użytkownika (zalogowany/niezalogowany, z/bez flagi `registration`).
    - Interakcje z mockowanymi usługami zewnętrznymi (Supabase, OpenRouter) na poziomie API lub serwisów w celu sprawdzenia poprawnej obsługi odpowiedzi i błędów.
  - **Narzędzia:** Jest/Vitest, RTL, Supertest (dla API routes, opcjonalnie), MSW, testowa instancja Supabase.
- **Testy End-to-End (E2E Tests):**
  - **Cel:** Symulacja rzeczywistych przepływów użytkownika w przeglądarce, weryfikacja działania całej aplikacji zintegrowanej z backendem i (w miarę możliwości) rzeczywistymi lub testowymi usługami zewnętrznymi.
  - **Zakres:** Kluczowe scenariusze użytkownika:
    1. Pełny proces rejestracji i logowania.
    2. Pełny proces generowania fiszek (wpisanie tekstu, generacja, edycja, akceptacja/odrzucenie).
    3. Pełny proces zapisywania fiszek (zapis zaakceptowanych, zapis wszystkich).
    4. Proces resetowania hasła.
    5. Dostęp do chronionych stron (pozytywny i negatywny).
    6. Proces wylogowania.
  - **Narzędzia:** Playwright lub Cypress.
  - **Uwaga:** Wymagają stabilnego środowiska testowego. Strategia dla zależności zewnętrznych (Supabase, OpenRouter) - użycie dedykowanych instancji/kluczy testowych lub zaawansowane mockowanie na poziomie sieci.
- **Testy wizualne (Visual Regression Tests - VRT):**
  - **Cel:** Wykrywanie niezamierzonych zmian w wyglądzie interfejsu użytkownika.
  - **Zakres:** Opcjonalnie, dla kluczowych stron (`/generate`, `/auth/login`, `/auth/register`) i krytycznych, reużywalnych komponentów UI.
  - **Narzędzia:** Chromatic (jeśli używany jest Storybook), Percy, Playwright/Cypress z pluginami do porównywania zrzutów ekranu.
- **Testy API (jako część testów integracyjnych/E2E):**
  - **Cel:** Bezpośrednia weryfikacja kontraktu (request/response) i działania endpointów API.
  - **Zakres:** Sprawdzanie poprawności żądań, odpowiedzi (statusy HTTP, struktura JSON zgodna z DTO), walidacji, obsługi błędów dla `POST /api/generations` i `POST /api/flashcards`. Testowanie przypadków brzegowych walidacji.
  - **Narzędzia:** Narzędzia do testów E2E (Playwright/Cypress intercepting requests), Postman/Insomnia (manualne eksploracyjne), Supertest (w testach integracyjnych backendu).
- **Testy bezpieczeństwa (podstawowe):**
  - **Cel:** Identyfikacja podstawowych, oczywistych luk bezpieczeństwa.
  - **Zakres:** Weryfikacja działania ochrony ścieżek przez middleware, próby dostępu do API bez autentykacji, weryfikacja czy wrażliwe dane nie są eksponowane po stronie klienta, przegląd konfiguracji Row Level Security (RLS) w Supabase (manualny).
  - **Narzędzia:** Testy E2E (symulacja użytkownika), narzędzia deweloperskie przeglądarki (inspekcja kodu, żądań sieciowych), manualna inspekcja.
- **Testy wydajnościowe (podstawowe/eksploracyjne):**
  - **Cel:** Wstępna ocena wydajności kluczowych operacji i identyfikacja potencjalnych wąskich gardeł.
  - **Zakres:** Subiektywna ocena czasu odpowiedzi interfejsu, pomiar czasu odpowiedzi API generowania (zależny od AI), czas zapisu dużej liczby fiszek, czas ładowania strony `/generate`.
  - **Narzędzia:** Narzędzia deweloperskie przeglądarki (zakładki Network, Performance), Google Lighthouse.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

_(Przykładowe scenariusze wysokiego poziomu. Szczegółowe przypadki testowe zostaną opracowane w systemie zarządzania testami lub dokumentacji.)_

**4.1. Autentykacja i Autoryzacja**

- **SCN-AUTH-001:** Użytkownik pomyślnie rejestruje się przy użyciu prawidłowego, unikalnego emaila i hasła spełniającego wymagania (min. 8 znaków). Otrzymuje informację o konieczności potwierdzenia emaila.
- **SCN-AUTH-002:** Próba rejestracji z już istniejącym adresem email skutkuje wyświetleniem odpowiedniego błędu.
- **SCN-AUTH-003:** Próba rejestracji z nieprawidłowym formatem emaila lub zbyt krótkim hasłem skutkuje błędem walidacji formularza po stronie klienta.
- **SCN-AUTH-004:** Użytkownik pomyślnie loguje się przy użyciu poprawnych danych (email, hasło) i jest przekierowywany na stronę `/generate`.
- **SCN-AUTH-005:** Próba logowania z błędnym hasłem lub nieistniejącym email skutkuje wyświetleniem komunikatu błędu.
- **SCN-AUTH-006:** Użytkownik pomyślnie inicjuje proces resetowania hasła dla istniejącego konta i otrzymuje informację o wysłaniu linku.
- **SCN-AUTH-007:** Niezalogowany użytkownik próbujący uzyskać dostęp do `/sets` lub `/profile` jest przekierowywany na stronę `/auth/login`.
- **SCN-AUTH-008:** Zalogowany użytkownik próbujący uzyskać dostęp do `/auth/login` jest przekierowywany na stronę `/generate` (chyba że trwa proces rejestracji - ten scenariusz wymaga doprecyzowania).
- **SCN-AUTH-009:** Zalogowany użytkownik może uzyskać dostęp do `/generate`.
- **SCN-AUTH-010:** Użytkownik klika przycisk "Wyloguj" i zostaje pomyślnie wylogowany (przekierowany na stronę główną/logowania, sesja usunięta).

**4.2. Generowanie Fiszek**

- **SCN-GEN-001:** Użytkownik wprowadza tekst źródłowy o długości między 1000 a 10000 znaków i klika "Generuj fiszki" - proces generowania rozpoczyna się (widoczny stan ładowania), a po zakończeniu wyświetlana jest lista propozycji fiszek.
- **SCN-GEN-002:** Przycisk "Generuj fiszki" jest nieaktywny, gdy tekst w `TextInputArea` jest krótszy niż 1000 znaków lub dłuższy niż 10000 znaków. Komunikat o liczbie znaków jest aktualizowany i ewentualnie wskazuje błąd.
- **SCN-GEN-003:** Aplikacja poprawnie wyświetla komponent `SkeletonLoader` podczas oczekiwania na odpowiedź z API generowania.
- **SCN-GEN-004:** W przypadku błędu podczas generowania (np. błąd 500 z API, timeout, błąd usługi AI), użytkownik widzi stosowny komunikat błędu (`ErrorNotification`).
- **SCN-GEN-005:** Użytkownik klika ikonę edycji na fiszce - pola `front` i `back` stają się edytowalnymi `Textarea`. Po zmianie treści i ponownym kliknięciu ikony edycji (lub dedykowanego przycisku zapisu edycji), zmiany są zapisywane w stanie komponentu, a flaga `edited` dla tej propozycji jest ustawiana na `true`.
- **SCN-GEN-006:** Użytkownik klika ikonę akceptacji (`Check`) - wizualne oznaczenie akceptacji pojawia się na fiszce (lub przycisk zmienia stan), a flaga `accepted` jest ustawiana na `true`. Ponowne kliknięcie cofa akceptację.
- **SCN-GEN-007:** Użytkownik klika ikonę odrzucenia (`X`) - dana propozycja fiszki jest usuwana z widoku (`FlashcardList`).
- **SCN-GEN-008:** Na stronie `/generate`, przed pierwszym generowaniem lub po udanym zapisie, gdy nie ma propozycji, wyświetlany jest komponent `EmptyState`.

**4.3. Zapisywanie Fiszek**

- **SCN-SAVE-001:** Użytkownik akceptuje kilka fiszek, klika "Save accepted" - proces zapisu rozpoczyna się (widoczny stan ładowania), a po pomyślnym zakończeniu zaakceptowane fiszki są zapisywane w bazie, lista propozycji jest czyszczona, pole tekstowe jest czyszczone, a użytkownik widzi komunikat sukcesu (`SuccessNotification`).
- **SCN-SAVE-002:** Użytkownik generuje fiszki, niekoniecznie akceptując wszystkie, klika "Zapisz wszystkie" - proces zapisu rozpoczyna się, a po pomyślnym zakończeniu wszystkie aktualnie wyświetlane propozycje są zapisywane w bazie, UI jest resetowane, a użytkownik widzi komunikat sukcesu.
- **SCN-SAVE-003:** Przycisk "Save accepted" jest nieaktywny, jeśli żadna fiszka na liście propozycji nie ma statusu `accepted: true`.
- **SCN-SAVE-004:** W przypadku błędu podczas zapisu (np. błąd API `/api/flashcards`, błąd bazy danych), użytkownik widzi stosowny komunikat błędu (`ErrorNotification`), a stan UI (propozycje fiszek) nie jest resetowany.
- **SCN-SAVE-005:** Weryfikacja w bazie danych (lub poprzez inne API, jeśli dostępne), że zapisane fiszki mają poprawnie ustawione pole `source` ("ai-full" dla nieedytowanych, "ai-edited" dla edytowanych) oraz prawidłowy `generation_id` powiązany z odpowiednim rekordem w tabeli `generations`.

## 5. Środowisko testowe

- **Środowisko lokalne (Development):**
  - Komputery deweloperów i testerów.
  - Uruchomiona lokalnie aplikacja Next.js (`npm run dev`).
  - Lokalna instancja Supabase (jeśli używane jest Supabase CLI) lub połączenie z dedykowanym projektem Supabase Dev.
  - Mockowanie usług zewnętrznych (OpenRouter) za pomocą MSW lub podobnych narzędzi.
  - Używane do: tworzenia i uruchamiania testów jednostkowych, integracyjnych, debugowania.
- **Środowisko testowe/stagingowe (Test/Staging):**
  - W pełni zintegrowane środowisko hostowane na platformie chmurowej (np. Vercel, AWS, inne).
  - Oddzielna, dedykowana instancja projektu Supabase (z własną bazą danych i konfiguracją autentykacji, potencjalnie z seedowanymi danymi testowymi).
  - Dostęp do OpenRouter API (dedykowany klucz API z niższymi limitami lub ograniczony dostęp do klucza produkcyjnego, ewentualnie zaawansowany mock na poziomie infrastruktury sieciowej).
  - Konfiguracja zmiennych środowiskowych specyficzna dla tego środowiska.
  - Używane do: testów integracyjnych, E2E, wizualnych, bezpieczeństwa (podstawowych), UAT (User Acceptance Testing).
- **Środowisko produkcyjne (Production):**
  - Środowisko dostępne dla użytkowników końcowych.
  - Używane do: testów typu "smoke tests" po wdrożeniu, monitorowania.

## 6. Narzędzia do testowania

- **Framework do testów jednostkowych/integracyjnych:** **Jest** lub **Vitest** (do wyboru przez zespół, Vitest może być łatwiejszy w konfiguracji z Vite-based projects, ale Jest jest bardziej standardowy).
- **Biblioteka do testowania komponentów React:** **React Testing Library (RTL)** (instalowana domyślnie z Create Next App, standard dla testowania komponentów React).
- **Framework do testów E2E:** **Playwright** (rekomendowany ze względu na szybkość, niezawodność i szerokie możliwości, w tym testowanie API i VRT) lub **Cypress** (alternatywa z bogatym ekosystemem).
- **Mockowanie żądań HTTP/usług:** **Mock Service Worker (MSW)** (zalecane do mockowania API na poziomie sieci w testach integracyjnych i E2E).
- **Mockowanie klienta Supabase:** Użycie bibliotek typu `supabase-mock` lub stworzenie własnych prostych mocków dla potrzeb testów jednostkowych/integracyjnych.
- **Narzędzia do testów API (manualne/eksploracyjne):** **Postman**, **Insomnia**.
- **Narzędzia do testów wizualnych (opcjonalnie):** **Playwright** (wbudowane możliwości porównywania zrzutów), **Chromatic** (jeśli planowane jest użycie Storybook), **Percy**.
- **System CI/CD:** **GitHub Actions** (lub inny zgodny z platformą repozytorium) do automatyzacji uruchamiania testów.
- **System zarządzania testami (opcjonalnie, w zależności od skali):** **TestRail**, **Zephyr Scale (Jira Plugin)**, **Xray (Jira Plugin)**, lub proste rozwiązania: **Arkusze Google**, **Pliki Markdown** w repozytorium.
- **System śledzenia błędów:** **Jira**, **GitHub Issues** (zależnie od preferencji zespołu).

## 7. Harmonogram testów

- **Sprint/Iteracja N:**
  - **Podczas rozwoju:** Deweloperzy piszą testy jednostkowe i integracyjne dla nowo tworzonych/modyfikowanych komponentów, hooków, serwisów, walidatorów. QA przygotowuje scenariusze E2E dla nowych funkcjonalności.
  - **Po zakończeniu rozwoju funkcjonalności:** QA wykonuje testy eksploracyjne, implementuje i uruchamia testy E2E dla nowych przepływów.
  - **Koniec sprintu/przed wydaniem:** Przeprowadzenie pełnego cyklu testów regresji (automatycznych i kluczowych manualnych). Testy na środowisku Staging. UAT (jeśli dotyczy).
- **Ciągła Integracja (CI):** Testy jednostkowe i integracyjne uruchamiane automatycznie przy każdym pushu do repozytorium. Testy E2E uruchamiane automatycznie przed merge do głównej gałęzi (np. `main` lub `develop`) lub nightly.
- **Po wdrożeniu na produkcję:** Wykonanie zestawu testów "smoke tests" w celu weryfikacji kluczowych funkcjonalności.
- _Szczegółowy harmonogram testów dla poszczególnych wydań zostanie dostosowany do ogólnego harmonogramu projektu._

## 8. Kryteria akceptacji testów

### 8.1. Kryteria wejścia (rozpoczęcia formalnych testów np. na Staging)

- Kod źródłowy został wdrożony na dedykowanym środowisku testowym (Staging).
- Środowisko testowe jest stabilne i skonfigurowane zgodnie z wymaganiami.
- Wszystkie zależności (Supabase, OpenRouter) są dostępne i działają poprawnie na środowisku testowym.
- Podstawowa dokumentacja funkcjonalności lub User Stories są dostępne dla testerów.
- Zakończono rozwój funkcjonalności przewidzianych do testowania w danym cyklu.
- Testy jednostkowe i integracyjne przechodzą pomyślnie w pipeline CI.

### 8.2. Kryteria wyjścia (zakończenia testów i rekomendacji do wdrożenia)

- Wszystkie zaplanowane scenariusze testowe (integracyjne, E2E, manualne) dla danej wersji zostały wykonane.
- Osiągnięto minimalny próg pokrycia kodu testami jednostkowymi i integracyjnymi (np. 80% dla logiki biznesowej w serwisach i walidatorach, 70% dla całości kodu objętego testami jednostkowymi/integracyjnymi).
- Wszystkie testy automatyczne (jednostkowe, integracyjne, E2E) przechodzą pomyślnie (100% pass rate dla krytycznych przepływów).
- Wszystkie zidentyfikowane błędy o priorytecie Krytycznym (Blocker) i Wysokim (Critical/High) zostały naprawione i pomyślnie zweryfikowane (re-tested).
- Liczba i waga pozostałych znanych błędów (Średnie, Niskie) jest znana i zaakceptowana przez Product Ownera/Managera.
- Wyniki testów zostały udokumentowane i zakomunikowane interesariuszom.
- Otrzymano formalną akceptację UAT (jeśli dotyczy).

## 9. Role i odpowiedzialności w procesie testowania

- **Inżynier QA:**
  - Odpowiedzialny za całokształt strategii i procesu testowania.
  - Tworzenie, utrzymanie i aktualizacja planu testów.
  - Projektowanie, implementacja i utrzymanie automatycznych testów E2E i integracyjnych API.
  - Wykonywanie testów manualnych (eksploracyjnych, scenariuszowych, regresji).
  - Konfiguracja i zarządzanie danymi testowymi oraz środowiskiem testowym (we współpracy z DevOps/Developerami).
  - Dokładne raportowanie, priorytetyzacja (wstępna) i śledzenie błędów.
  - Analiza wyników testów, raportowanie statusu jakości i ryzyka.
  - Współpraca z deweloperami i PO w celu zapewnienia jakości.
- **Deweloperzy:**
  - Odpowiedzialni za jakość kodu, który tworzą.
  - Tworzenie i utrzymanie testów jednostkowych i integracyjnych dla swojego kodu (komponenty, hooki, serwisy, utils).
  - Naprawianie błędów zgłoszonych przez QA lub wykrytych przez automatyczne testy.
  - Uczestnictwo w przeglądach kodu (code reviews) pod kątem jakości i testowalności.
  - Wsparcie QA w debugowaniu problemów i konfiguracji środowiska.
  - Zapewnienie, że kod jest łatwy do testowania.
- **Product Owner/Manager:**
  - Dostarczanie jasnych wymagań i kryteriów akceptacji.
  - Priorytetyzacja funkcjonalności i błędów.
  - Udział w definiowaniu scenariuszy testowych (szczególnie UAT).
  - Ostateczna akceptacja funkcjonalności i wyników testów (UAT).
  - Podejmowanie decyzji dotyczących akceptowalnego poziomu ryzyka (np. znanych błędów o niskim priorytecie).

## 10. Procedury raportowania błędów

- Wszystkie zidentyfikowane podczas testów defekty (błędy) będą raportowane w dedykowanym systemie śledzenia błędów (np. Jira, GitHub Issues).
- Każdy raport błędu powinien być unikalny i zawierać następujące informacje:
  - **ID:** Unikalny identyfikator błędu (nadawany przez system).
  - **Tytuł:** Zwięzły, jednoznaczny opis problemu.
  - **Opis:** Szczegółowy opis błędu, kontekst wystąpienia.
  - **Kroki do reprodukcji:** Numerowana lista kroków pozwalających na jednoznaczne odtworzenie błędu.
  - **Oczekiwany rezultat:** Jak system powinien się zachować.
  - **Rzeczywisty rezultat:** Jak system się zachował.
  - **Środowisko:** Wersja aplikacji, przeglądarka (z wersją), system operacyjny, środowisko testowe (np. Staging, Local).
  - **Priorytet/Waga (Severity/Priority):** Określenie wpływu błędu na system i pilności naprawy (np. Blocker, Critical, High, Medium, Low).
  - **Status:** Aktualny stan błędu w cyklu życia (np. New, Open, In Progress, Fixed, Reopened, Closed, Won't Fix).
  - **Przypisany do:** Osoba odpowiedzialna za naprawę (początkowo może być nieprzypisany).
  - **Zgłaszający:** Osoba, która wykryła i zgłosiła błąd.
  - **Załączniki:** Zrzuty ekranu, nagrania wideo, logi konsoli/sieciowe, dane testowe użyte do reprodukcji (jeśli relevantne i pomocne).
- Błędy będą weryfikowane pod kątem duplikatów przed formalnym zgłoszeniem.
- Priorytetyzacja błędów będzie odbywać się we współpracy QA, Deweloperów i PO.
- Naprawione błędy będą weryfikowane (re-tested) przez QA na tym samym środowisku, na którym zostały znalezione (lub nowszej wersji na tym środowisku).
- Status błędów będzie na bieżąco aktualizowany w systemie śledzenia. Regularne przeglądy statusu błędów będą częścią procesu (np. podczas spotkań zespołu).
