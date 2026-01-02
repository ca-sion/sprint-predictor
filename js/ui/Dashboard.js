/**
 * Dashboard UI Controller
 * Handles charts, tables, and result displays.
 */

import { BIBLIOGRAPHY, GLOSSARY, ATHLETICS_DATA } from '../data/ReferenceData.js';

export class Dashboard {
    constructor() {
        this.chartInstance = null;
        this.standardsChartInstance = null;
        this.els = {
            hero: document.getElementById('result-hero'),
            placeholder: document.getElementById('result-placeholder'),
            grid: document.getElementById('analysis-grid'),
            time: document.getElementById('predicted-time'),
            range: document.getElementById('predicted-range'),
            tags: document.getElementById('prediction-tags'),
            splitsBody: document.getElementById('splits-table-body'),
            strengths: document.getElementById('strengths-list'),
            weaknesses: document.getElementById('weaknesses-list'),
            advice: document.getElementById('coach-advice'),
            biblio: document.getElementById('bibliography-list'),
            glossary: document.getElementById('glossary-list'),
            category: document.getElementById('athlete-category-display'),
            stdLegend: document.getElementById('standards-legend')
        };
        
        this.renderBibliography();
        this.renderGlossary();
    }

    renderBibliography() {
        if (!this.els.biblio) return;
        this.els.biblio.innerHTML = BIBLIOGRAPHY.map(ref => 
            `<li>${ref}</li>`
        ).join('');
    }

    renderGlossary() {
        if (!this.els.glossary) return;
        
        // On récupère tout le texte visible de la page pour savoir quels termes sont cités
        const bodyText = document.body.innerText.toLowerCase();
        
        // On filtre le glossaire pour ne garder que ce qui est présent à l'écran
        const citedTerms = Object.values(GLOSSARY).filter(item => {
            const termLower = item.term.toLowerCase();
            // On cherche le terme complet ou sa clé (ex: "Vmax") dans le texte
            return bodyText.includes(termLower) || 
                   Object.keys(GLOSSARY).some(key => GLOSSARY[key] === item && bodyText.includes(key.toLowerCase()));
        });

        if (citedTerms.length === 0) {
            this.els.glossary.innerHTML = '<li class="italic opacity-50">Les termes techniques s\'afficheront ici lors de l\'analyse.</li>';
            return;
        }

        this.els.glossary.innerHTML = citedTerms
            .sort((a, b) => a.term.localeCompare(b.term))
            .map(item => `<li><span class="font-bold text-slate-500">${item.term}:</span> ${item.def}</li>`)
            .join('');
    }

    updateHeader(athlete) {
        if (!this.els.category) return;
        this.els.category.textContent = `${athlete.category} (${athlete.age})`;
    }

