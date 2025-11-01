pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';

let words = [];
let currentIndex = 0;
let isPlaying = false;
let intervalId = null;

// ORP - Optimal Recognition Point
function getORPIndex(word) {
    const len = word.length;
    if (len <= 2) return 0;  // 1-2 znaki: pierwszy znak
    if (len <= 5) return 1;  // 3-5 znaków: drugi znak
    if (len <= 9) return 2;  // 6-9 znaków: trzeci znak
    if (len <= 13) return 3; // 10-13 znaków: czwarty znak
    return 4;                 // 14+ znaków: piąty znak
}

function renderWord(word) {
    if (!word) return '';
    const orpIndex = getORPIndex(word);
    const before = word.substring(0, orpIndex);
    const highlight = word[orpIndex];
    const after = word.substring(orpIndex + 1);
    return `<span class="word-before">${before}</span><span class="word-highlight">${highlight}</span><span class="word-after">${after}</span>`;
}

function displayWord(index) {
    const display = document.getElementById('wordDisplay');
    if (index >= 0 && index < words.length) {
        display.innerHTML = renderWord(words[index]);
        const progress = ((index + 1) / words.length) * 100;
        document.getElementById('progress').style.width = progress + '%';
        document.getElementById('status').textContent = `Słowo ${index + 1} z ${words.length}`;
        highlightCurrentWord();
        highlightPreviewWord();
    }
}

