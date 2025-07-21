// ==UserScript==
// @name         TSS Teams Summarizer - BARN protocol phase - 11
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Capture & summarize Teams chat + transcription on 'TSS' trigger.
// @author       Master Prashant Rai, The Sovereign Strategist
// @match        https://teams.microsoft.com/*
// @grant        none
// ==/UserScript==
// Teams Summarizer Script (Keyword-Triggered, Stealth Mode)
(function() {
    // Configuration
    const TRIGGER_WORD = "tss"; // Case-insensitive
    const TIMEZONE = "Australia/Sydney"; // AEST
    const KEYWORDS = [
        "p1", "p2", "potential", "potential major", "potential mi", 
        "bridge", "bridge call", "join bridge", "on bridge", "call", 
        "incident", "major", "outage", "potential impact", "high impact", "critical"
    ];

    // Check if meeting title matches ANY keyword (case-insensitive)
    const meetingTitle = document.title.toLowerCase();
    const isRelevantMeeting = KEYWORDS.some(keyword => meetingTitle.includes(keyword.toLowerCase()));
    if (!isRelevantMeeting) {
        console.log("[Teams Summarizer] Skipping: Meeting title does not contain keywords.");
        return;
    }

    // Add stealth button (⚫) to the chat toolbar
    const addButton = () => {
        const toolbar = document.querySelector('[data-tid="compose-toolbar"]');
        if (!toolbar) return;

        const button = document.createElement("button");
        button.innerHTML = "⚫";
        button.style.background = "none";
        button.style.border = "none";
        button.style.cursor = "pointer";
        button.title = "TSS Summarizer (Stealth Mode)";
        button.onclick = () => {
            const chatBox = document.querySelector('[aria-label="Message"]');
            if (chatBox) chatBox.textContent = TRIGGER_WORD;
        };
        toolbar.prepend(button);
        console.log("[Teams Summarizer] Stealth button added.");
    };

    // Generate summary with AEST timestamps (newest first)
    const summarize = () => {
        const messages = Array.from(document.querySelectorAll('[data-tid="message-body"]'));
        const summary = messages.map(msg => {
            const time = new Date().toLocaleString("en-AU", {
                timeZone: TIMEZONE,
                hour12: false,
                hour: "2-digit",
                minute: "2-digit"
            });
            return `[${time}] ${msg.textContent}`;
        }).reverse().join("\n");

        const chatBox = document.querySelector('[aria-label="Message"]');
        if (chatBox) {
            chatBox.textContent = `Summary (AEST, newest first):\n${summary}`;
            console.log("[Teams Summarizer] Summary generated.");
        }
    };

    // Monitor chat for the trigger word "TSS"
    const observer = new MutationObserver(() => {
        const chatBox = document.querySelector('[aria-label="Message"]');
        if (chatBox && chatBox.textContent.toLowerCase().trim() === TRIGGER_WORD) {
            summarize();
        }
    });

    // Initialize
    addButton();
    observer.observe(document.body, { childList: true, subtree: true });
    console.log("[Teams Summarizer] Active for meeting:", document.title);
})();
