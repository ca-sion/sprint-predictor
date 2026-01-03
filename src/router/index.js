import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Analysis from '../views/Analysis.vue';
import RaceAnalysis from '../views/RaceAnalysis.vue';
import RacesEvolution from '../views/RacesEvolution.vue';
import AthleteProfile from '../views/AthleteProfile.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/analysis', name: 'Analysis', component: Analysis },
  { path: '/races-analysis', name: 'RaceAnalysis', component: RaceAnalysis },
  { path: '/races-evolution', name: 'RacesEvolution', component: RacesEvolution },
  { path: '/athlete/:id', name: 'AthleteProfile', component: AthleteProfile },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
