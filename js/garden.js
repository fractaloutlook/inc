// MODULE: Garden Manager
// ============================================
const GardenManager = (() => {
    const events = Utils.createEventEmitter();
    let entanglementMode = false;
    let entanglementSource = null;
    let autoHarvestTimer = 0;
    let autoPlantTimer = 0;
    let autoHarvestInProgress = false;
    
    function getPlot(index) {
        return StateManager.get(`garden.plots.${index}`);
    }
    
    function getSize() {
        return StateManager.get('garden.size') || 9;
    }
    
    // Mutation definitions
    const mutations = {
        golden: {
            name: 'Golden',
            icon: '✨',
            color: '#FFD700',
            effect: 'energy',
            multiplier: 2.5,
            description: '2.5× energy yield'
        },
        prismatic: {
            name: 'Prismatic',
            icon: '🌈',
            color: '#FF69B4',
            effect: 'all',
            multiplier: 1.5,
            description: '1.5× all yields'
        },
        temporal: {
            name: 'Temporal',
            icon: '⏰',
            color: '#00CED1',
            effect: 'time',
            multiplier: 3,
            description: '3× time crystal yield'
        },
        void: {
            name: 'Void',
            icon: '🌑',
            color: '#9400D3',
            effect: 'rare',
            multiplier: 2,
            description: '2× knowledge & entanglement'
        },
        crystalline: {
            name: 'Crystalline',
            icon: '💎',
            color: '#E0FFFF',
            effect: 'crystalline',
            multiplier: 2,
            description: '2× time + bonus energy'
        },
        echoing: {
            name: 'Echoing',
            icon: '🔊',
            color: '#7B68EE',
            effect: 'echo',
            multiplier: 1.3,
            description: '1.3× all + grants seeds'
        }
    };
    
    function applyMutationBonus(yields, mutationType) {
        const mutation = mutations[mutationType];
        if (!mutation) return yields;
        
        const result = { ...yields };
        
        switch (mutation.effect) {
            case 'energy':
                if (result.energy) result.energy = Math.floor(result.energy * mutation.multiplier);
                break;
            case 'time':
                if (result.time) result.time = Math.floor(result.time * mutation.multiplier);
                break;
            case 'rare':
                if (result.knowledge) result.knowledge = Math.floor(result.knowledge * mutation.multiplier);
                if (result.entanglement) result.entanglement = Math.floor(result.entanglement * mutation.multiplier);
                break;
            case 'all':
                for (const key in result) {
                    result[key] = Math.floor(result[key] * mutation.multiplier);
                }
                break;
            case 'crystalline':
                // 2× time crystals + bonus energy equal to 50% of time crystals
                if (result.time) {
                    const bonusEnergy = Math.floor(result.time * 0.5);
                    result.time = Math.floor(result.time * mutation.multiplier);
                    result.energy = (result.energy || 0) + bonusEnergy;
                }
                break;
            case 'echo':
                // 1.3× all + grants 1-2 seeds
                for (const key in result) {
                    result[key] = Math.floor(result[key] * mutation.multiplier);
                }
                result.seeds = (result.seeds || 0) + 1 + (Math.random() < 0.3 ? 1 : 0);
                break;
        }
        
        return result;
    }
    
    function getMutationInfo(mutationType) {
        return mutations[mutationType] || null;
    }
    
    function plant(plotIndex, generatorId) {
        const plot = getPlot(plotIndex);
        if (plot.plant) return false;
        
        // Check if we have seeds
        if (ResourceManager.get('seeds') < 1) {
            events.emit('error', 'Not enough seeds!');
            return false;
        }
        
        ResourceManager.spend('seeds', 1);
        
        // Mutation chance! Higher coherence = higher chance
        const coherence = ResourceManager.get('coherence') || 50;
        const mutationChance = 0.02 + (coherence / 100) * 0.08; // 2-10% based on coherence
        const isMutated = Math.random() < mutationChance;
        
        // Mutation type (if mutated) - only assign mutations that benefit this plant!
        let mutation = null;
        if (isMutated) {
            const plantData = GameData.generators[generatorId];
            const yields = plantData.harvestYield || {};
            
            // Build list of valid mutations based on what this plant produces
            const validMutations = ['golden', 'prismatic']; // These always help (energy/all)
            
            // Temporal mutation only helps if plant produces time crystals
            if (yields.time) {
                validMutations.push('temporal');
            }
            
            // Void mutation only helps if plant produces knowledge or entanglement
            if (yields.knowledge || yields.entanglement) {
                validMutations.push('void');
            }
            
            mutation = validMutations[Math.floor(Math.random() * validMutations.length)];
            
            // Track mutation stat
            const mutationsWitnessed = StateManager.get('stats.mutationsWitnessed') || 0;
            StateManager.set('stats.mutationsWitnessed', mutationsWitnessed + 1);
            
            events.emit('mutation', { plotIndex, generatorId, mutation });
        }
        
        // Preserve autoPlantType when planting
        StateManager.set(`garden.plots.${plotIndex}`, {
            plant: generatorId,
            progress: 0,
            plantedAt: Date.now(),
            entangledWith: null,
            autoPlantType: plot.autoPlantType || null,
            mutation: mutation
        });
        
        events.emit('planted', { plotIndex, generatorId, mutation });
        return true;
    }
    
    function harvest(plotIndex) {
        const plot = getPlot(plotIndex);
        if (!plot.plant || plot.progress < 1) return false;
        
        const data = GameData.generators[plot.plant];
        
        // Use quantum collapsed yield instead of fixed yield
        let actualYield = QuantumMechanics.collapseYield(plot.plant);
        
        // Apply mutation bonus!
        if (plot.mutation) {
            actualYield = applyMutationBonus(actualYield, plot.mutation);
        }
        
        // Apply entanglement bonus if applicable
        if (plot.entangledWith !== null && UpgradeManager.isPurchased('deepEntanglement')) {
            for (const resource in actualYield) {
                actualYield[resource] = Math.floor(actualYield[resource] * 1.25);
            }
        }
        
        // Grant harvest yield
        for (const [resource, amount] of Object.entries(actualYield)) {
            ResourceManager.add(resource, amount);
        }
        
        // Handle entangled partner
        const partnerId = plot.entangledWith;
        let partnerYield = null;
        let partnerPlant = null;  // Track partner plant type for logging
        
        if (partnerId !== null) {
            const partner = getPlot(partnerId);
            if (partner && partner.plant && partner.entangledWith === plotIndex) {
                partnerPlant = partner.plant;  // Save before clearing
                
                // Harvest partner too!
                partnerYield = QuantumMechanics.collapseYield(partner.plant);
                
                // Apply partner's mutation bonus if any
                if (partner.mutation) {
                    partnerYield = applyMutationBonus(partnerYield, partner.mutation);
                }
                
                if (UpgradeManager.isPurchased('deepEntanglement')) {
                    for (const resource in partnerYield) {
                        partnerYield[resource] = Math.floor(partnerYield[resource] * 1.25);
                    }
                }
                
                for (const [resource, amount] of Object.entries(partnerYield)) {
                    ResourceManager.add(resource, amount);
                }
                
                // Clear partner plot but PRESERVE autoPlantType
                const partnerAutoPlantType = partner.autoPlantType;
                StateManager.set(`garden.plots.${partnerId}`, {
                    plant: null,
                    progress: 0,
                    plantedAt: null,
                    entangledWith: null,
                    autoPlantType: partnerAutoPlantType || null,
                    mutation: null
                });
            }
        }
        
        // Clear plot but PRESERVE autoPlantType
        const autoPlantType = plot.autoPlantType;
        StateManager.set(`garden.plots.${plotIndex}`, {
            plant: null,
            progress: 0,
            plantedAt: null,
            entangledWith: null,
            autoPlantType: autoPlantType || null
        });
        
        // Update stats
        const harvested = StateManager.get('stats.totalPlantsHarvested') || 0;
        StateManager.set('stats.totalPlantsHarvested', harvested + (partnerYield ? 2 : 1));
        
        events.emit('harvested', { plotIndex, plant: plot.plant, yield: actualYield, partnerYield, partnerPlant, partnerId });
        return { yield: actualYield, partnerYield, partnerPlant, partnerId }; // Return both yields and partner info
    }
    
    function entangle(plotIndex1, plotIndex2) {
        const plot1 = getPlot(plotIndex1);
        const plot2 = getPlot(plotIndex2);
        
        if (!plot1.plant || !plot2.plant) return false;
        if (plot1.entangledWith !== null || plot2.entangledWith !== null) return false;
        if (plotIndex1 === plotIndex2) return false;
        
        // Consume entanglement thread
        if (ResourceManager.get('entanglement') < 1) {
            return false;
        }
        ResourceManager.spend('entanglement', 1);
        
        // Link them
        StateManager.set(`garden.plots.${plotIndex1}.entangledWith`, plotIndex2);
        StateManager.set(`garden.plots.${plotIndex2}.entangledWith`, plotIndex1);
        
        // Track stat
        const entangled = StateManager.get('stats.plantsEntangled') || 0;
        StateManager.set('stats.plantsEntangled', entangled + 2);
        
        events.emit('entangled', { plot1: plotIndex1, plot2: plotIndex2 });
        return true;
    }
    
    function isEntanglementUnlocked() {
        return UpgradeManager.isPurchased('entanglementBasics');
    }
    
    function setEntanglementMode(enabled, sourcePlot = null) {
        entanglementMode = enabled;
        entanglementSource = sourcePlot;
    }
    
    function getEntanglementMode() {
        return { active: entanglementMode, source: entanglementSource };
    }
    
    function update(deltaTime) {
        const plots = StateManager.get('garden.plots') || [];
        const growthMult = UpgradeManager.getGrowthMultiplier();
        
        plots.forEach((plot, index) => {
            if (plot.plant && plot.progress < 1) {
                const data = GameData.generators[plot.plant];
                let growthPerSecond = (1 / data.growthTime) * growthMult;
                
                // Entangled plants share growth progress
                if (plot.entangledWith !== null) {
                    const partner = plots[plot.entangledWith];
                    if (partner && partner.plant) {
                        // Average their growth rates
                        const partnerData = GameData.generators[partner.plant];
                        const partnerRate = (1 / partnerData.growthTime) * growthMult;
                        growthPerSecond = (growthPerSecond + partnerRate) / 2;
                    }
                }
                
                const newProgress = Math.min(1, plot.progress + growthPerSecond * deltaTime);
                StateManager.set(`garden.plots.${index}.progress`, newProgress);
                
                // Sync entangled partner
                if (plot.entangledWith !== null) {
                    StateManager.set(`garden.plots.${plot.entangledWith}.progress`, newProgress);
                }
                
                if (newProgress >= 1 && plot.progress < 1) {
                    events.emit('ready', { plotIndex: index, plant: plot.plant });
                }
            }
        });
        
        // Check for entanglement breaking at very low coherence
        const coherence = ResourceManager.get('coherence') || 100;
        if (coherence < 10) {
            checkEntanglementStability(plots);
        }
        
        // Auto-harvest
        if (UpgradeManager.isPurchased('autoHarvest') && StateManager.get('settings.autoHarvestEnabled') && !autoHarvestInProgress) {
            autoHarvestTimer += deltaTime;
            if (autoHarvestTimer >= 10) {
                autoHarvestTimer = 0;
                autoHarvestAll();
            }
        }
        
        // Auto-plant (only if not in middle of auto-harvest cycle)
        if (UpgradeManager.isPurchased('autoPlant') && StateManager.get('settings.autoPlantEnabled') && !autoHarvestInProgress) {
            autoPlantTimer += deltaTime;
            if (autoPlantTimer >= 5) {
                autoPlantTimer = 0;
                autoPlantAll();
            }
        }
    }
    
    function checkEntanglementStability(plots) {
        // At very low coherence, entanglement can break
        const coherence = ResourceManager.get('coherence') || 0;
        const breakChance = (10 - coherence) * 0.001; // Up to 1% per tick at 0% coherence
        
        plots.forEach((plot, index) => {
            if (plot.entangledWith !== null && Math.random() < breakChance) {
                const partnerId = plot.entangledWith;
                
                // Break the link
                StateManager.set(`garden.plots.${index}.entangledWith`, null);
                StateManager.set(`garden.plots.${partnerId}.entangledWith`, null);
                
                UI.addLogEntry('⚠️ Entanglement collapsed due to low coherence!', 'warning');
                UI.renderGarden();
            }
        });
    }
    
    function autoHarvestAll() {
        const plots = StateManager.get('garden.plots') || [];
        const readyIndices = [];
        
        // Collect indices of all ready plants (in order for left->right, top->bottom)
        plots.forEach((plot, index) => {
            if (plot.plant && plot.progress >= 1) {
                readyIndices.push(index);
            }
        });
        
        if (readyIndices.length === 0) return;
        
        // Set flag to prevent overlapping harvests AND prevent garden re-renders
        autoHarvestInProgress = true;
        
        // Track which plots we've already processed (including via entanglement)
        const alreadyHarvested = new Set();
        
        UI.addLogEntry(`🤖 Auto-harvesting ${readyIndices.length} plant(s)...`, 'success');
        
        let animationStep = 0;
        
        // Process each ready plant in order
        readyIndices.forEach((plotIndex) => {
            // Skip if already harvested (e.g., via entanglement with earlier plant)
            if (alreadyHarvested.has(plotIndex)) return;
            
            const plot = plots[plotIndex];
            const entangledIndex = plot.entangledWith;
            const entangledPlot = entangledIndex !== null ? plots[entangledIndex] : null;
            const entangledIsReady = entangledPlot && entangledPlot.plant && entangledPlot.progress >= 1;
            
            // IMPORTANT: Decide NOW if partner should be harvested (before adding to set)
            const shouldHarvestPartner = entangledIsReady && entangledIndex !== null;
            
            // Mark as harvested BEFORE scheduling (to prevent duplicate processing)
            alreadyHarvested.add(plotIndex);
            if (shouldHarvestPartner) {
                alreadyHarvested.add(entangledIndex);
            }
            
            // Schedule this harvest at the current animation step
            const delay = animationStep * 150;
            
            setTimeout(() => {
                // 1. Remove plant visually and show harvest effect
                harvestPlotVisually(plotIndex);
                
                // If entangled partner is ready, harvest it visually at the SAME time
                if (shouldHarvestPartner) {
                    harvestPlotVisually(entangledIndex);
                }
                
                // 2. Actually harvest (this handles entangled partner internally and clears entanglement state)
                const result = harvest(plotIndex);
                
                // 3. Update entanglement lines (AFTER harvest clears entanglement from state)
                UI.updateEntanglementLines();
                
                // 4. Show floating numbers
                if (result && result.yield) {
                    ResourceGainTracker.showHarvestFloat(plotIndex, result.yield);
                }
                if (result && result.partnerYield && entangledIndex !== null) {
                    ResourceGainTracker.showHarvestFloat(entangledIndex, result.partnerYield);
                }
                
                UI.renderResources();
            }, delay);
            
            animationStep++;
        });
        
        // After all harvesting animations complete, wait then replant all at once
        const totalHarvestTime = animationStep * 150 + 500;
        setTimeout(() => {
            // Check if auto-plant is enabled
            if (UpgradeManager.isPurchased('autoPlant') && StateManager.get('settings.autoPlantEnabled')) {
                autoPlantAll();
            }
            // Full re-render to show planted state (or empty if no auto-plant)
            UI.renderGarden();
            
            // Clear flag - harvest cycle complete
            autoHarvestInProgress = false;
        }, totalHarvestTime);
    }
    
    // Helper: Remove plant visually and show harvest effect
    function harvestPlotVisually(plotIndex) {
        const plotEl = document.querySelector(`.garden-plot[data-index="${plotIndex}"]`);
        if (!plotEl) return;
        
        // Find and REMOVE the plant element entirely (class is 'plot-plant', not 'plant-emoji')
        const plantEl = plotEl.querySelector('.plot-plant');
        if (plantEl) {
            plantEl.remove();
        }
        
        // Also remove the progress bar and timer
        const progressBar = plotEl.querySelector('.plot-progress');
        if (progressBar) {
            progressBar.remove();
        }
        const timer = plotEl.querySelector('.plot-timer');
        if (timer) {
            timer.remove();
        }
        
        // Remove mutation indicator if present
        const mutationIndicator = plotEl.querySelector('.mutation-indicator');
        if (mutationIndicator) {
            mutationIndicator.remove();
        }
        
        // Remove plant-related classes
        plotEl.classList.remove('ready', 'planted', 'mutated', 'entangled');
        plotEl.classList.add('empty');
        
        // Add harvest flash effect
        plotEl.style.transition = 'box-shadow 0.15s ease-out';
        plotEl.style.boxShadow = '0 0 20px var(--quantum-green), inset 0 0 15px rgba(68, 255, 170, 0.3)';
        
        // Clear the flash after a moment
        setTimeout(() => {
            plotEl.style.boxShadow = '';
            plotEl.style.transition = '';
        }, 200);
    }
    
    function autoPlantAll() {
        const plots = StateManager.get('garden.plots') || [];
        const seeds = ResourceManager.get('seeds');
        if (seeds < 1) return;
        
        // Get the currently selected plot (modal open) to skip it
        const modalOpen = document.getElementById('plant-modal')?.classList.contains('active');
        const openPlotIndex = modalOpen ? UI.getSelectedPlotIndex() : -1;
        
        // Find the most efficient unlocked plant (default fallback)
        let defaultPlant = null;
        let bestEfficiency = 0;
        
        Object.entries(GameData.generators).forEach(([id, data]) => {
            if (!data.gardenPlantable) return;
            if (!GeneratorManager.isUnlocked(id)) return;
            
            const energyYield = data.harvestYield.energy || 0;
            const efficiency = energyYield / data.growthTime;
            
            if (efficiency > bestEfficiency) {
                bestEfficiency = efficiency;
                defaultPlant = id;
            }
        });
        
        if (!defaultPlant) return;
        
        let plantedCount = 0;
        for (let i = 0; i < plots.length && ResourceManager.get('seeds') >= 1; i++) {
            // Skip if plot has a plant or modal is open for this plot
            if (plots[i].plant) continue;
            if (i === openPlotIndex) continue;
            
            // Use plot preference if set, otherwise use default
            const preferredPlant = plots[i].autoPlantType;
            let plantToUse = defaultPlant;
            
            if (preferredPlant && GeneratorManager.isUnlocked(preferredPlant)) {
                plantToUse = preferredPlant;
            }
            
            if (plant(i, plantToUse)) {
                plantedCount++;
            }
        }
        
        if (plantedCount > 0) {
            UI.addLogEntry(`🌱 Auto-planted ${plantedCount} plant(s)`, 'highlight');
            UI.renderGarden();
            UI.renderResources();
        }
    }
    
    function expandTo(newSize) {
        const currentSize = getSize();
        if (newSize <= currentSize) return;
        
        const plots = StateManager.get('garden.plots') || [];
        for (let i = currentSize; i < newSize; i++) {
            plots.push({ plant: null, progress: 0, plantedAt: null, entangledWith: null });
        }
        
        StateManager.set('garden.size', newSize);
        StateManager.set('garden.plots', plots);
        events.emit('expanded', newSize);
    }
    
    function getPlantsGrowing() {
        const plots = StateManager.get('garden.plots') || [];
        return plots.filter(p => p.plant && p.progress < 1).length;
    }
    
    function getPlantsReady() {
        const plots = StateManager.get('garden.plots') || [];
        return plots.filter(p => p.plant && p.progress >= 1).length;
    }
    
    function getAutoTimerProgress() {
        return {
            harvest: {
                current: autoHarvestTimer,
                max: 10,
                progress: autoHarvestTimer / 10,
                enabled: UpgradeManager.isPurchased('autoHarvest') && StateManager.get('settings.autoHarvestEnabled')
            },
            plant: {
                current: autoPlantTimer,
                max: 5,
                progress: autoPlantTimer / 5,
                enabled: UpgradeManager.isPurchased('autoPlant') && StateManager.get('settings.autoPlantEnabled')
            }
        };
    }
    
    return {
        getPlot,
        getSize,
        plant,
        harvest,
        entangle,
        isEntanglementUnlocked,
        setEntanglementMode,
        getEntanglementMode,
        getMutationInfo,
        update,
        expandTo,
        getPlantsGrowing,
        getPlantsReady,
        getAutoTimerProgress,
        on: events.on
    };
})();

// ============================================
