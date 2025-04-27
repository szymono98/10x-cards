flowchart TD
subgraph UI
A[Strona logowania (/login)]
B[Strona rejestracji (/register)]
C[Strona resetowania hasła (/reset-password)]
D[Header: przyciski logowania/rejestracji/wylogowania]
end

    subgraph Client [Client-side]
      E[Formularze: React Hook Form]
      F[Stan sesji: useSession / Kontekst Auth]
    end

    subgraph API [API Endpointy]
      G[/api/register]
      H[/api/login]
      I[/api/logout]
      J[/api/reset-password]
      K[/api/delete-account]
    end

    subgraph Supabase [Supabase Auth]
      L[Zarządzanie użytkownikami]
      M[Przechowywanie zaszyfrowanych haseł]
      N[Tokeny i sesje]
    end

    %% Flow: Rejestracja
    B --> E
    E --> G
    G --> L
    L --> M
    L --> N
    N --> G

    %% Flow: Logowanie
    A --> E
    E --> H
    H --> L
    L --> N
    N --> H

    %% Flow: Resetowanie hasła
    C --> E
    E --> J
    J --> L
    L --> J

    %% Flow: Wylogowywanie & usunięcie konta
    D --> E
    E --> I
    I --> L

    D --> E
    E --> K
    K --> L

    %% Uaktualnienie stanu sesji
    L --> F
    F --> D

    %% Integracja z generowaniem fiszek
    F -- "Dostęp do zapisanych fiszek" --> subgraph App [Aplikacja 10x-cards]
          O[Generowanie fiszek "ad-hoc"]
          P[Zapis i zarządzanie zestawami (tylko dla zalogowanych)]
       end

    F --> P
