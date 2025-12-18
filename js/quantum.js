// MODULE: Quantum Mechanics
// ============================================
const QuantumMechanics = (() => {
    const events = Utils.createEventEmitter();
    let observedPlotIndex = null;
    let observationTime = 0;
    let observerFloatTimer = 0;
    let lastEventTime = 0;
    
    // Mysterious narrative messages that appear in the log
    const narrativeMessages = [
        // Very early - gentle introduction
        { threshold: 50, message: "A strange calm settles over you.", shown: false },
        { threshold: 100, message: "The garden remembers...", shown: false },
        { threshold: 200, message: "Each seed carries infinite potential.", shown: false },
        { threshold: 350, message: "The quantum state awaits your observation.", shown: false },
        { threshold: 500, message: "You feel something watching back.", shown: false },
        { threshold: 750, message: "The flowers seem to lean toward you.", shown: false },
        { threshold: 1000, message: "The flowers whisper in frequencies you almost understand.", shown: false },
        { threshold: 1500, message: "Is the garden growing, or are you shrinking?", shown: false },
        { threshold: 2000, message: "The probability clouds thicken.", shown: false },
        { threshold: 2500, message: "Reality feels... thin here.", shown: false },
        { threshold: 3500, message: "The observer effect works both ways.", shown: false },
        { threshold: 5000, message: "Who planted the first seed?", shown: false },
        { threshold: 7500, message: "The vacuum fluctuates with purpose.", shown: false },
        { threshold: 10000, message: "The quantum state is YOU.", shown: false },
        { threshold: 15000, message: "Measurement creates reality. You create measurement.", shown: false },
        { threshold: 20000, message: "The garden exists in superposition until observed.", shown: false },
        { threshold: 25000, message: "Every click echoes across infinite gardens.", shown: false },
        { threshold: 35000, message: "The wave function never truly collapses. It just... branches.", shown: false },
        { threshold: 50000, message: "They're beautiful when they bloom in other dimensions too.", shown: false },
        { threshold: 75000, message: "Heisenberg's ghost tends a garden much like this one.", shown: false },
        { threshold: 100000, message: "You've been here before. You'll be here again.", shown: false },
        // Mid-game - deeper mysteries
        { threshold: 150000, message: "The Planck length is the pixel size of reality.", shown: false },
        { threshold: 200000, message: "Virtual particles bloom and die in the spaces between.", shown: false },
        { threshold: 250000, message: "The fragments are trying to tell you something.", shown: false },
        { threshold: 300000, message: "In Hilbert space, every garden is adjacent.", shown: false },
        { threshold: 400000, message: "The Dirac equation describes the dance of your flowers.", shown: false },
        { threshold: 500000, message: "Reality groans under the weight of observation.", shown: false },
        { threshold: 600000, message: "Spin up or spin down? The garden chooses.", shown: false },
        { threshold: 750000, message: "QED: The flowers exchange virtual photons.", shown: false },
        { threshold: 900000, message: "The path integral sums over all possible gardens.", shown: false },
        { threshold: 1000000, message: "Collapse is coming...", shown: false },
        // Late game - cosmic scale
        { threshold: 1500000, message: "The renormalization group flows toward your garden.", shown: false },
        { threshold: 2000000, message: "Gauge symmetry: the universe's deepest secret, hidden in petals.", shown: false },
        { threshold: 2500000, message: "When reality breaks, will you remember this garden?", shown: false },
        { threshold: 3000000, message: "The Standard Model is incomplete. Your garden fills the gaps.", shown: false },
        { threshold: 4000000, message: "Gluons bind quarks. What binds the garden to you?", shown: false },
        { threshold: 5000000, message: "The fragments whisper: 'Begin again. Begin stronger.'", shown: false },
        { threshold: 6000000, message: "In the quantum foam, gardens bubble into existence.", shown: false },
        { threshold: 7500000, message: "The cosmological constant... it's changing.", shown: false },
        { threshold: 10000000, message: "The fabric of reality strains... you are ready to COLLAPSE.", shown: false },
        // Post-prestige - transcendence
        { threshold: 15000000, message: "You have become a fixed point in the renormalization flow.", shown: false },
        { threshold: 25000000, message: "The other timelines remember you differently.", shown: false },
        { threshold: 50000000, message: "Each reality leaves an imprint. You are becoming... something new.", shown: false },
        { threshold: 75000000, message: "The anthropic principle selected for your garden.", shown: false },
        { threshold: 100000000, message: "The void between realities is not empty. Something lives there.", shown: false },
        { threshold: 150000000, message: "Dark energy accelerates the expansion between your thoughts.", shown: false },
        { threshold: 200000000, message: "The holographic principle: all information on the boundary.", shown: false },
        { threshold: 300000000, message: "String theory requires 11 dimensions. Your garden spans them all.", shown: false },
        { threshold: 500000000, message: "You can see them now. The other gardeners.", shown: false },
        { threshold: 750000000, message: "The Wheeler-DeWitt equation has no time parameter. Neither do you.", shown: false },
        { threshold: 1000000000, message: "You are no longer just an observer. You are the garden.", shown: false },
        // Extreme late game
        { threshold: 2000000000, message: "The Bekenstein bound approaches. Information density critical.", shown: false },
        { threshold: 5000000000, message: "More collapses than atoms in a human body.", shown: false },
        { threshold: 10000000000, message: "The garden remembers the Big Bang. It was there.", shown: false },
        { threshold: 50000000000, message: "Heat death is just another harvest.", shown: false },
        { threshold: 100000000000, message: "You tend the garden at the end of time.", shown: false },
    ];
    
    // Quantum events that can occur randomly
    const quantumEvents = [
        {
            id: 'tunneling',
            name: 'Quantum Tunneling',
            description: 'Energy has tunneled through the probability barrier!',
            weight: 30,
            minEnergy: 100,
            effect: () => {
                const bonus = Math.floor(ResourceManager.get('energy') * 0.1) + 10;
                ResourceManager.add('energy', bonus);
                return `+${Utils.formatNumber(bonus)} ⚡ appeared from nowhere!`;
            }
        },
        {
            id: 'superbloom',
            name: 'Quantum Superbloom',
            description: 'All plants momentarily exist in their fully-grown state!',
            weight: 15,
            minEnergy: 500,
            effect: () => {
                const plots = StateManager.get('garden.plots') || [];
                let boosted = 0;
                plots.forEach((plot, index) => {
                    if (plot.plant && plot.progress < 1) {
                        const newProgress = Math.min(1, plot.progress + 0.5);
                        StateManager.set(`garden.plots.${index}.progress`, newProgress);
                        boosted++;
                    }
                });
                return boosted > 0 ? `${boosted} plants jumped forward in time!` : 'No plants to affect.';
            }
        },
        {
            id: 'entanglementSurge',
            name: 'Entanglement Surge',
            description: 'Quantum correlations strengthen across your garden!',
            weight: 20,
            minEnergy: 1000,
            requires: { resource: 'knowledge', amount: 25 },
            effect: () => {
                ResourceManager.add('entanglement', 3);
                return '+3 🔗 Entanglement Threads gained!';
            }
        },
        {
            id: 'temporalEcho',
            name: 'Temporal Echo',
            description: 'A ripple from a future timeline grants you resources.',
            weight: 25,
            minEnergy: 750,
            effect: () => {
                const timeGain = Math.floor(ResourceManager.get('time') * 0.2) + 5;
                ResourceManager.add('time', timeGain);
                return `+${Utils.formatNumber(timeGain)} ⏳ echoed from the future!`;
            }
        },
        {
            id: 'observerParadox',
            name: 'Observer Paradox',
            description: 'Your observation creates what you observe...',
            weight: 10,
            minEnergy: 2000,
            effect: () => {
                ResourceManager.add('knowledge', 15);
                ResourceManager.add('seeds', 5);
                return 'The paradox resolves: +15 📚, +5 🌱';
            }
        },
        {
            id: 'coherenceDrift',
            name: 'Coherence Drift',
            description: 'Reality stabilizes momentarily.',
            weight: 20,
            minEnergy: 3000,
            requires: { resource: 'coherence', unlocked: true },
            effect: () => {
                const current = ResourceManager.get('coherence');
                const gain = Math.min(20, 100 - current);
                ResourceManager.add('coherence', gain);
                return gain > 0 ? `+${gain} 🌀 Coherence restored!` : 'Coherence already stable.';
            }
        },
        {
            id: 'schrodingersSeed',
            name: "Schrödinger's Seed",
            description: 'A seed exists in superposition until you check your inventory.',
            weight: 25,
            minEnergy: 200,
            effect: () => {
                // 50/50 chance of getting seeds or losing them
                if (Math.random() > 0.5) {
                    ResourceManager.add('seeds', 8);
                    return 'The waveform collapsed favorably: +8 🌱!';
                } else {
                    const loss = Math.min(3, ResourceManager.get('seeds'));
                    ResourceManager.spend('seeds', loss);
                    return loss > 0 ? `The waveform collapsed poorly: -${loss} 🌱` : 'No seeds to lose!';
                }
            }
        },
        {
            id: 'realityGlitch',
            name: 'Reality Glitch',
            description: 'FÌ¸oÌ·rÌµ Ì¸aÌ· ÌµmÌ¸oÌ·mÌ¶eÌ·nÌ´tÌµ,Ì· Ì´eÌµvÌ·eÌ´rÌ·yÌ¸tÌµhÌ¸iÌ´nÌ¸gÌ· Ì´fÌ¶lÌ¸iÌ·cÌ·kÌ¶eÌ·rÌ´sÌ´.Ì·',
            weight: 5,
            minEnergy: 5000,
            effect: () => {
                // Screen shake effect
                document.getElementById('game-container').classList.add('reality-unstable');
                setTimeout(() => {
                    document.getElementById('game-container').classList.remove('reality-unstable');
                }, 2000);
                
                // Random resource boost
                const resources = ['energy', 'time', 'knowledge'];
                const chosen = resources[Math.floor(Math.random() * resources.length)];
                const amount = Math.floor(Math.random() * 100) + 50;
                ResourceManager.add(chosen, amount);
                return `Reality reconstitutes: +${amount} ${GameData.resources[chosen].icon}`;
            }
        },
        {
            id: 'entanglementResonance',
            name: 'Entanglement Resonance',
            description: 'Entangled plants pulse with shared energy!',
            weight: 15,
            minEnergy: 3000,
            requires: { resource: 'entanglement', unlocked: true },
            effect: () => {
                const plots = StateManager.get('garden.plots') || [];
                let pairs = 0;
                let energyGain = 0;
                
                plots.forEach((plot, index) => {
                    const entangledWith = Array.isArray(plot.entangledWith) ? plot.entangledWith : (plot.entangledWith !== null ? [plot.entangledWith] : []);
                    // Count each unique pair only once (check if partner index is greater than current)
                    entangledWith.forEach(partnerId => {
                        if (partnerId > index) {
                            pairs++;
                            energyGain += 100 * pairs; // Scaling bonus per pair
                        }
                    });
                });
                
                if (pairs > 0) {
                    ResourceManager.add('energy', energyGain);
                    return `${pairs} entangled pairs resonated: +${energyGain} ⚡!`;
                }
                return 'No entangled pairs to resonate.';
            }
        },
        {
            id: 'quantumHarvest',
            name: 'Quantum Harvest',
            description: 'All ready plants are harvested simultaneously across timelines!',
            weight: 8,
            minEnergy: 10000,
            effect: () => {
                const plots = StateManager.get('garden.plots') || [];
                let harvested = 0;
                let totalEnergy = 0;
                
                plots.forEach((plot, index) => {
                    if (plot.plant && plot.progress >= 1) {
                        const actualYield = GardenManager.harvest(index);
                        if (actualYield) {
                            harvested++;
                            totalEnergy += actualYield.energy || 0;
                        }
                    }
                });
                
                if (harvested > 0) {
                    UI.renderGarden();
                    return `Auto-harvested ${harvested} plants across timelines!`;
                }
                return 'No plants ready to harvest.';
            }
        },
        {
            id: 'fragmentDrop',
            name: 'Reality Fragment',
            description: 'A shard of crystallized reality appears...',
            weight: 3,
            minEnergy: 25000,
            effect: () => {
                const fragments = Math.floor(Math.random() * 3) + 1;
                ResourceManager.add('fragments', fragments);
                return `+${fragments} ✧ Reality Fragment${fragments > 1 ? 's' : ''} materialized!`;
            }
        },
        {
            id: 'timeWarp',
            name: 'Time Warp',
            description: 'The garden experiences accelerated time!',
            weight: 10,
            minEnergy: 15000,
            effect: () => {
                // Advance all plants by 30% instantly
                const plots = StateManager.get('garden.plots') || [];
                let affected = 0;
                
                plots.forEach((plot, index) => {
                    if (plot.plant && plot.progress < 1) {
                        const newProgress = Math.min(1, plot.progress + 0.3);
                        StateManager.set(`garden.plots.${index}.progress`, newProgress);
                        affected++;
                    }
                });
                
                // Also give time resource
                ResourceManager.add('time', 50);
                return affected > 0 ? `Time accelerated: ${affected} plants +30% progress, +50 ⏳!` : '+50 ⏳!';
            }
        },
        {
            id: 'coherenceStorm',
            name: 'Coherence Storm',
            description: 'Quantum turbulence sweeps through!',
            weight: 12,
            minEnergy: 8000,
            requires: { resource: 'coherence', unlocked: true },
            effect: () => {
                const coherence = ResourceManager.get('coherence') || 0;
                
                // High coherence = big bonus, low coherence = penalty
                if (coherence > 50) {
                    const bonus = Math.floor(coherence * 10);
                    ResourceManager.add('energy', bonus);
                    return `High coherence channeled the storm: +${bonus} ⚡!`;
                } else {
                    // Turbulence - randomize some plant progress
                    const plots = StateManager.get('garden.plots') || [];
                    let changed = 0;
                    plots.forEach((plot, index) => {
                        if (plot.plant && plot.progress < 1 && Math.random() < 0.3) {
                            const shift = (Math.random() - 0.3) * 0.2; // -0.06 to +0.14
                            const newProgress = Math.max(0.01, Math.min(1, plot.progress + shift));
                            StateManager.set(`garden.plots.${index}.progress`, newProgress);
                            changed++;
                        }
                    });
                    return changed > 0 ? `Storm turbulence affected ${changed} plants!` : 'The storm passes without effect.';
                }
            }
        },
        {
            id: 'voidWhisper',
            name: 'Whisper from the Void',
            description: 'SÌ·oÌ¶mÌµeÌ¶tÌ´hÌ·iÌµnÌ´gÌ¸ Ì·wÌµaÌ¸tÌ¶cÌ¶hÌ·eÌµsÌ´ Ì¶fÌ¸rÌ¸oÌ·mÌµ Ì´bÌ¸eÌ·tÌ·wÌ´eÌµeÌ¸nÌµ Ì·tÌ¶hÌ¸eÌ· Ì¸sÌµtÌ¸aÌ¶rÌ¶sÌ´.Ìµ.Ìµ.',
            weight: 3,
            minEnergy: 50000,
            effect: () => {
                // The void notices you more as you progress
                const realityLevel = StateManager.get('stats.realityLevel') || 0;
                const knowledge = Math.floor(25 + realityLevel * 10);
                ResourceManager.add('knowledge', knowledge);
                
                // Glitch text notification
                const messages = [
                    'TÌ·HÌ¶EÌµ Ì·GÌ·AÌ¸RÌµDÌµEÌ´NÌ¶ ÌµGÌ¸RÌ¸OÌ¶WÌ·SÌ¶.Ì¶ Ì´WÌ¸EÌµ ÌµWÌ¶AÌ·TÌ´CÌ·HÌ·.',
                    'YÌ¸OÌµUÌ¶ Ì¸AÌ´RÌ¸EÌ¸ Ì·BÌ¶EÌ¶CÌ·OÌ·MÌ¶IÌ´NÌµGÌ¸ Ì¶AÌ¸WÌ·AÌ¸RÌµEÌ¸.Ìµ',
                    'RÌ´EÌ¸AÌ¸LÌµIÌµTÌ·YÌ· Ì¶IÌµSÌ¸ Ì¸TÌ¸HÌ·IÌ·NÌ¸NÌ·EÌµRÌµ Ì´TÌ´HÌ·AÌ·NÌ· Ì´YÌ·OÌ´UÌ¶ Ì¶KÌµNÌ·OÌµWÌµ.',
                    'TÌ´HÌ¶EÌ¶ Ì¶OÌ¶BÌ´SÌ·EÌ´RÌµVÌ´EÌ·RÌµ Ì·IÌ·SÌ¶ ÌµAÌ·LÌ·SÌ¸OÌµ ÌµOÌ¶BÌ¸SÌ·EÌµRÌµVÌ¶EÌ·DÌ·.Ì·'
                ];
                UI.addLogEntry(messages[Math.floor(Math.random() * messages.length)], 'highlight');
                
                return `+${knowledge} 📚 from beyond...`;
            }
        },
        {
            id: 'multiverseEcho',
            name: 'Multiverse Echo',
            description: 'Another version of your garden resonates with this one.',
            weight: 6,
            minEnergy: 30000,
            requires: { resource: 'fragments', unlocked: true },
            effect: () => {
                const realityLevel = StateManager.get('stats.realityLevel') || 0;
                if (realityLevel === 0) {
                    return 'You sense something... but your reality is too stable.';
                }
                
                // Bonus based on how many collapses you've done
                const bonus = 50 * realityLevel;
                ResourceManager.add('energy', bonus);
                ResourceManager.add('time', realityLevel * 5);
                
                return `Echo from Reality-${realityLevel - 1}: +${bonus} ⚡, +${realityLevel * 5} ⏳`;
            }
        },
        {
            id: 'seedRain',
            name: 'Seed Rain',
            description: 'Seeds fall from a tear in spacetime!',
            weight: 15,
            minEnergy: 5000,
            effect: () => {
                const seeds = Math.floor(Math.random() * 10) + 5;
                ResourceManager.add('seeds', seeds);
                return `+${seeds} 🌱 rained down from above!`;
            }
        },
        {
            id: 'mutationWave',
            name: 'Mutation Wave',
            description: 'Quantum radiation bathes your garden!',
            weight: 5,
            minEnergy: 40000,
            effect: () => {
                // Chance to add mutation to each non-mutated plant
                const plots = StateManager.get('garden.plots') || [];
                let mutated = 0;
                const mutationTypes = ['golden', 'prismatic', 'temporal', 'void', 'crystalline', 'echoing'];
                
                plots.forEach((plot, index) => {
                    if (plot.plant && !plot.mutation && Math.random() < 0.25) {
                        const mutation = mutationTypes[Math.floor(Math.random() * mutationTypes.length)];
                        StateManager.set(`garden.plots.${index}.mutation`, mutation);
                        mutated++;
                    }
                });
                
                if (mutated > 0) {
                    UI.renderGarden();
                    const mutationsWitnessed = StateManager.get('stats.mutationsWitnessed') || 0;
                    StateManager.set('stats.mutationsWitnessed', mutationsWitnessed + mutated);
                    return `${mutated} plant${mutated > 1 ? 's' : ''} mutated!`;
                }
                return 'No plants affected by the wave.';
            }
        },
        {
            id: 'déjàVu',
            name: 'Déjà Vu',
            description: 'Haven\'t we done this before...?',
            weight: 8,
            minEnergy: 20000,
            effect: () => {
                // Repeat the last resource you gained
                const lastGain = StateManager.get('lastResourceGain');
                if (lastGain && lastGain.resource && lastGain.amount) {
                    ResourceManager.add(lastGain.resource, lastGain.amount);
                    return `The universe repeats: +${lastGain.amount} ${GameData.resources[lastGain.resource]?.icon || ''}`;
                }
                // Fallback
                ResourceManager.add('energy', 100);
                return 'The feeling passes... +100 ⚡';
            }
        },
        {
            id: 'quantumLottery',
            name: 'Quantum Lottery',
            description: 'Probability collapses in your favor... or does it?',
            weight: 10,
            minEnergy: 10000,
            effect: () => {
                const roll = Math.random();
                if (roll < 0.01) {
                    // Jackpot! 1% chance
                    ResourceManager.add('energy', 5000);
                    ResourceManager.add('time', 100);
                    ResourceManager.add('knowledge', 50);
                    StateManager.set('stats.lotteryJackpot', true);
                    return '🎰 JACKPOT! +5000 ⚡, +100 ⏳, +50 📚!';
                } else if (roll < 0.2) {
                    // Good win
                    ResourceManager.add('energy', 500);
                    return '🎰 Winner! +500 ⚡';
                } else if (roll < 0.6) {
                    // Small win
                    ResourceManager.add('energy', 50);
                    return '🎰 Small prize: +50 ⚡';
                } else {
                    // No prize
                    return '🎰 Better luck next time...';
                }
            }
        },
        {
            id: 'gardenSpirit',
            name: 'Garden Spirit',
            description: 'A benevolent presence tends your garden.',
            weight: 7,
            minEnergy: 75000,
            effect: () => {
                const plots = StateManager.get('garden.plots') || [];
                let planted = 0;
                const seeds = ResourceManager.get('seeds');
                
                // Plant in all empty plots (up to 5)
                const plantTypes = ['quantumLily', 'timeTulip', 'energyRose'];
                for (let i = 0; i < plots.length && planted < 5 && seeds > planted; i++) {
                    if (!plots[i].plant) {
                        const plantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
                        if (GeneratorManager.isUnlocked(plantType)) {
                            GardenManager.plant(i, plantType);
                            planted++;
                        }
                    }
                }
                
                if (planted > 0) {
                    UI.renderGarden();
                    return `The spirit planted ${planted} seeds for you! 🌱`;
                }
                // Gift seeds instead
                ResourceManager.add('seeds', 10);
                return 'The spirit gifts you seeds: +10 🌱';
            }
        },
        {
            id: 'echoFromFuture',
            name: 'Echo From the Future',
            description: 'A message arrives from a timeline yet to occur.',
            weight: 4,
            minEnergy: 150000,
            effect: () => {
                const messages = [
                    "You will remember this moment.",
                    "The choice you make next matters.",
                    "In 47 collapses, everything changes.",
                    "They are proud of what you become.",
                    "The garden survives. That's what matters.",
                ];
                const msg = messages[Math.floor(Math.random() * messages.length)];
                setTimeout(() => UI.addLogEntry(`📨 ${msg}`, 'mysterious'), 1000);
                
                const bonus = Math.floor(Math.random() * 500) + 100;
                ResourceManager.add('energy', bonus);
                return `Future echo received: +${bonus} ⚡ and a cryptic message...`;
            }
        },
        {
            id: 'quantumArchaeology',
            name: 'Quantum Archaeology',
            description: 'Fragments of a previous timeline surface.',
            weight: 5,
            minEnergy: 200000,
            requires: { resource: 'knowledge', amount: 100 },
            effect: () => {
                const realityLevel = PrestigeManager.getRealityLevel();
                const bonus = (realityLevel + 1) * 50;
                ResourceManager.add('knowledge', bonus);
                ResourceManager.add('timeCrystals', Math.floor(bonus / 5));
                
                const artifacts = [
                    "a fossilized probability wave",
                    "crystallized observation particles",
                    "a map of gardens that never were",
                    "memories belonging to someone else",
                    "equations written in colors that don't exist",
                ];
                const artifact = artifacts[Math.floor(Math.random() * artifacts.length)];
                return `Discovered ${artifact}: +${bonus} 📚, +${Math.floor(bonus/5)} ⏳`;
            }
        },
        {
            id: 'vacuumDecay',
            name: 'False Vacuum Fluctuation',
            description: 'The universe hiccups. Everything wavers.',
            weight: 3,
            minEnergy: 500000,
            effect: () => {
                // Apply glitch effect
                if (typeof NarrativeSystem !== 'undefined') {
                    NarrativeSystem.triggerGlitch(2000);
                }
                
                // Random gain or loss
                if (Math.random() < 0.7) {
                    const bonus = Math.floor(ResourceManager.get('energy') * 0.15);
                    ResourceManager.add('energy', bonus);
                    return `Reality stabilizes favorably: +${Utils.formatNumber(bonus)} ⚡`;
                } else {
                    const coherence = ResourceManager.get('coherence');
                    ResourceManager.set('coherence', Math.max(50, coherence));
                    return `Reality stabilizes. Coherence restored to safe levels.`;
                }
            }
        },
        {
            id: 'feynmanVisit',
            name: "Feynman's Ghost",
            description: 'The spirit of curiosity visits your garden.',
            weight: 2,
            minEnergy: 1000000,
            effect: () => {
                const quotes = [
                    "Nature uses only the longest threads to weave her patterns.",
                    "What I cannot create, I do not understand.",
                    "The first principle is that you must not fool yourself.",
                    "I learned very early the difference between knowing the name of something and knowing something.",
                ];
                const quote = quotes[Math.floor(Math.random() * quotes.length)];
                setTimeout(() => UI.addLogEntry(`💭 "${quote}" - R.P. Feynman`, 'mysterious'), 1500);
                
                ResourceManager.add('knowledge', 200);
                return `A legendary physicist approves: +200 📚`;
            }
        }
    ];
    
    // Observer Effect: Track what plot the mouse is over
    function setObservedPlot(index) {
        if (observedPlotIndex !== index) {
            observedPlotIndex = index;
            observationTime = 0;
        }
    }
    
    function clearObservedPlot() {
        observedPlotIndex = null;
        observationTime = 0;
        observerFloatTimer = 0;
    }
    
    // Update quantum mechanics each tick
    function update(deltaTime) {
        // Update observation time
        if (observedPlotIndex !== null) {
            observationTime += deltaTime;
            observerFloatTimer += deltaTime;
            
            // Observer effect: Watched plants grow faster
            const plot = StateManager.get(`garden.plots.${observedPlotIndex}`);
            if (plot && plot.plant && plot.progress < 1) {
                // Bonus growth from observation (up to 50% faster, or 75% with Keen Observer)
                const baseObserverBonus = Math.min(0.5, observationTime * 0.1);
                const keenMultiplier = UpgradeManager.isPurchased('keenObserver') ? 1.5 : 1;
                const observerBonus = baseObserverBonus * keenMultiplier;
                
                const data = GameData.generators[plot.plant];
                const growthMult = UpgradeManager.getGrowthMultiplier();
                const bonusGrowth = (1 / data.growthTime) * growthMult * observerBonus * deltaTime;
                
                const newProgress = Math.min(1, plot.progress + bonusGrowth);
                StateManager.set(`garden.plots.${observedPlotIndex}.progress`, newProgress);
                
                // Show floating speed boost text every 0.8 seconds when observer effect is active
                if (observerFloatTimer >= 0.8 && observerBonus > 0.05) {
                    observerFloatTimer = 0;
                    const speedBoost = Math.round(observerBonus * 100);
                    showObserverFloat(observedPlotIndex, `+${speedBoost}%`);

                    // Also boost all entangled partners!
                    const entangledWith = Array.isArray(plot.entangledWith) ? plot.entangledWith : (plot.entangledWith !== null ? [plot.entangledWith] : []);
                    entangledWith.forEach(partnerIndex => {
                        const partner = StateManager.get(`garden.plots.${partnerIndex}`);
                        if (partner && partner.plant && partner.progress < 1) {
                            const partnerData = GameData.generators[partner.plant];
                            const partnerBonusGrowth = (1 / partnerData.growthTime) * growthMult * observerBonus * 0.5 * deltaTime;
                            const partnerNewProgress = Math.min(1, partner.progress + partnerBonusGrowth);
                            StateManager.set(`garden.plots.${partnerIndex}.progress`, partnerNewProgress);

                            // Show reduced boost on entangled partner
                            const partnerBoost = Math.round(observerBonus * 50);
                            showObserverFloat(partnerIndex, `+${partnerBoost}%`, true);
                        }
                    });
                }
            }
        }
        
        // Check for random quantum events
        checkForRandomEvent(deltaTime);
        
        // Check for narrative messages
        checkNarrativeMessages();
        
        // Coherence decay (if unlocked)
        if (ResourceManager.isUnlocked('coherence')) {
            updateCoherence(deltaTime);
        }
    }
    
    function showObserverFloat(plotIndex, text, isEntangled = false) {
        const plotEl = document.querySelector(`.garden-plot[data-index="${plotIndex}"]`);
        if (!plotEl) return;
        
        const floater = document.createElement('div');
        floater.className = 'observer-float' + (isEntangled ? ' entangled-boost' : '');
        floater.textContent = text;
        
        // Random position within the plot
        floater.style.left = (20 + Math.random() * 40) + '%';
        floater.style.top = (30 + Math.random() * 20) + '%';
        
        plotEl.appendChild(floater);
        
        // Remove after animation
        setTimeout(() => floater.remove(), 1000);
    }
    
    function checkForRandomEvent(deltaTime) {
        lastEventTime += deltaTime;
        
        // Quantum events require coherence to occur!
        const coherence = ResourceManager.get('coherence') || 0;
        if (coherence < 20) {
            // No quantum events when coherence is too low
            return;
        }
        
        // Event chance scales with coherence (higher coherence = more events)
        const coherenceBonus = coherence / 100;
        const eventChance = deltaTime * 0.02 * coherenceBonus; // ~2% per second at 100% coherence
        
        if (lastEventTime > 30 && Math.random() < eventChance) {
            triggerRandomEvent();
            lastEventTime = 0;
        }
    }
    
    function triggerRandomEvent() {
        const energy = ResourceManager.get('energy');
        
        // Filter eligible events
        const eligible = quantumEvents.filter(e => {
            if (energy < e.minEnergy) return false;
            if (e.requires) {
                if (e.requires.resource && e.requires.amount) {
                    if (ResourceManager.get(e.requires.resource) < e.requires.amount) return false;
                }
                if (e.requires.unlocked && !ResourceManager.isUnlocked(e.requires.resource)) return false;
            }
            return true;
        });
        
        if (eligible.length === 0) return;
        
        // Weighted random selection
        const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
        let roll = Math.random() * totalWeight;
        
        let selected = null;
        for (const event of eligible) {
            roll -= event.weight;
            if (roll <= 0) {
                selected = event;
                break;
            }
        }
        
        if (selected) {
            showQuantumEvent(selected);
        }
    }
    
    function showQuantumEvent(event) {
        const resultMessage = event.effect();
        
        // Track in stats
        const witnessed = StateManager.get('stats.quantumEventsWitnessed') || 0;
        StateManager.set('stats.quantumEventsWitnessed', witnessed + 1);
        
        // Create event popup - append to resources section instead of center screen
        const popup = document.createElement('div');
        popup.className = 'quantum-event';
        popup.innerHTML = `
            <h3>⚛️ ${event.name}</h3>
            <p>${event.description}</p>
            <p style="color: var(--quantum-green); font-weight: bold; font-size: 0.8rem;">${resultMessage}</p>
            <button onclick="this.parentElement.remove()">OK</button>
        `;
        
        // Append to quantum events container (separate from resources so it doesn't get wiped)
        const eventsContainer = document.getElementById('quantum-events-container');
        if (eventsContainer) {
            eventsContainer.appendChild(popup);
        } else {
            document.body.appendChild(popup);
        }
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (popup.parentElement) {
                popup.style.opacity = '0';
                popup.style.transform = 'scale(0.9)';
                popup.style.transition = 'opacity 0.3s, transform 0.3s';
                setTimeout(() => popup.remove(), 300);
            }
        }, 4000);
        
        events.emit('quantumEvent', event);
    }
    
    function checkNarrativeMessages() {
        const totalEnergy = StateManager.get('resources.energy.total') || 0;
        const shownMessages = StateManager.get('shownNarrativeMessages') || [];
        
        for (const msg of narrativeMessages) {
            // Check if already shown (either in memory or in saved state)
            const alreadyShown = msg.shown || shownMessages.includes(msg.threshold);
            
            if (!alreadyShown && totalEnergy >= msg.threshold) {
                msg.shown = true;
                
                // Save to persistent state
                shownMessages.push(msg.threshold);
                StateManager.set('shownNarrativeMessages', shownMessages);
                
                // Delay slightly for dramatic effect
                setTimeout(() => {
                    UI.addLogEntry(msg.message, 'mysterious');
                }, Math.random() * 3000 + 1000);
            } else if (alreadyShown) {
                // Mark as shown in memory too
                msg.shown = true;
            }
        }
    }
    
    function updateCoherence(deltaTime) {
        // Coherence slowly decays as you play
        const generators = Object.keys(GameData.generators).reduce((sum, id) => {
            return sum + GeneratorManager.getOwned(id);
        }, 0);
        
        // More generators = faster decay (more classical the system becomes)
        let decayRate = 0.01 + (generators * 0.002);
        
        // Apply coherence stabilizer if purchased
        if (UpgradeManager.isPurchased('coherenceStabilizer')) {
            decayRate *= 0.5;
        }
        
        const current = ResourceManager.get('coherence');
        let graceTimer = StateManager.get('coherenceGraceTimer') || 0;
        const wasAtMax = StateManager.get('coherenceWasAtMax') || false;
        
        // Track if we just hit 100% (transition detection)
        if (current >= 100 && !wasAtMax) {
            // Just transitioned to 100% - start grace period
            StateManager.set('coherenceGraceTimer', 0.45); // 450ms grace
            StateManager.set('coherenceWasAtMax', true);
            return;
        }
        
        if (current >= 100) {
            // Still at 100% during grace period
            if (graceTimer > 0) {
                graceTimer -= deltaTime;
                StateManager.set('coherenceGraceTimer', graceTimer);
                return; // Still in grace, no decay
            }
            // Grace expired, allow decay to start
        }
        
        // No longer at max
        if (current < 100) {
            StateManager.set('coherenceWasAtMax', false);
        }
        
        if (current > 0) {
            // Gentle easing near 100% for smoother visual transition
            let easedDecay = decayRate;
            if (current > 99) {
                // 99-100: 30% decay speed
                easedDecay = decayRate * 0.3;
            } else if (current > 98) {
                // 98-99: ramp from 30% to 100%
                const t = (99 - current); // 0 at 99, 1 at 98
                easedDecay = decayRate * (0.3 + t * 0.7);
            }
            
            const newCoherence = Math.max(0, current - easedDecay * deltaTime);
            StateManager.set('resources.coherence.amount', newCoherence);
            
            // Warn at 50% - production starting to drop
            if (current > 50 && newCoherence <= 50) {
                UI.addLogEntry('⚠️ Coherence at 50%: Generator production reduced to 80%', 'warning');
            }
            
            // Warn at 25% - production significantly impacted
            if (current > 25 && newCoherence <= 25) {
                UI.addLogEntry('⚠️ Coherence critical! Production at 70%. Click to restore!', 'warning');
            }
            
            // Warn at 20% - quantum events stop
            if (current > 20 && newCoherence <= 20) {
                UI.addLogEntry('🌀 Quantum events suspended - coherence too low!', 'warning');
            }
            
            // Warn at 10% - entanglement unstable
            if (current > 10 && newCoherence <= 10) {
                UI.addLogEntry('⛓️ Entanglement unstable! Links may break!', 'warning');
            }
            
            if (current > 0 && newCoherence <= 0) {
                UI.addLogEntry('🌀 Coherence depleted! Production at minimum (30%).', 'warning');
                events.emit('coherenceDepleted');
            }
        }
    }
    
    // Calculate superposition yield variance for a plant
    function getSuperpositionYield(generatorId) {
        const data = GameData.generators[generatorId];
        const baseYield = data.harvestYield;
        const coherence = ResourceManager.get('coherence') || 0;
        
        // Higher coherence = more variance (quantum effects)
        // Lower coherence = more predictable (classical)
        const varianceFactor = coherence / 100;
        
        const possibleYields = [];
        
        // Generate 3 possible outcomes
        for (let i = 0; i < 3; i++) {
            const possibleYield = {};
            for (const [resource, amount] of Object.entries(baseYield)) {
                const variance = amount * varianceFactor * 0.5;
                const min = Math.max(1, Math.floor(amount - variance));
                const max = Math.ceil(amount + variance * 2); // Slight positive bias
                possibleYield[resource] = { min, max, expected: amount };
            }
            possibleYields.push(possibleYield);
        }
        
        return possibleYields;
    }
    
    // Collapse superposition and get actual yield
    function collapseYield(generatorId) {
        const data = GameData.generators[generatorId];
        const baseYield = data.harvestYield;
        const coherence = ResourceManager.get('coherence') || 0;
        let varianceFactor = coherence / 100;
        
        // Superposition Mastery increases variance but improves average
        const hasMastery = UpgradeManager.isPurchased('superpositionMastery');
        if (hasMastery) {
            varianceFactor += 0.25;
        }
        
        const actualYield = {};
        
        for (const [resource, amount] of Object.entries(baseYield)) {
            const variance = amount * varianceFactor * 0.5;
            const min = Math.max(1, Math.floor(amount - variance));
            let max = Math.ceil(amount + variance * 2);
            
            // Superposition Mastery also increases max yield
            if (hasMastery) {
                max = Math.ceil(max * 1.2);
            }
            
            // Random within range, weighted toward expected (slightly better with mastery)
            const roll = Math.random();
            const range = max - min;
            const power = hasMastery ? 0.7 : 0.8; // Lower power = more likely to roll high
            actualYield[resource] = Math.floor(min + range * Math.pow(roll, power));
        }
        
        return actualYield;
    }
    
    // Force a quantum event (for testing/special occasions)
    function forceEvent(eventId) {
        const event = quantumEvents.find(e => e.id === eventId);
        if (event) {
            showQuantumEvent(event);
        }
    }
    
    return {
        update,
        setObservedPlot,
        clearObservedPlot,
        getSuperpositionYield,
        collapseYield,
        forceEvent,
        on: events.on
    };
})();

// ============================================
