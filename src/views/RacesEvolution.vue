<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <nav class="flex mb-2" aria-label="Breadcrumb">
          <router-link to="/" class="text-xs font-semibold text-slate-500 hover:text-blue-600 uppercase tracking-wider">Tableau de bord</router-link>
          <span class="mx-2 text-slate-300">/</span>
          <span class="text-xs font-semibold text-slate-900 uppercase tracking-wider">Évolution</span>
        </nav>
        <h2 class="text-3xl font-extrabold text-slate-900">
          Progression de <span class="text-blue-600">{{ athlete?.name || 'l\'athlète' }}</span>
        </h2>
      </div>
      
      <!-- Discipline Selector -->
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

    <div v-if="filteredRaces.length === 0" class="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
      <p class="text-slate-400 font-bold">Aucune course enregistrée pour cette discipline.</p>
    </div>

    <div v-else class="space-y-6">
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

        <div class="flex items-center gap-3">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Analyse :</span>
          <div class="flex bg-slate-100 p-1 rounded-lg">
            <button 
              @click="viewMode = 'heatmap'"
              :class="['px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all', viewMode === 'heatmap' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900']"
            >
              Intensité
            </button>
            <button 
              @click="viewMode = 'delta'"
              :class="['px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all', viewMode === 'delta' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900']"
            >
              Écart PB
            </button>
          </div>
        </div>
      </div>

      <!-- 1. GRID VIEW -->
      <div v-if="layoutMode === 'grid'" class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div class="flex border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20">
          <div class="w-32 flex-shrink-0 p-4 border-r border-slate-100"><span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Chrono</span></div>
          <div class="flex-1 flex">
            <div v-for="(seg, idx) in templateSegments" :key="idx" class="flex-1 p-2 border-r border-slate-100 last:border-0 flex items-center justify-center">
              <span class="text-[9px] font-black text-slate-400 uppercase">{{ seg.label }}</span>
            </div>
          </div>
        </div>

        <!-- PB Row -->
        <div v-if="pbRace" class="flex relative z-10 bg-yellow-50/50 group border-b-2 border-yellow-200">
           <div class="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
           <div class="w-32 flex-shrink-0 p-4 border-r border-yellow-100 flex flex-col justify-center bg-yellow-50/30">
            <div class="flex items-center gap-1 mb-1">
              <span class="text-[9px] font-black bg-yellow-400 text-white px-1.5 py-0.5 rounded shadow-sm">PB</span>
              <span class="text-[10px] font-bold text-slate-900 truncate">{{ formatDate(pbRace.date) }}</span>
            </div>
            <span class="text-xl font-black text-slate-900 tabular-nums tracking-tight">{{ getRaceTotalTime(pbRace).toFixed(2) }}s</span>
          </div>
          <div class="flex-1 flex">
            <div v-for="(tSeg, idx) in templateSegments" :key="idx" class="flex-1 border-r border-yellow-100/50 last:border-0 relative group/cell p-1">
              <div v-if="getRaceSegmentData(pbRace, idx)" 
                   class="w-full h-full rounded flex items-center justify-center border border-yellow-400/30 shadow-inner transition-all duration-300"
                   :style="getGridCellStyles(pbRace, idx)">
                <span class="text-xs font-black tabular-nums">{{ formatMetricValue(getRaceSegmentData(pbRace, idx)[activeMetric], activeMetric) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sorted Races -->
        <div class="divide-y divide-slate-100">
          <div v-for="race in sortedRaces" :key="race.id" class="flex hover:bg-slate-50 transition-colors group relative">
             <div class="w-32 flex-shrink-0 p-4 border-r border-slate-100 flex flex-col justify-center">
              <span class="text-[10px] font-bold text-slate-500 mb-1 truncate" :title="race.name">{{ formatDate(race.date) }}</span>
              <div class="flex items-baseline gap-2">
                <span class="text-sm font-black text-slate-800 tabular-nums">{{ getRaceTotalTime(race).toFixed(2) }}s</span>
                <span v-if="pbRace" :class="['text-[9px] font-bold', getRaceTotalTime(race) > getRaceTotalTime(pbRace) ? 'text-red-500' : 'text-green-500']">
                  {{ formatDiff(getRaceTotalTime(race) - getRaceTotalTime(pbRace)) }}
                </span>
              </div>
            </div>
            <div class="flex-1 flex h-16">
              <div v-for="(tSeg, idx) in templateSegments" :key="idx" class="flex-1 border-r border-slate-100 last:border-0 relative group/cell">
                <div v-if="getRaceSegmentData(race, idx)" 
                     class="w-full h-full transition-all duration-300 flex items-center justify-center relative overflow-visible" 
                     :style="getGridCellStyles(race, idx)">
                   <div class="z-0 pointer-events-none">
                     <span class="text-xs font-black">{{ formatMetricValue(getRaceSegmentData(race, idx)[activeMetric], activeMetric) }}</span>
                   </div>
                   
                   <!-- Tooltip -->
                   <div v-if="getRaceSegmentData(race, idx)" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-700 p-3 opacity-0 group-hover/cell:opacity-100 transition-opacity z-50 pointer-events-none">
                      <div class="font-bold text-slate-400 uppercase text-[9px] mb-2 border-b border-slate-700 pb-1">{{ templateSegments[idx]?.label }}</div>
                      <div class="space-y-1.5">
                        <div class="flex justify-between items-center"><span class="text-slate-400 text-[10px]">Temps</span><span class="font-mono font-bold">{{ formatValue(getRaceSegmentData(race, idx).time) }}s</span></div>
                        <div class="flex justify-between items-center"><span class="text-slate-400 text-[10px]">Vitesse</span><div class="flex items-center gap-2"><span class="font-mono font-bold text-blue-400">{{ formatValue(getRaceSegmentData(race, idx).speed) }}</span><span v-if="pbRace" :class="getDiffClass(getRaceSegmentData(race, idx).speed - getPbValue(idx, 'speed'), true)">{{ formatDiff(getRaceSegmentData(race, idx).speed - getPbValue(idx, 'speed')) }}</span></div></div>
                        <div class="flex justify-between items-center"><span class="text-slate-400 text-[10px]">Fréq.</span><div class="flex items-center gap-2"><span class="font-mono font-bold text-purple-400">{{ getRaceSegmentData(race, idx).frequency > 0 ? formatValue(getRaceSegmentData(race, idx).frequency) : '-' }}</span><span v-if="pbRace && getRaceSegmentData(race, idx).frequency > 0" :class="getDiffClass(getRaceSegmentData(race, idx).frequency - getPbValue(idx, 'frequency'), true)">{{ formatDiff(getRaceSegmentData(race, idx).frequency - getPbValue(idx, 'frequency')) }}</span></div></div>
                        <div class="flex justify-between items-center"><span class="text-slate-400 text-[10px]">Ampl.</span><div class="flex items-center gap-2"><span class="font-mono font-bold text-emerald-400">{{ getRaceSegmentData(race, idx).stepLength > 0 ? formatValue(getRaceSegmentData(race, idx).stepLength) : '-' }}</span><span v-if="pbRace && getRaceSegmentData(race, idx).stepLength > 0" :class="getDiffClass(getRaceSegmentData(race, idx).stepLength - getPbValue(idx, 'stepLength'), true)">{{ formatDiff(getRaceSegmentData(race, idx).stepLength - getPbValue(idx, 'stepLength')) }}</span></div></div>
                      </div>
                      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. TIMELINE VIEW -->
      <div v-else class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
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
                   :class="['absolute top-0 bottom-0 border-l-2 border-dotted z-10', , race.id === pbRace?.id ? 'border-slate-900/10' : 'border-slate-900/20']"
                   :style="{ left: marker.percent + '%' }">
                <span class="absolute -bottom-1 -left-4 w-8 text-center text-[7px] font-black text-slate-500 uppercase leading-none">{{ marker.label }}</span>
              </div>
            </template>

            <!-- Actual Race Segments (Linear) -->
            <div class="flex h-6 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner relative z-20 border-2 border-slate-200">
              <div v-for="(seg, sIdx) in getLinearSegments(race)" :key="'seg-'+sIdx"
                   class="h-full relative transition-all group/timeline border-r border-white/5 last:border-0"
                   :style="{ width: (seg.time / maxTotalTime) * 100 + '%', ...getLinearCellStyles(seg, race) }">
                
                <div class="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 group-hover/timeline:opacity-100 transition-opacity z-50 pointer-events-none">
                   <div class="bg-slate-900 text-white px-3 py-2 rounded-xl text-[10px] font-black flex flex-col gap-1 whitespace-nowrap shadow-2xl border border-slate-700">
                      <span class="text-blue-400 border-b border-white/10 pb-1 mb-1">{{ seg.label }}</span>
                      <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span>Vitesse: {{ seg.speed.toFixed(2) }} m/s</span>
                        <span>Temps: {{ seg.time.toFixed(2) }}s</span>
                        <span v-if="seg.frequency > 0">Fréq: {{ seg.frequency.toFixed(2) }} Hz</span>
                        <span v-if="seg.stepLength > 0">Ampl: {{ seg.stepLength.toFixed(2) }} m</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <!-- Labels dessous (Métrique dynamique) -->
            <div class="flex w-full mt-2 px-1">
               <div v-for="(seg, sIdx) in getLinearSegments(race)" :key="'txt-'+sIdx"
                    :style="{ width: (seg.time / maxTotalTime) * 100 + '%' }"
                    class="text-center overflow-hidden">
                  <span class="text-[10px] font-black text-slate-900 leading-none">
                    {{ formatMetricValue(seg[activeMetric], activeMetric) }}
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Race } from '../models/Race.js';
import { Athlete } from '../models/Athlete.js';
import { getDynamicAnalysisTemplate } from '../data/ReferenceData.js';

const athlete = ref(null);
const races = ref([]);
const selectedDiscipline = ref('100m');
const activeMetric = ref('speed');
const viewMode = ref('heatmap');
const layoutMode = ref('timeline');

const metrics = [
  { id: 'speed', label: 'Vitesse' },
  { id: 'frequency', label: 'Fréq.' },
  { id: 'stepLength', label: 'Ampl.' },
  { id: 'time', label: 'Temps' }
];

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
  return times.length > 0 ? Math.max(...times) * 1.05 : 15;
});

