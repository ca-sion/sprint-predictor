import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Predictor from '../views/Predictor.vue';
import RaceAnalysis from '../views/RaceAnalysis.vue';
import AthleteProfile from '../views/AthleteProfile.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/predictor', name: 'Predictor', component: Predictor },
  { path: '/races-analysis', name: 'RaceAnalysis', component: RaceAnalysis },
  { path: '/athlete/:id', name: 'AthleteProfile', component: AthleteProfile },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
