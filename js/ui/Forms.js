/**
 * Forms UI Controller
 * Generates input fields dynamically.
 * Updated for Light Mode UI
 */

import { INPUT_GROUPS } from '../data/ReferenceData.js';

export class Forms {
    constructor(containerId, changeCallback) {
        this.container = document.getElementById(containerId);
        this.changeCallback = changeCallback;
    }

    render(athlete) {
        this.container.innerHTML = '';

        INPUT_GROUPS.forEach((group, index) => {
            const section = document.createElement('section');
            section.className = 'bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md';
            
            // Header
            const header = document.createElement('div');
            header.className = 'p-4 flex items-center justify-between cursor-pointer bg-white hover:bg-slate-50 transition-colors select-none';
            // Default open the first one
            const isOpen = index === 0;
            
            header.innerHTML = `
                <h3 class="text-sm font-bold text-slate-800 flex items-center">
                    <span class="mr-3 text-lg opacity-80 filter grayscale-[0.2] group-hover:grayscale-0 transition-all">${group.icon}</span> ${group.title}
                </h3>
                <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <svg class="w-3 h-3 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
            `;
            
            // Content
            const content = document.createElement('div');
            content.className = `p-4 pt-0 grid grid-cols-1 gap-4 sm:grid-cols-2 transition-all duration-300 ease-in-out ${isOpen ? 'block' : 'hidden'}`;
            content.style.borderTop = isOpen ? '1px solid #f1f5f9' : 'none'; // slate-100
            
            group.fields.forEach(field => {
                const wrapper = document.createElement('div');
                const value = athlete.getMetric(field.id) || '';
                
                wrapper.innerHTML = `
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1" for="${field.id}">${field.label}</label>
                    <div class="relative group">
                        <input type="number" 
                            id="${field.id}" 
                            step="${field.step}" 
                            placeholder="${field.placeholder}"
                            value="${value}"
                            class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pl-3 pr-8 placeholder-slate-300"
                        >
                        <span class="absolute right-3 top-2 text-xs text-slate-400 font-medium">${field.unit}</span>
                    </div>
                `;
                
                // Event Listener
                const input = wrapper.querySelector('input');
                input.addEventListener('input', (e) => {
                    this.changeCallback(field.id, e.target.value);
                });

                content.appendChild(wrapper);
            });

            // Accordion Toggle Logic
            header.addEventListener('click', () => {
                const isHidden = content.classList.contains('hidden');
                
                if (isHidden) {
                    content.classList.remove('hidden');
                    // Small delay to allow display:block to apply before animating opacity if we were doing that, 
                    // but for now simple class toggle.
                    header.querySelector('svg').classList.add('rotate-180');
                    content.style.borderTop = '1px solid #f1f5f9';
                } else {
                    content.classList.add('hidden');
                    header.querySelector('svg').classList.remove('rotate-180');
                    content.style.borderTop = 'none';
                }
            });

            section.appendChild(header);
            section.appendChild(content);
            this.container.appendChild(section);
        });
    }

    updateValues(athlete) {
        INPUT_GROUPS.forEach(group => {
            group.fields.forEach(field => {
                const el = document.getElementById(field.id);
                if (el) {
                    el.value = athlete.getMetric(field.id) || '';
                }
            });
        });
    }
}