const templateSegments = computed(() => {
  return getDynamicAnalysisTemplate(selectedDiscipline.value, athlete.value?.gender, athlete.value?.category) || [];
});

/**
 * VIRTUAL BEST ENGINE
 * Calculates the absolute best performance for each segment across all filtered races
 */
const virtualBestSegments = computed(() => {
  if (!filteredRaces.value.length) return [];
  
  return templateSegments.value.map((template, idx) => {
    const allValues = filteredRaces.value.map(race => {
      const seg = getRaceSegmentData(race, idx);
      return seg ? seg[activeMetric.value] : null;
    }).filter(v => v !== null && v > 0);

    if (!allValues.length) return null;

    const isHigherBetter = activeMetric.value !== 'time';
    return isHigherBetter ? Math.max(...allValues) : Math.min(...allValues);
  });
});

const gridSegmentsCache = new Map();
const getRaceSegmentData = (race, index) => {
  if (!race) return null;
  const key = race.id + selectedDiscipline.value + '_grid';
  let calculated;
  if (gridSegmentsCache.has(key)) {
    calculated = gridSegmentsCache.get(key);
  } else {
    calculated = race.calculateIntervals(templateSegments.value);
    gridSegmentsCache.set(key, calculated);
  }
  const templateItem = templateSegments.value[index];
  if (!templateItem || !calculated) return null;
  return calculated.find(c => c && c.label === templateItem.label && c.start === templateItem.start && c.end === templateItem.end);
};

