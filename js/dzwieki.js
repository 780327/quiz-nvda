// dzwieki.js – efekty dźwiękowe i przycisk wyciszania.
// Dźwięki tworzymy w przeglądarce przez Web Audio API (krótkie tony),
// więc nie potrzebujemy żadnych plików audio.
// Dźwięk to tylko dodatek: każda informacja jest też podana tekstem.

const przyciskWycisz = document.getElementById('przycisk-wycisz');
let wyciszone = false;
let kontekstAudio = null;

// Zapamiętujemy wyciszenie w przeglądarce. try/catch, bo w niektórych
// trybach (np. prywatnym) dostęp do localStorage może się nie udać.
try {
  wyciszone = localStorage.getItem('wyciszone') === 'tak';
} catch (blad) {
  wyciszone = false;
}

function pokazStanWyciszenia() {
  // aria-pressed="true" – NVDA powie "przełącznik wciśnięty".
  przyciskWycisz.setAttribute('aria-pressed', wyciszone ? 'true' : 'false');
}

przyciskWycisz.addEventListener('click', function () {
  wyciszone = !wyciszone;
  pokazStanWyciszenia();
  try {
    localStorage.setItem('wyciszone', wyciszone ? 'tak' : 'nie');
  } catch (blad) {
    // Nic nie robimy – wyciszenie zadziała do zamknięcia strony.
  }
});

pokazStanWyciszenia();

// Gra listę nut. Każda nuta: [częstotliwość w Hz, początek w s, długość w s].
function zagrajNuty(nuty, rodzajFali) {
  if (wyciszone) {
    return;
  }
  // Kontekst audio tworzymy dopiero po pierwszym kliknięciu,
  // bo przeglądarki nie pozwalają grać dźwięków bez działania użytkownika.
  if (kontekstAudio === null) {
    kontekstAudio = new AudioContext();
  }
  const teraz = kontekstAudio.currentTime;

  nuty.forEach(function (nuta) {
    const generator = kontekstAudio.createOscillator();
    const glosnosc = kontekstAudio.createGain();
    const start = teraz + nuta[1];
    const koniec = start + nuta[2];

    generator.type = rodzajFali;
    generator.frequency.value = nuta[0];
    // Łagodne wyciszanie na końcu nuty, żeby nie było trzasków.
    glosnosc.gain.setValueAtTime(0.2, start);
    glosnosc.gain.exponentialRampToValueAtTime(0.001, koniec);

    generator.connect(glosnosc);
    glosnosc.connect(kontekstAudio.destination);
    generator.start(start);
    generator.stop(koniec);
  });
}

// Poprawna odpowiedź: dwa wesołe, rosnące tony.
function dzwiekPoprawna() {
  zagrajNuty([[660, 0, 0.15], [880, 0.12, 0.25]], 'sine');
}

// Błędna odpowiedź: dwa niskie, opadające tony.
function dzwiekBledna() {
  zagrajNuty([[300, 0, 0.2], [200, 0.18, 0.35]], 'square');
}

// Koniec gry: krótka melodia z czterech nut.
function dzwiekKoniec() {
  zagrajNuty([[523, 0, 0.18], [659, 0.15, 0.18], [784, 0.3, 0.18], [1047, 0.45, 0.4]], 'triangle');
}
