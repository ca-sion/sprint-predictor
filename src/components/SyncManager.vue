<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
    <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold text-slate-900">Synchronisation Local-First</h3>
        <p class="text-xs text-slate-500 mt-0.5">Liez un fichier JSON local pour sauvegarder vos données en temps réel.</p>
      </div>
      <div v-if="syncing" class="flex items-center text-blue-600 space-x-2">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-widest">Synchro...</span>
      </div>
      <div v-else-if="lastSyncSuccess" class="flex items-center text-emerald-500 space-x-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
        <span class="text-[10px] font-bold uppercase tracking-widest">À jour</span>
      </div>
    </div>

    <div class="p-6">
      <!-- État 1 : Non lié -->
      <div v-if="!fileHandle" class="text-center py-4">
        <button @click="linkFile" class="inline-flex items-center px-6 py-3 bg-white border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-all group">
          <svg class="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.103-1.103"/>
          </svg>
          <span class="font-bold text-sm">Lier un fichier JSON local</span>
        </button>
        <p class="text-[10px] text-slate-400 mt-4 max-w-xs mx-auto italic">
          Idéal pour synchroniser vos données avec Google Drive ou Dropbox via leurs dossiers locaux.
        </p>
      </div>

      <!-- État 2 : Lié mais permission requise -->
      <div v-else-if="permissionRequired" class="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div>
            <div class="text-sm font-bold text-orange-900">Permission révoquée</div>
            <div class="text-xs text-orange-700">Le navigateur nécessite votre accord pour synchroniser.</div>
          </div>
        </div>
        <button @click="requestPermission" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
          Réactiver
        </button>
      </div>

      <!-- État 3 : Synchronisé -->
      <div v-else class="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
        <div class="flex items-center space-x-3 overflow-hidden">
          <div class="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="overflow-hidden">
            <div class="text-sm font-bold text-emerald-900 truncate">{{ fileHandle.name }}</div>
            <div class="text-[10px] text-emerald-700 font-medium">Liaison active • Sauvegarde automatique</div>
          </div>
        </div>
        <button @click="unlinkFile" class="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Détacher le fichier">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { SyncService } from '../services/SyncService.js';
import { StorageManager } from '../models/StorageManager.js';

const fileHandle = ref(null);
const syncing = ref(false);
const permissionRequired = ref(false);
const lastSyncSuccess = ref(false);

const updateStatus = async () => {
  fileHandle.value = await SyncService.getHandle();
  if (fileHandle.value) {
    const hasPermission = await SyncService.verifyPermission(fileHandle.value);
    permissionRequired.value = !hasPermission;
  } else {
    permissionRequired.value = false;
  }
};

const linkFile = async () => {
  const handle = await SyncService.linkFile();
  if (handle) {
    // Proposer de charger ou d'écraser ?
    // Pour simplifier, on force une première sauvegarde locale vers le fichier
    if (confirm("Voulez-vous écraser le contenu du fichier sélectionné par vos données actuelles ?\n\n(Si le fichier est vide ou neuf, cliquez sur OK)")) {
        await SyncService.saveToDisk();
    } else if (confirm("Voulez-vous charger les données du fichier et écraser votre session actuelle ?")) {
        const db = await SyncService.loadFromDisk();
        if (db) {
            StorageManager.saveDB(db);
            alert("Données chargées avec succès !");
        }
    }
    updateStatus();
  }
};

const requestPermission = async () => {
  if (fileHandle.value) {
    const granted = await SyncService.verifyPermission(fileHandle.value, true);
    if (granted) {
      permissionRequired.value = false;
      await SyncService.saveToDisk();
    }
  }
};

const unlinkFile = async () => {
  if (confirm("Êtes-vous sûr de vouloir détacher ce fichier ? La synchronisation sera arrêtée.")) {
    await SyncService.unlinkFile();
    updateStatus();
  }
};

const onSyncStarted = () => { syncing.value = true; };
const onSyncFinished = (e) => { 
  syncing.value = false; 
  lastSyncSuccess.value = e.detail.success;
  if (lastSyncSuccess.value) {
    setTimeout(() => { lastSyncSuccess.value = false; }, 3000);
  }
};
const onPermissionRequired = () => { permissionRequired.value = true; };

onMounted(() => {
  updateStatus();
  window.addEventListener('sync-status-changed', updateStatus);
  window.addEventListener('sync-started', onSyncStarted);
  window.addEventListener('sync-finished', onSyncFinished);
  window.addEventListener('sync-permission-required', onPermissionRequired);
});

onUnmounted(() => {
  window.removeEventListener('sync-status-changed', updateStatus);
  window.removeEventListener('sync-started', onSyncStarted);
  window.removeEventListener('sync-finished', onSyncFinished);
  window.removeEventListener('sync-permission-required', onPermissionRequired);
});
</script>
