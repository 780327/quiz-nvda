// losowanie.js – logika losowania quizu.
// Te funkcje nie dotykają strony (HTML), dlatego łatwo je przetestować
// w testy/testy.js.

const ILE_ODPOWIEDZI = 3;
const ILE_PYTAN = 10;

// Tasowanie algorytmem Fishera–Yatesa.
// Idziemy od końca tablicy i każdy element zamieniamy z losowym elementem
// przed nim (albo z nim samym). Każda kolejność jest tak samo prawdopodobna.
// Zwracamy nową tablicę, a oryginał zostaje bez zmian.
function tasuj(tablica) {
  const wynik = tablica.slice();
  for (let i = wynik.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const schowek = wynik[i];
    wynik[i] = wynik[j];
    wynik[j] = schowek;
  }
  return wynik;
}

// Zwraca tekst odpowiedzi dla wpisu: akcję albo skrót (zależnie od typu pytania).
function tekstOdpowiedzi(wpis, typ, uklad) {
  return typ === 'co-robi' ? wpis.akcja : skrotDlaUkladu(wpis, uklad);
}

// Losuje błędne odpowiedzi z innych skrótów z tej samej kategorii.
// Pilnujemy, żeby błędna odpowiedź nie była taka sama jak poprawna
// i żeby błędne odpowiedzi się nie powtarzały.
function losujBledne(wpis, pula, typ, uklad) {
  const poprawna = tekstOdpowiedzi(wpis, typ, uklad);
  const kandydaci = [];

  pula.forEach(function (inny) {
    if (inny.kategoria !== wpis.kategoria || inny.id === wpis.id) {
      return;
    }
    const tekst = tekstOdpowiedzi(inny, typ, uklad);
    if (tekst !== poprawna && !kandydaci.includes(tekst)) {
      kandydaci.push(tekst);
    }
  });

  return tasuj(kandydaci).slice(0, ILE_ODPOWIEDZI - 1);
}

// Zmienia pierwszą literę na małą: "Otwiera menu" -> "otwiera menu".
function malaLitera(tekst) {
  return tekst.charAt(0).toLowerCase() + tekst.slice(1);
}

// Buduje jedno pytanie. typ to "co-robi" albo "ktory-skrot".
// Zwraca obiekt: { tresc, odpowiedzi: [3 teksty], poprawna: numer od 0 do 2 }.
function zbudujPytanie(wpis, pula, uklad, typ) {
  const tresc = typ === 'co-robi'
    ? 'Co robi skrót ' + skrotDlaUkladu(wpis, uklad) + '?'
    : 'Który skrót ' + malaLitera(wpis.akcja) + '?';

  const poprawnyTekst = tekstOdpowiedzi(wpis, typ, uklad);
  // Tasowanie odpowiedzi sprawia, że poprawna trafia na losowe miejsce.
  const odpowiedzi = tasuj([poprawnyTekst].concat(losujBledne(wpis, pula, typ, uklad)));

  return {
    tresc: tresc,
    odpowiedzi: odpowiedzi,
    poprawna: odpowiedzi.indexOf(poprawnyTekst),
    kategoria: wpis.kategoria
  };
}

// Przygotowuje całą grę: listę pytań w losowej kolejności.
// pula to skróty już przefiltrowane po kategorii i układzie.
function przygotujGre(pula, uklad) {
  // Pomijamy wpisy do sprawdzenia.
  const pewne = pula.filter(function (wpis) { return !wpis.do_sprawdzenia; });
  const pytania = [];

  tasuj(pewne).forEach(function (wpis) {
    if (pytania.length >= ILE_PYTAN) {
      return;
    }
    // Typ pytania losujemy jak rzut monetą.
    const typ = Math.random() < 0.5 ? 'co-robi' : 'ktory-skrot';
    const pytanie = zbudujPytanie(wpis, pewne, uklad, typ);
    // Pytanie ma sens tylko wtedy, gdy są wszystkie 3 odpowiedzi.
    if (pytanie.odpowiedzi.length === ILE_ODPOWIEDZI) {
      pytania.push(pytanie);
    }
  });

  return pytania;
}
