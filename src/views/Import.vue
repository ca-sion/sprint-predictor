<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-slate-500 font-medium">Analyse des données partagées...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
      <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-red-900 mb-2">Erreur lors de l'importation</h3>
      <p class="text-red-700 mb-6">{{ error }}</p>
      <button @click="router.push('/')" class="px-6 py-2 bg-white border border-red-200 text-red-700 font-bold rounded-lg hover:bg-red-50 transition-colors">
        Retour à l'accueil
      </button>
    </div>

    <div v-else-if="importData" class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div class="bg-blue-600 p-6 text-white flex items-center justify-between">
        <div>
          <h3 class="text-xl font-bold">Données partagées reçues</h3>
          <p class="text-blue-100 text-sm">Vérifiez les informations avant l'importation.</p>
        </div>
        <div v-if="isSynced" class="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20">
          Auto-Sync Active
        </div>
      </div>

      <div class="p-8 space-y-6">
        <!-- Athlete Info -->
        <div v-if="importData.athlete" class="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
            {{ importData.athlete.name.charAt(0) }}
          </div>
          <div class="flex-grow">
            <div class="font-bold text-slate-900 text-lg">{{ importData.athlete.name }}</div>
            <div class="text-sm text-slate-500">
              {{ importData.athlete.gender === 'M' ? 'Homme' : 'Femme' }} • Né(e) en {{ importData.athlete.birthYear }}
            </div>
          </div>
          <div v-if="athleteExists" class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-black uppercase">
            Déjà existant
          </div>
        </div>

        <!-- Details -->
        <div class="space-y-3">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                {{ importData.type === 'athlete' ? `${importData.races.length} courses incluses` : '1 course individuelle' }}
            </div>
            
            <div v-if="importData.type === 'athlete'" class="max-h-48 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                <div v-for="race in importData.races" :key="race.id" class="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-sm border border-slate-100">
                    <span class="font-bold text-slate-700">{{ race.discipline }}</span>
                    <span class="text-slate-500 text-xs">{{ race.date }}</span>
                </div>
            </div>

            <div v-else class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-slate-800">{{ importData.race.discipline }}</span>
                    <span class="text-blue-600 font-bold text-sm">{{ importData.race.date }}</span>
                </div>
                <div class="text-xs text-slate-500">{{ importData.race.name || 'Sans titre' }}</div>
            </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <button @click="confirmImport" class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            {{ athleteExists ? 'Fusionner les données' : 'Confirmer l\'importation' }}
          </button>
          <button @click="router.push('/')" class="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Annuler
          </button>
        </div>
        
        <p v-if="isSynced" class="text-center text-[10px] text-slate-400 italic">
          Note : Les données seront automatiquement synchronisées avec votre fichier local après l\'import.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ExportService } from '../services/ExportService.js';
import { Athlete } from '../models/Athlete.js';
import { Race } from '../models/Race.js';
import { StorageManager } from '../models/StorageManager.js';
import { SyncService } from '../services/SyncService.js';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const importData = ref(null);
const isSynced = ref(false);

const athleteExists = computed(() => {
    if (!importData.value?.athlete) return false;
    const athletes = Athlete.getAll();
    return Object.values(athletes).some(a => a.name === importData.value.athlete.name);
});

onMounted(async () => {
  isSynced.value = !!(await SyncService.getHandle());
  
  const dataParam = route.query.data;
  if (!dataParam) {
    error.value = "Aucune donnée n'a été trouvée dans le lien.";
    loading.value = false;
    return;
  }

  try {
    const decoded = ExportService.decodeShareData(dataParam);
    if (!decoded) {
      throw new Error("Les données sont corrompues ou invalides.");
    }
    importData.value = decoded;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

const confirmImport = () => {
  try {
    let athleteId = null;
    const athletesList = Athlete.getAll();
    const existing = Object.values(athletesList).find(a => a.name === importData.value.athlete?.name);

    if (importData.value.type === 'athlete') {
        if (existing) {
            athleteId = existing.id;
        } else {
            const newAthlete = new Athlete(importData.value.athlete);
            newAthlete.save();
            athleteId = newAthlete.id;
        }

        importData.value.races.forEach(r => {
            const race = new Race({ ...r, athleteId: athleteId });
            race.save();
        });
    } else if (importData.value.type === 'race') {
        if (existing) {
            athleteId = existing.id;
        } else if (importData.value.athlete) {
            const newAthlete = new Athlete(importData.value.athlete);
            newAthlete.save();
            athleteId = newAthlete.id;
        }

        if (athleteId) {
            const race = new Race({ ...importData.value.race, athleteId: athleteId });
            race.save();
        }
    }
    
    StorageManager.setCurrentAthlete(athleteId);
    alert("Importation réussie !");
    router.push('/');
  } catch (err) {
    alert("Erreur : " + err.message);
  }
};
</script>
