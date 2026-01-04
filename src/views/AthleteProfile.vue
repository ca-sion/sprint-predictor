<template>
  <div v-if="athlete" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
      <div class="flex items-center space-x-2 sm:space-x-4">
        <button @click="router.push('/')" class="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
        </button>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 truncate">
          Profil de <span class="text-blue-600">{{ athlete.name || 'Athlète' }}</span>
        </h2>
      </div>
      <div class="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
        <button @click="shareAthlete" class="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm sm:text-base font-bold rounded-lg transition-colors shadow-sm">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          Partager
        </button>
        <button @click="exportAthleteData" class="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm sm:text-base font-bold rounded-lg transition-colors shadow-sm">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Exporter
        </button>
        <button @click="saveAthlete" class="flex-1 sm:flex-none inline-flex items-center justify-center px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-bold rounded-lg transition-colors shadow-sm">
          Enregistrer
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      <!-- Left Column: Basic Info & Notes -->
      <div class="md:col-span-1 space-y-6">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 class="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Informations de base</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
              <input v-model="athlete.name" type="text" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Année de naissance</label>
              <input v-model.number="athlete.birthYear" type="number" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Sexe</label>
              <select v-model="athlete.gender" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 class="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Notes & observations</h3>
          <textarea 
            v-model="athlete.notes" 
            rows="8" 
            placeholder="Points forts, axes d'amélioration, blessures..." 
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
          ></textarea>
        </div>
      </div>

      <!-- Right Column: PBs -->
      <div class="md:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 class="text-lg font-bold text-slate-900">Records personnels (PB)</h3>
            <p class="text-sm text-slate-500">Mettez à jour les meilleures performances de l'athlète.</p>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div v-for="field in pbFields" :key="field.id" class="relative">
                <label :for="field.id" class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {{ field.label }}
                </label>
                <div class="relative">
                  <input 
                    :id="field.id"
                    type="number" 
                    :step="field.step" 
                    :placeholder="field.placeholder"
                    v-model.number="athlete.metrics[field.id]"
                    class="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono font-bold text-slate-700"
                  >
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-sm font-bold">
                    {{ field.unit }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Navigation -->
        <div class="flex flex-col space-y-4">
          <button @click="goToPredictor" class="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center">
            Analyser le potentiel
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
          <button @click="goToAnalysis" class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-200">
            Analyser les courses
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex items-center justify-center h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Athlete } from '../models/Athlete.js';
import { Race } from '../models/Race.js';
import { StorageManager } from '../models/StorageManager.js';
import { ExportService } from '../services/ExportService.js';
import { INPUT_GROUPS } from '../data/definitions/FormConfig.js';

const route = useRoute();
const router = useRouter();
const athlete = ref(null);

const pbFields = computed(() => {
  const pbGroup = INPUT_GROUPS.find(g => g.id === 'pbs');
  return pbGroup ? pbGroup.fields : [];
});

const loadAthlete = () => {
  const id = route.params.id;
  const loaded = Athlete.load(id);
  if (loaded) {
    athlete.value = loaded;
  } else {
    router.push('/');
  }
};

const saveAthlete = () => {
  if (athlete.value) {
    athlete.value.save();
    alert("Profil enregistré avec succès !");
  }
};

const goToPredictor = () => {
  if (athlete.value) {
    athlete.value.save();
    StorageManager.setCurrentAthlete(athlete.value.id);
    router.push('/analysis');
  }
};

const goToAnalysis = () => {
  if (athlete.value) {
    athlete.value.save();
    StorageManager.setCurrentAthlete(athlete.value.id);
    router.push({ path: '/races-analysis', query: { athleteId: athlete.value.id } });
  }
};

const exportAthleteData = () => {
  if (!athlete.value) return;
  ExportService.exportAthlete(athlete.value.id);
};

const shareAthlete = () => {
  if (!athlete.value) return;
  const result = ExportService.generateAthleteShareLink(athlete.value.id);
  if (result) {
    navigator.clipboard.writeText(result.url).then(() => {
      let msg = "Lien de partage de l'athlète copié !";
      if (result.isLimited) {
        msg += "\n\nNote: Seules les 3 courses les plus récentes sont incluses dans le lien. Utilisez 'Exporter' pour envoyer l'historique complet.";
      }
      alert(msg);
    });
  }
};

onMounted(loadAthlete);
</script>
