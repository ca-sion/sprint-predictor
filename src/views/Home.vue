<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Bienvenue sur <span class="text-blue-600">Sprint Predictor</span>
      </h2>
      <p class="mt-4 text-xl text-slate-500">
        Gérez vos athlètes, analysez leurs performances et prédisez leur potentiel.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Athlete Management -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">Vos Athlètes</h3>
            <button @click="createNewAthlete" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nouveau
            </button>
          </div>
          
          <div class="divide-y divide-slate-100">
            <div v-if="Object.keys(athletes).length === 0" class="p-12 text-center text-slate-400">
              <svg class="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Aucun athlète enregistré. Commencez par en créer un.
            </div>
            
            <div v-for="(athlete, id) in athletes" :key="id" class="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                  {{ (athlete.name || '?').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-bold text-slate-900">{{ athlete.name || 'Sans nom' }}</div>
                  <div class="text-xs text-slate-500">{{ getAthleteSub(athlete) }}</div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button @click="shareAthlete(athlete)" class="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Partager">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  </svg>
                </button>
                <button @click="selectAthlete(id)" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold rounded transition-all">
                  Charger
                </button>
                <button @click="deleteAthlete(id)" class="p-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tools & Import/Export -->
      <div class="space-y-6">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Sauvegarde & Transfert</h3>
          <div class="space-y-4">
            <button @click="exportData" class="w-full flex items-center justify-center px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Exporter en JSON
            </button>
            
            <label class="w-full flex items-center justify-center px-4 py-3 border border-slate-200 border-dashed rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer">
              <svg class="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/>
              </svg>
              Importer un fichier
              <input type="file" class="hidden" @change="importData" accept=".json">
            </label>
          </div>
          <p class="mt-4 text-[10px] text-slate-400 leading-tight">
            Les données sont stockées localement dans votre navigateur. Utilisez l'export pour transférer vos données vers un autre appareil.
          </p>
        </div>

        <div class="bg-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-500/20 text-white">
          <h3 class="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Prochainement</h3>
          <p class="text-sm font-medium mb-4">Analyse de courses de compétition (découpage vidéo et splits automatiques).</p>
          <div class="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold">WIP</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Athlete } from '../models/Athlete.js';

const router = useRouter();
const athletes = ref({});

const loadAthletes = () => {
  athletes.value = Athlete.getAll();
};

const getAthleteSub = (athlete) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - athlete.birthYear;
  const gender = athlete.gender === 'M' ? 'Homme' : 'Femme';
  return `${gender} • ${age} ans • ${athlete.lastUpdated?.split('T')[0] || '?'}`;
};

const createNewAthlete = () => {
  const name = prompt("Nom de l'athlète :");
  if (name) {
    const athlete = new Athlete({ name });
    athlete.save();
    loadAthletes();
  }
};

const selectAthlete = (id) => {
  localStorage.setItem('sprint_predictor_current_athlete', id);
  router.push('/predictor');
};

const deleteAthlete = (id) => {
  if (confirm("Supprimer cet athlète ? Cette action est irréversible.")) {
    const all = Athlete.getAll();
    delete all[id];
    localStorage.setItem('sprint_predictor_athletes', JSON.stringify(all));
    if (localStorage.getItem('sprint_predictor_current_athlete') === id) {
      localStorage.removeItem('sprint_predictor_current_athlete');
    }
    loadAthletes();
  }
};

const exportData = () => {
  const data = localStorage.getItem('sprint_predictor_athletes') || '{}';
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sprint-predictor-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const importData = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const current = Athlete.getAll();
      const merged = { ...current, ...data };
      localStorage.setItem('sprint_predictor_athletes', JSON.stringify(merged));
      loadAthletes();
      alert("Importation réussie !");
    } catch (err) {
      alert("Erreur lors de l'importation. Fichier JSON invalide.");
    }
  };
  reader.readAsText(file);
};

const shareAthlete = (athlete) => {
  const data = btoa(JSON.stringify(athlete));
  const url = `${window.location.origin}${window.location.pathname}#/predictor?share=${data}`;
  navigator.clipboard.writeText(url).then(() => {
    alert("Lien de partage copié dans le presse-papier !");
  });
};

onMounted(loadAthletes);
</script>
