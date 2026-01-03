import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Predictor from '../views/Predictor.vue';
import RaceAnalysis from '../views/RaceAnalysis.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/predictor', name: 'Predictor', component: Predictor },
  { path: '/analysis', name: 'RaceAnalysis', component: RaceAnalysis },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
