<template>
  <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
          </svg>
          Évolution Historique
        </h1>
        <p class="text-slate-500 text-sm mt-1">
          Suivi des performances de <span class="font-bold text-slate-700">{{ athlete.name || 'Athlète' }}</span> ({{ athlete.history ? athlete.history.length : 0 }} relevés)
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="openAddModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Ajouter une session
        </button>
        <router-link to="/analysis" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Retour
        </router-link>
      </div>
    </div>

    <!-- Graphiques -->
    <div v-if="activeGroups.length > 0">
      <div v-for="group in activeGroups" :key="group.id" class="mb-12 animate-fade-in">
        <h2 class="text-lg font-bold text-slate-800 flex items-center mb-6 border-b border-slate-200 pb-2">
          <span class="mr-2">{{ group.icon }}</span> {{ group.title }}
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="field in group.activeFields" :key="field.id" class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-black text-slate-500 uppercase tracking-widest">{{ field.label }}</h3>
                <span class="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{{ field.unit }}</span>
            </div>
            <div class="relative h-48 w-full">
              <canvas :ref="el => { if(el) canvasRefs[field.id] = el }"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-16 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed mb-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
      <h3 class="text-lg font-bold text-slate-700 mb-1">Aucune donnée historique</h3>
      <p class="text-sm">Cliquez sur "Ajouter une session" ou saisissez des données dans l'analyse.</p>
    </div>

    <!-- Gestion de l'historique -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-12" v-if="athlete.history && athlete.history.length > 0">
      <div class="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 class="text-md font-bold text-slate-800">Gestion des Sessions</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="px-5 py-3 font-bold">Date</th>
              <th class="px-5 py-3 font-bold">Métriques enregistrées</th>
              <th class="px-5 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="session in sortedHistory" :key="session.date" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-5 py-3 font-medium text-slate-900">{{ formatDate(session.date) }}</td>
              <td class="px-5 py-3 text-slate-500">
                <div class="flex flex-wrap gap-1">
                  <span v-for="(val, key) in session.metrics" :key="key" class="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                    {{ getMetricLabel(key) }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="openEditModal(session)" class="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition-colors" title="Éditer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button @click="confirmDelete(session.date)" class="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-1.5 rounded transition-colors" title="Supprimer">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal d'Édition/Ajout -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="text-lg font-bold text-slate-800">
            {{ isEditing ? 'Éditer la session' : 'Ajouter une session' }}
          </h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div class="mb-6">
            <label class="block text-sm font-bold text-slate-700 mb-2">Date de la session</label>
            <input type="date" v-model="editingDate" :disabled="isEditing" 
                   class="w-full sm:w-64 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:bg-slate-50">
            <p v-if="isEditing" class="text-xs text-slate-400 mt-1">La date d'une session existante ne peut pas être modifiée.</p>
          </div>

          <div class="space-y-6">
            <div v-for="group in INPUT_GROUPS" :key="group.id" class="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <h4 class="font-bold text-slate-700 mb-4 flex items-center text-sm border-b border-slate-200 pb-2">
                <span class="mr-2">{{ group.icon }}</span> {{ group.title }}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="field in group.fields" :key="field.id">
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{{ field.label }}</label>
                  <div class="relative group">
                    <input type="number" 
                      :step="field.step" 
                      :placeholder="field.placeholder"
                      v-model.number="editingMetrics[field.id]"
                      class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pl-3 pr-8"
                    >
                    <span class="absolute right-3 top-2 text-xs text-slate-400 font-medium">{{ field.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button @click="closeModal" class="px-4 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-medium rounded-lg transition-colors">
            Annuler
          </button>
          <button @click="saveSession" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center shadow-sm">
            Enregistrer
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';
import { Athlete } from '../models/Athlete.js';
import { StorageManager } from '../models/StorageManager.js';
import { INPUT_GROUPS } from '../data/definitions/FormConfig.js';
import { FormatService } from '../services/FormatService.js';

const router = useRouter();
const athlete = ref(new Athlete());
const canvasRefs = ref({});
let chartInstances = {};

// Modal state
const showModal = ref(false);
const isEditing = ref(false);
const editingDate = ref('');
const editingMetrics = ref({});

const loadData = () => {
  const savedId = StorageManager.getCurrentAthleteId();
  if (savedId) {
    const loaded = Athlete.load(savedId);
    if (loaded) {
      athlete.value = loaded;
      if (athlete.value.history) {
        athlete.value.history.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
    } else {
      router.push('/analysis');
    }
  } else {
    router.push('/analysis');
  }
};

const sortedHistory = computed(() => {
  if (!athlete.value.history) return [];
  return [...athlete.value.history].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const activeGroups = computed(() => {
  if (!athlete.value.history || athlete.value.history.length === 0) return [];
  const groups = [];
  for (const group of INPUT_GROUPS) {
    const activeFields = group.fields.filter(field => {
      const dataPoints = athlete.value.history.filter(h => h.metrics[field.id] !== undefined && h.metrics[field.id] !== null);
      return dataPoints.length > 0;
    });
    if (activeFields.length > 0) {
      groups.push({ ...group, activeFields });
    }
  }
  return groups;
});

const getMetricLabel = (key) => {
  for (const group of INPUT_GROUPS) {
    const field = group.fields.find(f => f.id === key);
    if (field) return field.label;
  }
  return key;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-CH', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

// --- Modal Actions ---

const openAddModal = () => {
  isEditing.value = false;
  editingDate.value = new Date().toISOString().split('T')[0];
  editingMetrics.value = {};
  showModal.value = true;
};

const openEditModal = (session) => {
  isEditing.value = true;
  editingDate.value = session.date;
  editingMetrics.value = { ...session.metrics };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingDate.value = '';
  editingMetrics.value = {};
};

const saveSession = () => {
  if (!editingDate.value) {
    alert("Veuillez sélectionner une date.");
    return;
  }
  
  athlete.value.updateHistory(editingDate.value, editingMetrics.value);
  closeModal();
  
  // Re-render
  nextTick(() => {
    setTimeout(renderCharts, 100);
  });
};

const confirmDelete = (date) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la session du ${formatDate(date)} ? Cette action est irréversible.`)) {
    athlete.value.deleteHistory(date);
    nextTick(() => {
      setTimeout(renderCharts, 100);
    });
  }
};

const renderCharts = () => {
  Object.values(chartInstances).forEach(chart => chart.destroy());
  chartInstances = {};
  if (!athlete.value.history || athlete.value.history.length === 0) return;
  
  const history = athlete.value.history;
  const dates = history.map(h => new Date(h.date).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: '2-digit' }));
  
  for (const group of activeGroups.value) {
    for (const field of group.activeFields) {
      const canvas = canvasRefs.value[field.id];
      if (!canvas) continue;
      const ctx = canvas.getContext('2d');
      const data = history.map(h => {
        const val = h.metrics[field.id];
        return (val !== undefined && val !== null) ? val : null;
      });
      
      let color = '#3b82f6'; let bgColor = 'rgba(59, 130, 246, 0.1)';
      if (group.id === 'pbs') { color = '#f59e0b'; bgColor = 'rgba(245, 158, 11, 0.1)'; }
      if (group.id === 'tests_sprint') { color = '#10b981'; bgColor = 'rgba(16, 185, 129, 0.1)'; }
      if (group.id === 'tests_power') { color = '#8b5cf6'; bgColor = 'rgba(139, 92, 246, 0.1)'; }
      if (group.id === 'tests_biomech') { color = '#ec4899'; bgColor = 'rgba(236, 72, 153, 0.1)'; }

      const reverseY = ['s', 'ms'].includes(field.unit);

      chartInstances[field.id] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [{
            label: field.label,
            data: data,
            borderColor: color,
            backgroundColor: bgColor,
            borderWidth: 2,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            spanGaps: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: FormatService.chartTooltipConfig({
                label: (ctx) => `${FormatService.number(ctx.raw)} ${field.unit}`
            })
          },
          scales: {
            y: {
              reverse: reverseY,
              grid: { color: '#f1f5f9' },
              ticks: { font: { size: 10, weight: 'bold' }, color: '#64748b' }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 9 }, color: '#94a3b8', maxRotation: 45, minRotation: 45 }
            }
          }
        }
      });
    }
  }
};

onMounted(() => {
  loadData();
  nextTick(() => {
    setTimeout(renderCharts, 100);
  });
});
</script>
