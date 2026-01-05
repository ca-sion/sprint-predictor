<template>
  <div class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">
    <!-- Sync Alert Banner (Sticky) -->
    <div v-if="syncPermissionRequired" class="bg-orange-600 text-white px-4 py-2 text-center text-xs font-bold flex items-center justify-center space-x-3 cursor-pointer hover:bg-orange-700 transition-colors" @click="router.push('/')">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      <span>Synchronisation en pause : Action requise pour autoriser l'accès au fichier.</span>
      <span class="underline ml-2">Réactiver</span>
    </div>

    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <img src="/src/assets/logo.svg" alt="Logo">
          </div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900">Sprint <span class="text-blue-600">Predictor</span></h1>
        </router-link>
        
        <nav class="hidden md:flex items-center space-x-6">
          <router-link to="/" class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" active-class="text-blue-600">Accueil</router-link>
          <router-link to="/analysis" class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" active-class="text-blue-600">Analyse</router-link>
          <router-link to="/races-analysis" class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" active-class="text-blue-600">Courses</router-link>
        </nav>

        <div class="flex items-center space-x-2 sm:space-x-3">
          <!-- Sync Indicator -->
          <div v-if="isSynced" class="hidden sm:flex items-center mr-2 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100" title="Synchronisation locale active">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" :class="{'animate-pulse': isSyncing}"></div>
            <span class="text-[10px] font-black uppercase tracking-tighter">Sync</span>
          </div>

          <!-- Athlete Selector -->
          <div v-if="currentAthlete" class="relative group">
            <button @click="isAthleteSelectorOpen = !isAthleteSelectorOpen" 
                    class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all shadow-sm">
              <span class="hidden sm:inline">{{ currentAthlete.name }}</span>
              <span class="sm:hidden uppercase">{{ currentAthleteInitials }}</span>
              <svg class="w-3 h-3 ml-1 transform transition-transform duration-200" :class="{'rotate-180': isAthleteSelectorOpen}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Dropdown -->
            <transition 
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div v-if="isAthleteSelectorOpen" 
                   class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-[60] overflow-hidden">
                <div class="px-4 py-2 border-b border-slate-50 mb-1">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Changer d'athlète</span>
                </div>
                <div class="max-h-60 overflow-y-auto custom-scrollbar">
                  <button v-for="ath in Object.values(allAthletes)" 
                          :key="ath.id"
                          @click="switchAthlete(ath.id)"
                          class="w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center justify-between transition-colors"
                          :class="ath.id === currentAthlete.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
                    {{ ath.name }}
                    <svg v-if="ath.id === currentAthlete.id" class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
                <div class="mt-1 pt-1 border-t border-slate-50">
                  <router-link to="/" @click="isAthleteSelectorOpen = false" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    Nouvel athlète
                  </router-link>
                </div>
              </div>
            </transition>
          </div>

          <!-- Profile Link -->
          <router-link v-if="currentAthlete" :to="`/athlete/${currentAthlete.id}`" class="px-3 py-2 sm:px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-sm">
            <span class="hidden sm:inline">Profil</span>
            <svg class="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </router-link>
          
          <!-- Mobile Menu Button -->
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <transition 
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-1 shadow-xl">
          <router-link 
            to="/" 
            @click="isMobileMenuOpen = false"
            class="block px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all"
            active-class="bg-blue-50 text-blue-600"
          >
            Accueil
          </router-link>
          <router-link 
            to="/analysis" 
            @click="isMobileMenuOpen = false"
            class="block px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all"
            active-class="bg-blue-50 text-blue-600"
          >
            Analyse
          </router-link>
          <router-link 
            to="/races-analysis" 
            @click="isMobileMenuOpen = false"
            class="block px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all"
            active-class="bg-blue-50 text-blue-600"
          >
            Courses
          </router-link>
          <div v-if="currentAthlete" class="pt-2 pb-1 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Athlète actuel : {{ currentAthlete.name }}
          </div>
        </div>
      </transition>
    </header>

    <!-- Main Content -->
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-4">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-slate-500 text-sm font-medium">Sprint Predictor</p>
        <p class="text-slate-400 text-xs mt-1">
          Développé avec <span class="text-[7pt]">♥️</span> en 🇨🇭 par <a href="https://michaelravedoni.com" class="underline hover:text-blue-500" target="_blank">MR</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Athlete } from './models/Athlete.js';
import { StorageManager } from './models/StorageManager.js';
import { SyncService } from './services/SyncService.js';

const router = useRouter();
const currentAthlete = ref(null);
const allAthletes = ref({});
const isMobileMenuOpen = ref(false);
const isAthleteSelectorOpen = ref(false);

const isSynced = ref(false);
const isSyncing = ref(false);
const syncPermissionRequired = ref(false);

const currentAthleteInitials = computed(() => {
  if (!currentAthlete.value?.name) return '??';
  const parts = currentAthlete.value.name.split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]);
});

const updateCurrentAthlete = () => {
  allAthletes.value = Athlete.getAll();
  const savedId = StorageManager.getCurrentAthleteId();
  if (savedId) {
    currentAthlete.value = allAthletes.value[savedId] || null;
  } else {
    currentAthlete.value = null;
  }
};

const switchAthlete = (id) => {
  StorageManager.setCurrentAthlete(id);
  isAthleteSelectorOpen.value = false;
};

const closeSelector = (e) => {
  if (isAthleteSelectorOpen.value && !e.target.closest('.group')) {
    isAthleteSelectorOpen.value = false;
  }
};

// Logic Sync
const checkSyncStatus = async () => {
  if (!SyncService.isSupported()) return;
  
  const handle = await SyncService.getHandle();
  isSynced.value = !!handle;
  if (handle) {
    const hasPermission = await SyncService.verifyPermission(handle);
    syncPermissionRequired.value = !hasPermission;
    
    // Si on a la permission, on tente de charger au démarrage
    if (hasPermission) {
        const diskDB = await SyncService.loadFromDisk();
        if (diskDB) {
            // Comparaison basique pour éviter d'écraser si identique
            const localDB = StorageManager.getDB();
            if (diskDB.lastUpdated > localDB.lastUpdated) {
                console.log("Mise à jour depuis le disque...");
                StorageManager.saveDB(diskDB);
            }
        }
    }
  }
};

onMounted(() => {
  updateCurrentAthlete();
  checkSyncStatus();

  window.addEventListener('storage', updateCurrentAthlete);
  window.addEventListener('athlete-updated', updateCurrentAthlete);
  window.addEventListener('db-updated', updateCurrentAthlete);
  window.addEventListener('click', closeSelector);

  // Events Sync
  window.addEventListener('sync-status-changed', checkSyncStatus);
  window.addEventListener('sync-permission-required', () => { syncPermissionRequired.value = true; });
  window.addEventListener('sync-started', () => { isSyncing.value = true; });
  window.addEventListener('sync-finished', () => { isSyncing.value = false; syncPermissionRequired.value = false; });
});

onUnmounted(() => {
  window.removeEventListener('storage', updateCurrentAthlete);
  window.removeEventListener('athlete-updated', updateCurrentAthlete);
  window.removeEventListener('db-updated', updateCurrentAthlete);
  window.removeEventListener('click', closeSelector);
  window.removeEventListener('sync-status-changed', checkSyncStatus);
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