const getLinearSegments = (race) => {
  if (!race) return [];
  const raceInstance = race instanceof Race ? race : new Race(race);
  return raceInstance.segmentSpeeds;
};

const getPbLinearMarkers = () => {
  if (!pbRace.value) return [];
  let currentTime = 0;
  return getLinearSegments(pbRace.value).map(seg => {
    currentTime += seg.time;
    return { label: seg.label, percent: (currentTime / maxTotalTime.value) * 100 };
  });
};

const getRaceTotalTime = (race) => {
    if (!race || !race.milestones) return 0;
    const dist = parseInt(race.discipline);
    const finish = race.milestones.find(m => m.distance === dist);
    const start = race.milestones.find(m => m.distance === 0);
    if (finish && start) return Math.max(0, finish.time - start.time);
    
    const sorted = [...race.milestones].sort((a, b) => a.time - b.time);
    if (sorted.length > 1) {
        const first = sorted.find(m => m.distance === 0) || sorted[0];
        const last = sorted[sorted.length - 1];
        return Math.max(0, last.time - first.time);
    }
    return 0;
};

const getPbValue = (segmentIndex, metric = null) => {
  const seg = getRaceSegmentData(pbRace.value, segmentIndex);
  return seg ? seg[metric || activeMetric.value] : 0;
};

