// quiz.js – zakładka Quiz: pokazywanie pytań, odpowiedzi i punktacja.
// Samo losowanie jest w losowanie.js.

const quizKategoria = document.getElementById('quiz-kategoria');
const ekranStart = document.getElementById('quiz-start');
const ekranPytanie = document.getElementById('quiz-pytanie');
const ekranKoniec = document.getElementById('quiz-koniec');
const trescPytania = document.getElementById('quiz-tresc');
const poleOdpowiedzi = document.getElementById('quiz-odpowiedzi');
const przyciskNastepne = document.getElementById('quiz-nastepne');
const naglowekKoniec = document.getElementById('quiz-koniec-naglowek');
const poleWyniku = document.getElementById('quiz-wynik');
const komunikat = document.getElementById('quiz-komunikat');

let quizSkroty = [];
let pytania = [];
let numerPytania = 0;
let punkty = 0;
let czyOdpowiedziano = false;

// Pokazuje jeden z trzech ekranów quizu, a pozostałe ukrywa.
function pokazEkran(ekran) {
  [ekranStart, ekranPytanie, ekranKoniec].forEach(function (e) {
    e.hidden = e !== ekran;
  });
}

function rozpocznijGre() {
  const uklad = wybranyUklad('quiz-uklad');
  const pula = filtrujSkroty(quizSkroty, quizKategoria.value, uklad);
  pytania = przygotujGre(pula, uklad);

  if (pytania.length === 0) {
    komunikat.textContent = 'W tej kategorii jest za mało skrótów, żeby zagrać. Wybierz inną.';
    return;
  }

  numerPytania = 0;
  punkty = 0;
  pokazPytanie();
}

function pokazPytanie() {
  const pytanie = pytania[numerPytania];
  czyOdpowiedziano = false;
  komunikat.textContent = '';
  pokazEkran(ekranPytanie);

  trescPytania.textContent = 'Pytanie ' + (numerPytania + 1) + ' z ' + pytania.length +
    ': ' + pytanie.tresc;

  // Tworzymy 3 zwykłe przyciski <button> z numerami 1, 2, 3.
  poleOdpowiedzi.textContent = '';
  pytanie.odpowiedzi.forEach(function (tekst, numer) {
    const przycisk = document.createElement('button');
    przycisk.type = 'button';
    przycisk.textContent = (numer + 1) + '. ' + tekst;
    przycisk.addEventListener('click', function () {
      wybierzOdpowiedz(numer);
    });
    poleOdpowiedzi.appendChild(przycisk);
  });

  przyciskNastepne.hidden = true;
  const czyOstatnie = numerPytania === pytania.length - 1;
  przyciskNastepne.textContent = czyOstatnie ? 'Zobacz wynik' : 'Następne pytanie';

  // Fokus na treść pytania – NVDA od razu ją przeczyta.
  trescPytania.focus();
}

function wybierzOdpowiedz(numer) {
  // Po odpowiedzi kolejne kliknięcia nic nie zmieniają.
  if (czyOdpowiedziano) {
    return;
  }
  czyOdpowiedziano = true;

  const pytanie = pytania[numerPytania];
  const przyciski = poleOdpowiedzi.querySelectorAll('button');

  // aria-disabled zamiast disabled: przycisk nie traci fokusu,
  // a NVDA mówi, że jest niedostępny.
  przyciski.forEach(function (przycisk, i) {
    przycisk.setAttribute('aria-disabled', 'true');
    if (i === pytanie.poprawna) {
      przycisk.classList.add('poprawna');
    } else if (i === numer) {
      przycisk.classList.add('bledna');
    }
  });

  if (numer === pytanie.poprawna) {
    punkty++;
    dzwiekPoprawna();
    komunikat.textContent = 'Dobrze!';
  } else {
    dzwiekBledna();
    komunikat.textContent = 'Źle, poprawna odpowiedź to: ' + pytanie.odpowiedzi[pytanie.poprawna] + '.';
  }

  przyciskNastepne.hidden = false;
}

function nastepnePytanie() {
  numerPytania++;
  if (numerPytania < pytania.length) {
    pokazPytanie();
  } else {
    pokazWynik();
  }
}

function pokazWynik() {
  pokazEkran(ekranKoniec);
  // Wynik jest w nagłówku, na który przenosimy fokus – NVDA przeczyta go
  // od razu i tylko raz. Gdybyśmy dodatkowo wstawili go do regionu
  // aria-live, NVDA przeczytałby wynik dwa razy.
  komunikat.textContent = '';
  naglowekKoniec.textContent = 'Koniec gry. Twój wynik: ' + punkty + ' z ' + pytania.length + '.';
  poleWyniku.textContent = ocena(punkty, pytania.length);
  dzwiekKoniec();
  naglowekKoniec.focus();
}

// Krótki komentarz do wyniku.
function ocena(punkty, wszystkie) {
  const procent = punkty / wszystkie;
  if (procent === 1) {
    return 'Wszystko dobrze. Brawo!';
  }
  if (procent >= 0.7) {
    return 'Bardzo dobrze. Jeszcze trochę i będzie komplet.';
  }
  if (procent >= 0.4) {
    return 'Nieźle. Zajrzyj do zakładki Lekcja i spróbuj jeszcze raz.';
  }
  return 'Warto powtórzyć skróty w zakładce Lekcja i zagrać jeszcze raz.';
}

// Klawisze 1, 2 i 3 wybierają odpowiedź, ale tylko gdy fokus jest w obszarze
// pytania. W NVDA działają w trybie formularza (w trybie przeglądania NVDA
// używa cyfr do skakania po nagłówkach).
ekranPytanie.addEventListener('keydown', function (zdarzenie) {
  if (zdarzenie.ctrlKey || zdarzenie.altKey || zdarzenie.metaKey) {
    return;
  }
  const numer = ['1', '2', '3'].indexOf(zdarzenie.key);
  if (numer !== -1 && !czyOdpowiedziano) {
    zdarzenie.preventDefault();
    wybierzOdpowiedz(numer);
  }
});

document.getElementById('quiz-rozpocznij').addEventListener('click', rozpocznijGre);
document.getElementById('quiz-jeszcze-raz').addEventListener('click', rozpocznijGre);
document.getElementById('quiz-ustawienia').addEventListener('click', function () {
  komunikat.textContent = '';
  pokazEkran(ekranStart);
  quizKategoria.focus();
});
przyciskNastepne.addEventListener('click', nastepnePytanie);

// Start: wczytaj dane i wypełnij listę kategorii.
wczytajSkroty()
  .then(function (skroty) {
    quizSkroty = skroty;
    wypelnijListeKategorii(quizKategoria, pobierzKategorie(skroty));
  })
  .catch(function (blad) {
    komunikat.textContent = blad.message;
  });
