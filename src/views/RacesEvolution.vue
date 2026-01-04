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
        <div class="flex items-center gap-3">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">Discipline</span>
          <div class="flex bg-slate-100 p-1 rounded-xl">
            <button 
              v-for="d in availableDisciplines"
              :key="d"
              @click="selectedDiscipline = d"
              :class="['px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all', selectedDiscipline === d ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
            >
              {{ d }}
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
                <span class="text-[10px] font-bold text-slate-500 uppercase">Potentiel</span>
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
              <span class="text-[9px] font-black text-blue-500 uppercase tracking-tighter mb-1">Potentiel (Théorie)</span>
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
              <span class="text-xl font-black text-purple-600 tabular-nums">{{ virtualBestRow.totalTime.toFixed(2) }}s</span>
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
              <span class="text-xl font-black text-slate-900 tabular-nums">{{ getRaceTotalTime(pbRace).toFixed(2) }}s</span>
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
        </div>

        <!-- Sorted Races -->
        <div class="divide-y divide-slate-100">
          <div v-for="race in sortedRaces" :key="race.id" class="flex hover:bg-slate-50 transition-colors group relative">
             <div class="w-40 flex-shrink-0 p-4 border-r border-slate-100 flex flex-col justify-center">
              <span class="text-[10px] font-bold text-slate-500 mb-1 truncate">{{ formatDate(race.date) }}</span>
              <div class="flex items-baseline gap-2 flex-wrap">
                <span class="text-sm font-black text-slate-800 tabular-nums">{{ getRaceTotalTime(race).toFixed(2) }}s</span>
                
                <!-- PB Validation Button -->
                <button v-if="isPotentialNewPB(race)" 
                        @click="manualSyncPB(race)"
                        title="Mettre à jour le record du profil"
                        class="px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase rounded animate-pulse hover:bg-emerald-600 transition-colors">
                  Nouveau PB ?
                </button>

                <span v-if="pbRace && !isPotentialNewPB(race)" :class="['text-[9px] font-bold', getRaceTotalTime(race) > getRaceTotalTime(pbRace) ? 'text-red-500' : 'text-green-500']">
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
              <span class="text-[8px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase shadow-sm">Théorie</span>
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
              <div v-for="(seg, sIdx) in potentialTimelineSegments" :key="'seg-pot-'+sIdx"
                   class="h-full relative border-r border-white/60 last:border-0 flex items-center justify-center overflow-hidden"
                   :style="{ 
                     width: (seg.time / maxTotalTime) * 100 + '%',
                     ...getCellStyles(seg[activeMetric], virtualBestTimelineSegments[sIdx]?.[activeMetric], activeMetric)
                   }">
                <span class="text-[8px] font-black leading-none truncate">{{ formatMetricValue(seg[activeMetric]) }}</span>
              </div>
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
               <span class="text-2xl font-black text-purple-600 leading-none">{{ virtualBestRow.totalTime.toFixed(2) }}<span class="text-xs ml-0.5 opacity-40">s</span></span>
               <span v-if="pbRace" class="text-xs font-bold text-purple-500">
                  {{ formatDiff(virtualBestRow.totalTime - getRaceTotalTime(pbRace)) }}
               </span>
            </div>
            <span class="text-[10px] font-black text-purple-400/80 uppercase tracking-widest block mt-1">Record Virtuel (Terrain)</span>
          </div>

          <div class="flex-1 relative py-4">
            <div class="flex h-6 w-full bg-purple-100/30 rounded-full overflow-hidden shadow-inner relative z-20 border-2 border-purple-200/50">
              <div v-for="(seg, sIdx) in virtualBestTimelineSegments" :key="'seg-vb-'+sIdx"
                   class="h-full relative border-r border-white/60 last:border-0 flex items-center justify-center overflow-hidden"
                   :style="{ 
                     width: (seg.time / maxTotalTime) * 100 + '%',
                     ...getCellStyles(seg[activeMetric], seg[activeMetric], activeMetric)
                   }">
                <span class="text-[8px] font-black leading-none truncate">{{ formatMetricValue(seg[activeMetric]) }}</span>
              </div>
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
              <div v-for="(seg, sIdx) in getTimelineSegmentsForRace(race)" :key="'seg-'+sIdx"
                   class="h-full relative transition-all group/timeline border-r border-white/60 last:border-0 flex items-center justify-center overflow-hidden"
                   :style="{ 
                     width: (seg.time / maxTotalTime) * 100 + '%', 
                     ...getCellStyles(seg[activeMetric], virtualBestTimelineSegments[sIdx]?.[activeMetric], activeMetric) 
                   }">
                <span class="text-[8px] font-black leading-none truncate">{{ formatMetricValue(seg[activeMetric]) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import Chart from 'chart.js/auto';
import { Race } from '../models/Race.js';
import { Athlete } from '../models/Athlete.js';
import { PredictionEngine } from '../models/PredictionEngine.js';
import { getDynamicAnalysisTemplate } from '../data/ReferenceData.js';

const athlete = ref(null);
const races = ref([]);
const selectedDiscipline = ref('100m');
const activeMetric = ref('speed');
const activeTheme = ref('indigo');
const sensitivity = ref(10);
const layoutMode = ref('timeline');

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
  if (!val || !ref) return { backgroundColor: '#f8fafc', color: '#cbd5e1' };
  
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
  { id: 'speed', label: 'Vitesse' },
  { id: 'frequency', label: 'Fréq.' },
  { id: 'stepLength', label: 'Ampl.' },
  { id: 'time', label: 'Temps' }
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
  if (!prediction.value) return null;
  
  const theorySegments = templateSegments.value.map(t => {
    const match = prediction.value.splits.find(ts => Math.abs(ts.distance - t.end) < 5);
    if (!match) return 0;
    
    if (activeMetric.value === 'speed') return match.velocity;
    if (activeMetric.value === 'time') return match.segmentTime;
    return 0;
  });

  return {
    totalTime: parseFloat(prediction.value.time),
    segments: theorySegments
  };
});

