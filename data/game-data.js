const GameData = {
    resources: {
        energy: {
            id: 'energy',
            name: 'Quantum Energy',
            icon: '⚡',
            color: 'text-energy',
            baseAmount: 0,
            unlocked: true,
            description: 'The fundamental force of the quantum garden'
        },
        seeds: {
            id: 'seeds',
            name: 'Seeds',
            icon: '🌱',
            color: 'text-seeds',
            baseAmount: 0,
            unlocked: false,
            unlockAt: { resource: 'energy', amount: 50 },
            description: 'Required to plant in your garden'
        },
        time: {
            id: 'time',
            name: 'Time Crystals',
            icon: '⏳',
            color: 'text-time',
            baseAmount: 0,
            unlocked: false,
            unlockAt: { resource: 'energy', amount: 500 },
            description: 'Crystallized moments of temporal energy'
        },
        knowledge: {
            id: 'knowledge',
            name: 'Quantum Knowledge',
            icon: '📚',
            color: 'text-knowledge',
            baseAmount: 0,
            unlocked: false,
            unlockAt: { resource: 'time', amount: 100 },
            description: 'Understanding of quantum phenomena'
        },
        coherence: {
            id: 'coherence',
            name: 'Coherence',
            icon: '🌀',
            color: 'text-coherence',
            baseAmount: 100,
            maxAmount: 100,
            unlocked: false,
            unlockAt: { resource: 'knowledge', amount: 50 },
            description: 'The stability of your quantum state. Depletes as reality becomes classical.'
        },
        entanglement: {
            id: 'entanglement',
            name: 'Entanglement Threads',
            icon: '🔗',
            color: 'text-entanglement',
            baseAmount: 0,
            unlocked: false,
            unlockAt: { resource: 'knowledge', amount: 100 },
            description: 'Quantum links between plants. Harvest carefully.'
        },
        fragments: {
            id: 'fragments',
            name: 'Reality Fragments',
            icon: '💠',
            color: 'text-fragments',
            baseAmount: 0,
            unlocked: false,
            isPermanent: true, // Survives reality collapse
            description: 'Shards of collapsed realities. Persist across all timelines.'
        }
    },
    
    generators: {
        quantumLily: {
            id: 'quantumLily',
            name: 'Quantum Lily',
            icon: '🌸',
            description: 'A delicate flower that absorbs ambient quantum fluctuations',
            baseCost: { energy: 15 },
            costMultiplier: 1.15,
            production: { energy: 0.5 },
            unlocked: true,
            gardenPlantable: true,
            growthTime: 10, // seconds
            harvestYield: { energy: 5, seeds: 1 }
        },
        timeTulip: {
            id: 'timeTulip',
            name: 'Time Tulip',
            icon: '🌷',
            description: 'Petals that shimmer with temporal energy',
            baseCost: { energy: 100, seeds: 5 },
            costMultiplier: 1.18,
            production: { energy: 2, time: 0.1 },
            unlocked: false,
            unlockAt: { resource: 'energy', amount: 75 },
            gardenPlantable: true,
            growthTime: 30,
            harvestYield: { energy: 20, time: 3, seeds: 2 }
        },
        energyRose: {
            id: 'energyRose',
            name: 'Energy Rose',
            icon: '🌹',
            description: 'Radiates concentrated quantum energy',
            baseCost: { energy: 500, seeds: 15 },
            costMultiplier: 1.2,
            production: { energy: 10 },
            unlocked: false,
            unlockAt: { resource: 'energy', amount: 400 },
            gardenPlantable: true,
            growthTime: 60,
            harvestYield: { energy: 100, seeds: 3 }
        },
        dimensionDaisy: {
            id: 'dimensionDaisy',
            name: 'Dimension Daisy',
            icon: '🌼',
            description: 'Blooms across multiple realities simultaneously',
            baseCost: { energy: 2000, time: 50 },
            costMultiplier: 1.22,
            production: { energy: 25, knowledge: 0.1 },
            unlocked: false,
            unlockAt: { resource: 'time', amount: 30 },
            gardenPlantable: true,
            growthTime: 120,
            harvestYield: { energy: 200, knowledge: 10, entanglement: 1, seeds: 5 }
        },
        voidViolet: {
            id: 'voidViolet',
            name: 'Void Violet',
            icon: '💜',
            description: 'Draws power from the space between spaces. Produces entanglement threads.',
            baseCost: { energy: 10000, knowledge: 25 },
            costMultiplier: 1.25,
            production: { energy: 100, time: 1, entanglement: 0.05 },
            unlocked: false,
            unlockAt: { resource: 'knowledge', amount: 20 },
            gardenPlantable: true,
            growthTime: 300,
            harvestYield: { energy: 1000, time: 50, entanglement: 2, seeds: 10 }
        }
    },
    
    upgrades: {
        // Click Power Upgrades
        efficientClicking: {
            id: 'efficientClicking',
            name: 'Quantum Resonance',
            icon: '✨',
            description: 'Double your click power',
            cost: { energy: 50 },
            effect: { clickPowerMultiplier: 2 },
            unlocked: true,
            purchased: false
        },
        improvedClicking: {
            id: 'improvedClicking',
            name: 'Harmonic Amplification',
            icon: '🔊',
            description: 'Triple your click power',
            cost: { energy: 500 },
            effect: { clickPowerMultiplier: 3 },
            requires: ['efficientClicking'],
            unlocked: false,
            purchased: false
        },
        quantumClicking: {
            id: 'quantumClicking',
            name: 'Quantum Superposition Click',
            icon: '⚛️',
            description: 'Your clicks exist in multiple states. +5 base click power.',
            cost: { energy: 2000, time: 20 },
            effect: { clickPowerBonus: 5 },
            requires: ['improvedClicking'],
            unlocked: false,
            purchased: false
        },

        // Hoverclicker Upgrades
        hoverclickerI: {
            id: 'hoverclickerI',
            name: 'Passive Observation',
            icon: '👀',
            description: 'Hovering over the quantum core generates 2 clicks per second',
            cost: { energy: 10000, time: 500 },
            effect: { hoverClickRate: 2 },
            requires: ['quantumClicking'],
            unlocked: false,
            purchased: false
        },
        hoverclickerII: {
            id: 'hoverclickerII',
            name: 'Active Surveillance',
            icon: '🔍',
            description: 'Hover clicking increased to 5 per second',
            cost: { energy: 100000, time: 2000 },
            effect: { hoverClickRate: 5 },
            requires: ['hoverclickerI'],
            unlocked: false,
            purchased: false
        },
        hoverclickerIII: {
            id: 'hoverclickerIII',
            name: 'Constant Monitoring',
            icon: '📡',
            description: 'Hover clicking increased to 15 per second',
            cost: { energy: 1000000, time: 10000 },
            effect: { hoverClickRate: 15 },
            requires: ['hoverclickerII'],
            unlocked: false,
            purchased: false
        },
        clicklock: {
            id: 'clicklock',
            name: 'Clicklock Protocol',
            icon: '🔒',
            description: 'Auto-clicking continues even without hovering. Effectively an auto-clicker!',
            cost: { energy: 10000000, time: 50000, knowledge: 100 },
            effect: { clicklockEnabled: true },
            requires: ['hoverclickerIII'],
            unlocked: false,
            purchased: false
        },

        // Seed & Garden Upgrades
        seedProduction: {
            id: 'seedProduction',
            name: 'Seed Synthesis',
            icon: '🌱',
            description: 'Unlock seeds and gain 5 to start. Quantum Lilies now produce seeds.',
            cost: { energy: 30 },
            effect: { unlockSeeds: true, grantSeeds: 5 },
            unlocked: true,
            purchased: false
        },
        largerGarden: {
            id: 'largerGarden',
            name: 'Garden Expansion',
            icon: '🌿',
            description: 'Expand your garden to 16 plots',
            cost: { energy: 200, seeds: 20 },
            effect: { gardenSize: 16 },
            requires: ['seedProduction'],
            unlocked: false,
            purchased: false
        },
        fasterGrowth: {
            id: 'fasterGrowth',
            name: 'Temporal Growth',
            icon: '⏱️',
            description: 'Plants grow 25% faster',
            cost: { energy: 1000, time: 15 },
            effect: { growthSpeedMultiplier: 1.25 },
            requires: ['seedProduction'],
            unlocked: false,
            purchased: false
        },
        
        // Production Upgrades
        quantumLilyBoost: {
            id: 'quantumLilyBoost',
            name: 'Lily Enhancement',
            icon: '🌸',
            description: 'Quantum Lilies produce 50% more energy',
            cost: { energy: 100 },
            effect: { generatorBoost: { quantumLily: 1.5 } },
            unlocked: true,
            purchased: false
        },
        timeTulipBoost: {
            id: 'timeTulipBoost',
            name: 'Temporal Bloom',
            icon: '🌷',
            description: 'Time Tulips produce double time crystals',
            cost: { energy: 750, time: 10 },
            effect: { generatorBoost: { timeTulip: 2 } },
            requires: ['quantumLilyBoost'],
            unlocked: false,
            purchased: false
        },
        
        // Time Unlocks
        unlockTime: {
            id: 'unlockTime',
            name: 'Temporal Awareness',
            icon: '⏳',
            description: 'Unlock Time Crystals resource',
            cost: { energy: 250 },
            effect: { unlockResource: 'time' },
            unlocked: false,
            unlockAt: { resource: 'energy', amount: 200 },
            purchased: false
        },
        
        // Observer upgrades
        keenObserver: {
            id: 'keenObserver',
            name: 'Keen Observer',
            icon: '👁️',
            description: 'Plants grow 50% faster while you watch them',
            cost: { energy: 300, knowledge: 10 },
            effect: { observerBonus: 1.5 },
            unlocked: false,
            unlockAt: { resource: 'knowledge', amount: 5 },
            purchased: false
        },
        
        // Quantum upgrades
        superpositionMastery: {
            id: 'superpositionMastery',
            name: 'Superposition Mastery',
            icon: '🎭',
            description: 'Harvest yields have higher variance but better average outcomes',
            cost: { energy: 1500, knowledge: 30 },
            effect: { yieldVarianceBonus: 0.25 },
            unlocked: false,
            unlockAt: { resource: 'knowledge', amount: 20 },
            purchased: false
        },
        coherenceStabilizer: {
            id: 'coherenceStabilizer',
            name: 'Coherence Stabilizer',
            icon: '🌀',
            description: 'Coherence decays 50% slower',
            cost: { energy: 5000, time: 100 },
            effect: { coherenceDecayReduction: 0.5 },
            requires: ['superpositionMastery'],
            unlocked: false,
            purchased: false
        },
        
        // Entanglement upgrades
        entanglementBasics: {
            id: 'entanglementBasics',
            name: 'Quantum Entanglement',
            icon: '🔗',
            description: 'Unlock the ability to entangle plants. Entangled plants share growth and harvests.',
            cost: { energy: 2000, knowledge: 50 },
            effect: { unlockEntanglement: true },
            unlocked: false,
            unlockAt: { resource: 'knowledge', amount: 40 },
            purchased: false
        },
        deepEntanglement: {
            id: 'deepEntanglement',
            name: 'Deep Entanglement',
            icon: '⛓️',
            description: 'Entangled plants boost each other\'s yield by 25%',
            cost: { energy: 10000, entanglement: 10 },
            effect: { entanglementYieldBonus: 0.25 },
            requires: ['entanglementBasics'],
            unlocked: false,
            purchased: false
        },
        quantumWeb: {
            id: 'quantumWeb',
            name: 'Quantum Web',
            icon: '🕸️',
            description: 'Each plant can now have up to 2 entanglement links',
            cost: { energy: 50000, knowledge: 200 },
            effect: { maxEntanglements: 2 },
            requires: ['entanglementBasics'],
            unlocked: false,
            purchased: false
        },
        
        // Automation upgrades
        autoHarvest: {
            id: 'autoHarvest',
            name: 'Quantum Auto-Harvester',
            icon: '🤖',
            description: 'Mature plants are automatically harvested every 10 seconds',
            cost: { energy: 15000, time: 200, knowledge: 100 },
            effect: { autoHarvest: true },
            unlocked: false,
            unlockAt: { resource: 'time', amount: 150 },
            purchased: false
        },
        autoPlant: {
            id: 'autoPlant',
            name: 'Quantum Auto-Planter',
            icon: '🌱',
            description: 'Empty plots automatically plant your most efficient seed',
            cost: { energy: 25000, time: 300, knowledge: 150 },
            effect: { autoPlant: true },
            requires: ['autoHarvest'],
            unlocked: false,
            purchased: false
        },
        
        // Late game multipliers
        quantumResonance: {
            id: 'quantumResonance',
            name: 'Quantum Resonance Field',
            icon: '📡',
            description: 'All generators produce 50% more',
            cost: { energy: 50000, knowledge: 200 },
            effect: { globalProductionMultiplier: 1.5 },
            unlocked: false,
            unlockAt: { resource: 'knowledge', amount: 150 },
            purchased: false
        },
        
        // Garden expansions
        largerGarden2: {
            id: 'largerGarden2',
            name: 'Garden Expansion II',
            icon: '🌳',
            description: 'Expand your garden to 25 plots',
            cost: { energy: 5000, seeds: 50, time: 50 },
            effect: { gardenSize: 25 },
            requires: ['largerGarden'],
            unlocked: false,
            purchased: false
        },
        largerGarden3: {
            id: 'largerGarden3',
            name: 'Infinite Garden',
            icon: '🌌',
            description: 'Expand your garden to 36 plots',
            cost: { energy: 25000, seeds: 100, time: 150 },
            effect: { gardenSize: 36 },
            requires: ['largerGarden2'],
            unlocked: false,
            purchased: false
        },
        
        // PRESTIGE SYSTEM
        realityAwareness: {
            id: 'realityAwareness',
            name: 'Reality Awareness',
            icon: '🔮',
            description: 'Become aware of the fragile nature of reality. Unlocks Reality Collapse (requires 1M+ total energy to earn fragments).',
            cost: { energy: 100000, knowledge: 500, entanglement: 50 },
            effect: { unlockPrestige: true },
            unlocked: false,
            unlockAt: { resource: 'energy', amount: 75000 },
            purchased: false
        },
        
        // Post-prestige upgrades (unlocked by fragments)
        fragmentBoost1: {
            id: 'fragmentBoost1',
            name: 'Echoes of Past Realities',
            icon: '💠',
            description: 'Each Reality Fragment grants +5% base production',
            cost: { fragments: 5 },
            effect: { fragmentProductionBonus: 0.05 },
            unlocked: false,
            unlockAt: { resource: 'fragments', amount: 3 },
            purchased: false,
            persistent: true  // Survives reality collapse
        },
        fragmentBoost2: {
            id: 'fragmentBoost2',
            name: 'Quantum Memory',
            icon: '🧠',
            description: 'Start each reality with 100 energy and 10 seeds',
            cost: { fragments: 10 },
            effect: { startingBonus: { energy: 100, seeds: 10 } },
            requires: ['fragmentBoost1'],
            unlocked: false,
            purchased: false,
            persistent: true
        },
        fragmentBoost3: {
            id: 'fragmentBoost3',
            name: 'Temporal Persistence',
            icon: '⏳',
            description: 'Retain 10% of your Time Crystals through Reality Collapse',
            cost: { fragments: 25 },
            effect: { retainTimePercent: 0.1 },
            requires: ['fragmentBoost2'],
            unlocked: false,
            purchased: false,
            persistent: true
        }
    },
    
    // Initial game state template
    initialState: {
        resources: {
            energy: { amount: 0, total: 0, rate: 0 },
            seeds: { amount: 0, total: 0, rate: 0 },
            time: { amount: 0, total: 0, rate: 0 },
            knowledge: { amount: 0, total: 0, rate: 0 },
            coherence: { amount: 100, total: 100, rate: 0 },
            entanglement: { amount: 0, total: 0, rate: 0 },
            fragments: { amount: 0, total: 0, rate: 0 }
        },
        generators: {},
        upgrades: {},
        achievements: {},
        garden: {
            size: 9, // 3x3 starting
            plots: []
        },
        stats: {
            totalClicks: 0,
            totalEnergyEarned: 0,
            totalPlantsHarvested: 0,
            quantumEventsWitnessed: 0,
            quantumBursts: 0,
            plantsEntangled: 0,
            highCoherenceTime: 0,
            clicksWithManyGens: 0,
            mutationsWitnessed: 0,
            playTime: 0,
            startDate: Date.now()
        },
        settings: {
            notificationsEnabled: true,
            particlesEnabled: true,
            autosaveInterval: 30, // seconds
            autoHarvestEnabled: true,
            autoPlantEnabled: true
        },
        meta: {
            version: '1.0.0',
            lastSave: null
        }
    },
    
    // Achievements
    achievements: {
        // Click achievements
        firstClick: {
            id: 'firstClick',
            name: 'Quantum Awakening',
            description: 'Make your first click',
            icon: '👆',
            check: () => StateManager.get('stats.totalClicks') >= 1
        },
        click100: {
            id: 'click100',
            name: 'Probability Manipulator',
            description: 'Click 100 times',
            icon: '✋',
            check: () => StateManager.get('stats.totalClicks') >= 100
        },
        click1000: {
            id: 'click1000',
            name: 'Wave Function Collapser',
            description: 'Click 1,000 times',
            icon: '🖐️',
            check: () => StateManager.get('stats.totalClicks') >= 1000
        },
        
        // Energy achievements
        energy100: {
            id: 'energy100',
            name: 'Spark of Creation',
            description: 'Accumulate 100 Quantum Energy',
            icon: '⚡',
            check: () => StateManager.get('resources.energy.total') >= 100
        },
        energy10k: {
            id: 'energy10k',
            name: 'Power Surge',
            description: 'Accumulate 10,000 Quantum Energy',
            icon: '💫',
            check: () => StateManager.get('resources.energy.total') >= 10000
        },
        energy1m: {
            id: 'energy1m',
            name: 'Supernova',
            description: 'Accumulate 1,000,000 Quantum Energy',
            icon: '🌟',
            check: () => StateManager.get('resources.energy.total') >= 1000000
        },
        
        // Garden achievements
        firstHarvest: {
            id: 'firstHarvest',
            name: 'First Bloom',
            description: 'Harvest your first plant',
            icon: '🌸',
            check: () => StateManager.get('stats.totalPlantsHarvested') >= 1
        },
        harvest10: {
            id: 'harvest10',
            name: 'Green Thumb',
            description: 'Harvest 10 plants',
            icon: '🌿',
            check: () => StateManager.get('stats.totalPlantsHarvested') >= 10
        },
        harvest100: {
            id: 'harvest100',
            name: 'Master Gardener',
            description: 'Harvest 100 plants',
            icon: '👨‍🌾',
            check: () => StateManager.get('stats.totalPlantsHarvested') >= 100
        },
        fullGarden: {
            id: 'fullGarden',
            name: 'No Empty Plots',
            description: 'Fill every garden plot with a growing plant',
            icon: '🏡',
            check: () => {
                const plots = StateManager.get('garden.plots') || [];
                const size = StateManager.get('garden.size') || 9;
                return plots.length >= size && plots.every(p => p.plant !== null);
            }
        },
        
        // Generator achievements
        firstGenerator: {
            id: 'firstGenerator',
            name: 'Automation Begins',
            description: 'Purchase your first generator',
            icon: '⚙️',
            check: () => {
                return Object.keys(GameData.generators).some(id => 
                    GeneratorManager.getOwned(id) >= 1
                );
            }
        },
        tenLilies: {
            id: 'tenLilies',
            name: 'Lily Pad',
            description: 'Own 10 Quantum Lilies',
            icon: '🌸',
            check: () => GeneratorManager.getOwned('quantumLily') >= 10
        },
        allGenerators: {
            id: 'allGenerators',
            name: 'Biodiversity',
            description: 'Own at least one of every plant type',
            icon: '🌈',
            check: () => {
                return Object.keys(GameData.generators).every(id => 
                    GeneratorManager.getOwned(id) >= 1
                );
            }
        },
        
        // Quantum achievements
        firstEvent: {
            id: 'firstEvent',
            name: 'Quantum Observer',
            description: 'Witness your first quantum event',
            icon: '👁️',
            check: () => StateManager.get('stats.quantumEventsWitnessed') >= 1
        },
        tenEvents: {
            id: 'tenEvents',
            name: 'Reality Bender',
            description: 'Witness 10 quantum events',
            icon: '🔮',
            check: () => StateManager.get('stats.quantumEventsWitnessed') >= 10
        },
        lowCoherence: {
            id: 'lowCoherence',
            name: 'Edge of Classical',
            description: 'Let coherence drop below 10%',
            icon: '⚠️',
            check: () => {
                const coherence = ResourceManager.get('coherence');
                return ResourceManager.isUnlocked('coherence') && coherence < 10;
            }
        },
        
        // Secret achievements
        speedrunner: {
            id: 'speedrunner',
            name: 'Speedrunner',
            description: 'Reach 1000 energy in under 5 minutes',
            icon: '🏃',
            secret: true,
            check: () => {
                const playTime = StateManager.get('stats.playTime') || 0;
                const energy = StateManager.get('resources.energy.total') || 0;
                return energy >= 1000 && playTime < 300;
            }
        },
        patient: {
            id: 'patient',
            name: 'Patience of a Physicist',
            description: 'Play for over an hour',
            icon: '⏰',
            check: () => StateManager.get('stats.playTime') >= 3600
        },
        nightOwl: {
            id: 'nightOwl',
            name: 'Night Owl',
            description: 'Play between midnight and 4 AM',
            icon: '🦉',
            secret: true,
            check: () => {
                const hour = new Date().getHours();
                return hour >= 0 && hour < 4;
            }
        },
        
        // New coherence achievements
        coherenceMaster: {
            id: 'coherenceMaster',
            name: 'Coherence Master',
            description: 'Maintain 90%+ coherence for 5 minutes with 50+ generators',
            icon: '🌀',
            check: () => {
                const generators = Object.keys(GameData.generators).reduce((sum, id) => 
                    sum + GeneratorManager.getOwned(id), 0);
                const coherence = ResourceManager.get('coherence') || 0;
                const highTime = StateManager.get('stats.highCoherenceTime') || 0;
                return generators >= 50 && coherence >= 90 && highTime >= 300;
            }
        },
        zeroCoherence: {
            id: 'zeroCoherence',
            name: 'Completely Classical',
            description: 'Let coherence reach exactly 0%',
            icon: '📉',
            check: () => {
                const coherence = ResourceManager.get('coherence');
                return ResourceManager.isUnlocked('coherence') && coherence <= 0;
            }
        },
        
        // Quantum burst achievements
        firstBurst: {
            id: 'firstBurst',
            name: 'Quantum Surge',
            description: 'Trigger your first Quantum Burst',
            icon: '⚡',
            check: () => StateManager.get('stats.quantumBursts') >= 1
        },
        tenBursts: {
            id: 'tenBursts',
            name: 'Chain Reaction',
            description: 'Trigger 10 Quantum Bursts',
            icon: '💥',
            check: () => StateManager.get('stats.quantumBursts') >= 10
        },
        
        // Entanglement achievements
        firstEntangle: {
            id: 'firstEntangle',
            name: 'Spooky Action',
            description: 'Entangle two plants together',
            icon: '🔗',
            check: () => StateManager.get('stats.plantsEntangled') >= 2
        },
        entangleFive: {
            id: 'entangleFive',
            name: 'Quantum Network',
            description: 'Have 5 pairs of entangled plants simultaneously',
            icon: '🕸️',
            check: () => {
                const plots = StateManager.get('garden.plots') || [];
                // Count total entanglement links (each pair counts as 2 links, so divide by 2)
                const totalLinks = plots.reduce((sum, p) => {
                    const entangled = Array.isArray(p.entangledWith) ? p.entangledWith : (p.entangledWith !== null ? [p.entangledWith] : []);
                    return sum + entangled.length;
                }, 0);
                return totalLinks / 2 >= 5;
            }
        },
        
        // Late-game clicking achievement
        clickerReborn: {
            id: 'clickerReborn',
            name: 'Return to Basics',
            description: 'Click 100 times while owning 100+ generators',
            icon: '🔄',
            secret: true,
            check: () => {
                const generators = Object.keys(GameData.generators).reduce((sum, id) => 
                    sum + GeneratorManager.getOwned(id), 0);
                const clicks = StateManager.get('stats.clicksWithManyGens') || 0;
                return generators >= 100 && clicks >= 100;
            }
        },
        
        // Big numbers
        energy100m: {
            id: 'energy100m',
            name: 'Cosmic Power',
            description: 'Accumulate 100,000,000 Quantum Energy',
            icon: '🌌',
            check: () => StateManager.get('resources.energy.total') >= 100000000
        },
        harvest1000: {
            id: 'harvest1000',
            name: 'Legendary Farmer',
            description: 'Harvest 1,000 plants',
            icon: '🏆',
            check: () => StateManager.get('stats.totalPlantsHarvested') >= 1000
        },
        
        // Mutation achievements
        firstMutation: {
            id: 'firstMutation',
            name: 'Genetic Surprise',
            description: 'Witness your first plant mutation',
            icon: '🧬',
            check: () => StateManager.get('stats.mutationsWitnessed') >= 1
        },
        mutationCollector: {
            id: 'mutationCollector',
            name: 'Mutation Collector',
            description: 'Witness 10 plant mutations',
            icon: '🌈',
            check: () => StateManager.get('stats.mutationsWitnessed') >= 10
        },
        mutationMaster: {
            id: 'mutationMaster',
            name: 'Mutation Master',
            description: 'Witness 50 plant mutations',
            icon: '🧪',
            check: () => StateManager.get('stats.mutationsWitnessed') >= 50
        },
        luckyWinner: {
            id: 'luckyWinner',
            name: 'Lucky Winner',
            description: 'Hit the jackpot in the Quantum Lottery',
            icon: '🎰',
            secret: true,
            check: () => StateManager.get('stats.lotteryJackpot') || false
        },
        
        // Prestige achievements
        firstCollapse: {
            id: 'firstCollapse',
            name: 'Reality Shattered',
            description: 'Collapse reality for the first time',
            icon: '💠',
            check: () => (StateManager.get('stats.totalCollapses') || 0) >= 1
        },
        realityVeteran: {
            id: 'realityVeteran',
            name: 'Reality Veteran',
            description: 'Collapse reality 5 times',
            icon: '🔮',
            check: () => (StateManager.get('stats.totalCollapses') || 0) >= 5
        },
        fragmentHoarder: {
            id: 'fragmentHoarder',
            name: 'Fragment Hoarder',
            description: 'Accumulate 50 Reality Fragments',
            icon: '💎',
            check: () => (ResourceManager.get('fragments') || 0) >= 50
        },
        speedCollapse: {
            id: 'speedCollapse',
            name: 'Speed Collapser',
            description: 'Collapse reality within 30 minutes of a previous collapse',
            icon: '⚡',
            secret: true,
            check: () => {
                // Check if we've collapsed at least twice and the last two were close together
                const totalCollapses = StateManager.get('stats.totalCollapses') || 0;
                const fastCollapse = StateManager.get('stats.fastCollapse') || false;
                return totalCollapses >= 2 && fastCollapse;
            }
        },
        
        // Narrative achievements
        quantumWitness: {
            id: 'quantumWitness',
            name: 'Quantum Witness',
            description: 'Experience 50 quantum events',
            icon: '👁️',
            check: () => (StateManager.get('stats.quantumEventsWitnessed') || 0) >= 50
        },
        storySeeker: {
            id: 'storySeeker',
            name: 'Story Seeker',
            description: 'Unlock 3 major story moments',
            icon: '📖',
            check: () => (StateManager.get('triggeredStories') || []).length >= 3
        },
        theObserver: {
            id: 'theObserver',
            name: 'The Observer',
            description: 'Use the observer effect to grow plants for 10 minutes total',
            icon: '🔭',
            check: () => (StateManager.get('stats.totalObservationTime') || 0) >= 600
        },
        realityBender: {
            id: 'realityBender',
            name: 'Reality Bender',
            description: 'Reach Reality Level 10',
            icon: '🌀',
            secret: true,
            check: () => (StateManager.get('stats.realityLevel') || 0) >= 10
        },
        transcendent: {
            id: 'transcendent',
            name: 'Transcendent',
            description: 'Generate 1 trillion total energy',
            icon: '∞',
            secret: true,
            check: () => StateManager.get('resources.energy.total') >= 1000000000000
        }
    }
};
