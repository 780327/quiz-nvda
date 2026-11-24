# Skróty NVDA – Lekcje i Quiz

## O projekcie
Aplikacja w przeglądarce do nauki skrótów klawiszowych NVDA i Windows.
Jest przeznaczona przede wszystkim dla osób niewidomych korzystających z czytnika ekranu NVDA.
Projekt powstaje na potrzeby serii na kanale YouTube „Janusz Parzyszek cyfrowo”,
więc kod ma być prosty, czytelny i łatwy do wytłumaczenia na nagraniu.

Autor (Janusz) sam korzysta z NVDA i uczy się programowania.
Testuje każdą zmianę czytnikiem ekranu, więc dostępność jest ważniejsza od wyglądu.

## Zasady współpracy
- Odpowiadaj i pisz komentarze w kodzie **po polsku**.
- Zanim zaczniesz większą zmianę, przedstaw krótki plan i poczekaj na akceptację.
- Rób małe kroki: jedna funkcja na raz, potem test i commit w Git.
- Wyjaśniaj, co robisz i dlaczego. To projekt edukacyjny, a Janusz się na nim uczy.
- Nie dodawaj frameworków ani bibliotek bez pytania.
- Nigdy nie wymyślaj skrótów klawiszowych. Każdy skrót musi pochodzić z oficjalnego
  podręcznika NVDA (Podręcznik użytkownika NVDA) lub dokumentacji Microsoft.
  Jeśli nie masz pewności, oznacz wpis polem `"do_sprawdzenia": true`.

## Technologia
- Czysty HTML, CSS i JavaScript, bez frameworków i bez etapu budowania.
- Ma działać po otwarciu `index.html` i na GitHub Pages.
- Dane wczytujemy z pliku `dane/skroty.json` przez `fetch()`.
  Uwaga: `fetch()` nie działa przy otwieraniu pliku bezpośrednio (file://),
  więc lokalnie używamy prostego serwera, np. `python -m http.server`.

## Struktura plików
```
index.html          – szkielet strony, dwie zakładki
css/style.css       – wygląd (ciemny motyw, duży kontrast)
js/dane.js          – wczytywanie i filtrowanie skrótów
js/lekcja.js        – zakładka Lekcja
js/quiz.js          – zakładka Quiz (losowanie, punktacja)
js/dzwieki.js       – efekty dźwiękowe
dane/skroty.json    – wszystkie skróty (jedno źródło danych)
dzwieki/            – pliki audio (poprawna, błędna, koniec gry)
```

## Format danych – `dane/skroty.json`
Lekcja i quiz korzystają z tego samego pliku. Każdy skrót to jeden obiekt:
```json
{
  "id": "nvda-lista-elementow",
  "kategoria": "NVDA – ogólne",
  "uklad": "oba",
  "skrot": "NVDA+F7",
  "skrot_laptop": null,
  "akcja": "Otwiera listę elementów",
  "wyjasnienie": "Dłuższy opis do lekcji: kiedy i po co używać tego skrótu.",
  "do_sprawdzenia": false
}
```
- `kategoria`: np. „NVDA – ogólne”, „NVDA – Word”, „NVDA – Excel”, „NVDA – przeglądarka”, „Windows”.
- `uklad`: `"desktop"`, `"laptop"` lub `"oba"`.
- `skrot_laptop`: osobny skrót dla układu laptopowego NVDA, jeśli różni się od desktopowego.

## Zakładka 1 – Lekcja
- Wybór kategorii i przełącznik układu: Desktop / Laptop.
- Lista skrótów: skrót, akcja i wyjaśnienie.
- Nawigacja nagłówkami, żeby w NVDA dało się skakać klawiszem H.

## Zakładka 2 – Quiz
- Gracz wybiera kategorię (lub „Wszystkie”) i układ klawiatury.
- Każde pytanie ma **3 odpowiedzi**, z których jedna jest poprawna.
- **Losowanie przy każdej grze:**
  - kolejność pytań jest tasowana algorytmem Fishera–Yatesa,
  - pozycja poprawnej odpowiedzi jest losowa,
  - błędne odpowiedzi są losowane z innych skrótów **z tej samej kategorii**.
- Dwa typy pytań, losowane:
  - „Co robi skrót NVDA+F7?” (odpowiedzi to akcje),
  - „Jak otworzyć listę elementów?” (odpowiedzi to skróty).
- Po odpowiedzi: dźwięk, komunikat „Dobrze!” albo „Źle, poprawna odpowiedź to…”,
  a potem przycisk „Następne pytanie”.
- Na końcu wynik, np. „8 z 10”, i przycisk „Zagraj jeszcze raz”.
- Pomijamy wpisy z `"do_sprawdzenia": true`.

## Dostępność (najważniejsze wymagania)
- Zakładki zgodne z wzorcem WAI-ARIA Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`,
  `aria-selected`, przełączanie strzałkami.
- Odpowiedzi to zwykłe `<button>`, nie `<div>`.
- Komunikaty (wynik odpowiedzi, punktacja) w regionie `aria-live="polite"`,
  żeby NVDA odczytał je automatycznie.
- Po przejściu do nowego pytania fokus trafia na treść pytania (nagłówek z `tabindex="-1"`).
- Pełna obsługa klawiaturą, logiczna kolejność Tab, widoczny fokus.
- Dodatkowo skróty w quizie: klawisze 1, 2 i 3 wybierają odpowiedź.
  Nie mogą kolidować z trybem przeglądania NVDA, więc działają tylko wtedy,
  gdy fokus jest w obszarze quizu.
- Dźwięki są dodatkiem: każda informacja z dźwięku musi być też podana tekstem.
- Przycisk do wyciszenia dźwięków.
- `lang="pl"` w `<html>`, żeby NVDA czytał polskim głosem.

## Plan pracy (kolejne odcinki)
1. Szkielet: `index.html`, dwie dostępne zakładki, Git.
2. `skroty.json` z 20–30 skrótami: NVDA ogólne i Windows.
3. Zakładka Lekcja.
4. Zakładka Quiz z losowaniem.
5. Dźwięki i ekran wyniku.
6. Kolejne kategorie: Word, Excel, przeglądarka, układ laptopowy.
7. Publikacja na GitHub Pages.

## Testowanie
- Każdą funkcję sprawdza Janusz z NVDA w Chrome lub Firefox.
- Logikę losowania (tasowanie, dobór błędnych odpowiedzi bez duplikatów
  i bez poprawnej odpowiedzi) warto pokryć prostymi testami.
