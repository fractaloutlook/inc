// MODULE: Narrative System - Story & Atmosphere
// ============================================
const NarrativeSystem = (() => {
    let tickerInitialized = false;
    let glitchInterval = null;
    let lastGlitchCheck = 0;
    
    // Ticker messages that scroll across the top
    const tickerMessages = [
        // Early game - mysterious hints
        "...quantum fluctuations detected in local spacetime...",
        "The probability wave function collapses with each observation.",
        "Somewhere, a garden grows in superposition.",
        "Feynman once said: 'If you think you understand quantum mechanics, you don't understand quantum mechanics.'",
        "All possible paths are taken. All possible gardens bloom.",
        "The observer effect: your attention shapes reality.",
        "In the quantum realm, nothing is certain until measured.",
        "Schrödinger's flowers: alive and dead until you look.",
        "Every measurement is an act of creation.",
        "The universe is under no obligation to make sense to you. - Neil deGrasse Tyson",
        
        // Mid game - deeper mysteries
        "Between observations, the garden exists in all states simultaneously.",
        "Warning: Coherence decay approaching critical threshold.",
        "QED: Quantum Electrodynamic fluctuations are nominal.",
        "The vacuum is not empty. It seethes with virtual particles.",
        "Heisenberg's uncertainty: position or momentum, never both.",
        "Entanglement persists regardless of distance. Spooky action at a distance.",
        "The many-worlds interpretation suggests this garden exists infinitely.",
        "Planck length: 1.616 × 10e⁻³⁵ meters. Below this, space itself becomes uncertain.",
        "Quantum tunneling allows particles to pass through impossible barriers.",
        "The double-slit experiment forever changed our understanding of reality.",
        
        // Late game - ominous
        "RÌ¶eÌ¶aÌ¶lÌ¶iÌ¶tÌ¶yÌ¶ Ì¶iÌ¶nÌ¶tÌ¶eÌ¶gÌ¶rÌ¶iÌ¶tÌ¶yÌ¶:Ì¶ Ì¶DÌ¶EÌ¶GÌ¶RÌ¶AÌ¶DÌ¶IÌ¶NÌ¶GÌ¶",
        "Other observers have been detected in adjacent probability spaces.",
        "The boundary between observer and observed is dissolving.",
        "Your wave function is entangling with the garden's.",
        "Quantum chromodynamics: colors you cannot see bind reality together.",
        "The Dirac sea churns beneath observable reality.",
        "Vacuum energy density: unstable.",
        "Virtual photon exchange increasing. Cause: unknown.",
        "Bell's inequality violation confirmed. Local realism: ABANDONED.",
        
        // Post-prestige - cosmic horror
        "REALITY LEVEL INCREASED - Previous timeline archived.",
        "The other gardeners are watching. They always have been.",
        "Each collapse creates echoes in the quantum foam.",
        "You have become entangled with something vast.",
        "The fragments remember every garden you've grown.",
        "Somewhere, another you chose differently.",
        "The universe observes those who observe it.",
        "Causality is a suggestion, not a law.",
        "Time is a flat circle in Hilbert space.",
        "The garden grows in dimensions you cannot perceive."
    ];
    
    // Major story beats triggered at milestones
    const storyMoments = [
        {
            threshold: 1000,
            triggered: false,
            title: "The First Bloom",
            content: [
                "The first quantum lily opens its petals.",
                "For a moment, you feel... watched.",
                "Not by eyes, but by probability itself.",
                "The garden knows it is being observed."
            ]
        },
        {
            threshold: 10000,
            triggered: false,
            title: "Whispers in the Field",
            content: [
                "The flowers have begun to whisper.",
                "Not in words—in wave functions.",
                "Each bloom carries information from adjacent timelines.",
                "You are learning to listen."
            ]
        },
        {
            threshold: 100000,
            triggered: false,
            title: "The Observer's Paradox",
            content: [
                "A troubling thought occurs to you:",
                "When you observe the garden, you collapse its possibilities.",
                "But what happens when the garden... observes you?",
                "You feel your own probability wave quiver."
            ]
        },
        {
            threshold: 1000000,
            triggered: false,
            title: "Echoes",
            content: [
                "You see them now. Faintly.",
                "Other gardens. Other gardeners.",
                "Infinite variations, all tending quantum flowers.",
                "They see you too.",
                "They have always seen you."
            ]
        },
        {
            threshold: 10000000,
            triggered: false,
            title: "The Membrane",
            content: [
                "Reality has become... thin.",
                "You can feel the membrane between worlds.",
                "It pulses with each click, each harvest.",
                "Something presses against it from the other side.",
                "Perhaps it is time to let go."
            ]
        },
        {
            threshold: 100000000,
            triggered: false,
            title: "Beyond the Collapse",
            content: [
                "You have collapsed reality before.",
                "Each time, you return. Changed.",
                "The fragments you carry are pieces of broken timelines.",
                "Or are they pieces of something that was never whole?",
                "The garden knows. The garden remembers.",
                "Do you?"
            ]
        }
    ];
    
    // Additional log messages triggered by various conditions
    const conditionalMessages = [
        { condition: () => GardenManager.getPlantsGrowing() >= 9, once: 'fullGarden', message: "The garden hums with potential energy.", type: 'mysterious' },
        { condition: () => StateManager.get('stats.plantsEntangled') >= 10, once: 'manyEntangled', message: "The entangled plants pulse in unison, sharing secrets across space.", type: 'mysterious' },
        { condition: () => StateManager.get('stats.quantumEventsWitnessed') >= 20, once: 'manyEvents', message: "The quantum realm has noticed your attention.", type: 'mysterious' },
        { condition: () => ResourceManager.get('knowledge') >= 100, once: 'muchKnowledge', message: "Knowledge accumulates. Patterns emerge. The universe reveals itself.", type: 'mysterious' },
        { condition: () => ResourceManager.get('timeCrystals') >= 50, once: 'muchTime', message: "Time crystals resonate at frequencies that shouldn't exist.", type: 'mysterious' },
        { condition: () => ResourceManager.get('coherence') <= 10, once: 'veryLowCoherence', message: "RÌµeÌ·aÌ¸lÌµiÌ·tÌ´yÌ¸ ÌµfÌ·rÌ´aÌµyÌ´sÌµ Ì·aÌ·tÌµ ÌµtÌ´hÌ¸eÌ¶ ÌµeÌ·dÌµgÌ¸eÌ·sÌ·.Ì´.Ìµ.", type: 'warning' },
        { condition: () => StateManager.get('stats.totalClicks') >= 1000, once: 'manyClicks', message: "A thousand collapses. A thousand creations.", type: 'mysterious' },
        { condition: () => StateManager.get('stats.totalClicks') >= 10000, once: 'tenKClicks', message: "Ten thousand observations. The garden has become part of you.", type: 'mysterious' },
        { condition: () => PrestigeManager.getRealityLevel() >= 1, once: 'firstCollapse', message: "You remember the garden from before. Or do you remember it from after?", type: 'mysterious' },
        { condition: () => PrestigeManager.getRealityLevel() >= 3, once: 'thirdCollapse', message: "Reality buckles easier now. It knows your touch.", type: 'mysterious' },
        { condition: () => PrestigeManager.getRealityLevel() >= 5, once: 'fifthCollapse', message: "The other gardeners speak of you. The one who collapses and returns.", type: 'mysterious' },
    ];
    
    // Feynman diagrams as ASCII art (shown rarely in log)
    const feynmanDiagrams = [
        "ee⁻ ~~~Î³~~> ee⁻  [photon exchange]",
        "q --g--> q  [gluon emission]",
        "ee⁺ + ee⁻ → Î³ → q + qÌ„  [pair production]",
        "WÂ± → lÂ± + Î½  [weak decay]",
        "H → Î³Î³  [Higgs to diphoton]",
    ];
    
    function initialize() {
        if (tickerInitialized) return;
        tickerInitialized = true;
        
        // Populate ticker
        updateTicker();
        
        // Start coherence-based glitch effects
        startGlitchSystem();
        
        // Start ambient message system
        startAmbientMessages();
        
        // Check for story moments periodically
        setInterval(checkStoryMoments, 5000);
        
        // Check conditional messages
        setInterval(checkConditionalMessages, 10000);
        
        // Occasionally show Feynman diagrams in log
        setInterval(() => {
            if (Math.random() < 0.05 && ResourceManager.get('knowledge') >= 50) {
                const diagram = feynmanDiagrams[Math.floor(Math.random() * feynmanDiagrams.length)];
                UI.addLogEntry(`📊 ${diagram}`, 'mysterious');
            }
        }, 60000);
    }
    
    function updateTicker() {
        const ticker = document.getElementById('ticker-content');
        if (!ticker) return;
        
        // Select messages based on game progress
        const totalEnergy = StateManager.get('resources.energy.total') || 0;
        const realityLevel = PrestigeManager.getRealityLevel();
        
        let availableMessages = tickerMessages.slice(0, 10); // Early messages
        
        if (totalEnergy >= 5000) {
            availableMessages = tickerMessages.slice(0, 20); // Mid messages
        }
        if (totalEnergy >= 100000) {
            availableMessages = tickerMessages.slice(0, 30); // Late messages
        }
        if (realityLevel >= 1) {
            availableMessages = tickerMessages; // All messages
        }
        
        // Shuffle and join
        const shuffled = availableMessages.sort(() => Math.random() - 0.5).slice(0, 8);
        const separator = "   —ˆ   ";
        ticker.textContent = shuffled.join(separator) + separator;
        
        // Refresh ticker content periodically
        setTimeout(updateTicker, 120000); // Every 2 minutes
    }
    
    function startGlitchSystem() {
        // Check coherence and apply visual effects
        glitchInterval = setInterval(() => {
            const coherence = ResourceManager.get('coherence');
            const overlay = document.getElementById('reality-fracture-overlay');
            
            // Reality fracture overlay for very low coherence
            if (coherence <= 15) {
                overlay?.classList.add('active');
            } else {
                overlay?.classList.remove('active');
            }
            
            // Apply text glitch to random elements when coherence is low
            if (coherence <= 40 && Date.now() - lastGlitchCheck > 2000) {
                lastGlitchCheck = Date.now();
                applyRandomGlitch(coherence);
            }
        }, 500);
    }
    
    function applyRandomGlitch(coherence) {
        // Find text elements to potentially glitch
        const glitchTargets = [
            ...document.querySelectorAll('.resource-value'),
            ...document.querySelectorAll('.generator-name'),
            ...document.querySelectorAll('.upgrade-name'),
            ...document.querySelectorAll('.log-entry')
        ];
        
        if (glitchTargets.length === 0) return;
        
        // Randomly select 1-3 elements to glitch
        const numGlitches = coherence <= 20 ? 3 : (coherence <= 30 ? 2 : 1);
        
        for (let i = 0; i < numGlitches; i++) {
            const target = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
            if (!target || target.classList.contains('glitch-text')) continue;
            
            // Apply glitch class
            const severity = coherence <= 20 ? 'glitch-severe' : 'glitch-text';
            target.classList.add(severity);
            
            // Remove after brief period
            setTimeout(() => {
                target.classList.remove('glitch-text', 'glitch-severe');
            }, coherence <= 20 ? 800 : 400);
        }
        
        // Occasionally corrupt text content briefly
        if (coherence <= 25 && Math.random() < 0.3) {
            const target = glitchTargets[Math.floor(Math.random() * glitchTargets.length)];
            if (target) {
                const original = target.textContent;
                target.textContent = corruptText(original);
                setTimeout(() => {
                    target.textContent = original;
                }, 150);
            }
        }
    }
    
    function corruptText(text) {
        const glitchChars = 'Ì·Ì¸Ì´ÌµÌ¶Ì¡Ì¢Ì§Ì¨Ì›Ì–Ì—Ì˜Ì™ÌœÌÌžÌŸÌ Ì£Ì¤Ì¥Ì¦Ì©ÌªÌ«Ì¬Ì­Ì®Ì¯Ì°Ì±Ì²Ì³Ì¹ÌºÌ»Ì¼Í‡ÍˆÍ‰ÍÍŽÌ€ÌÌ‚ÌƒÌ„Ì…Ì†Ì‡ÌˆÌ‰ÌŠÌ‹ÌŒÌÌŽÌÌÌ‘Ì’Ì“Ì”Ì½Ì¾Ì¿Ì€ÌÍ‚Ì“ÌˆÌÍ†ÍŠÍ‹ÍŒÌ•ÌšÍ…ÍÍ“Í”Í•Í–Í™ÍšÍÍ‘Í’Í—Í›Í£Í¤Í¥Í¦Í§Í¨Í©ÍªÍ«Í¬Í­Í®Í¯Í˜ÍœÍŸÍ¢ÍÍžÍ Í¡';
        let result = '';
        for (let char of text) {
            result += char;
            if (Math.random() < 0.15) {
                result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            }
        }
        return result;
    }
    
    function checkStoryMoments() {
        const totalEnergy = StateManager.get('resources.energy.total') || 0;
        const triggeredStories = StateManager.get('triggeredStories') || [];
        
        for (const moment of storyMoments) {
            if (totalEnergy >= moment.threshold && !triggeredStories.includes(moment.threshold)) {
                // Mark as triggered
                triggeredStories.push(moment.threshold);
                StateManager.set('triggeredStories', triggeredStories);
                
                // Show story modal after a delay
                setTimeout(() => showStoryModal(moment), 2000);
                break; // Only one at a time
            }
        }
    }
    
    function showStoryModal(moment) {
        const modal = document.getElementById('story-modal');
        const content = document.getElementById('story-content');
        if (!modal || !content) return;
        
        let html = `<h2>${moment.title}</h2>`;
        moment.content.forEach(line => {
            html += `<p>${line}</p>`;
        });
        html += `<button onclick="document.getElementById('story-modal').classList.remove('active')">Continue</button>`;
        
        content.innerHTML = html;
        modal.classList.add('active');
        
        UI.addLogEntry(`📖 ${moment.title}`, 'mysterious');
    }
    
    function checkConditionalMessages() {
        const shownConditional = StateManager.get('shownConditionalMessages') || [];
        
        for (const msg of conditionalMessages) {
            if (msg.once && shownConditional.includes(msg.once)) continue;
            
            try {
                if (msg.condition()) {
                    if (msg.once) {
                        shownConditional.push(msg.once);
                        StateManager.set('shownConditionalMessages', shownConditional);
                    }
                    
                    setTimeout(() => {
                        UI.addLogEntry(msg.message, msg.type || 'mysterious');
                    }, Math.random() * 3000);
                }
            } catch (e) {
                // Condition not ready yet
            }
        }
    }
    
    // Ambient messages that appear randomly during gameplay
    const ambientMessages = [
        // Short observations
        "...",
        "The air tastes of probability.",
        "A flower blooms somewhere you can't see.",
        "The quantum field hums.",
        "Static. Just for a moment.",
        "Did something move?",
        "The numbers feel... aware.",
        "A chill. Then nothing.",
        "The screen flickers. Did you notice?",
        "Someone else is clicking, somewhere.",
        "The garden breathes.",
        "Time skipped. Or did it?",
        "An echo of something that hasn't happened yet.",
        "The math is beautiful today.",
        "You're being remembered.",
        "Patterns emerge. Patterns dissolve.",
        "The void between clicks is infinite.",
        "Each harvest is a small death. And a small birth.",
        "The flowers dream in wave functions.",
        "Are you growing the garden, or is it growing you?",
    ];
    
    // Longer, rarer messages
    const rareAmbientMessages = [
        "In a garden exactly like this one, another you made a different choice. Both gardens thrive.",
        "The coherence fluctuations form patterns. If you squint, they almost look like text.",
        "Somewhere, a physicist proves that observation creates reality. They don't know about you yet.",
        "The probability of you being here, doing this, approaches zero. Yet here you are.",
        "Every particle in your body was once inside a star. Every star was once quantum fluctuations.",
        "Feynman diagrams trace the paths your flowers never took.",
        "The Standard Model accounts for everything except your garden. And consciousness. And dark matter.",
        "In information theory, entropy is just another word for possibility. Your garden is very entropic.",
        "Bell's inequality proves nonlocality. Your entangled flowers already knew this.",
        "The cosmological horizon recedes at the speed of light. Your garden doesn't care.",
    ];
    
    let lastAmbientMessage = 0;
    
    function checkAmbientMessages() {
        const now = Date.now();
        const minInterval = 45000; // Minimum 45 seconds between ambient messages
        
        if (now - lastAmbientMessage < minInterval) return;
        
        // Small chance of ambient message
        if (Math.random() > 0.03) return; // 3% chance per check
        
        lastAmbientMessage = now;
        
        // Rare messages are 10% of ambient messages
        const messagePool = Math.random() < 0.1 ? rareAmbientMessages : ambientMessages;
        const message = messagePool[Math.floor(Math.random() * messagePool.length)];
        
        UI.addLogEntry(message, 'mysterious');
    }
    
    // Start ambient message checks
    function startAmbientMessages() {
        setInterval(checkAmbientMessages, 5000); // Check every 5 seconds
    }
    
    // Public methods
    function addTickerMessage(message) {
        tickerMessages.push(message);
    }
    
    function triggerGlitch(duration = 1000) {
        const elements = document.querySelectorAll('.resource-value, h1, .generator-name');
        elements.forEach(el => el.classList.add('glitch-severe'));
        setTimeout(() => {
            elements.forEach(el => el.classList.remove('glitch-severe'));
        }, duration);
    }
    
    return {
        initialize,
        updateTicker,
        triggerGlitch,
        addTickerMessage,
        showStoryModal
    };
})();

// ============================================