    showResults(prediction, analysis, athlete) {
        this.els.placeholder.classList.add('hidden');
        this.els.hero.classList.remove('hidden');
        this.els.grid.classList.remove('hidden'); 
        
        // --- 1. Hero Section ---
        this.els.time.textContent = prediction.time;
        this.els.range.textContent = `Intervalle ± ${prediction.range}s`;
        
        // Tags
        let tagsHtml = '';
        if (prediction.sources && prediction.sources.length > 0) {
            tagsHtml += `<div class="w-full text-center text-xs text-slate-400 mb-2 font-medium italic">Sources: ${prediction.sources.join(', ')}</div>`;
        }
        tagsHtml += prediction.tags.map(tag => {
            // Sort keys by length descending to match most specific terms first
            const termKey = Object.keys(GLOSSARY)
                .sort((a, b) => b.length - a.length)
                .find(key => tag.toLowerCase().includes(key.toLowerCase()));
            
            if (termKey) {
                return `
                <div class="group relative inline-block">
                    <span class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 shadow-sm cursor-help hover:bg-blue-100 transition-colors">${tag}</span>
                    <div class="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl w-56 z-50 pointer-events-none leading-relaxed font-normal">
                        <span class="font-bold block mb-1 text-center border-b border-slate-600 pb-1 text-blue-300 uppercase tracking-tighter">${GLOSSARY[termKey].term}</span>
                        ${GLOSSARY[termKey].def}
                        <svg class="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon class="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                    </div>
                </div>`;
            }
            return `<span class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 shadow-sm">${tag}</span>`;
        }).join('');
        this.els.tags.innerHTML = tagsHtml;

        // --- 2. Alerts & Messages ---
        let messageHtml = '';
        if (prediction.warnings && prediction.warnings.length > 0) {
            messageHtml += prediction.warnings.map(w => 
                `<div class="bg-amber-50 border-l-4 border-amber-400 text-amber-800 p-3 mb-3 text-sm rounded-r flex items-start animate-fade-in"><span class="mr-2">⚠️</span><span>${w}</span></div>`
            ).join('');
        }

        if (prediction.consistency && prediction.consistency.length > 0) {
             messageHtml += '<div class="space-y-2 mb-6">';
             messageHtml += prediction.consistency.map(c => {
                 let color = 'bg-slate-50 text-slate-700 border-slate-200';
                 let icon = 'ℹ️';
                 if(c.type === 'anomaly') { color = 'bg-red-50 text-red-800 border-red-200'; icon = '🚨'; }
                 if(c.type === 'opportunity') { color = 'bg-emerald-50 text-emerald-800 border-emerald-200'; icon = '🚀'; }
                 return `<div class="${color} border px-3 py-2 rounded-lg text-sm flex items-start animate-fade-in"><span class="mr-2 mt-0.5">${icon}</span><span>${c.text}</span></div>`;
             }).join('');
             messageHtml += '</div>';
        }

        // --- 3. Analysis Grid (Cards) ---
        let cardsContainer = document.getElementById('cards-container');
        if (!cardsContainer) {
            cardsContainer = document.createElement('div');
            cardsContainer.id = 'cards-container';
            cardsContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6';
            this.els.grid.prepend(cardsContainer);
        } else {
            cardsContainer.innerHTML = '';
        }

        if (prediction.analysisGrid && prediction.analysisGrid.length > 0) {
             cardsContainer.innerHTML = prediction.analysisGrid.map(row => {
                 let statusStyle = 'border-slate-200 bg-white';
                 let badgeStyle = 'bg-slate-100 text-slate-600';
                 let diffStyle = 'text-slate-400';
                 let icon = '';

                 if (row.status === 'excellent') { 
                     statusStyle = 'border-purple-200 bg-purple-50/30'; badgeStyle = 'bg-purple-600 text-white'; diffStyle = 'text-purple-600 font-bold'; icon = '🌟';
                 } else if (row.status === 'good') { 
                     statusStyle = 'border-emerald-200 bg-emerald-50/30'; badgeStyle = 'bg-emerald-600 text-white'; diffStyle = 'text-emerald-600 font-bold'; icon = '✅';
                 } else if (row.status === 'bad') { 
                     statusStyle = 'border-red-200 bg-red-50/30'; badgeStyle = 'bg-red-600 text-white'; diffStyle = 'text-red-600 font-bold'; icon = '⚠️';
                 }

                 // Tooltip Logic
                 let tooltipHtml = '';
                 const termKey = Object.keys(GLOSSARY).find(key => row.label.includes(key));
                 if (termKey) {
                     tooltipHtml = `
                     <div class="group relative inline-block ml-1">
                        <svg class="w-3 h-3 text-slate-300 cursor-help hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <div class="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl w-48 z-50 pointer-events-none leading-relaxed">
                            <span class="font-bold block mb-1">${GLOSSARY[termKey].term}</span>
                            ${GLOSSARY[termKey].def}
                            <svg class="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon class="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                        </div>
                     </div>`;
                 }

                 return `
                 <div class="p-4 rounded-xl border ${statusStyle} shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                        <div class="flex justify-between items-start mb-1">
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                                ${row.label} ${tooltipHtml}
                            </div>
                            <div class="text-[10px] font-mono ${diffStyle}">${row.diff}</div>
                        </div>
                        <div class="flex items-baseline gap-2 mb-3">
                            <div class="text-2xl font-bold text-slate-800 tracking-tight">${row.value}</div>
                            ${icon ? `<span class="text-sm">${icon}</span>` : ''}
                        </div>
                    </div>
                    <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                        ${row.level ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${badgeStyle}">${row.level}</span>` : '<span></span>'}
                        <div class="text-[9px] text-slate-400 font-medium italic text-right leading-tight">Cible: ${row.target}</div>
                    </div>
                 </div>`;
             }).join('');
        }

        // --- 4. Standards Chart ---
        const event = document.getElementById('target-event').value;
        this.renderStandardsComparisonChart(event, athlete, parseFloat(prediction.time));

        // --- 5. Coach Advice ---
        this.els.advice.innerHTML = messageHtml;
        if (analysis.advice.length > 0) {
            this.els.advice.innerHTML += analysis.advice.map(a => `<p class="mb-2 last:mb-0 flex items-start"><span class="text-blue-500 mr-2">💡</span><span>${a}</span></p>`).join('');
        } else {
             this.els.advice.innerHTML += "<p class='text-slate-400 italic text-center py-4'>Saisissez plus de tests pour des conseils personnalisés.</p>";
        }

        // --- 6. Splits Table & Velocity Chart ---
        this.renderSplitsTable(prediction.splits);
        this.renderVelocityChart(prediction.splits);

        // Analysis Lists
        this.els.strengths.innerHTML = analysis.strengths.map(s => `<li>${s}</li>`).join('') || '<li class="text-slate-400 italic text-xs">Analyse en attente...</li>';
        this.els.weaknesses.innerHTML = analysis.weaknesses.map(w => `<li>${w}</li>`).join('') || '<li class="text-slate-400 italic text-xs">Analyse en attente...</li>';

        // Update Glossary to catch terms cited in analysis
        this.renderGlossary();
    }

    renderSplitsTable(splits) {
        if (!splits || splits.length === 0) {
            this.els.splitsBody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-slate-400 italic">Splits non disponibles</td></tr>`;
            return;
        }
        this.els.splitsBody.innerHTML = splits.map(split => `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                <td class="px-4 py-2.5 font-medium text-slate-600 text-xs">${split.distance}m</td>
                <td class="px-4 py-2.5 text-slate-900 font-bold">${split.time.toFixed(2)}</td>
                <td class="px-4 py-2.5 text-blue-600 font-mono text-xs">${split.segmentTime.toFixed(2)}</td>
                <td class="px-4 py-2.5 text-slate-400 text-[10px] font-medium">${split.velocity.toFixed(2)}</td>
            </tr>
        `).join('');
    }

    renderStandardsComparisonChart(event, athlete, predictedTime) {
        const canvas = document.getElementById('standards-chart');
        if (!canvas) return;
        
        if (this.standardsChartInstance) this.standardsChartInstance.destroy();

        const gender = athlete.gender;
        const eventData = ATHLETICS_DATA[event]?.[gender];
        
        if (!eventData) {
            document.getElementById('standards-chart-container').classList.add('hidden');
            return;
        }
        document.getElementById('standards-chart-container').classList.remove('hidden');

        // Prepare X-axis (Categories)
        const categories = ['U16', 'U18', 'U20', 'U23', 'ELITE'];
        
        // Datasets
        const intl = [];
        const nat = [];
        const reg = [];
        
        categories.forEach(cat => {
            const std = eventData[cat]?.standards;
            intl.push(std?.INTERNATIONAL || null);
            nat.push(std?.NATIONAL || null);
            reg.push(std?.REGIONAL || null);
        });

        // Athlete's PB for this event
        const pbKey = `pb_${event.toLowerCase()}`;
        const actualPb = athlete.metrics[pbKey] || null;
        const pbData = categories.map(c => (c === athlete.category) ? actualPb : null);
        
        // Athlete's Prediction Point
        const predData = categories.map(c => (c === athlete.category) ? predictedTime : null);

        this.standardsChartInstance = new Chart(canvas.getContext("2d"), {
          type: "line",
          data: {
            labels: categories,
            datasets: [
              {
                label: "International (Red Curve)",
                data: intl,
                borderColor: "#ef4444", // Red
                backgroundColor: "rgba(239, 68, 68, 0.05)",
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: "#ef4444",
                tension: 0.3,
                fill: true,
                spanGaps: true,
              },
              {
                label: "National",
                data: nat,
                backgroundColor: "#22c55e", // Emerald
                borderColor: "#22c55e", // Emerald
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 1,
                tension: 0.3,
                fill: false,
                spanGaps: true,
              },
              {
                label: "Régional",
                data: reg,
                borderColor: "#94a3b8", // Slate
                borderWidth: 1,
                borderDash: [2, 2],
                pointRadius: 1,
                tension: 0.3,
                fill: false,
                spanGaps: true,
              },
              {
                label: "Record (PB)",
                data: pbData,
                type: "scatter",
                backgroundColor: "#f59e0b", // Amber
                borderColor: "#fff",
                borderWidth: 2,
                pointRadius: 7,
                pointHoverRadius: 9,
                zIndex: 10,
              },
              {
                label: "Potentiel estimé",
                data: predData,
                type: "scatter",
                backgroundColor: "#3b82f6", // Blue
                borderColor: "#fff",
                borderWidth: 2,
                pointRadius: 7,
                pointHoverRadius: 11,
                zIndex: 11,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                reverse: true, // Lower time is higher performance
                grid: { color: "#f1f5f9" },
                ticks: { font: { size: 10 } },
                title: { display: true, text: "Performance (s)", font: { size: 10, weight: "bold" } },
              },
              x: {
                grid: { display: false },
                ticks: { font: { size: 10, weight: "bold" } },
              },
            },
            plugins: {
              legend: {
                position: "bottom",
                labels: { boxWidth: 8, font: { size: 10 }, usePointStyle: true },
              },
              tooltip: {
                backgroundColor: "#ffffff",
                titleColor: "#1e293b",
                bodyColor: "#475569",
                borderColor: "#e2e8f0",
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}s`,
                },
              },
            },
          },
        });
    }

    renderVelocityChart(splits) {
        const ctx = document.getElementById('velocity-chart').getContext('2d');
        if (this.chartInstance) this.chartInstance.destroy();
        if (!splits || splits.length === 0) return;

        let labels = splits.map(s => s.distance + 'm');
        let data = splits.map(s => s.velocity);

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vitesse (m/s)',
                    data: data,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#2563eb',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        grid: { color: '#f1f5f9' }, 
                        ticks: { font: { size: 10 } },
                        title: { display: true, text: 'Vitesse (m/s)', font: { size: 9 } }
                    },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }
}