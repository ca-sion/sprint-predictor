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

    <div v-else class="space-y-8">
      <!-- Controls Toolbar -->
      <div class="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div class="flex items-center gap-4">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Métrique :</span>
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

        <div class="flex items-center gap-4">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Mode :</span>
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
              Différentiel (vs PB)
            </button>
          </div>
        </div>
      </div>

      <!-- The DNA Ribbon Visualization -->
      <div class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        <!-- Header Row (Segments) -->
        <div class="flex border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-20">
          <div class="w-32 flex-shrink-0 p-4 border-r border-slate-100">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Chrono</span>
          </div>
          <div class="flex-1 flex">
            <div 
              v-for="(seg, idx) in templateSegments" 
              :key="idx" 
              class="flex-1 p-2 border-r border-slate-100 last:border-0 flex items-center justify-center"
            >
              <span class="text-[9px] font-black text-slate-400 uppercase">{{ seg.label }}</span>
            </div>
          </div>
        </div>

        <!-- PB Row (The Gold Standard) -->
        <div v-if="pbRace" class="flex relative z-10 bg-yellow-50/50 group border-b-2 border-yellow-200">
           <div class="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>
           <div class="w-32 flex-shrink-0 p-4 border-r border-yellow-100 flex flex-col justify-center bg-yellow-50/30">
            <div class="flex items-center gap-1 mb-1">
              <span class="text-[9px] font-black bg-yellow-400 text-white px-1.5 py-0.5 rounded shadow-sm">PB</span>
              <span class="text-[10px] font-bold text-slate-900 truncate">{{ formatDate(pbRace.date) }}</span>
            </div>
            <span class="text-xl font-black text-slate-900 tabular-nums tracking-tight">{{ getRaceTotalTime(pbRace).toFixed(2) }}s</span>
          </div>
          
          <!-- PB Segments -->
          <div class="flex-1 flex">
            <div 
              v-for="(tSeg, idx) in templateSegments" 
              :key="idx" 
              class="flex-1 border-r border-yellow-100/50 last:border-0 relative group/cell p-1"
            >
              <div class="w-full h-full rounded bg-yellow-400/20 flex items-center justify-center border border-yellow-400/30 shadow-inner">
                <span class="text-xs font-black text-yellow-700 tabular-nums">{{ formatValue(getRaceSegmentData(pbRace, idx)?.[activeMetric]) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Races List -->
        <div class="divide-y divide-slate-100">
          <div 
            v-for="race in sortedRaces" 
            :key="race.id" 
            class="flex hover:bg-slate-50 transition-colors group relative"
          >
            <!-- Race Info -->
             <div class="w-32 flex-shrink-0 p-4 border-r border-slate-100 flex flex-col justify-center">
              <span class="text-[10px] font-bold text-slate-500 mb-1 truncate" :title="race.name">{{ formatDate(race.date) }}</span>
              <div class="flex items-baseline gap-2">
                <span class="text-sm font-black text-slate-800 tabular-nums">{{ getRaceTotalTime(race).toFixed(2) }}s</span>
                <span 
                  v-if="pbRace" 
                  :class="['text-[9px] font-bold', getRaceTotalTime(race) > getRaceTotalTime(pbRace) ? 'text-red-500' : 'text-green-500']"
                >
                  {{ formatDiff(getRaceTotalTime(race) - getRaceTotalTime(pbRace)) }}
                </span>
              </div>
            </div>

            <!-- Heatmap Segments -->
            <div class="flex-1 flex h-16"> <!-- Fixed height for ribbon effect -->
              <div 
                v-for="(tSeg, idx) in templateSegments" 
                :key="idx" 
                class="flex-1 border-r border-slate-100 last:border-0 relative group/cell"
              >
                <!-- The Colored Block -->
                <div 
                  class="w-full h-full transition-all duration-300 flex items-center justify-center relative overflow-hidden"
                  :style="{ backgroundColor: getCellColor(getRaceSegmentData(race, idx), idx) }"
                >
                   <!-- Value Display (Only on hover or if very contrasting) -->
                   <div v-if="getRaceSegmentData(race, idx)" class="opacity-0 group-hover/cell:opacity-100 transition-opacity z-10 flex flex-col items-center">
                      <span class="text-xs font-black text-white drop-shadow-md">{{ formatValue(getRaceSegmentData(race, idx)[activeMetric]) }}</span>
                      <span v-if="pbRace && viewMode === 'heatmap'" class="text-[9px] font-bold text-white/90 drop-shadow-md">
                        {{ formatDiff(getRaceSegmentData(race, idx)[activeMetric] - getPbValue(idx)) }}
                      </span>
                   </div>
                </div>
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
import { getDynamicAnalysisTemplate, getDynamicDisciplineConfig } from '../data/ReferenceData.js';

const athlete = ref(null);
const races = ref([]);
const selectedDiscipline = ref('100m');
const activeMetric = ref('speed'); // speed, frequency, stepLength
const viewMode = ref('heatmap'); // heatmap (intensity), delta (diff vs PB)

const metrics = [
  { id: 'speed', label: 'Vitesse (m/s)' },
  { id: 'frequency', label: 'Fréquence (Hz)' },
  { id: 'stepLength', label: 'Amplitude (m)' },
  { id: 'time', label: 'Temps (s)' }
];

const availableDisciplines = computed(() => {
  const s = new Set(races.value.map(r => r.discipline));
  // Default list if empty or to enforce order
  const defaults = ['100m', '200m'];
  defaults.forEach(d => { if(s.has(d)) s.add(d); });
  return Array.from(s).sort();
});

const filteredRaces = computed(() => {
  return races.value
    .filter(r => r.discipline === selectedDiscipline.value)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
});

const pbRace = computed(() => {
  if (filteredRaces.value.length === 0) return null;
  // PB is lowest time (assuming all are finished races with time > 0)
  // We filter out races with 0 time just in case
  const finished = filteredRaces.value.filter(r => getRaceTotalTime(r) > 0);
  if (finished.length === 0) return null;
  return finished.reduce((prev, curr) => getRaceTotalTime(curr) < getRaceTotalTime(prev) ? curr : prev);
});

// Remove PB from the regular list to avoid duplication if we want (optional)
// For now, I'll keep it in the list but highlight it, OR exclude it.
// Standard practice is to keep it or put it top. I put it top. I will exclude it from the scroll list to be cleaner?
// Actually showing it in timeline context is good too. Let's exclude it from the "Other Races" list to avoid redundancy.
const sortedRaces = computed(() => {
  if (!pbRace.value) return [];
  return filteredRaces.value.filter(r => r.id !== pbRace.value.id);
});

const templateSegments = computed(() => {
  // Use a standard template based on discipline
  return getDynamicAnalysisTemplate(selectedDiscipline.value, athlete.value?.gender, athlete.value?.category) || [];
});

// Cache for calculated segments to avoid re-calc on every render
const raceSegmentsCache = new Map();

const getRaceSegments = (race) => {
  if (!race) return [];
  if (raceSegmentsCache.has(race.id + selectedDiscipline.value)) {
    return raceSegmentsCache.get(race.id + selectedDiscipline.value);
  }
  
  const results = race.calculateIntervals(templateSegments.value);
  raceSegmentsCache.set(race.id + selectedDiscipline.value, results);
  return results;
};

const getRaceSegmentData = (race, index) => {
  const calculated = getRaceSegments(race);
  const templateItem = templateSegments.value[index];
  if (!templateItem || !calculated) return null;
  
  // Find matching segment in calculated results
  return calculated.find(c => c.label === templateItem.label && c.start === templateItem.start && c.end === templateItem.end);
};

const getRaceTotalTime = (race) => {
    // Try to get time from milestones if finish exists, else sum segments?
    // Best is to look for the finish milestone based on discipline
    const dist = parseInt(race.discipline);
    const finish = race.milestones.find(m => m.distance === dist);
    const start = race.milestones.find(m => m.distance === 0);
    
    if (finish && start) return finish.time - start.time;
    
    // Fallback: sum of calculated intervals
    const segs = getRaceSegments(race);
    if (segs && segs.length > 0) {
        // Warning: intervals might overlap (e.g. 0-100 and 0-60). 
        // We should only sum primitive intervals or trust milestones.
        // If no milestones, we can't do much.
        return 0;
    }
    return 0;
};

const getPbValue = (segmentIndex) => {
  if (!pbRace.value) return 0;
  const seg = getRaceSegmentData(pbRace.value, segmentIndex);
  return seg ? seg[activeMetric.value] : 0;
};

// --- Visualization Logic ---

const getCellColor = (segment, index) => {
  if (!segment || !pbRace.value) return '#f8fafc'; // slate-50 (Empty/Missing)
  
  const val = segment[activeMetric.value];
  const pbVal = getPbValue(index);
  
  if (pbVal === 0) return '#f1f5f9'; // No reference
  
  if (viewMode.value === 'heatmap') {
    // Intensity mode (Blue scale)
    // We need a min/max for this metric to normalize
    // Simple approach: Compare to PB. 
    // Let's assume PB is 100%.
    // > 100% (better than PB) = Super Dark Blue / Purple
    // 90-100% = Blue
    // < 80% = Light Blue / White
    
    // Metrics where "Higher is Better" (Speed, Freq, Amp - usually)
    // Time: Lower is better.
    
    const isHigherBetter = activeMetric.value !== 'time';
    const ratio = isHigherBetter ? (val / pbVal) : (pbVal / val); // Normalize so 1.0 is PB level
    
    // Safety for 0/NaN
    if (!isFinite(ratio)) return '#f1f5f9';

    // Opacity based on ratio. 
    // 1.0 = 100% opacity blue-600 (#2563eb)
    // 0.8 = 20% opacity
    let opacity = 0;
    
    if (ratio >= 1.0) return '#1e40af'; // Darker blue for PB or better
    if (ratio < 0.5) opacity = 0.1;
    else opacity = (ratio - 0.5) * 2; // Map 0.5->1.0 to 0->1 opacity
    
    return `rgba(37, 99, 235, ${opacity})`; // blue-600
  } 
  else { // Delta Mode
    // Green = Better than PB, Red = Worse
    const diff = val - pbVal;
    const isHigherBetter = activeMetric.value !== 'time';
    const isGood = isHigherBetter ? diff >= 0 : diff <= 0;
    
    // Intensity of color based on % diff
    const percentDiff = Math.abs(diff / pbVal);
    const intensity = Math.min(percentDiff * 5, 1); // Cap at 20% diff for max color
    
    return isGood 
      ? `rgba(16, 185, 129, ${intensity})` // emerald-500
      : `rgba(239, 68, 68, ${intensity})`; // red-500
  }
};

const formatValue = (v) => {
    if (typeof v !== 'number') return '-';
    return v.toFixed(2);
};

const formatDiff = (v) => {
    if (typeof v !== 'number') return '-';
    const s = v > 0 ? '+' : '';
    return `${s}${v.toFixed(2)}`;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', year: '2-digit' });
};

onMounted(() => {
  const athleteId = localStorage.getItem('sprint_predictor_current_athlete');
  if (athleteId) {
    athlete.value = Athlete.load(athleteId);
    races.value = Race.getByAthlete(athleteId);
  }
});
</script>

<style scoped>
/* Custom Scrollbar for horizontal scrolling if needed */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;  
  scrollbar-width: none; 
}
</style>
