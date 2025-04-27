# Specyfikacja modułu autentykacji

Niniejszy dokument opisuje architekturę funkcjonalności rejestracji, logowania, wylogowywania oraz odzyskiwania hasła użytkowników, zgodnie z wymaganiami z dokumentu PRD oraz wykorzystanym stosem technologicznym (Next.js 15, React 19, TypeScript 5, Tailwind 4, Supabase, Openrouter.ai).

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Struktura stron i komponentów

- **Nowe strony:**

  - `/login` – formularz logowania, weryfikacja danych wejściowych (email, hasło) oraz wyświetlanie komunikatów błędów.
  - `/register` – formularz rejestracji, walidacja pól (email, hasło, potwierdzenie hasła) oraz informacja o pomyślnej rejestracji.
  - `/reset-password` – formularz odzyskiwania hasła, gdzie użytkownik wprowadza email, by otrzymać link do resetu hasła.

- **Komponenty wspólne i layouty:**
  - **Header:** W trybie zalogowanym wyświetla przyciski: „Wyloguj”, dostęp do profilu, zestawów; w trybie niezalogowanym – przyciski „Zaloguj” i „Zarejestruj”.
  - **Formularze:** Oddzielne komponenty dla rejestracji, logowania i odzyskiwania hasła, wykorzystujące React Hook Form (lub podobną bibliotekę) dla łatwej walidacji i obsługi stanu formy.

### Zarządzanie stanem i nawigacja

- **Session Management:**
  - Integracja z Supabase Auth przy użyciu odpowiednich hooków (np. `useSession`) lub kontekstu React, aby kontrolować aktualny stan użytkownika.
  - Warunkowe renderowanie elementów UI w zależności od statusu autentykacji.
- **Walidacja i komunikaty błędów:**
  - Walidacja po stronie klienta (np. sprawdzanie formatu email, minimalnej długości hasła).
  - Informowanie użytkownika o błędach np. nieprawidłowe dane logowania, hasła niezgodne, brak wypełnionych pól.
  - Obsługa błędów po stronie serwera z wyświetleniem user-friendly komunikatów.

### Scenariusze użytkowania

- Użytkownik anonimowy może generować fiszki "ad-hoc", ale przy próbie zapisu zestawów zostaje poproszony o logowanie/rejestrację.
- Podczas rejestracji następuje walidacja danych, a po pozytywnym wyniku następuje automatyczne logowanie lub przekierowanie do strony logowania.
- Użytkownik może odzyskać hasło poprzez formularz, który wysyła zapytanie do backendu, a następnie otrzymuje e-mail z linkiem do resetu hasła.

---

## 2. LOGIKA BACKENDOWA

### Endpointy API i modele danych

- **Endpointy API (Next.js route handlers):**

  - POST `/api/register` – rejestracja nowego użytkownika.
  - POST `/api/login` – logowanie użytkownika.
  - POST `/api/logout` – wylogowywanie użytkownika.
  - POST `/api/reset-password` – inicjacja procesu odzyskiwania hasła.
  - POST `/api/delete-account` – usunięcie konta użytkownika wraz z powiązanymi danymi (fiszki) na jego żądanie.

- **Modele danych:**
  - Użytkownik: minimalny model zawierający email, hash hasła (przechowywany przez Supabase), identyfikator oraz inne metadane niezbędne do zarządzania sesją.

### Walidacja i obsługa wyjątków

- **Walidacja danych wejściowych:**
  - Każdy endpoint weryfikuje poprawność otrzymanych danych (np. format email, spójność hasła i potwierdzenia hasła) przy użyciu np. bibliotek Joi czy Zod.
- **Obsługa wyjątków:**
  - W przypadku błędów walidacji lub problemów przy komunikacji z Supabase, endpointy zwracają odpowiednie statusy HTTP (400, 500) oraz komunikaty błędów.
  - Wszystkie wyjątkowe sytuacje są logowane, aby umożliwić diagnostykę.

### Renderowanie stron server-side

- Wybrane strony (np. dashboard użytkownika) będą renderowane na serwerze przy użyciu mechanizmów Next.js, z uwzględnieniem sesji użytkownika pobieranej z Supabase.

---

## 3. SYSTEM AUTENTYKACJI

### Wykorzystanie Supabase Auth

- **Integracja:**
  - Wykorzystanie Supabase Auth jako głównego modułu zarządzania użytkownikami, w tym rejestracji, logowania, wylogowywania i odzyskiwania hasła.
- **Mechanizmy:**
  - Użycie metod Supabase do obsługi sesji, przechowywania tokenów i zarządzania stanem użytkownika.
  - Po stronie klienta, aktualizacja stanu sesji przy użyciu hooków lub kontekstu React, umożliwiając dostęp do danych sesji w całej aplikacji.
- **Bezpieczeństwo:**
  - Dane użytkowników (w tym hasła) są przechowywane w formie zaszyfrowanej przez Supabase.
  - Mechanizmy resetu hasła opierają się na wysyłce linków do edycji hasła na zarejestrowany adres email użytkownika.
  - Sesja użytkownika wygasa po okresie nieaktywności (domyślnie 24 godziny), po czym wymagane jest ponowne logowanie.

### Podział uprawnień i dostępów

- Użytkownicy niezalogowani mają ograniczony dostęp – mogą korzystać tylko z generowania fiszek "ad-hoc".
- Funkcjonalności zarządzania zestawami oraz zapisu fiszek są dostępne wyłącznie dla zalogowanych użytkowników.
- Dodatkowo, zgodnie z wymaganiami, użytkownik ma możliwość usunięcia swojego konta wraz z powiązanymi danymi.

---

## Kluczowe wnioski

- Frontend zostanie rozszerzony o dedykowane strony logowania, rejestracji i odzyskiwania hasła, z odpowiednią walidacją i komunikatami błędów.
- Backend (endpointy API) odpowiada za weryfikację, autoryzację oraz obsługę wyjątków, integrując się bezpośrednio z Supabase Auth.
- Bezpieczeństwo danych użytkowników jest zapewnione przez mechanizmy szyfrowania i zarządzanie sesjami w Supabase.
- Nowy system autentykacji współpracuje z istniejącą architekturą aplikacji, nie zakłócając funkcji generowania fiszek, jednocześnie wprowadzając kontrolę dostępu do funkcji zapisu zestawów.

Dokument stanowi podstawę do implementacji modułu autentykacji w aplikacji, gwarantując zgodność z wymaganiami bezpieczeństwa oraz dedykowaną obsługę procesów rejestracji, logowania i odzyskiwania hasła.