const formatValue = (v) => typeof v === 'number' ? v.toFixed(2) : '-';
const formatDiff = (v) => typeof v === 'number' ? (v > 0 ? '+' : '') + v.toFixed(2) : '-';

const formatMetricValue = (val, metric) => {
    if (val === undefined || val === null || val === 0) return '-';
    return val.toFixed(2);
};

const getDiffClass = (diff, higherIsBetter = true) => {
    if (Math.abs(diff) < 0.01) return 'text-slate-500 text-[9px]';
    return (higherIsBetter ? diff > 0 : diff < 0) ? 'text-emerald-400 text-[9px] font-bold' : 'text-red-400 text-[9px] font-bold';
};

/**
 * CORE COLOR CALCULATION ENGINE
 * Professional linear interpolation with high-sensitivity magnification
 */
const getCellStyles = (val, ref, metric) => {
  if (val === undefined || val === null || val === 0 || !ref) {
    return { backgroundColor: '#f8fafc', color: '#cbd5e1' };
  }
  
  const isHigherBetter = metric !== 'time';
  const ratio = isHigherBetter ? (val / ref) : (ref / val);
  
  // High sensitivity window: 94% to 100% of Virtual Best
  // In elite sprinting, 6% is a massive range.
  const clampedRatio = Math.max(0.94, Math.min(1.0, ratio));
  const normalized = (clampedRatio - 0.94) / 0.06; // 0 to 1 scale

  let bgColor;
  let textColor = '#ffffff';

  if (viewMode.value === 'heatmap') {
    // Heatmap: Deep Indigo Scale
    const hue = 235; 
    const saturation = 75; // Constant high saturation
    const lightness = 96 - (normalized * 60); // 96% (light) to 36% (dark)
    
    bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    if (lightness > 65) textColor = '#1e1b4b'; // Indigo 950
  } else {
    // Delta: Red -> Amber -> Emerald Scale
    // We map 0.94 (Red) -> 0.97 (Amber) -> 1.0 (Emerald)
    let hue, saturation, lightness;
    
    if (normalized > 0.5) {
      // Zone: Amber to Emerald (97% to 100%)
      const zoneNorm = (normalized - 0.5) * 2; // 0 to 1
      hue = 45 + (zoneNorm * 97); // 45 (Amber) to 142 (Emerald)
      saturation = 70 + (zoneNorm * 10);
      lightness = 85 - (zoneNorm * 40); // 85% to 45%
    } else {
      // Zone: Red to Amber (94% to 97%)
      const zoneNorm = normalized * 2; // 0 to 1
      hue = 0 + (zoneNorm * 45); // 0 (Red) to 45 (Amber)
      saturation = 80;
      lightness = 70 + (zoneNorm * 15); // 70% to 85%
    }
    
    bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    if (lightness > 70) {
      textColor = normalized > 0.5 ? '#064e3b' : '#7f1d1d';
    }
  }

  return { backgroundColor: bgColor, color: textColor };
};

const getLinearCellStyles = (segment, race) => {
  if (!segment) return { backgroundColor: '#f8fafc' };
  
  // Find the index of this segment in the linear array to get the virtual best
  const raceInstance = race instanceof Race ? race : new Race(race);
  const linearSegs = raceInstance.segmentSpeeds;
  const idx = linearSegs.findIndex(s => s.label === segment.label && s.start === segment.start);
  
  const refVal = virtualBestSegments.value[idx];
  return getCellStyles(segment[activeMetric.value], refVal, activeMetric.value);
};

const getGridCellStyles = (race, index) => {
  const seg = getRaceSegmentData(race, index);
  if (!seg) return { backgroundColor: '#f8fafc' };
  
  const refVal = virtualBestSegments.value[index];
  return getCellStyles(seg[activeMetric.value], refVal, activeMetric.value);
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: '2-digit' });

onMounted(() => {
  const athleteId = localStorage.getItem('sprint_predictor_current_athlete');
  if (athleteId) {
    athlete.value = Athlete.load(athleteId);
    races.value = Race.getByAthlete(athleteId);
  }
});
</script>