(function() {
    // Prevent multiple injections
    if (document.getElementById('rsvp-modal-overlay')) {
        document.getElementById('rsvp-modal-overlay').remove();
        return;
    }

    // State
    let words = [];
    let currentIndex = 0;
    let isPlaying = false;
    let intervalId = null;

    // Create modal HTML
    const overlay = document.createElement('div');
    overlay.id = 'rsvp-modal-overlay';
    overlay.innerHTML = `
        <style>
            #rsvp-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #rsvp-modal {
                background: #1a1a2e;
                border-radius: 16px;
                padding: 30px;
                width: 90%;
                max-width: 700px;
                color: #eee;
                box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            }
            #rsvp-modal * {
                box-sizing: border-box;
            }
            .rsvp-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            .rsvp-header h1 {
                margin: 0;
                font-size: 1.5rem;
                color: #fff;
            }
            .rsvp-close {
                background: none;
                border: none;
                color: #666;
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            .rsvp-close:hover {
                color: #e94560;
            }
            .rsvp-status {
                text-align: center;
                color: #666;
                font-size: 0.9rem;
                margin-bottom: 10px;
            }
            .rsvp-progress {
                width: 100%;
                height: 4px;
                background: #333;
                border-radius: 2px;
                margin-bottom: 20px;
                overflow: hidden;
            }
            .rsvp-progress-fill {
                height: 100%;
                background: #e94560;
                width: 0%;
                transition: width 0.1s;
            }
            .rsvp-display {
                background: #16213e;
                border-radius: 12px;
                padding: 60px 20px;
                margin-bottom: 20px;
                min-height: 180px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .rsvp-orp-marker {
                position: absolute;
                left: 50%;
                top: 20px;
                bottom: 20px;
                width: 2px;
                background: linear-gradient(to bottom, transparent, var(--rsvp-highlight, #e94560) 30%, var(--rsvp-highlight, #e94560) 70%, transparent);
                opacity: 0.3;
            }
            .rsvp-word {
                font-family: 'Courier New', monospace;
                font-weight: bold;
                font-size: 48px;
                letter-spacing: 2px;
                display: flex;
                align-items: center;
            }
            .rsvp-word-before {
                text-align: right;
                width: 200px;
            }
            .rsvp-word-highlight {
                color: var(--rsvp-highlight, #e94560);
                width: 1ch;
                text-align: center;
            }
            .rsvp-word-after {
                text-align: left;
                width: 200px;
            }
            .rsvp-placeholder {
                color: #666;
                font-size: 1.2rem;
            }
            .rsvp-controls {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            .rsvp-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                transition: all 0.2s;
            }
            .rsvp-btn-primary {
                background: #e94560;
                color: white;
            }
            .rsvp-btn-primary:hover {
                background: #ff6b6b;
            }
            .rsvp-btn-primary:disabled {
                background: #555;
                cursor: not-allowed;
            }
            .rsvp-btn-secondary {
                background: #0f3460;
                color: white;
            }
            .rsvp-btn-secondary:hover {
                background: #1a5090;
            }
            .rsvp-btn-secondary:disabled {
                background: #333;
                cursor: not-allowed;
            }
            .rsvp-settings {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                background: #16213e;
                border-radius: 10px;
                padding: 15px;
            }
            .rsvp-setting {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .rsvp-setting label {
                font-size: 0.8rem;
                color: #aaa;
            }
            .rsvp-setting input[type="range"] {
                width: 100%;
                accent-color: #e94560;
            }
            .rsvp-setting input[type="color"] {
                width: 50px;
                height: 35px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                background: transparent;
            }
            .rsvp-setting-value {
                font-size: 0.95rem;
                font-weight: 600;
                color: #fff;
            }
            .rsvp-tabs {
                display: flex;
                gap: 5px;
                margin-bottom: 15px;
            }
            .rsvp-tab {
                padding: 8px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 600;
                background: #0f3460;
                color: #888;
                transition: all 0.2s;
            }
            .rsvp-tab:hover {
                background: #1a5090;
                color: #fff;
            }
            .rsvp-tab-active {
                background: #e94560;
                color: #fff;
            }
            .rsvp-word-picker {
                background: #0d1b2a;
                border-radius: 8px;
                padding: 10px;
                margin-top: 10px;
                max-height: 100px;
                overflow-y: auto;
                display: none;
                flex-wrap: wrap;
                gap: 5px;
            }
            .rsvp-word-picker span {
                padding: 2px 6px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8rem;
                color: #888;
                transition: all 0.15s;
            }
            .rsvp-word-picker span:hover {
                background: #e94560;
                color: #fff;
            }
            .rsvp-word-picker span.rsvp-current-word {
                background: #e94560;
                color: #fff;
            }
            .rsvp-picker-toggle {
                text-align: center;
                margin-top: 10px;
            }
            .rsvp-picker-toggle button {
                background: none;
                border: 1px solid #333;
                color: #666;
                padding: 5px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8rem;
            }
            .rsvp-picker-toggle button:hover {
                border-color: #e94560;
                color: #e94560;
            }

            .rsvp-btn-highlight {
                background: linear-gradient(135deg, #f39c12, #e74c3c) !important;
                color: white !important;
                border: 2px solid #f39c12 !important;
                padding: 10px 20px !important;
                font-size: 0.95rem !important;
                font-weight: 600 !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
                transition: all 0.2s !important;
            }

            .rsvp-btn-highlight:hover {
                background: linear-gradient(135deg, #e67e22, #c0392b) !important;
                border-color: #e67e22 !important;
                box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
                transform: translateY(-2px);
            }

            .rsvp-preview-section {
                margin-top: 15px;
            }

            .rsvp-text-preview {
                background: #0d1b2a;
                border-radius: 8px;
                padding: 15px;
                max-height: 150px;
                overflow-y: auto;
                display: none;
                line-height: 1.8;
                font-size: 0.9rem;
                color: #666;
            }

            .rsvp-text-preview.visible {
                display: block;
            }

            .rsvp-text-preview span {
                cursor: pointer;
                padding: 2px 4px;
                border-radius: 3px;
                transition: all 0.15s;
            }

            .rsvp-text-preview span:hover {
                background: #1a3a5c;
                color: #fff;
            }

            .rsvp-text-preview span.current-word {
                background: #e94560;
                color: #fff;
            }

            .rsvp-text-preview span.past-word {
                color: #888;
            }
        </style>
        <div id="rsvp-modal">
            <div class="rsvp-header">
                <h1>🌵 CactusRSVP</h1>
                <button class="rsvp-close" id="rsvp-close">&times;</button>
            </div>
            <div class="rsvp-tabs">
                <button class="rsvp-tab rsvp-tab-active" id="rsvp-tab-auto">Auto</button>
                <button class="rsvp-tab" id="rsvp-tab-manual">Manual</button>
            </div>
            <div class="rsvp-tab-content" id="rsvp-content-auto">
                <div class="rsvp-url-input" id="rsvp-url-section" style="display:none; margin-bottom: 15px;">
                    <input type="text" id="rsvp-url" placeholder="Paste URL of PDF..." style="width: calc(100% - 90px); padding: 10px; border: 2px solid #333; border-radius: 6px; background: #16213e; color: #fff; font-size: 0.9rem;">
                    <button class="rsvp-btn rsvp-btn-primary" id="rsvp-load-url" style="margin-left: 5px;">Load</button>
                </div>
            </div>
            <div class="rsvp-tab-content" id="rsvp-content-manual" style="display:none;">
                <textarea id="rsvp-manual-text" placeholder="Insert text here..." style="width: 100%; height: 120px; padding: 10px; border: 2px solid #333; border-radius: 6px; background: #16213e; color: #fff; font-size: 0.9rem; resize: vertical; margin-bottom: 10px;"></textarea>
                <button class="rsvp-btn rsvp-btn-primary" id="rsvp-load-manual" style="width: 100%;">Load text</button>
            </div>
            <div class="rsvp-status" id="rsvp-status">Loading text...</div>
            <div class="rsvp-progress">
                <div class="rsvp-progress-fill" id="rsvp-progress"></div>
            </div>
            <div class="rsvp-display">
                <div class="rsvp-orp-marker"></div>
                <div class="rsvp-word" id="rsvp-word">
                    <span class="rsvp-placeholder">Loading...</span>
                </div>
            </div>
            <div class="rsvp-picker-toggle">
                <button id="rsvp-toggle-picker" class="rsvp-btn-highlight">📍 Choose from list</button>
                <button id="rsvp-select-from-page" class="rsvp-btn-highlight">👆 Click on website</button>
            </div>
            <div class="rsvp-word-picker" id="rsvp-word-picker"></div>
            <div class="rsvp-controls">
                <button class="rsvp-btn rsvp-btn-primary" id="rsvp-play" disabled>▶ Start</button>
                <button class="rsvp-btn rsvp-btn-secondary" id="rsvp-rewind" disabled title="Cofnij 15s">-15s</button>
                <button class="rsvp-btn rsvp-btn-secondary" id="rsvp-restart" disabled>↺ Restart</button>
                <button class="rsvp-btn rsvp-btn-secondary" id="rsvp-prev" disabled>←</button>
                <button class="rsvp-btn rsvp-btn-secondary" id="rsvp-next" disabled>→</button>
            </div>
            <div class="rsvp-preview-section">
                <button class="rsvp-btn rsvp-btn-secondary" id="rsvp-toggle-preview" style="width:100%;margin-bottom:10px;" disabled>Text preview</button>
                <div class="rsvp-text-preview" id="rsvp-text-preview"></div>
            </div>
            <div class="rsvp-settings">
                <div class="rsvp-setting">
                    <label>Speed</label>
                    <input type="range" id="rsvp-speed" min="100" max="800" value="300">
                    <span class="rsvp-setting-value"><span id="rsvp-speed-val">300</span> WPM</span>
                </div>
                <div class="rsvp-setting">
                    <label>Size</label>
                    <input type="range" id="rsvp-fontsize" min="24" max="96" value="48">
                    <span class="rsvp-setting-value"><span id="rsvp-fontsize-val">48</span>px</span>
                </div>
                <div class="rsvp-setting">
                    <label>Color</label>
                    <input type="color" id="rsvp-color" value="#e94560">
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Elements
    const modal = document.getElementById('rsvp-modal');
    const status = document.getElementById('rsvp-status');
    const progress = document.getElementById('rsvp-progress');
    const wordDisplay = document.getElementById('rsvp-word');
    const playBtn = document.getElementById('rsvp-play');
    const restartBtn = document.getElementById('rsvp-restart');
    const prevBtn = document.getElementById('rsvp-prev');
    const nextBtn = document.getElementById('rsvp-next');
    const speedInput = document.getElementById('rsvp-speed');
    const speedVal = document.getElementById('rsvp-speed-val');
    const fontSizeInput = document.getElementById('rsvp-fontsize');
    const fontSizeVal = document.getElementById('rsvp-fontsize-val');
    const colorInput = document.getElementById('rsvp-color');
    const urlSection = document.getElementById('rsvp-url-section');
    const urlInput = document.getElementById('rsvp-url');
    const loadUrlBtn = document.getElementById('rsvp-load-url');
    const tabAuto = document.getElementById('rsvp-tab-auto');
    const tabManual = document.getElementById('rsvp-tab-manual');
    const contentAuto = document.getElementById('rsvp-content-auto');
    const contentManual = document.getElementById('rsvp-content-manual');
    const manualText = document.getElementById('rsvp-manual-text');
    const loadManualBtn = document.getElementById('rsvp-load-manual');
    const wordPicker = document.getElementById('rsvp-word-picker');
    const togglePickerBtn = document.getElementById('rsvp-toggle-picker');
    const selectFromPageBtn = document.getElementById('rsvp-select-from-page');
    const rewindBtn = document.getElementById('rsvp-rewind');
    const togglePreviewBtn = document.getElementById('rsvp-toggle-preview');
    const textPreview = document.getElementById('rsvp-text-preview');

    // Close modal
    document.getElementById('rsvp-close').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    // ORP calculation
    function getORPIndex(word) {
        const len = word.length;
        if (len <= 2) return 0;
        if (len <= 5) return 1;
        if (len <= 9) return 2;
        if (len <= 13) return 3;
        return 4;
    }

    function renderWord(word) {
        if (!word) return '';
        const orpIndex = getORPIndex(word);
        const before = word.substring(0, orpIndex);
        const highlight = word[orpIndex];
        const after = word.substring(orpIndex + 1);
        return `<span class="rsvp-word-before">${before}</span><span class="rsvp-word-highlight">${highlight}</span><span class="rsvp-word-after">${after}</span>`;
    }

    function displayWord(index) {
        if (index >= 0 && index < words.length) {
            wordDisplay.innerHTML = renderWord(words[index]);
            progress.style.width = ((index + 1) / words.length * 100) + '%';
            status.textContent = `Word ${index + 1} / ${words.length}`;
            // Update picker highlight
            const spans = wordPicker.querySelectorAll('span[data-index]');
            spans.forEach(s => {
                s.classList.toggle('rsvp-current-word', parseInt(s.dataset.index) === index);
            });
            // Update preview highlight
            highlightPreviewWord();
        }
    }

    function play() {
        if (words.length === 0) return;
        if (currentIndex >= words.length) currentIndex = 0;
        isPlaying = true;
        playBtn.textContent = '⏸ Pause';
        const wpm = parseInt(speedInput.value);
        const interval = 60000 / wpm;
        intervalId = setInterval(() => {
            displayWord(currentIndex);
            currentIndex++;
            if (currentIndex >= words.length) {
                pause();
                status.textContent = 'Finished';
            }
        }, interval);
    }

    function pause() {
        isPlaying = false;
        playBtn.textContent = '▶ Start';
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function togglePlay() {
        if (isPlaying) pause(); else play();
    }

    function restart() {
        pause();
        currentIndex = 0;
        if (words.length > 0) displayWord(0);
    }

    function enableControls() {
        playBtn.disabled = false;
        restartBtn.disabled = false;
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        rewindBtn.disabled = false;
        togglePreviewBtn.disabled = false;
    }

    // Rewind 15 seconds
    function rewind15s() {
        const wpm = parseInt(speedInput.value);
        const wordsToRewind = Math.floor(wpm / 4); // 15 seconds worth of words
        currentIndex = Math.max(0, currentIndex - wordsToRewind);
        displayWord(currentIndex);
        status.textContent = `Rewinded ${wordsToRewind} words`;
    }

    // Text preview
    let previewVisible = false;

    function toggleTextPreview() {
        previewVisible = !previewVisible;

        if (previewVisible) {
            textPreview.classList.add('visible');
            togglePreviewBtn.textContent = 'Hide preview';
            updateTextPreview();
        } else {
            textPreview.classList.remove('visible');
            togglePreviewBtn.textContent = 'Text preview';
        }
    }

    function updateTextPreview() {
        if (!previewVisible) return;

        textPreview.innerHTML = '';

        const contextSize = 100;
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
                status.textContent = `Skipped to: "${words[currentIndex]}" (${currentIndex + 1}/${words.length})`;
            };

            textPreview.appendChild(span);
            textPreview.appendChild(document.createTextNode(' '));
        }

        const currentSpan = textPreview.querySelector('.current-word');
        if (currentSpan) {
            currentSpan.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    function highlightPreviewWord() {
        if (!previewVisible) return;

        const spans = textPreview.querySelectorAll('span');
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

    function showUrlInput() {
        urlSection.style.display = 'block';
    }

    async function loadPdfFromUrl(pdfUrl) {
        if (!pdfUrl) return;

        // Ensure PDF.js is loaded
        if (typeof pdfjsLib === 'undefined') {
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('lib/pdf.min.js');
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
            pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('lib/pdf.worker.min.js');
        }

        try {
            status.textContent = 'Downloading PDF...';
            const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(pdfUrl);
            const response = await fetch(proxyUrl);

            if (!response.ok) throw new Error('HTTP ' + response.status);

            const arrayBuffer = await response.arrayBuffer();
            status.textContent = 'Processing PDF...';

            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + ' ';
                status.textContent = `Page ${i}/${pdf.numPages}...`;
            }

            processText(fullText);
            urlSection.style.display = 'none';
        } catch (error) {
            console.error('RSVP PDF Error:', error);
            status.textContent = 'Error: ' + error.message;
            showUrlInput();
        }
    }

    // Event listeners
    playBtn.onclick = togglePlay;
    restartBtn.onclick = restart;
    rewindBtn.onclick = rewind15s;
    togglePreviewBtn.onclick = toggleTextPreview;
    prevBtn.onclick = () => { if (currentIndex > 0) { currentIndex--; displayWord(currentIndex); } };
    nextBtn.onclick = () => { if (currentIndex < words.length - 1) { currentIndex++; displayWord(currentIndex); } };
    speedInput.oninput = () => {
        speedVal.textContent = speedInput.value;
        if (isPlaying) { pause(); play(); }
    };
    fontSizeInput.oninput = () => {
        fontSizeVal.textContent = fontSizeInput.value;
        wordDisplay.style.fontSize = fontSizeInput.value + 'px';
    };
    colorInput.oninput = () => {
        modal.style.setProperty('--rsvp-highlight', colorInput.value);
    };
    loadUrlBtn.onclick = () => {
        const pdfUrl = urlInput.value.trim();
        if (pdfUrl) loadPdfFromUrl(pdfUrl);
    };
    urlInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            const pdfUrl = urlInput.value.trim();
            if (pdfUrl) loadPdfFromUrl(pdfUrl);
        }
    };

    // Tab switching
    tabAuto.onclick = () => {
        tabAuto.classList.add('rsvp-tab-active');
        tabManual.classList.remove('rsvp-tab-active');
        contentAuto.style.display = 'block';
        contentManual.style.display = 'none';
    };
    tabManual.onclick = () => {
        tabManual.classList.add('rsvp-tab-active');
        tabAuto.classList.remove('rsvp-tab-active');
        contentManual.style.display = 'block';
        contentAuto.style.display = 'none';
    };

    // Manual text loading
    loadManualBtn.onclick = () => {
        const text = manualText.value.trim();
        if (text) {
            processText(text);
            updateWordPicker();
        }
    };

    // Word picker toggle
    let pickerVisible = false;
    togglePickerBtn.onclick = () => {
        pickerVisible = !pickerVisible;
        wordPicker.style.display = pickerVisible ? 'flex' : 'none';
        togglePickerBtn.textContent = pickerVisible ? 'Hide' : 'Choose starting point';
    };

    function updateWordPicker() {
        wordPicker.innerHTML = '';
        const maxWords = Math.min(words.length, 500); // Limit for performance
        for (let i = 0; i < maxWords; i++) {
            const span = document.createElement('span');
            span.textContent = words[i];
            span.dataset.index = i;
            if (i === currentIndex) span.classList.add('rsvp-current-word');
            span.onclick = () => {
                currentIndex = parseInt(span.dataset.index);
                displayWord(currentIndex);
                highlightCurrentInPicker();
            };
            wordPicker.appendChild(span);
        }
        if (words.length > 500) {
            const more = document.createElement('span');
            more.textContent = `... +${words.length - 500} more`;
            more.style.color = '#666';
            more.style.cursor = 'default';
            wordPicker.appendChild(more);
        }
    }

    function highlightCurrentInPicker() {
        const spans = wordPicker.querySelectorAll('span[data-index]');
        spans.forEach(s => {
            s.classList.toggle('rsvp-current-word', parseInt(s.dataset.index) === currentIndex);
        });
        // Scroll to current word
        const currentSpan = wordPicker.querySelector('.rsvp-current-word');
        if (currentSpan) currentSpan.scrollIntoView({ block: 'nearest' });
    }

    // Select from page functionality
    let selectionMode = false;
    let originalText = '';

    selectFromPageBtn.onclick = () => {
        if (words.length === 0) {
            status.textContent = 'Load text first';
            return;
        }

        selectionMode = true;
        modal.style.display = 'none';
        overlay.style.background = 'rgba(0, 0, 0, 0.3)';
        overlay.style.pointerEvents = 'none';

        // Store original text for matching
        originalText = words.join(' ').toLowerCase();

        // Add selection styles
        const selectionStyle = document.createElement('style');
        selectionStyle.id = 'rsvp-selection-style';
        selectionStyle.textContent = `
            body * {
                cursor: crosshair !important;
            }
            .rsvp-hover-highlight {
                background: #e94560 !important;
                color: white !important;
                border-radius: 2px;
            }
        `;
        document.head.appendChild(selectionStyle);

        // Info banner
        const banner = document.createElement('div');
        banner.id = 'rsvp-selection-banner';
        banner.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#e94560;color:white;padding:15px 30px;border-radius:10px;z-index:2147483647;font-family:sans-serif;font-size:16px;box-shadow:0 5px 20px rgba(0,0,0,0.3);';
        banner.innerHTML = 'Click where you want to start reading <button id="rsvp-cancel-selection" style="margin-left:15px;padding:5px 15px;border:none;border-radius:5px;cursor:pointer;background:white;color:#e94560;font-weight:bold;">Anuluj</button>';
        document.body.appendChild(banner);

        document.getElementById('rsvp-cancel-selection').onclick = (e) => {
            e.stopPropagation();
            cancelSelection();
        };

        // Click handler for page
        setTimeout(() => {
            document.addEventListener('click', handlePageClick, true);
        }, 100);

        // ESC to cancel
        document.addEventListener('keydown', handleSelectionEsc);
    };

    function handleSelectionEsc(e) {
        if (e.key === 'Escape' && selectionMode) {
            cancelSelection();
        }
    }

    function cancelSelection() {
        selectionMode = false;
        modal.style.display = 'block';
        overlay.style.background = 'rgba(0, 0, 0, 0.85)';
        overlay.style.pointerEvents = 'auto';

        const style = document.getElementById('rsvp-selection-style');
        if (style) style.remove();

        const banner = document.getElementById('rsvp-selection-banner');
        if (banner) banner.remove();

        document.removeEventListener('click', handlePageClick, true);
        document.removeEventListener('keydown', handleSelectionEsc);
    }

    function handlePageClick(e) {
        if (!selectionMode) return;
        if (e.target.id === 'rsvp-cancel-selection') return;

        e.preventDefault();
        e.stopPropagation();

        let clickedWord = '';

        // Method 1: Try caretRangeFromPoint
        if (document.caretRangeFromPoint) {
            const range = document.caretRangeFromPoint(e.clientX, e.clientY);
            if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
                const text = range.startContainer.textContent;
                const offset = range.startOffset;

                let wordStart = offset;
                let wordEnd = offset;

                while (wordStart > 0 && /\S/.test(text[wordStart - 1])) wordStart--;
                while (wordEnd < text.length && /\S/.test(text[wordEnd])) wordEnd++;

                clickedWord = text.substring(wordStart, wordEnd);
            }
        }

        // Method 2: Try getting text from clicked element
        if (!clickedWord && e.target && e.target.textContent) {
            const text = e.target.textContent.trim();
            const words_in_el = text.split(/\s+/);
            if (words_in_el.length <= 5) {
                clickedWord = words_in_el[0];
            }
        }

        // Clean up clicked word
        clickedWord = clickedWord.toLowerCase().replace(/[^a-ząćęłńóśźżA-ZĄĆĘŁŃÓŚŹŻ0-9]/gi, '');

        console.log('Clicked word:', clickedWord);

        if (clickedWord && clickedWord.length > 1) {
            // Search for word in our array
            let foundIndex = -1;

            // Exact match first
            foundIndex = words.findIndex(w => w.toLowerCase() === clickedWord);

            // Partial match if no exact
            if (foundIndex === -1) {
                foundIndex = words.findIndex(w =>
                    w.toLowerCase().includes(clickedWord) ||
                    clickedWord.includes(w.toLowerCase())
                );
            }

            // Prefix match
            if (foundIndex === -1 && clickedWord.length >= 3) {
                const prefix = clickedWord.substring(0, 3);
                foundIndex = words.findIndex(w => w.toLowerCase().startsWith(prefix));
            }

            if (foundIndex !== -1) {
                currentIndex = foundIndex;
                displayWord(currentIndex);
                status.textContent = `Start od: "${words[foundIndex]}" (słowo ${foundIndex + 1} z ${words.length})`;
            } else {
                status.textContent = `Did not found "${clickedWord}"`;
            }
        } else {
            status.textContent = 'Click a word';
        }

        cancelSelection();
    }

    // Keyboard
    document.addEventListener('keydown', function rsvpKeyHandler(e) {
        if (!document.getElementById('rsvp-modal-overlay')) {
            document.removeEventListener('keydown', rsvpKeyHandler);
            return;
        }
        // Don't capture keys when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.code === 'Escape') { overlay.remove(); }
            return;
        }
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        else if (e.code === 'ArrowLeft') { if (currentIndex > 0) { currentIndex--; displayWord(currentIndex); } }
        else if (e.code === 'ArrowRight') { if (currentIndex < words.length - 1) { currentIndex++; displayWord(currentIndex); } }
        else if (e.code === 'KeyR') { restart(); }
        else if (e.code === 'Escape') { overlay.remove(); }
    });

    // Extract text from page
    function extractFromHTML() {
        // Try to get main content
        const selectors = ['article', 'main', '.content', '.post', '.entry', '#content', '.article-body', '.post-content'];
        let content = null;

        for (const sel of selectors) {
            content = document.querySelector(sel);
            if (content) break;
        }

        if (!content) {
            content = document.body;
        }

        // Clone and remove unwanted elements
        const clone = content.cloneNode(true);
        const unwanted = clone.querySelectorAll('script, style, nav, header, footer, aside, .sidebar, .menu, .nav, .comments, #rsvp-modal-overlay');
        unwanted.forEach(el => el.remove());

        const text = clone.textContent || clone.innerText || '';
        return text;
    }

    function processText(text) {
        // Remove emojis and special symbols
        const noEmoji = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FAFF}]/gu, '');

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
            status.textContent = `Done! ${words.length} words`;
            updateWordPicker();
        } else {
            status.textContent = 'Text not found';
        }
    }

    // Check if PDF
    const url = window.location.href;
    const isPDF = url.toLowerCase().endsWith('.pdf') ||
                  url.toLowerCase().includes('.pdf?') ||
                  url.toLowerCase().includes('.pdf#') ||
                  document.contentType === 'application/pdf' ||
                  document.querySelector('embed[type="application/pdf"]') ||
                  document.querySelector('iframe[src*=".pdf"]');

    if (isPDF) {
        // Get clean PDF URL
        let pdfUrl = url;
        // Handle Chrome's PDF viewer URL
        if (url.includes('chrome-extension://') && url.includes('/content/')) {
            const match = url.match(/\/content\/([^/]+)/);
            if (match) pdfUrl = decodeURIComponent(match[1]);
        }
        urlInput.value = pdfUrl;
        loadPdfFromUrl(pdfUrl);
    } else {
        // Extract from HTML
        showUrlInput(); // Show URL input in case user wants to load PDF
        status.textContent = 'Extracting text...';
        setTimeout(() => {
            const text = extractFromHTML();
            processText(text);
        }, 100);
    }
})();