function togglePlay() {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

function play() {
    if (words.length === 0) return;
    if (currentIndex >= words.length) currentIndex = 0;

    isPlaying = true;
    document.getElementById('playBtn').textContent = '⏸';

    const wpm = parseInt(document.getElementById('speed').value);
    const interval = 60000 / wpm;

    intervalId = setInterval(() => {
        displayWord(currentIndex);
        currentIndex++;
        if (currentIndex >= words.length) {
            pause();
            document.getElementById('status').textContent = 'Koniec tekstu';
        }
    }, interval);
}

function pause() {
    isPlaying = false;
    document.getElementById('playBtn').textContent = '▶';
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function restart() {
    pause();
    currentIndex = 0;
    if (words.length > 0) {
        displayWord(0);
    }
}

function prevWord() {
    if (currentIndex > 0) {
        currentIndex--;
        displayWord(currentIndex);
    }
}

function nextWord() {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        displayWord(currentIndex);
    }
}

function updateSpeed() {
    const value = document.getElementById('speed').value;
    document.getElementById('speedValue').textContent = value;
    if (isPlaying) {
        pause();
        play();
    }
}

function updateFontSize() {
    const value = document.getElementById('fontSize').value;
    document.getElementById('fontSizeValue').textContent = value;
    document.getElementById('wordDisplay').style.fontSize = value + 'px';
}

function updateHighlightColor() {
    const color = document.getElementById('highlightColor').value;
    document.querySelector('.word-container').style.setProperty('--highlight-color', color);
}

function enableControls() {
    document.getElementById('playBtn').disabled = false;
    document.getElementById('restartBtn').disabled = false;
    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('rewindBtn').disabled = false;
    document.getElementById('togglePicker').disabled = false;
    document.getElementById('togglePreview').disabled = false;
}

// Rewind 15 seconds
function rewind15s() {
    const wpm = parseInt(document.getElementById('speed').value);
    const wordsToRewind = Math.floor(wpm / 4); // 15 seconds worth of words
    currentIndex = Math.max(0, currentIndex - wordsToRewind);
    displayWord(currentIndex);
    document.getElementById('status').textContent = `Cofnięto ${wordsToRewind} słów`;
}

// Text preview
let previewVisible = false;

function togglePreview() {
    previewVisible = !previewVisible;
    const preview = document.getElementById('textPreview');
    const btn = document.getElementById('togglePreview');

    if (previewVisible) {
        preview.classList.add('visible');
        btn.textContent = 'Ukryj podgląd';
        updateTextPreview();
    } else {
        preview.classList.remove('visible');
        btn.textContent = 'Podgląd tekstu';
    }
}

function updateTextPreview() {
    const preview = document.getElementById('textPreview');
    if (!preview || !previewVisible) return;

    preview.innerHTML = '';

    // Show words around current position
    const contextSize = 100; // words before and after
    const start = Math.max(0, currentIndex - contextSize);
    const end = Math.min(words.length, currentIndex + contextSize);

    for (let i = start; i < end; i++) {
        const span = document.createElement('span');
        span.textContent = words[i];
        span.dataset.index = i;

        if (i === currentIndex) {
            span.classList.add('current-word');
        } else if (i < currentIndex) {
            span.classList.add('past-word');
        }

        span.onclick = () => {
            currentIndex = parseInt(span.dataset.index);
            displayWord(currentIndex);
            document.getElementById('status').textContent = `Przeskoczono do: "${words[currentIndex]}" (${currentIndex + 1}/${words.length})`;
        };

        preview.appendChild(span);
        preview.appendChild(document.createTextNode(' '));
    }

    // Scroll to current word
    const currentSpan = preview.querySelector('.current-word');
    if (currentSpan) {
        currentSpan.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
}

function highlightPreviewWord() {
    const preview = document.getElementById('textPreview');
    if (!preview || !previewVisible) return;

    const spans = preview.querySelectorAll('span');
    spans.forEach(span => {
        const idx = parseInt(span.dataset.index);
        span.classList.remove('current-word', 'past-word');
        if (idx === currentIndex) {
            span.classList.add('current-word');
            span.scrollIntoView({ block: 'center', behavior: 'smooth' });
        } else if (idx < currentIndex) {
            span.classList.add('past-word');
        }
    });
}

// Word picker
let pickerVisible = false;

function togglePicker() {
    pickerVisible = !pickerVisible;
    const picker = document.getElementById('wordPicker');
    const search = document.getElementById('wordSearch');
    const btn = document.getElementById('togglePicker');

    if (pickerVisible) {
        picker.classList.add('visible');
        search.style.display = 'block';
        btn.textContent = 'Ukryj wybór';
        updateWordPicker();
    } else {
        picker.classList.remove('visible');
        search.style.display = 'none';
        btn.textContent = 'Wybierz miejsce startu';
    }
}

function updateWordPicker(filter = '') {
    const picker = document.getElementById('wordPicker');
    picker.innerHTML = '';

    const filterLower = filter.toLowerCase().trim();
    const searchWords = filterLower.split(/\s+/).filter(w => w.length > 0);
    let count = 0;
    const maxShow = 200;

    // Multi-word search: find sequences
    if (searchWords.length > 1) {
        for (let i = 0; i <= words.length - searchWords.length && count < maxShow; i++) {
            let match = true;
            for (let j = 0; j < searchWords.length; j++) {
                if (!words[i + j].toLowerCase().includes(searchWords[j])) {
                    match = false;
                    break;
                }
            }
            if (match) {
                // Show the phrase as a single clickable item
                const phrase = words.slice(i, i + searchWords.length).join(' ');
                const span = document.createElement('span');
                span.textContent = `[${i + 1}] ${phrase}`;
                span.dataset.index = i;
                span.style.background = '#1a3a5c';
                if (i === currentIndex) span.classList.add('current');

                span.onclick = () => {
                    currentIndex = parseInt(span.dataset.index);
                    displayWord(currentIndex);
                    highlightCurrentWord();
                    document.getElementById('status').textContent = `Start od: "${words[currentIndex]}" (${currentIndex + 1}/${words.length})`;
                };

                picker.appendChild(span);
                count++;
            }
        }
    } else {
        // Single word search
        for (let i = 0; i < words.length && count < maxShow; i++) {
            if (filterLower && !words[i].toLowerCase().includes(filterLower)) continue;

            const span = document.createElement('span');
            span.textContent = words[i];
            span.dataset.index = i;
            if (i === currentIndex) span.classList.add('current');

            span.onclick = () => {
                currentIndex = parseInt(span.dataset.index);
                displayWord(currentIndex);
                highlightCurrentWord();
                document.getElementById('status').textContent = `Start od: "${words[currentIndex]}" (${currentIndex + 1}/${words.length})`;
            };

            picker.appendChild(span);
            count++;
        }
    }

    if (count === 0) {
        const empty = document.createElement('span');
        empty.textContent = searchWords.length > 1 ? 'Nie znaleziono frazy' : 'Nie znaleziono';
        empty.className = 'more-indicator';
        picker.appendChild(empty);
    } else if (words.length > maxShow && !filter) {
        const more = document.createElement('span');
        more.textContent = `... +${words.length - maxShow} więcej (użyj wyszukiwania)`;
        more.className = 'more-indicator';
        picker.appendChild(more);
    } else if (searchWords.length > 1) {
        const info = document.createElement('span');
        info.textContent = `Znaleziono ${count} wystąpień frazy`;
        info.className = 'more-indicator';
        picker.insertBefore(info, picker.firstChild);
    }
}

function highlightCurrentWord() {
    const picker = document.getElementById('wordPicker');
    if (!picker) return;
    const spans = picker.querySelectorAll('span[data-index]');
    spans.forEach(s => {
        s.classList.toggle('current', parseInt(s.dataset.index) === currentIndex);
    });
}

async function extractTextFromPdf(pdfData) {
    document.getElementById('status').textContent = 'Wczytywanie PDF...';

    try {
        const pdf = await pdfjsLib.getDocument(pdfData).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + ' ';
            document.getElementById('status').textContent = `Wczytywanie strony ${i}/${pdf.numPages}...`;
        }

        // Remove emojis
        const noEmoji = fullText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FAFF}]/gu, '');

        words = noEmoji.split(/\s+/)
            .map(w => {
                // Keep hyphenated words together, just remove the hyphens
                let cleaned = w.replace(/[\-—–]/g, '');
                // Remove other punctuation
                cleaned = cleaned.replace(/[.,;:!?„""''()\[\]{}<>\/\\•·°©®™§¶†‡]/g, '');
                return cleaned;
            })
            .filter(w => w.length > 0 && !/^[\d]+$/.test(w));
        currentIndex = 0;

        if (words.length > 0) {
            displayWord(0);
            enableControls();
            document.getElementById('status').textContent = `Gotowe! ${words.length} słów`;
        } else {
            document.getElementById('status').textContent = 'Nie znaleziono tekstu w PDF';
        }
    } catch (error) {
        console.error(error);
        document.getElementById('status').textContent = 'Błąd wczytywania PDF: ' + error.message;
    }
}

