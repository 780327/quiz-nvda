// zakladki.js – obsługa zakładek według wzorca WAI-ARIA Tabs.
// Klawisze: strzałka w lewo/prawo – poprzednia/następna zakładka,
// Home/End – pierwsza/ostatnia zakładka. Enter i Spacja działają same,
// bo zakładki to zwykłe przyciski <button>.

const zakladki = Array.from(document.querySelectorAll('[role="tab"]'));

// Włącza wybraną zakładkę i pokazuje jej panel, resztę ukrywa.
function wlaczZakladke(wybrana, ustawFokus) {
  zakladki.forEach(function (zakladka) {
    const czyWybrana = zakladka === wybrana;
    const panel = document.getElementById(zakladka.getAttribute('aria-controls'));

    zakladka.setAttribute('aria-selected', czyWybrana ? 'true' : 'false');
    // Tylko wybrana zakładka jest w kolejności klawisza Tab.
    zakladka.tabIndex = czyWybrana ? 0 : -1;
    panel.hidden = !czyWybrana;
  });

  if (ustawFokus) {
    wybrana.focus();
  }
}

zakladki.forEach(function (zakladka, numer) {
  zakladka.addEventListener('click', function () {
    wlaczZakladke(zakladka, false);
  });

  zakladka.addEventListener('keydown', function (zdarzenie) {
    let nowyNumer = null;

    if (zdarzenie.key === 'ArrowRight') {
      // % (reszta z dzielenia) sprawia, że z ostatniej wracamy na pierwszą.
      nowyNumer = (numer + 1) % zakladki.length;
    } else if (zdarzenie.key === 'ArrowLeft') {
      nowyNumer = (numer - 1 + zakladki.length) % zakladki.length;
    } else if (zdarzenie.key === 'Home') {
      nowyNumer = 0;
    } else if (zdarzenie.key === 'End') {
      nowyNumer = zakladki.length - 1;
    }

    if (nowyNumer !== null) {
      // Blokujemy domyślne działanie klawisza (np. przewijanie strony).
      zdarzenie.preventDefault();
      wlaczZakladke(zakladki[nowyNumer], true);
    }
  });
});
