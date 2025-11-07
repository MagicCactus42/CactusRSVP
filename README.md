# 🌵 CactusRSVP

Czytnik RSVP (Rapid Serial Visual Presentation) z podświetleniem ORP (Optimal Recognition Point).

## Funkcje

- 📄 Wczytywanie PDF z URL lub pliku
- 🌐 Automatyczne scrapowanie tekstu ze stron HTML
- 📍 Wybór miejsca startu (lista słów lub kliknięcie na stronie)
- 👀 Podgląd tekstu w stylu Spotify/YT Music
- ⏪ Cofanie o 15 sekund
- ⚡ Regulacja prędkości (100-800 WPM)
- 🎨 Personalizacja (rozmiar tekstu, kolor podświetlenia)

## Instalacja

1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/TWOJ_USERNAME/rapid.git
   ```

2. Otwórz Chrome i wejdź w `chrome://extensions/`

3. Włącz **Developer mode** (prawy górny róg)

4. Kliknij **Load unpacked**

5. Wybierz folder `rapid`

6. Gotowe! Kliknij ikonę 🌵 na pasku rozszerzeń

## Użycie

### Na stronie HTML:
1. Otwórz dowolną stronę
2. Kliknij ikonę wtyczki
3. Tekst zostanie automatycznie wyekstrahowany
4. Naciśnij Start lub Spację

### Na PDF:
1. Otwórz plik PDF w przeglądarce
2. Kliknij ikonę wtyczki
3. PDF zostanie automatycznie wczytany

### Skróty klawiszowe:
- `Spacja` - Start/Pauza
- `←` / `→` - Poprzednie/Następne słowo
- `R` - Od nowa
- `ESC` - Zamknij

## Technologie

- Vanilla JavaScript
- PDF.js (parsowanie PDF)
- Chrome Extension Manifest V3
