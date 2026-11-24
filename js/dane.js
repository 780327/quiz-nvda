// dane.js – filtrowanie skrótów.
// Same skróty są w pliku dane/skroty.js w stałej SKROTY.
// Ten plik jest wczytany w index.html przed dane.js.

const WSZYSTKIE = 'Wszystkie';

// Zwraca listę nazw kategorii bez powtórzeń, w kolejności z pliku.
function pobierzKategorie(skroty) {
  const kategorie = [];
  skroty.forEach(function (wpis) {
    if (!kategorie.includes(wpis.kategoria)) {
      kategorie.push(wpis.kategoria);
    }
  });
  return kategorie;
}

// Zwraca skróty z danej kategorii (lub wszystkie), które pasują do układu.
// uklad to "desktop" albo "laptop".
function filtrujSkroty(skroty, kategoria, uklad) {
  return skroty.filter(function (wpis) {
    const pasujeKategoria = kategoria === WSZYSTKIE || wpis.kategoria === kategoria;
    const pasujeUklad = wpis.uklad === 'oba' || wpis.uklad === uklad;
    return pasujeKategoria && pasujeUklad;
  });
}

// Zwraca skrót do pokazania w wybranym układzie.
// Na laptopie bierzemy skrot_laptop, jeśli istnieje, a w przeciwnym razie zwykły skrót.
function skrotDlaUkladu(wpis, uklad) {
  if (uklad === 'laptop' && wpis.skrot_laptop) {
    return wpis.skrot_laptop;
  }
  return wpis.skrot;
}

// Wypełnia listę rozwijaną <select> kategoriami, z opcją "Wszystkie" na początku.
function wypelnijListeKategorii(select, kategorie) {
  [WSZYSTKIE].concat(kategorie).forEach(function (nazwa) {
    const opcja = document.createElement('option');
    opcja.value = nazwa;
    opcja.textContent = nazwa;
    select.appendChild(opcja);
  });
}

// Odczytuje, który przycisk opcji (radio) o danej nazwie jest zaznaczony.
function wybranyUklad(nazwaGrupy) {
  return document.querySelector('input[name="' + nazwaGrupy + '"]:checked').value;
}