async function loadFromUrl() {
    const url = document.getElementById('pdfUrl').value.trim();
    if (!url) {
        document.getElementById('status').textContent = 'Podaj URL do PDF';
        return;
    }

    pause();
    document.getElementById('status').textContent = 'Pobieranie PDF...';

    try {
        // Try direct fetch first, then proxy
        let response;
        let arrayBuffer;

        try {
            response = await fetch(url);
            if (response.ok) {
                arrayBuffer = await response.arrayBuffer();
            } else {
                throw new Error('Direct fetch failed');
            }
        } catch (e) {
            // Use CORS proxy
            document.getElementById('status').textContent = 'Używam proxy...';
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);
            response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            arrayBuffer = await response.arrayBuffer();
        }

        // Check if it looks like PDF
        const firstBytes = new Uint8Array(arrayBuffer.slice(0, 5));
        const header = String.fromCharCode(...firstBytes);
        if (!header.startsWith('%PDF')) {
            throw new Error('Plik nie jest prawidłowym PDF');
        }

        document.getElementById('status').textContent = 'Przetwarzanie PDF...';
        await extractTextFromPdf({ data: arrayBuffer });
    } catch (error) {
        console.error('PDF Load Error:', error);
        document.getElementById('status').textContent = 'Błąd: ' + error.message;
    }
}

async function loadFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    pause();
    const arrayBuffer = await file.arrayBuffer();
    await extractTextFromPdf({ data: arrayBuffer });
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('loadUrlBtn').addEventListener('click', loadFromUrl);
    document.getElementById('fileInput').addEventListener('change', loadFromFile);
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('restartBtn').addEventListener('click', restart);
    document.getElementById('prevBtn').addEventListener('click', prevWord);
    document.getElementById('nextBtn').addEventListener('click', nextWord);
    document.getElementById('rewindBtn').addEventListener('click', rewind15s);
    document.getElementById('speed').addEventListener('input', updateSpeed);
    document.getElementById('fontSize').addEventListener('input', updateFontSize);
    document.getElementById('highlightColor').addEventListener('input', updateHighlightColor);
    document.getElementById('togglePicker').addEventListener('click', togglePicker);
    document.getElementById('togglePreview').addEventListener('click', togglePreview);
    document.getElementById('wordSearch').addEventListener('input', (e) => {
        updateWordPicker(e.target.value);
    });

    // Check URL parameters first (from background.js for PDF pages)
    const urlParams = new URLSearchParams(window.location.search);
    const pdfParam = urlParams.get('pdf');

    if (pdfParam) {
        document.getElementById('pdfUrl').value = pdfParam;
        loadFromUrl();
        return;
    }

    // Auto-detect PDF from current tab
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            const url = tab.url;
            if (url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf')) {
                document.getElementById('pdfUrl').value = url;
                loadFromUrl(); // Auto-load PDF
            }
        }
    } catch (e) {
        console.log('Could not get tab URL:', e);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Don't capture keys when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    } else if (e.code === 'ArrowLeft') {
        prevWord();
    } else if (e.code === 'ArrowRight') {
        nextWord();
    } else if (e.code === 'KeyR') {
        restart();
    }
});
