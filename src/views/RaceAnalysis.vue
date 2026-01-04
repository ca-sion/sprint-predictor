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
          
          <div class="flex bg-slate-100 p-1 rounded-xl w-fit">
            <router-link 
              :to="{ path: '/races-analysis', query: { athleteId: athlete?.id } }"
              class="px-6 py-2 rounded-lg text-xs font-black uppercase transition-all bg-white text-blue-600 shadow-sm"
            >
              Découpe et liste
            </router-link>
            <router-link 
              :to="{ path: '/races-evolution', query: { athleteId: athlete?.id } }"
              class="px-6 py-2 rounded-lg text-xs font-black uppercase transition-all text-slate-500 hover:text-slate-700"
            >
              Évolution & comparaison
            </router-link>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button @click="showNewRaceModal = true" class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-blue-200 uppercase tracking-wider">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle course
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Race List -->
      <div class="lg:col-span-1 space-y-4">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-widest">Historique des courses</h3>
          </div>
          <div class="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            <div v-if="races.length === 0" class="p-8 text-center text-slate-400 italic text-sm">
              Aucune course analysée pour le moment.
            </div>
            <div 
              v-for="race in races" 
              :key="race.id" 
              @click="selectRace(race)"
              :class="['p-4 cursor-pointer transition-colors hover:bg-slate-50', activeRace?.id === race.id ? 'bg-blue-50/50 border-l-4 border-blue-600' : '']"
            >
              <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-slate-900">{{ race.name || race.discipline }}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full uppercase">{{ race.discipline }}</span>
              </div>
              <div class="text-xs text-slate-500 flex items-center gap-2">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                {{ formatDate(race.date) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analysis Detail -->
      <div class="lg:col-span-2">
        <div v-if="activeRace" class="space-y-6">
          <!-- Race Info Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div class="flex justify-between items-start mb-6">
              <div>
                <input 
                  v-model="activeRace.name" 
                  @blur="saveActiveRace"
                  class="text-2xl font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-full mb-1" 
                  placeholder="Nom de la course (ex: Finale Régionale)"
                />
                <div class="flex items-center gap-4 text-sm text-slate-500">
                  <span>{{ activeRace.discipline }}</span>
                  <span>•</span>
                  <input type="date" v-model="activeRace.date" @change="saveActiveRace" class="bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-500 cursor-pointer">
                </div>
              </div>
              <button @click="deleteRace(activeRace)" class="p-2 text-slate-400 hover:text-red-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>

            <!-- Capture Tool Block -->
            <VideoAnalyzer 
              ref="videoAnalyzerRef"
              :next-milestone="nextMilestone"
              :has-milestones="activeRace.milestones.length > 0"
              @capture="onCapture"
              @reset="resetCaptures"
              @set-as-start="setAsStart"
            />

            <!-- Milestones Table -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-widest">Temps de passage & Jalons</h4>
                <button @click="addManualMilestone" class="text-xs font-bold text-blue-600 hover:underline">Ajouter manuellement</button>
              </div>
              
              <div class="overflow-hidden border border-slate-100 rounded-xl mb-8">
                <table class="w-full text-left text-sm">
                  <thead class="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase">
                    <tr>
                      <th class="px-4 py-3">Jalon</th>
                      <th class="px-4 py-3">Type</th>
                      <th class="px-4 py-3">Capture (v)</th>
                      <th class="px-4 py-3 text-blue-600">Course (s)</th>
                      <th class="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="(m, index) in activeRace.milestones" :key="index" class="group hover:bg-slate-50 transition-colors">
                      <td class="px-4 py-3">
                        <input v-model="m.label" @blur="saveActiveRace" class="bg-transparent border-none p-0 text-sm focus:ring-0 font-bold text-slate-900 w-full">
                      </td>
                      <td class="px-4 py-3">
                        <select v-model="m.type" @change="saveActiveRace" class="bg-transparent border-none p-0 text-xs focus:ring-0 text-slate-500 cursor-pointer">
                          <option value="split">Split</option>
                          <option value="takeoff">Take-off</option>
                          <option value="touchdown">Touch-down</option>
                        </select>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <input type="number" step="0.001" v-model.number="m.time" @blur="saveActiveRace" class="bg-transparent border-none p-0 text-xs font-mono text-slate-400 w-20">
                          <button 
                            @click="syncMilestoneWithCurrent(index)" 
                            class="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title="Synchroniser avec le temps actuel"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td class="px-4 py-3 font-mono font-bold text-blue-600">
                        {{ getRaceTime(m.time) }}
                      </td>
                      <td class="px-4 py-3 text-right space-x-2">
                        <button 
                          v-if="m.distance === 0" 
                          @click="setAsStart(m.time)" 
                          class="text-[9px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded uppercase hover:bg-blue-100 transition-colors"
                          title="Synchroniser le départ sur ce temps"
                        >
                          Sync Start
                        </button>
                        <button @click="removeMilestone(index)" class="p-1 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="activeRace.milestones.length === 0">
                      <td colspan="5" class="px-4 py-8 text-center text-slate-400 italic">Aucun jalon enregistré. Utilisez l'outil de capture ou l'ajout manuel.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Performance Dashboard (Advanced Analysis) -->
              <div v-if="customIntervals.length > 0" class="mb-12">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center">
                  <span class="mr-2">📊</span> Analyse Temporelle (Splits)
                </h4>
                
                <div class="overflow-hidden border border-slate-100 rounded-2xl shadow-sm bg-white">
                  <table class="w-full text-left text-sm border-collapse">
                    <thead class="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100">
                      <tr>
                        <th class="px-4 py-3">Segment</th>
                        <th class="px-4 py-3">Distance</th>
                        <th class="px-4 py-3">Temps</th>
                        <th class="px-4 py-3 text-blue-600">Vitesse (m/s)</th>
                        <th class="px-4 py-3">Pas</th>
                        <th class="px-4 py-3">Fréq. (Hz)</th>
                        <th class="px-4 py-3">Ampl. (m)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="(interval, index) in customIntervals" :key="index" class="hover:bg-blue-50/30 transition-colors group">
                        <td class="px-4 py-3">
                          <span class="font-black text-slate-400 group-hover:text-blue-600 text-[10px] uppercase tracking-widest">{{ interval.label }}</span>
                        </td>
                        <td class="px-4 py-3 text-xs font-bold text-slate-500">
                          {{ interval.start }}-{{ interval.end }}m
                        </td>
                        <td class="px-4 py-3 font-mono font-bold text-slate-900">
                          {{ FormatService.time(interval.time, 3) }}
                        </td>
                        <td class="px-4 py-3">
                          <div class="flex items-center gap-2">
                            <span class="font-black text-blue-600 tabular-nums">{{ FormatService.number(interval.speed) }}</span>
                            <div class="hidden sm:block w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div class="h-full bg-blue-500" :style="{ width: Math.min((interval.speed / 12) * 100, 100) + '%' }"></div>
                            </div>
                          </div>
                        </td>
                        <td class="px-4 py-3 text-slate-500 font-medium">
                          {{ interval.steps || '---' }}
                        </td>
                        <td class="px-4 py-3 font-bold text-slate-700">
                          {{ interval.frequency > 0 ? FormatService.number(interval.frequency) : '---' }}
                        </td>
                        <td class="px-4 py-3 font-bold text-slate-700">
                          {{ interval.stepLength > 0 ? FormatService.number(interval.stepLength) : '---' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Hurdle Specific Analysis -->
              <div v-if="hurdleAnalysis.length > 0" class="mb-12">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center">
                  <span class="mr-2">🚧</span> Analyse spécifique Haies (Inter-haies)
                </h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Hurdle Steps Input -->
                  <div class="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                    <h5 class="text-[10px] font-bold text-blue-400 uppercase mb-4 tracking-widest">Nombre de pas entre les haies</h5>
                    <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <div v-for="seg in hurdleAnalysis" :key="'hurdle-step-' + seg.label" class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <span class="text-xs font-bold">{{ seg.label }}</span>
                        <div class="flex items-center gap-3">
                          <input 
                            type="number" 
                            v-model.number="activeRace.stepCounts[seg.label === 'Start - H1' ? `0-${seg.distance}` : `${seg.distance_start}-${seg.distance_end}` || seg.label]" 
                            @blur="saveActiveRace"
                            placeholder="---"
                            class="w-16 bg-white/10 border-none rounded-lg p-1.5 text-center text-sm font-bold focus:ring-2 focus:ring-blue-500 text-white"
                          >
                          <span class="text-[10px] text-slate-500 uppercase font-bold">pas</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Hurdle Times Table -->
                  <div class="overflow-hidden border border-slate-100 rounded-2xl bg-white shadow-sm">
                    <table class="w-full text-left text-sm">
                      <thead class="bg-slate-50 text-slate-400 font-bold text-[9px] uppercase">
                        <tr>
                          <th class="px-4 py-3">Séquence</th>
                          <th class="px-4 py-3 text-right">Temps</th>
                          <th class="px-4 py-3 text-right">Vitesse</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        <tr v-for="seg in hurdleAnalysis" :key="'hurdle-time-' + seg.label" class="hover:bg-slate-50 transition-colors">
                          <td class="px-4 py-3 text-xs font-bold text-slate-700">{{ seg.label }}</td>
                          <td class="px-4 py-3 text-right font-mono font-bold text-slate-900">{{ FormatService.time(seg.time, 3) }}</td>
                          <td class="px-4 py-3 text-right">
                            <span class="text-blue-600 font-black">{{ FormatService.number(seg.speed) }}</span>
                            <span class="text-[9px] text-slate-400 ml-1">m/s</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Metrics Summary (Primitive Segments) -->
              <div v-if="segmentSpeeds.length > 0">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center">
                  <span class="mr-2">📐</span> Analyse Biomécanique (Segments)
                </h4>
                
                <!-- Steps Input Section -->
                <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                  <h5 class="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Saisie du nombre de pas</h5>
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <div v-for="seg in segmentSpeeds" :key="'input-' + seg.id" class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                      <label class="block text-[9px] font-black text-slate-400 uppercase mb-1">{{ seg.segment }}</label>
                      <input 
                        type="number" 
                        v-model.number="activeRace.stepCounts[seg.id]" 
                        @blur="saveActiveRace"
                        placeholder="Nb pas"
                        class="w-full bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0"
                      >
                    </div>
                  </div>
                </div>

                <div class="overflow-hidden border border-slate-100 rounded-2xl bg-white/50">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-50/50 text-slate-400 font-bold text-[9px] uppercase border-b border-slate-100">
                      <tr>
                        <th class="px-4 py-2">Intervalle</th>
                        <th class="px-4 py-2 text-right">Temps</th>
                        <th class="px-4 py-2 text-right text-blue-500">Vitesse</th>
                        <th class="px-4 py-2 text-right">Fréq.</th>
                        <th class="px-4 py-2 text-right">Ampl.</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr v-for="speed in segmentSpeeds" :key="speed.segment" class="hover:bg-slate-50 transition-colors">
                        <td class="px-4 py-2 font-bold text-slate-600">{{ speed.segment }}</td>
                        <td class="px-4 py-2 text-right font-mono text-slate-500">{{ FormatService.time(speed.time, 3) }}</td>
                        <td class="px-4 py-2 text-right font-black text-slate-900">{{ FormatService.number(speed.speed) }} m/s</td>
                        <td class="px-4 py-2 text-right text-slate-600">{{ speed.frequency > 0 ? FormatService.number(speed.frequency) + ' Hz' : '---' }}</td>
                        <td class="px-4 py-2 text-right text-slate-600">{{ speed.stepLength > 0 ? FormatService.number(speed.stepLength) + ' m' : '---' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="mt-8 pt-8 border-t border-slate-100">
              <label class="block text-sm font-bold text-slate-900 uppercase tracking-widest mb-2">Notes & Analyse</label>
              <textarea 
                v-model="activeRace.note" 
                @blur="saveActiveRace"
                rows="4" 
                class="w-full bg-slate-50 border-slate-100 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500 p-4"
                placeholder="Ex: Bonnes sensations, vent de face en ligne droite, fatigue en fin de course..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <div v-else class="h-full flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
          <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <p class="font-bold">Sélectionnez une course pour voir son analyse</p>
          <p class="text-sm">Ou créez-en une nouvelle pour commencer le découpage.</p>
        </div>
      </div>
    </div>

    <!-- New Race Modal -->
    <div v-if="showNewRaceModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h3 class="text-xl font-bold text-slate-900">Nouvelle course</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Discipline</label>
            <select v-model="newRaceForm.discipline" class="w-full bg-slate-50 border-slate-100 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500 p-3">
              <option v-for="d in disciplines" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nom de la course / Séance</label>
            <input v-model="newRaceForm.name" type="text" placeholder="Ex: Meeting de Genève" class="w-full bg-slate-50 border-slate-100 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500 p-3">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
            <input v-model="newRaceForm.date" type="date" class="w-full bg-slate-50 border-slate-100 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500 p-3">
          </div>
        </div>
        <div class="p-6 bg-slate-50 flex gap-3">
          <button @click="showNewRaceModal = false" class="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Annuler</button>
          <button @click="createNewRace" class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all">Créer l'analyse</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Athlete } from '../models/Athlete.js';
import { Race } from '../models/Race.js';
import { StorageManager } from '../models/StorageManager.js';
import { RaceService } from '../services/RaceService.js';
import { FormatService } from '../services/FormatService.js';
import VideoAnalyzer from '../components/VideoAnalyzer.vue';
import { getDynamicDisciplineConfig, getDynamicAnalysisTemplate } from '../data/definitions/Disciplines.js';

const route = useRoute();
const athlete = ref(null);
const races = ref([]);
const activeRace = ref(null);
const showNewRaceModal = ref(false);
const videoAnalyzerRef = ref(null);

const disciplines = ['50m', '60m', '100m', '200m', '400m', '50mH', '60mH', '100mH', '110mH', '400mH'];

const newRaceForm = ref({
  discipline: '100m',
  name: '',
  date: new Date().toISOString().split('T')[0]
});

const nextMilestone = computed(() => {
  if (!activeRace.value) return null;
  const config = getDynamicDisciplineConfig(
    activeRace.value.discipline, 
    athlete.value?.gender, 
    athlete.value?.category
  );
  const existingCount = activeRace.value.milestones.length;
  return config[existingCount] || null;
});

const getRaceTime = (rawTime) => {
    return RaceService.formatRaceTime(rawTime, activeRace.value);
};

const setAsStart = (time) => {
    if (!activeRace.value) return;
    const raceInstance = activeRace.value instanceof Race ? activeRace.value : new Race(activeRace.value);
    raceInstance.setMilestone(0, time, 'split', 'Départ (0m)');
    raceInstance.save();
    loadData();
    activeRace.value = Race.load(activeRace.value.id);
};

const segmentSpeeds = computed(() => {
  if (!activeRace.value) return [];
  const raceInstance = activeRace.value instanceof Race ? activeRace.value : new Race(activeRace.value);
  return raceInstance.segmentSpeeds;
});

const hurdleAnalysis = computed(() => {
  if (!activeRace.value) return [];
  const raceInstance = activeRace.value instanceof Race ? activeRace.value : new Race(activeRace.value);
  return raceInstance.hurdleAnalysis;
});

const customIntervals = computed(() => {
  if (!activeRace.value) return [];
  const raceInstance = activeRace.value instanceof Race ? activeRace.value : new Race(activeRace.value);
  const template = getDynamicAnalysisTemplate(
    activeRace.value.discipline,
    athlete.value?.gender,
    athlete.value?.category
  );
  return raceInstance.calculateIntervals(template);
});

const loadData = () => {
  const athleteId = route.query.athleteId || StorageManager.getCurrentAthleteId();
  if (athleteId) {
    athlete.value = Athlete.load(athleteId);
    races.value = Race.getByAthlete(athleteId);
  }
};

const selectRace = (race) => {
  activeRace.value = race;
};

const saveActiveRace = () => {
  if (activeRace.value) {
    activeRace.value.save();
    races.value = Race.getByAthlete(athlete.value.id);
  }
};

const createNewRace = () => {
  const race = new Race({
    athleteId: athlete.value.id,
    discipline: newRaceForm.value.discipline,
    name: newRaceForm.value.name,
    date: newRaceForm.value.date
  });
  race.save();
  loadData();
  activeRace.value = race;
  showNewRaceModal.value = false;
  
  newRaceForm.value = {
    discipline: '100m',
    name: '',
    date: new Date().toISOString().split('T')[0]
  };
};

const deleteRace = (race) => {
  if (confirm("Supprimer cette analyse ?")) {
    race.delete();
    activeRace.value = null;
    loadData();
  }
};

const removeMilestone = (index) => {
  activeRace.value.milestones.splice(index, 1);
  saveActiveRace();
};

const addManualMilestone = () => {
  if (!activeRace.value) return;
  activeRace.value.milestones.push({
    label: 'Nouveau jalon',
    type: 'split',
    time: 0,
    distance: 0
  });
};

const onCapture = (timeToCapture) => {
  if (!activeRace.value || !nextMilestone.value) return;
  
  const m = nextMilestone.value;
  activeRace.value.milestones.push({
    label: m.label,
    type: m.type,
    distance: m.distance,
    time: parseFloat(timeToCapture.toFixed(3))
  });
  
  saveActiveRace();
};

const resetCaptures = () => {
  if (confirm("Réinitialiser tous les jalons capturés pour cette course ?")) {
    activeRace.value.milestones = [];
    saveActiveRace();
  }
};

const syncMilestoneWithCurrent = (index) => {
  if (videoAnalyzerRef.value) {
    const time = videoAnalyzerRef.value.getCurrentTime();
    activeRace.value.milestones[index].time = parseFloat(time.toFixed(3));
    saveActiveRace();
  }
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('fr-CH', { day: 'numeric', month: 'long', year: 'numeric' });
};

onMounted(() => {
  loadData();
});

onUnmounted(() => {
  // Empty
});
</script>
