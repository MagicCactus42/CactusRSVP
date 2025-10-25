chrome.action.onClicked.addListener(async (tab) => {
    const url = tab.url || '';
    const isPDF = url.toLowerCase().endsWith('.pdf') ||
                  url.toLowerCase().includes('.pdf?') ||
                  url.toLowerCase().includes('.pdf#') ||
                  url.includes('pdfviewer');

    if (isPDF) {
        // Can't inject into PDF viewer, open popup with PDF URL
        const popupUrl = chrome.runtime.getURL('popup.html') + '?pdf=' + encodeURIComponent(url);
        chrome.windows.create({
            url: popupUrl,
            type: 'popup',
            width: 750,
            height: 650
        });
    } else {
        // Regular page - inject content script
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
        } catch (e) {
            // If injection fails, open popup
            const popupUrl = chrome.runtime.getURL('popup.html');
            chrome.windows.create({
                url: popupUrl,
                type: 'popup',
                width: 750,
                height: 650
            });
        }
    }
});