const virtualBestRow = computed(() => {
  if (!filteredRaces.value.length) return null;
  
  // 1. Calculate TRUE Virtual Best total time using primitive segments (non-overlapping)
  const primitiveBestTimes = new Map();
  filteredRaces.value.forEach(race => {
    const raceInstance = race instanceof Race ? race : new Race(race);
    raceInstance.segmentSpeeds.forEach(seg => {
      const currentBest = primitiveBestTimes.get(seg.id) || 999;
      if (seg.time > 0 && seg.time < currentBest) {
        primitiveBestTimes.set(seg.id, seg.time);
      }
    });
  });
  const totalTime = Array.from(primitiveBestTimes.values()).reduce((a, b) => a + b, 0);

  // 2. Calculate values for the grid display (templateSegments)
  const isHigherBetter = activeMetric.value !== 'time';
  const segments = templateSegments.value.map((t, idx) => {
    const allSegs = filteredRaces.value.map(race => {
        const raceInstance = race instanceof Race ? race : new Race(race);
        const calculated = raceInstance.calculateIntervals(templateSegments.value);
        return calculated[idx];
    }).filter(s => s && s.time > 0);

    if (!allSegs.length) return 0;
    
    return isHigherBetter 
        ? Math.max(...allSegs.map(s => s[activeMetric.value])) 
        : Math.min(...allSegs.map(s => s[activeMetric.value]));
  });

  return { totalTime, segments };
});

const virtualBestSegments = computed(() => virtualBestRow.value?.segments || []);

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
  if (!ctx || !prediction.value) return;
  if (comparisonChart) comparisonChart.destroy();

  const labels = templateSegments.value.map(s => s.label);
  const theoryData = potentialRow.value?.segments || [];
  const vbData = virtualBestRow.value?.segments || [];

  comparisonChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Potentiel (Théorie)',
          data: theoryData,
          borderColor: 'rgba(59, 130, 246, 0.4)',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 0
        },
        {
          label: 'Réalité (VB)',
          data: vbData,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#2563eb'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { 
            grid: { color: '#f1f5f9' }, 
            title: { display: true, text: activeMetric.value === 'speed' ? 'm/s' : 's', font: { size: 10 } },
            beginAtZero: false
        },
        x: { grid: { display: false } }
      }
    }
  });
};

