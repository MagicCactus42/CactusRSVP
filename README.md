# 🌵 CactusRSVP

RSVP (Rapid Serial Visual Presentation) reader with ORP (Optimal Recognition Point) highlighting.

## Features

- 📄 Load PDF from URL or file
- 🌐 Automatic text scraping from HTML pages
- 📍 Select start position (word list or click on page)
- 👀 Text preview in Spotify/YT Music style
- ⏪ Rewind 15 seconds
- ⚡ Speed adjustment (100-800 WPM)
- 🎨 Customization (text size, highlight color)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MagicCactus42/CactusRSVP.git
   ```

2. Open chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (top right corner)

4. Click **Load unpacked**

5. Select the `CactusRSVP` folder

6. Done! Click the cactus icon in the extensions toolbar

## Usage

### On an HTML page:
1. Open any website
2. Click the extension icon
3. Text will be extracted automatically
4. Press Start or Spacebar

### On a PDF:
1. Open a PDF file in the browser
2. Click the extension icon
3. The PDF will be loaded automatically

### Keyboard Shortcuts:
- `Space` - Start/Pause
- `←` / `→` - Previous/Next word
- `R` - Restart
- `ESC` - Close

## Technologies

- Vanilla JavaScript
- PDF.js (PDF parsing)
- Chrome Extension Manifest V3
