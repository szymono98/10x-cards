# Plan Implementacji Usługi OpenRouter

## 1. Analiza Wymagań i Konfiguracja Projektu

### Dokumentacja API

- [ ] Analiza endpointów OpenRouter API
- [ ] Identyfikacja wymaganych headerów
- [ ] Przegląd schematów odpowiedzi
- [ ] Analiza limitów i ograniczeń API

### Konfiguracja Zależności

- [ ] Weryfikacja i konfiguracja:
  - [ ] Next.js 15
  - [ ] TypeScript 5
  - [ ] React 19
  - [ ] Tailwind 4
  - [ ] Shadcn/ui
- [ ] Konfiguracja zmiennych środowiskowych dla OpenRouter API

## 2. Implementacja Modułu Klienta API

### Struktura Modułu

```typescript
src/lib/openrouter/
  ├── types.ts       # Typy i interfejsy
  ├── config.ts      # Konfiguracja klienta
  ├── client.ts      # Główna klasa klienta
  └── errors.ts      # Obsługa błędów
```

### Kluczowe Funkcjonalności

1. Konfiguracja klienta:

   - Inicjalizacja z kluczem API
   - Ustawienia domyślnego modelu
   - Konfiguracja timeoutów

2. Metoda executeRequest():
   - Obsługa retry z exponential backoff
   - Zarządzanie timeoutami
   - Walidacja odpowiedzi

## 3. Warstwa Logiki Czatu

### Interfejs Publiczny

```typescript
interface ChatManager {
  sendMessage(content: string): Promise<Response>;
  updateSystemPrompt(prompt: string): void;
  setModelParams(params: ModelParams): void;
}
```

### Funkcjonalności

- Zarządzanie historią konwersacji
- Dynamiczna zmiana promptów systemowych
- Konfiguracja parametrów modelu w locie

## 4. Obsługa Odpowiedzi Strukturalnych

### Metoda buildRequestPayload

```typescript
interface RequestPayload {
  messages: Message[];
  model: string;
  response_format?: ResponseFormat;
  temperature?: number;
}
```

### Walidacja i Parsowanie

- Walidacja schematów JSON
- Parsowanie odpowiedzi strukturalnych
- Obsługa błędów formatowania

## 5. System Obsługi Błędów

### Typy Błędów

```typescript
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
}
```

### Mechanizm Logowania

- Logowanie błędów krytycznych
- Wykluczenie danych wrażliwych
- Rotacja logów

## 6. Przykład Implementacji

```typescript
const chatManager = new ChatManager({
  apiKey: process.env.OPENROUTER_API_KEY,
  model: 'gpt-3.5-turbo',
  systemPrompt: 'Jesteś pomocnym asystentem.',
});

try {
  const response = await chatManager.sendMessage('Podsumuj główne punkty.');
  console.log(response.content);
} catch (error) {
  if (error instanceof RateLimitError) {
    // Obsługa przekroczenia limitu
  }
}
```

## 7. Kolejne Kroki

1. Implementacja podstawowego klienta API
2. Dodanie mechanizmu retry i backoff
3. Implementacja zarządzania historią czatu
4. Wdrożenie obsługi błędów
5. Implementacja logowania