// --- DATA ACCESS HELPERS ---
const availableDisciplines = computed(() => {
  const s = new Set(races.value.map(r => r.discipline));
  return Array.from(s).sort();
});

const filteredRaces = computed(() => {
  return races.value
    .filter(r => r.discipline === selectedDiscipline.value)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const pbRace = computed(() => {
  const finished = filteredRaces.value.filter(r => getRaceTotalTime(r) > 0);
  if (finished.length === 0) return null;
  return finished.reduce((prev, curr) => getRaceTotalTime(curr) < getRaceTotalTime(prev) ? curr : prev);
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

// New: Atomic segments for consistent timeline alignment
const timelineSegmentsConfig = computed(() => {
  const template = templateSegments.value;
  if (!template.length) return [];
  
  // Filter out overlapping segments (like "0-60" if we already have "0-30" and "30-60")
  // For simplicity, we use segments where (end - start) matches the progressive milestones
  const points = new Set([0]);
  template.forEach(s => { points.add(s.start); points.add(s.end); });
  const sortedPoints = Array.from(points).sort((a, b) => a - b);
  
  const atomic = [];
  for (let i = 1; i < sortedPoints.length; i++) {
    const start = sortedPoints[i-1];
    const end = sortedPoints[i];
    if (end > parseInt(selectedDiscipline.value)) continue; // Don't go beyond finish
    atomic.push({
      start,
      end,
      label: `${end}m`
    });
  }
  return atomic;
});

const potentialTimelineSegments = computed(() => {
  if (!prediction.value) return [];
  return timelineSegmentsConfig.value.map(seg => {
    const startSplit = prediction.value.splits.find(s => Math.abs(s.distance - seg.start) < 0.1) || { time: 0 };
    const endSplit = prediction.value.splits.find(s => Math.abs(s.distance - seg.end) < 0.1);
    if (!endSplit) return { time: 0, [activeMetric.value]: 0 };
    
    const time = endSplit.time - startSplit.time;
    let val = 0;
    if (activeMetric.value === 'speed') val = (seg.end - seg.start) / time;
    if (activeMetric.value === 'time') val = time;
    
    return { time, [activeMetric.value]: val };
  });
});

const virtualBestTimelineSegments = computed(() => {
  if (!filteredRaces.value.length) return [];
  return timelineSegmentsConfig.value.map(seg => {
    const allSegs = filteredRaces.value.map(race => {
        const raceInstance = race instanceof Race ? race : new Race(race);
        const calculated = raceInstance.calculateIntervals([seg]);
        return calculated[0];
    }).filter(s => s && s.time > 0);

    if (!allSegs.length) return { time: 0, [activeMetric.value]: 0 };
    
    const bestTime = Math.min(...allSegs.map(s => s.time));
    const isHigherBetter = activeMetric.value !== 'time';
    const bestValue = isHigherBetter 
        ? Math.max(...allSegs.map(s => s[activeMetric.value])) 
        : Math.min(...allSegs.map(s => s[activeMetric.value]));

    return { time: bestTime, [activeMetric.value]: bestValue };
  });
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
    if (!race || !race.milestones) return 0;
    const dist = parseInt(race.discipline);
    const finish = race.milestones.find(m => m.distance === dist);
    const start = race.milestones.find(m => m.distance === 0);
    return (finish && start) ? finish.time - start.time : 0;
};

const formatValue = (v) => typeof v === 'number' ? v.toFixed(2) : '-';
const formatDiff = (v) => typeof v === 'number' ? (v > 0 ? '+' : '') + v.toFixed(2) : '-';
const formatMetricValue = (val) => (val === undefined || val === null || val === 0) ? '-' : val.toFixed(2);

const getGridCellStyles = (race, index) => {
  const seg = getRaceSegmentData(race, index);
  const refVal = virtualBestSegments.value[index];
  return getCellStyles(seg?.[activeMetric.value], refVal, activeMetric.value);
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short' });

watch([selectedDiscipline, activeMetric, athlete], runAnalysis);

onMounted(() => {
  const athleteId = localStorage.getItem('sprint_predictor_current_athlete');
  if (athleteId) {
    athlete.value = Athlete.load(athleteId);
    races.value = Race.getByAthlete(athleteId);
    runAnalysis();
  }
});
</script>