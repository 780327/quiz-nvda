// dane.js – wczytywanie i filtrowanie skrótów z pliku dane/skroty.json.
// Uwaga: fetch() nie działa po otwarciu pliku bezpośrednio (file://),
// dlatego lokalnie uruchamiamy prosty serwer: python -m http.server

const WSZYSTKIE = 'Wszystkie';

// Wczytuje plik JSON raz i zapamiętuje wynik (obietnicę), żeby lekcja
// i quiz nie pobierały tego samego pliku dwa razy.
let obietnicaDanych = null;

function wczytajSkroty() {
  if (obietnicaDanych === null) {
    obietnicaDanych = fetch('dane/skroty.json').then(function (odpowiedz) {
      if (!odpowiedz.ok) {
        throw new Error('Nie udało się wczytać pliku ze skrótami.');
      }
      return odpowiedz.json();
    });
  }
  return obietnicaDanych;
}

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
