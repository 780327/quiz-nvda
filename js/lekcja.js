// lekcja.js – zakładka Lekcja: lista skrótów z wyjaśnieniami.
// Budowa listy:
//   <h3> nazwa kategorii
//     <h4> skrót – akcja   (każdy skrót to nagłówek, więc w NVDA skaczesz klawiszem H)
//     <p>  wyjaśnienie

const lekcjaKategoria = document.getElementById('lekcja-kategoria');
const lekcjaLista = document.getElementById('lekcja-lista');
let lekcjaSkroty = [];

// Rysuje listę skrótów dla wybranej kategorii i układu.
function pokazLekcje() {
  const uklad = wybranyUklad('lekcja-uklad');
  const wybrane = filtrujSkroty(lekcjaSkroty, lekcjaKategoria.value, uklad)
    .filter(function (wpis) { return !wpis.do_sprawdzenia; });

  // Czyścimy poprzednią listę.
  lekcjaLista.textContent = '';

  pobierzKategorie(wybrane).forEach(function (kategoria) {
    const naglowekKategorii = document.createElement('h3');
    naglowekKategorii.textContent = kategoria;
    lekcjaLista.appendChild(naglowekKategorii);

    wybrane
      .filter(function (wpis) { return wpis.kategoria === kategoria; })
      .forEach(function (wpis) {
        const blok = document.createElement('div');
        blok.className = 'skrot';

        // Nagłówek: "NVDA+F7 – Otwiera listę elementów".
        // textContent zamiast innerHTML – bezpieczniej i prościej.
        const naglowek = document.createElement('h4');
        const klawisze = document.createElement('kbd');
        klawisze.textContent = skrotDlaUkladu(wpis, uklad);
        naglowek.appendChild(klawisze);
        naglowek.appendChild(document.createTextNode(' – ' + wpis.akcja));

        const opis = document.createElement('p');
        opis.textContent = wpis.wyjasnienie;

        blok.appendChild(naglowek);
        blok.appendChild(opis);
        lekcjaLista.appendChild(blok);
      });
  });
}

// Start: wczytaj dane, wypełnij listę kategorii i pokaż lekcję.
wczytajSkroty()
  .then(function (skroty) {
    lekcjaSkroty = skroty;
    wypelnijListeKategorii(lekcjaKategoria, pobierzKategorie(skroty));
    pokazLekcje();
  })
  .catch(function (blad) {
    lekcjaLista.textContent = blad.message +
      ' Jeśli otwierasz plik bezpośrednio z dysku, uruchom serwer: python -m http.server';
  });

// Lista odświeża się od razu po zmianie kategorii lub układu.
lekcjaKategoria.addEventListener('change', pokazLekcje);
document.querySelectorAll('input[name="lekcja-uklad"]').forEach(function (przycisk) {
  przycisk.addEventListener('change', pokazLekcje);
});
