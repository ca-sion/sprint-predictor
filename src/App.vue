<template>
  <div class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900">Sprint <span class="text-blue-600">Predictor</span></h1>
        </router-link>
        
        <nav class="hidden md:flex items-center space-x-6">
          <router-link to="/" class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" active-class="text-blue-600">Accueil</router-link>
          <router-link to="/predictor" class="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" active-class="text-blue-600">Predictor</router-link>
          <span class="text-sm font-medium text-slate-300 cursor-not-allowed" title="Bientôt disponible">Analyse de course</span>
        </nav>

        <div class="flex items-center space-x-3">
          <div v-if="currentAthlete" class="hidden sm:flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 mr-2">
            {{ currentAthlete.name }}
          </div>
          <router-link to="/predictor" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
            Ouvrir l'App
          </router-link>
        </div>
      </div>
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
    <footer class="bg-white border-t border-slate-200 py-8">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <p class="text-slate-500 text-sm font-medium">CA Sion Sprint Predictor</p>
        <p class="text-slate-400 text-xs mt-1">
          Développé par <a href="https://michaelravedoni.com" class="underline hover:text-blue-500">MR</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Athlete } from './models/Athlete.js';

const currentAthlete = ref(null);

const updateCurrentAthlete = () => {
  const savedId = localStorage.getItem('casion_current_athlete');
  if (savedId) {
    const all = Athlete.getAll();
    currentAthlete.value = all[savedId] || null;
  } else {
    currentAthlete.value = null;
  }
};

onMounted(() => {
  updateCurrentAthlete();
  window.addEventListener('storage', updateCurrentAthlete);
  window.addEventListener('athlete-updated', updateCurrentAthlete);
});

onUnmounted(() => {
  window.removeEventListener('storage', updateCurrentAthlete);
  window.removeEventListener('athlete-updated', updateCurrentAthlete);
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
