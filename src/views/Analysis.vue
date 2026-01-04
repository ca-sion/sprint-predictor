<template>
  <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
    
    <!-- Left Column: Inputs -->
    <aside class="lg:col-span-4 space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-1 pb-10">
      
      <!-- Basic Info -->
      <section class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center">
            <span class="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
            Athlète
          </h2>
          <div class="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-100">
            {{ athlete.category }} ({{ athlete.age }} ans)
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Identifiant</label>
            <input type="text" v-model="athlete.name" @change="saveAthlete" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400" placeholder="Ex: Michael">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Année</label>
              <input type="number" v-model.number="athlete.birthYear" @change="saveAthlete" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="2005">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Sexe</label>
              <select v-model="athlete.gender" @change="saveAthlete" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Dynamic Metrics Groups -->
      <div class="space-y-4">
        <section v-for="(group, gIdx) in inputGroups" :key="group.title" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
          <div @click="toggleGroup(gIdx)" class="p-4 flex items-center justify-between cursor-pointer bg-white hover:bg-slate-50 transition-colors select-none">
            <h3 class="text-sm font-bold text-slate-800 flex items-center">
              <span class="mr-3 text-lg opacity-80">{{ group.icon }}</span> {{ group.title }}
            </h3>
            <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <svg class="w-3 h-3 transform transition-transform duration-300" :class="{'rotate-180': openGroups[gIdx]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          
          <div v-show="openGroups[gIdx]" class="p-4 pt-0 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100">
            <div v-for="field in group.fields" :key="field.id">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{{ field.label }}</label>
              <div class="relative group">
                <input type="number" 
                  :step="field.step" 
                  :placeholder="field.placeholder"
                  v-model.number="athlete.metrics[field.id]"
                  @input="saveAthlete"
                  class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pl-3 pr-8 placeholder-slate-300"
                >
                <span class="absolute right-3 top-2 text-xs text-slate-400 font-medium">{{ field.unit }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="pt-2">
        <button @click="runAnalysis" :disabled="calculating" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
          <svg v-if="!calculating" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <svg v-else class="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ calculating ? 'Calcul en cours...' : "Lancer l'Analyse" }}
        </button>
      </div>

    </aside>

    <!-- Right Column: Results -->
    <article class="lg:col-span-8 space-y-6" id="analysis-content">
      
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Prédiction</h2>
            <p class="text-xs text-slate-500">Sélectionnez la discipline cible</p>
          </div>
          <div class="relative">
            <select v-model="targetEvent" @change="runAnalysis" class="appearance-none bg-white border border-slate-300 hover:border-blue-400 rounded-lg pl-4 pr-10 py-2 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer shadow-sm">
              <option value="50m">50m</option>
              <option value="60m">60m</option>
              <option value="50mH">50m Haies</option>
              <option value="60mH">60m Haies</option>
              <option value="100m">100m</option>
              <option value="200m">200m</option>
              <option value="400m">400m</option>
              <option value="100mH">100m Haies (F)</option>
              <option value="110mH">110m Haies (H)</option>
              <option value="400mH">400m Haies</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Main Result Display -->
        <div v-if="prediction" class="p-8 text-center animate-fade-in">
          <div class="inline-flex flex-col items-center">
            <div class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Potentiel Estimé</div>
            <div class="flex items-baseline justify-center gap-3 mt-2">
              <div class="text-7xl font-black text-slate-900 tracking-tighter">{{ FormatService.number(parseFloat(prediction.time)) }}</div>
              <span class="text-4xl font-bold text-slate-400">s</span>
            </div>
            <div class="mt-2 text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">Intervalle ± {{ FormatService.time(prediction.range) }}</div>
          </div>
          
          <div class="mt-6 flex flex-wrap justify-center gap-2">
            <div v-for="tag in prediction.tags" :key="tag" class="group relative inline-block">
              <span class="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 shadow-sm cursor-help hover:bg-blue-100 transition-colors">{{ tag }}</span>
              <div v-if="getGlossaryTerm(tag)" class="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl w-56 z-50 pointer-events-none leading-relaxed font-normal">
                <span class="font-bold block mb-1 text-center border-b border-slate-600 pb-1 text-blue-300 uppercase tracking-tighter">{{ getGlossaryTerm(tag).term }}</span>
                {{ getGlossaryTerm(tag).def }}
                <svg class="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon class="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Placeholder -->
        <div v-else class="py-20 text-center">
          <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h3 class="text-slate-900 font-medium text-lg">Prêt à calculer</h3>
          <p class="text-slate-500 mt-1 max-w-sm mx-auto">Remplissez les formulaires à gauche et lancez l'analyse pour obtenir vos prédictions.</p>
        </div>
      </div>

      <!-- Analysis Content -->
      <div v-if="prediction" class="space-y-6 animate-fade-in">
        
        <!-- Consistency Warnings -->
        <div v-if="prediction.consistency && prediction.consistency.length > 0" class="space-y-2">
          <div v-for="c in prediction.consistency" :key="c.text" 
               class="border px-3 py-2 rounded-lg text-sm flex items-start animate-fade-in"
               :class="c.type === 'anomaly' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'">
            <span class="mr-2 mt-0.5">{{ c.type === 'anomaly' ? '🚨' : '🚀' }}</span>
            <span>{{ c.text }}</span>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div v-for="row in prediction.analysisGrid" :key="row.label" class="p-4 rounded-xl border shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            :class="getStatusClasses(row.status)">
            <div>
              <div class="flex justify-between items-start mb-1">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  {{ row.label }}
                  <div v-if="getGlossaryTerm(row.label)" class="group relative inline-block ml-1">
                    <svg class="w-3 h-3 text-slate-300 cursor-help hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <div class="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl w-48 z-50 pointer-events-none leading-relaxed font-normal">
                        <span class="font-bold block mb-1">{{ getGlossaryTerm(row.label).term }}</span>
                        {{ getGlossaryTerm(row.label).def }}
                        <svg class="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon class="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                    </div>
                  </div>
                </div>
                <div class="text-[10px] font-mono text-slate-400">{{ row.diff }}</div>
              </div>
              <div class="flex items-baseline gap-2 mb-3">
                <div class="text-2xl font-bold text-slate-800 tracking-tight">{{ row.value }}</div>
              </div>
            </div>
            <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
              <span v-if="row.level" class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter" :class="getBadgeClasses(row.status)">{{ row.level }}</span>
              <div class="text-[9px] text-slate-400 font-medium italic text-right leading-tight">Cible: {{ row.target }}</div>
            </div>
          </div>
        </div>

        <!-- Standards Chart -->
        <div v-if="hasStandards" class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center">
            <svg class="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            Positionnement & Courbe des Standards
          </h3>
          <div class="relative h-64 w-full">
            <canvas ref="standardsChartCanvas"></canvas>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Splits Table -->
          <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Découpage de Course</h3>
            <div class="overflow-hidden rounded-lg border border-slate-100">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th class="px-4 py-3">Dist.</th>
                    <th class="px-4 py-3">Temps</th>
                    <th class="px-4 py-3">Split</th>
                    <th class="px-4 py-3">V (m/s)</th>
                  </tr>
                </thead>
                <tbody class="font-mono text-slate-700 divide-y divide-slate-100">
                  <tr v-for="split in analysisSplits" :key="split.distance" class="hover:bg-slate-50 transition-colors">
                    <td class="px-4 py-2.5 font-medium text-slate-600 text-xs">{{ split.label }}</td>
                    <td class="px-4 py-2.5 text-slate-900 font-bold">{{ FormatService.time(split.time) }}</td>
                    <td class="px-4 py-2.5 text-blue-600 font-mono text-xs">{{ split.distance }}</td>
                    <td class="px-4 py-2.5 text-slate-400 text-[10px]">{{ FormatService.speed(split.velocity) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Velocity Chart -->
          <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Courbe de Vitesse</h3>
            <div class="relative h-48 w-full">
              <canvas ref="velocityChartCanvas"></canvas>
            </div>
          </div>

          <!-- FV Profile Chart -->
          <div class="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-sm lg:col-span-2">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Profil Scientifique Force-Vitesse</h3>
              <div v-if="physicsMetrics" class="flex gap-6">
                <div class="text-center">
                  <p class="text-[9px] text-slate-500 uppercase font-black">F0 (N/kg)</p>
                  <p class="text-lg font-bold text-white leading-none">{{ FormatService.number(physicsMetrics.f0) }}</p>
                </div>
                <div class="text-center">
                  <p class="text-[9px] text-slate-500 uppercase font-black">Vmax (m/s)</p>
                  <p class="text-lg font-bold text-blue-400 leading-none">{{ FormatService.number(physicsMetrics.vmax) }}</p>
                </div>
                <div class="text-center">
                  <p class="text-[9px] text-slate-500 uppercase font-black">Pmax (W/kg)</p>
                  <p class="text-lg font-bold text-emerald-400 leading-none">{{ FormatService.number(physicsMetrics.pmax, 1) }}</p>
                </div>
              </div>
            </div>
            <div class="relative h-64 w-full">
              <canvas ref="fvProfileChartCanvas"></canvas>
            </div>
            
            <div v-if="fvInterpretation" class="mt-6 p-4 bg-white/5 rounded-xl border border-white/5 animate-fade-in">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full bg-current" :class="fvInterpretation.color"></span>
                <span class="text-xs font-black uppercase tracking-widest" :class="fvInterpretation.color">{{ fvInterpretation.label }}</span>
              </div>
              <p class="text-sm text-slate-300 leading-snug mb-2">{{ fvInterpretation.description }}</p>
              <div class="flex items-start gap-2 text-[11px] text-slate-500 bg-black/20 p-2 rounded-lg border border-white/5">
                <span class="text-blue-400 font-bold">CONSEIL:</span>
                <span>{{ fvInterpretation.advice }}</span>
              </div>
            </div>

            <p class="mt-4 text-[10px] text-slate-500 italic text-center">Modèle de dynamique Samozino/Morin - Droite de force et parabole de puissance théorique.</p>
          </div>
        </div>

        <!-- Strengths/Weaknesses & Advice -->
        <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Diagnostique Technique</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div class="flex items-center mb-3">
                <div class="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h4 class="font-bold text-slate-900">Points Forts</h4>
              </div>
              <ul class="space-y-2 text-sm text-slate-600 list-inside marker:text-green-500 pl-2">
                <li v-for="s in (analysis?.strengths || [])" :key="s">{{ s }}</li>
              </ul>
            </div>
            <div>
              <div class="flex items-center mb-3">
                <div class="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-2">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <h4 class="font-bold text-slate-900">Axes de Travail</h4>
              </div>
              <ul class="space-y-2 text-sm text-slate-600 list-inside marker:text-orange-500 pl-2">
                <li v-for="w in (analysis?.weaknesses || [])" :key="w">{{ w }}</li>
              </ul>
            </div>
          </div>
          
          <div class="mt-8 pt-6 border-t border-slate-100">
            <h4 class="text-blue-600 font-bold mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              Conseils de Coach
            </h4>
            <div class="space-y-2 text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
              <p v-for="a in (analysis?.advice || [])" :key="a" class="flex items-start">
                <span class="text-blue-500 mr-2">💡</span> {{ a }}
              </p>
            </div>
          </div>
        </div>

      </div>

       <!-- Bibliography -->
       <section class="mt-12 pt-8 text-slate-400 text-xs text-start border-t border-slate-200">
          <h4 class="uppercase tracking-widest font-bold mb-4 opacity-50">Références Scientifiques</h4>
          <ul class="space-y-1 opacity-70">
              <li v-for="ref in bibliography" :key="ref">{{ ref }}</li>
          </ul>
      </section>

      <!-- Glossary Section -->
      <section v-if="citedGlossary.length > 0" class="mt-12 pt-8 text-slate-400 text-xs text-start border-t border-slate-200">
          <h4 class="uppercase tracking-widest font-bold mb-4 opacity-50">Glossaire</h4>
          <ul class="space-y-1 opacity-70">
              <li v-for="item in citedGlossary" :key="item.term">
                  <span class="font-bold text-slate-500">{{ item.term }}:</span> {{ item.def }}
              </li>
          </ul>
      </section>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import { Athlete } from '../models/Athlete.js';
import { PredictionEngine } from '../models/PredictionEngine.js';
import { StorageManager } from '../models/StorageManager.js';
import { CoachingService } from '../services/CoachingService.js';
import { RaceService } from '../services/RaceService.js';
import { FormatService } from '../services/FormatService.js';
import { INPUT_GROUPS } from '../data/definitions/FormConfig.js';
import { ATHLETICS_DATA } from '../data/definitions/Standards.js';
import { GLOSSARY, BIBLIOGRAPHY } from '../data/definitions/Glossary.js';
import { getDynamicAnalysisTemplate } from '../data/definitions/Disciplines.js';

const athlete = ref(new Athlete());
const engine = new PredictionEngine();
const calculating = ref(false);
const targetEvent = ref('100m');
const prediction = ref(null);
const analysis = ref(null);
const inputGroups = INPUT_GROUPS;
const openGroups = ref([false, false, false, false]);
const bibliography = BIBLIOGRAPHY;

const analysisSplits = computed(() => {
  if (!prediction.value) return [];
  const template = getDynamicAnalysisTemplate(targetEvent.value, athlete.value.gender, athlete.value.category);
  const projected = RaceService.projectPredictionToSegments(prediction.value, template, 'speed', engine);
  if (!projected) return [];
  
  // Return segments with their time and speed
  return template.map((t, idx) => {
    // We need to get the time for the segment too
    const timeProjected = RaceService.projectPredictionToSegments(prediction.value, [t], 'time', engine);
    return {
      label: t.label,
      distance: `${t.start}-${t.end}m`,
      time: timeProjected.segments[0],
      velocity: projected.segments[idx]
    };
  });
});

const standardsChartCanvas = ref(null);
const velocityChartCanvas = ref(null);
const fvProfileChartCanvas = ref(null);
const physicsMetrics = ref(null);
const fvInterpretation = ref(null);

let standardsChart = null;
let velocityChart = null;
let fvProfileChart = null;

const loadInitialData = () => {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const sharedData = urlParams.get('share');
  
  if (sharedData) {
    try {
      const data = JSON.parse(atob(sharedData));
      athlete.value = new Athlete(data);
      // Save shared athlete to storage so it appears in the list
      athlete.value.save();
      StorageManager.setCurrentAthlete(athlete.value.id);
      return;
    } catch (e) { console.error("Error decoding shared data", e); }
  }

  const savedId = StorageManager.getCurrentAthleteId();
  if (savedId) {
    const loaded = Athlete.load(savedId);
    if (loaded) athlete.value = loaded;
  }
};

const toggleGroup = (index) => {
  openGroups.value[index] = !openGroups.value[index];
};

const hasStandards = computed(() => {
  const gender = athlete.value.gender || 'M';
  const eventData = ATHLETICS_DATA[targetEvent.value]?.[gender];
  if (!eventData) return false;
  return Object.values(eventData).some(cat => cat && cat.standards);
});

let analysisTimeout = null;
const runAnalysis = () => {
  if (analysisTimeout) clearTimeout(analysisTimeout);
  calculating.value = true;
  
  analysisTimeout = setTimeout(() => {
    try {
      prediction.value = engine.predict(athlete.value, targetEvent.value);
      
      // Use CoachingService for interpretation
      analysis.value = CoachingService.generateAdvice(prediction.value.profile, athlete.value.metrics, athlete.value);
      prediction.value.analysisGrid = CoachingService.generateAnalysisGrid(athlete.value, prediction.value.time, targetEvent.value, prediction.value.profile);
      prediction.value.consistency = CoachingService.analyzeConsistency(prediction.value.time, targetEvent.value, athlete.value.metrics);
      
      // Physics profile
      physicsMetrics.value = CoachingService.getPhysicsProfile(prediction.value.profile);
      fvInterpretation.value = CoachingService.interpretFVProfile(physicsMetrics.value);

      // Wait for Vue to update the DOM (v-if blocks)
      nextTick(() => {
        setTimeout(() => {
          renderCharts();
        }, 50);
      });
    } catch (e) {
      console.error(e);
      alert("Erreur lors du calcul.");
    } finally {
      calculating.value = false;
      analysisTimeout = null;
    }
  }, 400);
};


const saveAthlete = () => {
  athlete.value.save();
  StorageManager.setCurrentAthlete(athlete.value.id);
  runAnalysis();
};

// GLOSSARY LOGIC
const getGlossaryTerm = (text) => {
    const key = Object.keys(GLOSSARY)
        .sort((a, b) => b.length - a.length)
        .find(k => text.toLowerCase().includes(k.toLowerCase()));
    return key ? GLOSSARY[key] : null;
};

const citedGlossary = computed(() => {
    if (!prediction.value) return [];
    
    // Scan all data instead of DOM to be reactive and accurate
    const textsToScan = [
        ...prediction.value.tags,
        ...(prediction.value.consistency?.map(c => c.text) || []),
        ...(prediction.value.analysisGrid?.map(row => row.label + ' ' + (row.obs || '')) || []),
        ...(analysis.value?.strengths || []),
        ...(analysis.value?.weaknesses || []),
        ...(analysis.value?.advice || [])
    ].join(' ').toLowerCase();
    
    return Object.values(GLOSSARY).filter(item => {
        const termLower = item.term.toLowerCase();
        return textsToScan.includes(termLower) || 
               Object.keys(GLOSSARY).some(key => GLOSSARY[key] === item && textsToScan.includes(key.toLowerCase()));
    }).sort((a, b) => a.term.localeCompare(b.term));
});

const renderCharts = () => {
  renderStandardsChart();
  renderVelocityChart();
  renderFVProfileChart();
};

const renderStandardsChart = () => {
  const ctx = standardsChartCanvas.value?.getContext('2d');
  if (!ctx) return;
  if (standardsChart) standardsChart.destroy();

  const categories = ['U16', 'U18', 'U20', 'U23', 'ELITE'];
  const gender = athlete.value.gender;
  const eventData = ATHLETICS_DATA[targetEvent.value]?.[gender];
  
  if (!eventData) return;

  const intl = categories.map(cat => eventData[cat]?.standards?.INTERNATIONAL || null);
  const nat = categories.map(cat => eventData[cat]?.standards?.NATIONAL || null);
  const reg = categories.map(cat => eventData[cat]?.standards?.REGIONAL || null);
  
  // Potential Data Point
  const predData = categories.map(c => (c === athlete.value.category) ? parseFloat(prediction.value.time) : null);
  
  // Record (PB) Data Point
  const pbKey = `pb_${targetEvent.value.toLowerCase()}`;
  const actualPb = athlete.value.metrics[pbKey] || null;
  const pbData = categories.map(c => (c === athlete.value.category) ? actualPb : null);

  standardsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: categories,
      datasets: [
        { label: 'International', data: intl, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', fill: true, tension: 0.3, spanGaps: true },
        { label: 'National', data: nat, borderColor: '#22c55e', borderDash: [5,5], tension: 0.3, spanGaps: true },
        { label: 'Régional', data: reg, borderColor: '#94a3b8', borderDash: [2,2], tension: 0.3, spanGaps: true },
        { label: 'Record (PB)', data: pbData, type: 'scatter', backgroundColor: '#f59e0b', borderColor: '#fff', borderWidth: 2, pointRadius: 7, zIndex: 10 },
        { label: 'Potentiel', data: predData, type: 'scatter', backgroundColor: '#3b82f6', borderColor: '#fff', borderWidth: 2, pointRadius: 7, zIndex: 11 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { 
          y: { 
              reverse: true, 
              grid: { color: '#f1f5f9' },
              title: { display: true, text: "Performance (s)", font: { size: 10 } }
          }, 
          x: { 
              grid: { display: false },
              ticks: { font: { weight: 'bold' } }
          } 
      },
      plugins: { 
          legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10 }, usePointStyle: true } },
          tooltip: {
                backgroundColor: "#ffffff",
                titleColor: "#1e293b",
                bodyColor: "#475569",
                borderColor: "#e2e8f0",
                borderWidth: 1,
                callbacks: {
                  label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}s`,
                },
          }
      }
    }
  });
};

const renderVelocityChart = () => {
  const ctx = velocityChartCanvas.value?.getContext('2d');
  if (!ctx) return;
  if (velocityChart) velocityChart.destroy();

  const splits = prediction.value?.splits || [];
  if (splits.length === 0) return;

  velocityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: splits.map(s => s.distance + 'm'),
      datasets: [{
        label: 'Vitesse (m/s)',
        data: splits.map(s => s.velocity),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.05)',
        borderWidth: 3,
        tension: 0.4,
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
              title: { display: true, text: 'Vitesse (m/s)', font: { size: 9 } }
          }, 
          x: { grid: { display: false } } 
      }
    }
  });
};

const renderFVProfileChart = () => {
  const ctx = fvProfileChartCanvas.value?.getContext('2d');
  if (!ctx || !physicsMetrics.value) return;
  if (fvProfileChart) fvProfileChart.destroy();

  const { f0, vmax, pmax } = physicsMetrics.value;
  
  // Generate data points
  const points = 20;
  const forceData = [];
  const powerData = [];
  const labels = [];

  for (let i = 0; i <= points; i++) {
    const v = (vmax / points) * i;
    const f = f0 * (1 - v / vmax);
    const p = f * v;
    
    labels.push(v.toFixed(1));
    forceData.push(f);
    powerData.push(p);
  }

  fvProfileChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Force (N/kg)',
          data: forceData,
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          borderWidth: 3,
          tension: 0,
          pointRadius: 0,
          yAxisID: 'y'
        },
        {
          label: 'Puissance (W/kg)',
          data: powerData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          title: { display: true, text: 'Vitesse (m/s)', color: '#94a3b8', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#64748b' }
        },
        y: {
          title: { display: true, text: 'Force (N/kg)', color: '#3b82f6', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#3b82f6' },
          min: 0
        },
        y1: {
          position: 'right',
          title: { display: true, text: 'Puissance (W/kg)', color: '#10b981', font: { size: 10 } },
          grid: { display: false },
          ticks: { color: '#10b981' },
          min: 0
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}`
          }
        }
      }
    }
  });
};

const getStatusClasses = (status) => CoachingService.getStatusClasses(status);
const getBadgeClasses = (status) => CoachingService.getBadgeClasses(status);

onMounted(() => {
  loadInitialData();
  if (Object.keys(athlete.value.metrics).length > 0) {
    runAnalysis();
  }
});
</script>