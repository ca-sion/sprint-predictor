<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
      <nav class="flex mb-4" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2">
          <li>
            <router-link to="/" class="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Tableau de bord</router-link>
          </li>
          <li class="flex items-center space-x-2">
            <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            <span class="text-xs font-bold text-slate-900 uppercase tracking-widest">{{ athlete?.name || 'Athlète' }}</span>
          </li>
        </ol>
      </nav>

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 class="text-4xl font-black text-slate-900 tracking-tight mb-4">
            Analyse des <span class="text-blue-600">courses</span>
          </h2>
          
          <!-- Nav Tabs -->
          <div class="flex bg-slate-100 p-1 rounded-xl w-fit">
            <router-link 
              :to="{ path: '/races-analysis', query: { athleteId: athlete?.id } }"
              class="px-6 py-2 rounded-lg text-xs font-black uppercase transition-all text-slate-500 hover:text-slate-700"
            >
              Découpe et liste
            </router-link>
            <router-link 
              :to="{ path: '/races-evolution', query: { athleteId: athlete?.id } }"
              class="px-6 py-2 rounded-lg text-xs font-black uppercase transition-all bg-white text-blue-600 shadow-sm"
            >
              Évolution & comparaison
            </router-link>
          </div>
        </div>

        <!-- Discipline Selector -->
        <div class="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">Discipline</span>
          <div class="flex bg-slate-100 p-1 rounded-xl whitespace-nowrap">
            <button 
              v-for="d in availableDisciplines"
              :key="d.id"
              @click="selectedDiscipline = d.id"
              :class="['px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all', selectedDiscipline === d.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              {{ d.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredRaces.length === 0" class="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
      <p class="text-slate-400 font-bold">Aucune course enregistrée pour cette discipline.</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Comparison Chart (Ghost View) -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
         <div class="flex items-center justify-between mb-6">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Théorie vs Réalité</h3>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full bg-blue-400/50"></div>
                <span class="text-[10px] font-bold text-slate-500 uppercase">Potentiel théorique</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 rounded-full bg-blue-600"></div>
                <span class="text-[10px] font-bold text-slate-500 uppercase">Record virtuel (VB)</span>
              </div>
            </div>
         </div>
         <div class="h-56 w-full relative">
            <canvas ref="comparisonChartCanvas"></canvas>
         </div>
      </div>

      <!-- Controls Toolbar -->
      <div class="flex flex-wrap items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3">
             <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Vue :</span>
             <div class="flex bg-slate-100 p-1 rounded-lg">
                <button @click="layoutMode = 'grid'" :class="['px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all', layoutMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900']">Grille</button>
                <button @click="layoutMode = 'timeline'" :class="['px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all', layoutMode === 'timeline' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900']">Chronologie</button>
             </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Métrique :</span>
            <div class="flex bg-slate-100 p-1 rounded-lg">
              <button 
                v-for="m in metrics" 
                :key="m.id"
                @click="activeMetric = m.id"
                :class="['px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all', activeMetric === m.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900']"
              >
                {{ m.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-6">
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thème :</span>
            <div class="flex bg-slate-100 p-1 rounded-lg">
              <button 
                v-for="(tName, tKey) in THEME_LABELS" 
                :key="tKey"
                @click="activeTheme = tKey"
                :class="['px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all', activeTheme === tKey ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900']"
              >
                {{ tName }}
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tolérance :</span>
            <div class="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
              <input type="range" min="2" max="30" v-model.number="sensitivity" class="w-20 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600">
              <span class="text-[10px] font-black text-slate-600 w-6">{{ sensitivity }}%</span>
            </div>
          </div>

          <div class="flex items-center gap-3 border-l border-slate-200 pl-6 ml-2">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Comparer :</span>
            <select v-model="comparisonRaceId" class="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer">
              <option :value="null">Record Virtuel (VB)</option>
              <option v-for="race in filteredRaces" :key="race.id" :value="race.id">
                {{ formatDate(race.date) }} - {{ race.name || race.discipline }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 1. GRID VIEW -->
      <div v-if="layoutMode === 'grid'" class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div class="flex border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20">
          <div class="w-40 flex-shrink-0 p-4 border-r border-slate-100"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Chrono</span></div>
          <div class="flex-1 flex">
            <div v-for="(seg, idx) in templateSegments" :key="idx" class="flex-1 p-2 border-r border-slate-100 last:border-0 flex items-center justify-center">
              <span class="text-[9px] font-black text-slate-400 uppercase">{{ seg.label }}</span>
            </div>
          </div>
        </div>

        <!-- SPECIAL ROWS: POTENTIAL & VIRTUAL BEST -->
        <div class="divide-y divide-slate-100 bg-slate-50/30">
          
          <!-- A. POTENTIEL THÉORIQUE -->
          <div v-if="potentialRow" class="flex border-b border-blue-100 bg-blue-50/30 relative">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
            <div class="w-40 flex-shrink-0 p-4 border-r border-blue-100 flex flex-col justify-center">
              <span class="text-[9px] font-black text-blue-500 uppercase tracking-tighter mb-1">Potentiel théorique</span>
              <span class="text-xl font-black text-blue-600 tabular-nums">{{ potentialRow.totalTime.toFixed(2) }}s</span>
            </div>
            <div class="flex-1 flex">
              <div v-for="(val, idx) in potentialRow.segments" :key="'pot-'+idx" class="flex-1 border-r border-blue-100/30 last:border-0 p-1">
                <div class="w-full h-full rounded flex items-center justify-center border border-blue-200/50 bg-white/50">
                  <span class="text-xs font-black text-blue-500">{{ formatMetricValue(val) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- B. VIRTUAL BEST (TERRAIN) -->
          <div v-if="virtualBestRow" class="flex border-b border-purple-100 bg-purple-50/30 relative">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-400"></div>
            <div class="w-40 flex-shrink-0 p-4 border-r border-purple-100 flex flex-col justify-center">
              <span class="text-[9px] font-black text-purple-500 uppercase tracking-tighter mb-1">Record Virtuel (VB)</span>
              <span class="text-xl font-black text-purple-600 tabular-nums">
                {{ virtualBestRow.totalTime > 0 ? FormatService.number(virtualBestRow.totalTime) + 's' : '---' }}
              </span>
            </div>
            <div class="flex-1 flex">
              <div v-for="(val, idx) in virtualBestRow.segments" :key="'vb-'+idx" class="flex-1 border-r border-purple-100/30 last:border-0 p-1">
                <div class="w-full h-full rounded flex items-center justify-center border border-purple-200/50 bg-white/50">
                  <span class="text-xs font-black text-purple-500">{{ formatMetricValue(val) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- C. PB REAL ROW -->
          <div v-if="pbRace" class="flex relative z-10 bg-yellow-50/50 border-b-2 border-yellow-200">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
            <div class="w-40 flex-shrink-0 p-4 border-r border-yellow-100 flex flex-col justify-center">
              <div class="flex items-center gap-1 mb-1">
                <span class="text-[8px] font-black bg-yellow-400 text-white px-1.5 py-0.5 rounded shadow-sm">RECORD</span>
                <span class="text-[10px] font-bold text-slate-500">{{ formatDate(pbRace.date) }}</span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-xl font-black text-slate-900 tabular-nums">{{ getRaceTotalTime(pbRace).toFixed(2) }}s</span>
                
                <!-- PB Validation Button (Centralized) -->
                <button v-if="isPotentialNewPB(pbRace)" 
                        @click="manualSyncPB(pbRace)"
                        title="Mettre à jour le record du profil"
                        class="px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase rounded animate-pulse hover:bg-emerald-600 transition-colors">
                  Nouveau PB ?
                </button>
              </div>
            </div>
            <div class="flex-1 flex">
              <div v-for="(tSeg, idx) in templateSegments" :key="'pb-seg-'+idx" class="flex-1 border-r border-yellow-100/50 last:border-0 p-1">
                <div v-if="getRaceSegmentData(pbRace, idx)" 
                    class="w-full h-full rounded flex items-center justify-center border border-yellow-400/30 shadow-inner"
                    :style="getGridCellStyles(pbRace, idx)">
                  <span class="text-xs font-black">{{ formatMetricValue(getRaceSegmentData(pbRace, idx)[activeMetric]) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- D. RÉGULARITÉ TECHNIQUE (CV) -->
          <div v-if="segmentConsistency && filteredRaces.length >= 2" class="flex border-b border-slate-100 bg-slate-50/50 relative">
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
            <div class="w-40 flex-shrink-0 p-4 border-r border-slate-100 flex flex-col justify-center">
              <span class="text-[9px] font-black text-emerald-600 uppercase tracking-tighter mb-1">Régularité (CV)</span>
              <div class="flex items-center gap-1.5">
                 <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                 <span class="text-[10px] font-bold text-slate-400 uppercase">Coeff. de Var.</span>
              </div>
            </div>
            <div class="flex-1 flex h-14">
              <div v-for="(seg, idx) in segmentConsistency" :key="'cons-'+idx" class="flex-1 border-r border-slate-100/50 last:border-0 p-1.5 flex flex-col justify-center items-center">
                <div class="text-[11px] font-black text-slate-800">{{ seg.cv.toFixed(1) }}%</div>
                <div class="w-12 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-1000" 
                       :class="seg.cv < 3 ? 'bg-emerald-500' : (seg.cv < 6 ? 'bg-yellow-500' : 'bg-red-500')"
                       :style="{ width: Math.min(100, (seg.cv / 10) * 100) + '%' }">
                  </div>
                </div>
                <span class="text-[7px] font-black uppercase mt-1" :class="seg.cv < 3 ? 'text-emerald-600' : (seg.cv < 6 ? 'text-yellow-600' : 'text-red-600')">
                  {{ seg.cv < 3 ? 'Stable' : (seg.cv < 6 ? 'Variable' : 'Instable') }}
                </span>
              </div>
            </div>
          </div>
        </div>

      <!-- Sorted Races -->
        <div class="divide-y divide-slate-100">
          <div v-for="race in sortedRaces" :key="race.id" class="flex hover:bg-slate-50 transition-colors group relative">
             <div class="w-40 flex-shrink-0 p-4 border-r border-slate-100 flex flex-col justify-center">
              <span class="text-[10px] font-bold text-slate-500 mb-1 truncate">{{ formatDate(race.date) }}</span>
              <div class="flex items-baseline gap-2 flex-wrap">
                <span class="text-sm font-black text-slate-800 tabular-nums">{{ getRaceTotalTime(race).toFixed(2) }}s</span>
                
                <span v-if="pbRace" :class="['text-[9px] font-bold', getRaceTotalTime(race) > getRaceTotalTime(pbRace) ? 'text-red-500' : 'text-green-500']">
                  {{ formatDiff(getRaceTotalTime(race) - getRaceTotalTime(pbRace)) }}
                </span>
              </div>
            </div>
            <div class="flex-1 flex h-14">
              <div v-for="(tSeg, idx) in templateSegments" :key="idx" class="flex-1 border-r border-slate-100 last:border-0 relative group/cell">
                <div v-if="getRaceSegmentData(race, idx)" 
                     class="w-full h-full transition-all duration-300 flex items-center justify-center relative" 
                     :style="getGridCellStyles(race, idx)">
                   <span class="text-xs font-black">{{ formatMetricValue(getRaceSegmentData(race, idx)[activeMetric]) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. TIMELINE VIEW -->
      <div v-else class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
        <!-- A. POTENTIEL THÉORIQUE (TIMELINE) -->
        <div v-if="potentialRow" class="flex items-center p-4 bg-blue-50/30 relative group border-b border-blue-100">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
          <div class="w-48 flex-shrink-0 pr-6">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[8px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase shadow-sm">TB</span>
            </div>
            <div class="flex items-baseline gap-2">
               <span class="text-2xl font-black text-blue-600 leading-none">{{ potentialRow.totalTime.toFixed(2) }}<span class="text-xs ml-0.5 opacity-40">s</span></span>
               <span v-if="pbRace" class="text-xs font-bold text-blue-500">
                  {{ formatDiff(potentialRow.totalTime - getRaceTotalTime(pbRace)) }}
               </span>
            </div>
            <span class="text-[10px] font-black text-blue-400/80 uppercase tracking-widest block mt-1">Potentiel théorique</span>
          </div>

          <div class="flex-1 relative py-4">
            <div class="flex h-6 w-full bg-blue-100/30 rounded-full overflow-hidden shadow-inner relative z-20 border-2 border-blue-200/50">
              <template v-for="(seg, sIdx) in potentialTimelineSegments" :key="'seg-pot-'+sIdx">
                <div v-if="seg && seg.time > 0"
                    class="h-full relative border-r border-white/60 last:border-0 flex items-center justify-center overflow-hidden"
                    :style="{ 
                      width: (seg.time / maxTotalTime) * 100 + '%',
                      ...getCellStyles(seg[activeMetric], virtualBestTimelineSegments[sIdx]?.[activeMetric], activeMetric)
                    }">
                  <span class="text-[8px] font-black leading-none truncate">{{ formatMetricValue(seg[activeMetric]) }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- B. VIRTUAL BEST (TIMELINE) -->
        <div v-if="virtualBestRow" class="flex items-center p-4 bg-purple-50/30 relative group border-b border-purple-100">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-400"></div>
          <div class="w-48 flex-shrink-0 pr-6">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[8px] font-black bg-purple-500 text-white px-1.5 py-0.5 rounded uppercase shadow-sm">VB</span>
            </div>
            <div class="flex items-baseline gap-2">
               <span class="text-2xl font-black text-purple-600 leading-none">
                 {{ virtualBestRow.totalTime > 0 ? FormatService.number(virtualBestRow.totalTime) : '---' }}
                 <span class="text-xs ml-0.5 opacity-40" v-if="virtualBestRow.totalTime > 0">s</span>
               </span>
               <span v-if="pbRace && virtualBestRow.totalTime > 0" class="text-xs font-bold text-purple-500">
                  {{ formatDiff(virtualBestRow.totalTime - getRaceTotalTime(pbRace)) }}
               </span>
            </div>
            <span class="text-[10px] font-black text-purple-400/80 uppercase tracking-widest block mt-1">Record virtuel</span>
          </div>

          <div class="flex-1 relative py-4">
            <div class="flex h-6 w-full bg-purple-100/30 rounded-full overflow-hidden shadow-inner relative z-20 border-2 border-purple-200/50">
              <template v-for="(seg, sIdx) in virtualBestTimelineSegments" :key="'seg-vb-'+sIdx">
                <div v-if="seg && seg.time > 0"
                    class="h-full relative border-r border-white/60 last:border-0 flex items-center justify-center overflow-hidden"
                    :style="{ 
                      width: (seg.time / maxTotalTime) * 100 + '%',
                      ...getCellStyles(seg[activeMetric], seg[activeMetric], activeMetric)
                    }">
                  <span class="text-[8px] font-black leading-none truncate">{{ formatMetricValue(seg[activeMetric]) }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div v-for="race in [pbRace, ...sortedRaces].filter(r => r)" :key="race.id" 
             :class="['flex items-center p-4 hover:bg-slate-50 transition-all', race.id === pbRace?.id ? 'bg-yellow-50/50' : '']">
          
          <div class="w-48 flex-shrink-0 pr-6">
            <div class="flex items-center gap-2 mb-1">
              <span v-if="race.id === pbRace?.id" class="text-[8px] font-black bg-yellow-400 text-white px-1.5 py-0.5 rounded uppercase">PB</span>
              <span class="text-[10px] font-black text-slate-400 tabular-nums uppercase">{{ formatDate(race.date) }}</span>
            </div>
            <div class="flex items-baseline gap-2">
               <span class="text-2xl font-black text-slate-900 leading-none">{{ getRaceTotalTime(race).toFixed(2) }}<span class="text-xs ml-0.5 opacity-40">s</span></span>
               
               <!-- PB Sync Badge in Timeline -->
               <button v-if="race.id === pbRace?.id && isPotentialNewPB(race)" 
                        @click="manualSyncPB(race)"
                        class="px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase rounded animate-pulse">
                  Nouveau PB ?
                </button>

               <span v-if="race.id !== pbRace?.id" :class="['text-xs font-bold', getRaceTotalTime(race) > getRaceTotalTime(pbRace) ? 'text-red-500' : 'text-green-500']">
                  {{ formatDiff(getRaceTotalTime(race) - getRaceTotalTime(pbRace)) }}
               </span>
            </div>
            <span class="text-[10px] font-bold text-slate-400 truncate block mt-1">{{ race.name || race.discipline }}</span>
          </div>

          <div class="flex-1 relative py-4">
            <!-- Ghost Lines (PB Reference Markers) -->
            <template v-if="pbRace">
              <div v-for="(marker, mIdx) in getPbLinearMarkers()" :key="'marker-'+mIdx" 
                   :class="['absolute top-0 bottom-0 border-l-2 border-dotted z-10', race.id === pbRace?.id ? 'border-slate-900/10' : 'border-slate-900/20']"
                   :style="{ left: marker.percent + '%' }">
                <span class="absolute -bottom-1 -left-4 w-8 text-center text-[7px] font-black text-slate-500 uppercase leading-none">{{ marker.label }}</span>
              </div>
            </template>

            <div class="flex h-6 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner relative z-20 border-2 border-slate-200">
              <template v-for="(seg, sIdx) in getTimelineSegmentsForRace(race)" :key="'seg-'+sIdx">
                <div v-if="seg && seg.time > 0"
                    class="h-full relative transition-all group/timeline border-r border-white/60 last:border-0 flex items-center justify-center overflow-hidden"
                    :style="{ 
                      width: (seg.time / maxTotalTime) * 100 + '%', 
                      ...getCellStyles(seg[activeMetric], virtualBestTimelineSegments[sIdx]?.[activeMetric], activeMetric) 
                    }">
                  <span class="text-[8px] font-black leading-none truncate">{{ formatMetricValue(seg[activeMetric]) }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import Chart from 'chart.js/auto';
import { Race } from '../models/Race.js';
import { Athlete } from '../models/Athlete.js';
import { StorageManager } from '../models/StorageManager.js';
import { PredictionEngine } from '../models/PredictionEngine.js';
import { RaceService } from '../services/RaceService.js';
import { FormatService } from '../services/FormatService.js';
import { getDynamicAnalysisTemplate, getAvailableDisciplines } from '../data/definitions/Disciplines.js';

const athlete = ref(null);
const races = ref([]);
const selectedDiscipline = ref('100m');
const activeMetric = ref('speed');
const activeTheme = ref('indigo');
const sensitivity = ref(10);
const layoutMode = ref('timeline');
const comparisonRaceId = ref(null); // The "Ghost" race to compare against

const THEME_LABELS = {
  indigo: 'Intensité',
  traffic: 'Trafic',
  elite: 'Élite'
};

const COLOR_THEMES = {
  indigo: (score) => {
    const lightness = 96 - (score * 50);
    return { backgroundColor: `hsl(230, 80%, ${lightness}%)`, color: lightness > 65 ? '#1e1b4b' : '#fff' };
  },
  traffic: (score) => {
    const hue = score < 0.5 ? score * 2 * 45 : 45 + (score - 0.5) * 2 * 85;
    return { backgroundColor: `hsl(${hue}, 85%, 65%)`, color: '#1a1a1a' };
  },
  elite: (score) => {
    if (score < 0.7) {
      const s = score / 0.7;
      return { backgroundColor: `hsl(240, 10%, ${95 - s * 20}%)`, color: '#1a1a1a' };
    }
    const s = (score - 0.7) / 0.3;
    const hue = 280 - (s * 40); // Violet to Gold-ish
    return { backgroundColor: `hsl(${hue}, 80%, 60%)`, color: '#fff' };
  }
};

const getCellStyles = (val, ref, metric) => {
  if (val === undefined || val === null || val === 0 || !ref) return { backgroundColor: '#f8fafc', color: '#cbd5e1' };
  
  const isHigherBetter = metric !== 'time';
  const ratio = isHigherBetter ? (val / ref) : (ref / val);
  
  // Adaptive Score Engine
  const minRatio = 1 - (sensitivity.value / 100);
  const normalized = Math.max(0, Math.min(1, (ratio - minRatio) / (1 - minRatio)));
  
  return COLOR_THEMES[activeTheme.value](normalized);
};

const engine = new PredictionEngine();
const prediction = ref(null);
const comparisonChartCanvas = ref(null);
let comparisonChart = null;

const metrics = [
  { id: 'speed', label: 'Vitesse', unit: 'm/s' },
  { id: 'frequency', label: 'Fréq.', unit: 'Hz' },
  { id: 'stepLength', label: 'Ampl.', unit: 'm' },
  { id: 'time', label: 'Temps', unit: 's' }
];

// --- PB SYNC LOGIC (Manual Validation) ---
const isPotentialNewPB = (race) => {
  if (!athlete.value) return false;
  const raceTime = getRaceTotalTime(race);
  if (raceTime <= 0) return false;
  const pbKey = `pb_${selectedDiscipline.value.toLowerCase()}`;
  const profilePB = athlete.value.metrics[pbKey] || 999;
  return raceTime < (profilePB - 0.005);
};

const manualSyncPB = (race) => {
  if (!athlete.value) return;
  const raceTime = getRaceTotalTime(race);
  const pbKey = `pb_${selectedDiscipline.value.toLowerCase()}`;
  athlete.value.metrics[pbKey] = parseFloat(raceTime.toFixed(2));
  athlete.value.save();
  runAnalysis();
  alert(`Record personnel (${selectedDiscipline.value}) mis à jour dans le profil !`);
};

// --- VIRTUAL ROWS LOGIC ---
const potentialRow = computed(() => {
  return RaceService.projectPredictionToSegments(prediction.value, templateSegments.value, activeMetric.value, engine);
});

const pbRow = computed(() => {
  if (!pbRace.value) return null;
  const segments = templateSegments.value.map((t, idx) => {
    const data = getRaceSegmentData(pbRace.value, idx);
    return data ? data[activeMetric.value] : 0;
  });
  return { segments };
});

const virtualBestRow = computed(() => {
  return RaceService.calculateVirtualBest(filteredRaces.value, templateSegments.value, activeMetric.value);
});

const comparisonRow = computed(() => {
  if (!comparisonRaceId.value) return virtualBestRow.value;
  const race = filteredRaces.value.find(r => r.id === comparisonRaceId.value);
  if (!race) return virtualBestRow.value;
  
  const raceInstance = race instanceof Race ? race : new Race(race);
  const segments = raceInstance.calculateIntervals(templateSegments.value).map(s => s ? s[activeMetric.value] : null);
  return {
    totalTime: RaceService.getRaceTotalTime(race),
    segments
  };
});

// New atomic data for chart
const comparisonAtomicSegments = computed(() => {
  const refRace = comparisonRaceId.value 
    ? filteredRaces.value.find(r => r.id === comparisonRaceId.value)
    : null;
  
  if (refRace) {
    const raceInstance = refRace instanceof Race ? refRace : new Race(refRace);
    return raceInstance.calculateIntervals(timelineSegmentsConfig.value);
  }
  return virtualBestTimelineSegments.value;
});

const pbAtomicSegments = computed(() => {
  if (!pbRace.value) return [];
  const raceInstance = pbRace.value instanceof Race ? pbRace.value : new Race(pbRace.value);
  return raceInstance.calculateIntervals(timelineSegmentsConfig.value);
});

const virtualBestSegments = computed(() => comparisonRow.value?.segments || []);

const getPbLinearMarkers = () => {
  if (!pbRace.value) return [];
  let currentTime = 0;
  const raceInstance = pbRace.value instanceof Race ? pbRace.value : new Race(pbRace.value);
  return raceInstance.segmentSpeeds.map(seg => {
    currentTime += seg.time;
    return { label: seg.label, percent: (currentTime / maxTotalTime.value) * 100 };
  });
};

// --- CHART & ENGINE ---
const runAnalysis = () => {
  if (!athlete.value) return;
  try {
    prediction.value = engine.predict(athlete.value, selectedDiscipline.value);
    nextTick(() => renderComparisonChart());
  } catch (e) { console.error(e); }
};

const renderComparisonChart = () => {
  const ctx = comparisonChartCanvas.value?.getContext('2d');
  if (!ctx) return;
  if (comparisonChart) comparisonChart.destroy();
  
  // Use Atomic Segments for clarity
  const labels = timelineSegmentsConfig.value.map(s => s.label);
  const theoryData = potentialTimelineSegments.value.map(s => s ? s[activeMetric.value] : null);
  const comparisonData = comparisonAtomicSegments.value.map(s => s ? s[activeMetric.value] : null);
  const pbData = pbAtomicSegments.value.map(s => s ? s[activeMetric.value] : null);
  
  const currentMetric = metrics.find(m => m.id === activeMetric.value);
  const isGhost = !!comparisonRaceId.value;

  // Find peak theory point for highlighting
  let peakIdx = -1;
  if (activeMetric.value === 'speed' && theoryData.length > 0) {
    const validValues = theoryData.filter(v => v !== null);
    if (validValues.length > 0) {
      const maxVal = Math.max(...validValues);
      peakIdx = theoryData.indexOf(maxVal);
    }
  }

  comparisonChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: `Potentiel théorique (${currentMetric.label})`,
          data: theoryData,
          borderColor: 'rgba(59, 130, 246, 0.4)',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: (ctx) => (ctx.dataIndex === peakIdx ? 6 : 0),
          pointBackgroundColor: '#3b82f6',
          pointBorderWidth: 2,
          pointBorderColor: '#fff',
          zIndex: 1,
          spanGaps: true
        },
        {
          label: `Record (PB)`,
          data: pbData,
          borderColor: '#facc15', 
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#facc15',
          tension: 0.4,
          zIndex: 2,
          spanGaps: true
        },
        {
          label: isGhost ? 'Course Ghost' : 'Record virtuel (VB)',
          data: comparisonData,
          borderColor: isGhost ? '#8b5cf6' : '#2563eb',
          backgroundColor: isGhost ? 'rgba(139, 92, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: isGhost ? '#8b5cf6' : '#2563eb',
          zIndex: 0,
          spanGaps: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: FormatService.chartTooltipConfig({
            mode: 'index',
            intersect: false,
            label: (context) => `${context.dataset.label}: ${FormatService.number(context.raw)}${currentMetric.unit}`
        })
      },
      scales: {
        y: { 
            grid: { color: '#f1f5f9' }, 
            title: { display: true, text: currentMetric.unit, font: { size: 10, weight: 'bold' } },
            beginAtZero: activeMetric.value !== 'speed'
        },
        x: { grid: { display: false } }
      }
    }
  });
};

// --- DATA ACCESS HELPERS ---
const availableDisciplines = computed(() => {
  if (!athlete.value) return [];
  const profileAvailable = getAvailableDisciplines(athlete.value.gender, athlete.value.category);
  const raceIds = new Set(races.value.map(r => r.discipline));
  return profileAvailable.filter(d => raceIds.has(d.id));
});

watch(availableDisciplines, (newVal) => {
    if (newVal.length > 0 && !newVal.find(d => d.id === selectedDiscipline.value)) {
        selectedDiscipline.value = newVal[0].id;
    }
});

const filteredRaces = computed(() => {
  return races.value
    .filter(r => r.discipline === selectedDiscipline.value)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const pbRace = computed(() => {
  const finished = filteredRaces.value.filter(r => getRaceTotalTime(r) > 0);
  if (finished.length === 0) return null;
  // Use a small epsilon for more stable PB detection
  return finished.reduce((prev, curr) => getRaceTotalTime(curr) < getRaceTotalTime(prev) - 0.001 ? curr : prev);
});

const sortedRaces = computed(() => {
  if (!pbRace.value) return filteredRaces.value;
  return filteredRaces.value.filter(r => r.id !== pbRace.value.id);
});

const maxTotalTime = computed(() => {
  const times = filteredRaces.value.map(r => getRaceTotalTime(r)).filter(t => t > 0);
  if (potentialRow.value) times.push(potentialRow.value.totalTime);
  if (virtualBestRow.value) times.push(virtualBestRow.value.totalTime);
  return times.length > 0 ? Math.max(...times) * 1.05 : 15;
});

const templateSegments = computed(() => {
  return getDynamicAnalysisTemplate(selectedDiscipline.value, athlete.value?.gender, athlete.value?.category) || [];
});

const segmentConsistency = computed(() => {
  return RaceService.getSegmentConsistency(filteredRaces.value, templateSegments.value);
});

// New: Atomic segments for consistent timeline alignment
const timelineSegmentsConfig = computed(() => {
  return RaceService.getAtomicSegments(selectedDiscipline.value, templateSegments.value);
});

const potentialTimelineSegments = computed(() => {
  const result = RaceService.projectPredictionToSegments(prediction.value, timelineSegmentsConfig.value, activeMetric.value, engine);
  if (!result) return [];
  
  // We need both the value for the color and the time for the width
  const timeResult = RaceService.projectPredictionToSegments(prediction.value, timelineSegmentsConfig.value, 'time', engine);
  
  return timelineSegmentsConfig.value.map((seg, idx) => ({
      time: timeResult.segments[idx],
      [activeMetric.value]: result.segments[idx]
  }));
});

const virtualBestTimelineSegments = computed(() => {
  const result = RaceService.calculateVirtualBest(filteredRaces.value, timelineSegmentsConfig.value, activeMetric.value);
  if (!result) return [];
  
  // Calculate individual best times for widths
  const timeResult = RaceService.calculateVirtualBest(filteredRaces.value, timelineSegmentsConfig.value, 'time');
  
  return timelineSegmentsConfig.value.map((seg, idx) => ({
      time: timeResult.segments[idx],
      [activeMetric.value]: result.segments[idx]
  }));
});

const getTimelineSegmentsForRace = (race) => {
  const raceInstance = race instanceof Race ? race : new Race(race);
  return raceInstance.calculateIntervals(timelineSegmentsConfig.value);
};

const gridSegmentsCache = new Map();
const getRaceSegmentData = (race, index) => {
  if (!race) return null;
  const key = race.id + selectedDiscipline.value + activeMetric.value;
  if (gridSegmentsCache.has(key)) return gridSegmentsCache.get(key)[index];
  
  const raceInstance = race instanceof Race ? race : new Race(race);
  const calculated = raceInstance.calculateIntervals(templateSegments.value);
  gridSegmentsCache.set(key, calculated);
  return calculated[index];
};

const getLinearSegments = (race) => {
  if (!race) return [];
  const raceInstance = race instanceof Race ? race : new Race(race);
  return raceInstance.segmentSpeeds;
};

const getRaceTotalTime = (race) => {
    return RaceService.getRaceTotalTime(race);
};

const formatValue = (v) => FormatService.number(v);
const formatDiff = (v) => FormatService.diff(v);
const formatMetricValue = (val) => {
    if (activeMetric.value === 'speed') return FormatService.number(val); // Keep numbers in grid
    if (activeMetric.value === 'time') return FormatService.number(val, 3);
    return FormatService.number(val);
};

const getGridCellStyles = (race, index) => {
  const seg = getRaceSegmentData(race, index);
  const refVal = virtualBestSegments.value[index];
  return getCellStyles(seg?.[activeMetric.value], refVal, activeMetric.value);
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' });

watch([selectedDiscipline, activeMetric, athlete, comparisonRaceId], runAnalysis);

const loadInitialData = () => {
  const athleteId = StorageManager.getCurrentAthleteId();
  if (athleteId) {
    const loaded = Athlete.load(athleteId);
    if (loaded) {
      athlete.value = loaded;
      races.value = Race.getByAthlete(athleteId);
      runAnalysis();
    }
  }
};

onMounted(() => {
  loadInitialData();
  window.addEventListener('athlete-updated', loadInitialData);
});
</script>