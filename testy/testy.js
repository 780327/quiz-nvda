// testy.js – proste testy logiki losowania. Uruchomienie w terminalu:
//   node testy/testy.js
// Wczytujemy pliki skroty.js, dane.js i losowanie.js tak, jak robi to
// przeglądarka, i sprawdzamy wynik na prawdziwych danych.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const folder = path.join(__dirname, '..');
const kontekst = vm.createContext({ Math: Math });
['dane/skroty.js', 'js/dane.js', 'js/losowanie.js'].forEach(function (plik) {
  vm.runInContext(fs.readFileSync(path.join(folder, plik), 'utf8'), kontekst);
});
const skroty = vm.runInContext('SKROTY', kontekst);

let udane = 0;
let nieudane = 0;

function sprawdz(opis, warunek) {
  if (warunek) {
    udane++;
  } else {
    nieudane++;
    console.log('BŁĄD: ' + opis);
  }
}

// Test 1: tasowanie nie gubi ani nie dubluje elementów i nie zmienia oryginału.
const liczby = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const potasowane = kontekst.tasuj(liczby);
sprawdz('tasowanie zachowuje te same elementy',
  potasowane.slice().sort(function (a, b) { return a - b; }).join() === liczby.join());
sprawdz('tasowanie nie zmienia oryginalnej tablicy', liczby.join() === '1,2,3,4,5,6,7,8,9,10');

// Test 2: tasowanie jest równomierne – każdy element trafia na pierwsze miejsce
// mniej więcej tak samo często (1000 razy na 3000 prób, z zapasem).
const licznik = { a: 0, b: 0, c: 0 };
for (let i = 0; i < 3000; i++) {
  licznik[kontekst.tasuj(['a', 'b', 'c'])[0]]++;
}
sprawdz('tasowanie jest równomierne: ' + JSON.stringify(licznik),
  Object.values(licznik).every(function (n) { return n > 850 && n < 1150; }));

// Test 3: wiele gier w każdej kategorii i obu układach.
const kategorie = ['Wszystkie'].concat(kontekst.pobierzKategorie(skroty));
const pozycjePoprawnych = [0, 0, 0];

kategorie.forEach(function (kategoria) {
  ['desktop', 'laptop'].forEach(function (uklad) {
    const pula = kontekst.filtrujSkroty(skroty, kategoria, uklad);
    for (let gra = 0; gra < 200; gra++) {
      const pytania = kontekst.przygotujGre(pula, uklad);
      sprawdz(kategoria + ': gra ma 10 pytań', pytania.length === 10);

      pytania.forEach(function (p) {
        const bez = new Set(p.odpowiedzi);
        sprawdz('pytanie ma 3 odpowiedzi: ' + p.tresc, p.odpowiedzi.length === 3);
        sprawdz('odpowiedzi się nie powtarzają: ' + p.tresc, bez.size === 3);
        sprawdz('poprawna odpowiedź jest na liście: ' + p.tresc, p.poprawna >= 0 && p.poprawna <= 2);
        pozycjePoprawnych[p.poprawna]++;

        // Błędne odpowiedzi muszą pochodzić z tej samej kategorii co pytanie.
        const zKategorii = skroty
          .filter(function (w) { return w.kategoria === p.kategoria; })
          .map(function (w) { return [w.akcja, kontekst.skrotDlaUkladu(w, uklad)]; })
          .flat();
        sprawdz('odpowiedzi są z tej samej kategorii: ' + p.tresc,
          p.odpowiedzi.every(function (o) { return zKategorii.includes(o); }));
      });
    }
  });
});

// Test 4: poprawna odpowiedź trafia na każde z 3 miejsc mniej więcej po równo.
const razem = pozycjePoprawnych.reduce(function (a, b) { return a + b; }, 0);
sprawdz('poprawna odpowiedź na losowym miejscu: ' + pozycjePoprawnych.join(', '),
  pozycjePoprawnych.every(function (n) { return Math.abs(n / razem - 1 / 3) < 0.02; }));

// Test 5: wpisy do sprawdzenia są pomijane.
const zDoSprawdzenia = skroty.slice(0, 5).map(function (w, i) {
  return Object.assign({}, w, { do_sprawdzenia: i === 0 });
});
const pytaniaTestowe = kontekst.przygotujGre(zDoSprawdzenia, 'desktop');
sprawdz('pomija wpisy do_sprawdzenia', pytaniaTestowe.every(function (p) {
  return !p.odpowiedzi.includes(zDoSprawdzenia[0].akcja) &&
    !p.odpowiedzi.includes(zDoSprawdzenia[0].skrot);
}));

console.log('Testy udane: ' + udane + ', nieudane: ' + nieudane + '.');
process.exitCode = nieudane === 0 ? 0 : 1;
