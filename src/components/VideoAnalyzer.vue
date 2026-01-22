<template>
  <div class="bg-slate-900 rounded-2xl p-6 text-white mb-8 shadow-xl shadow-slate-200/50 overflow-hidden relative border border-slate-800">
    <!-- Header Status -->
    <div class="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse" v-if="isRecording"></div>
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            {{ videoUrl ? 'Analyse Vidéo' : (isRecording ? 'Enregistrement' : 'Outil de Capture') }}
          </h4>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <label class="cursor-pointer bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 flex items-center gap-2">
          <input type="file" accept="video/*" class="hidden" @change="handleVideoUpload">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          {{ videoUrl ? 'Changer' : 'Charger Vidéo' }}
        </label>
        <button v-if="videoUrl" @click="clearVideo" class="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- Video Player Area -->
    <div v-if="videoUrl" class="mb-6 space-y-0 rounded-xl overflow-hidden border border-white/10 bg-black">
      <div class="aspect-video relative group">
        <video 
          ref="videoRef" 
          :src="videoUrl" 
          class="w-full h-full cursor-pointer"
          @timeupdate="onVideoTimeUpdate"
          @loadedmetadata="onVideoLoaded"
          @click="togglePlay"
        ></video>
        
        <!-- Overlay Timecode -->
        <div class="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 font-mono text-xs text-blue-400 tabular-nums">
          T: {{ formatTime(videoCurrentTime) }}
        </div>



        <!-- Integrated Seeker -->
        <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12">
          <input 
            type="range" 
            min="0" 
            :max="videoDuration" 
            step="0.001"
            v-model.number="videoCurrentTime"
            @input="seekVideo"
            class="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
          >
        </div>
      </div>

      <!-- Pro Video Controls Bar -->
      <div class="flex items-center justify-between p-4 bg-slate-800/80 backdrop-blur-sm border-t border-white/5">
        <div class="flex items-center gap-4">
          <button @click="togglePlay" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <svg v-if="videoPaused" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <svg v-else class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>
          
          <div class="flex items-center bg-black/30 rounded-xl p-1 border border-white/5">
            <button 
              v-for="rate in [0.25, 0.5, 1]" 
              :key="rate"
              @click="videoPlaybackRate = rate"
              :class="['px-2 py-1.5 rounded text-[9px] font-black transition-all', videoPlaybackRate === rate ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white']"
            >
              {{ rate }}x
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
            <button @click="stepFrame(-1)" class="px-2 py-1.5 hover:bg-white/5 rounded-lg text-[10px] font-black text-slate-500" title="Shift+Gauche">-1s</button>
            <button @click="stepFrame(-0.01)" class="p-2 hover:bg-white/5 rounded-lg text-white" title="Gauche">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button @click="stepFrame(0.01)" class="p-2 hover:bg-white/5 rounded-lg text-white" title="Droite">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            <button @click="stepFrame(1)" class="px-2 py-1.5 hover:bg-white/5 rounded-lg text-[10px] font-black text-slate-500" title="Shift+Droite">+1s</button>
          </div>
          <button 
            @click="$emit('set-as-start', videoCurrentTime)" 
            class="px-3 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-[10px] font-black transition-all border border-blue-600/20"
          >
            DÉPART (0m)
          </button>
        </div>
      </div>
    </div>

    <!-- Main Interactive Area -->
    <div class="flex flex-col items-center justify-center">
      <div class="text-center">
        <div class="text-2xl font-mono tabular-nums font-black text-blue-400 tracking-tighter drop-shadow-2xl mb-2">
          {{ formatTime(videoUrl ? videoCurrentTime : currentTime) }}
          <span class="text-[10px] font-mono text-slate-500 uppercase tracking-[0.1em]" v-if="videoUrl">
            / {{ formatTime(videoDuration) }}
          </span>
        </div>
      </div>

      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div class="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p class="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Cible</p>
          <div class="flex items-center justify-between">
            <div class="text-xl font-bold text-white">
              {{ nextMilestone?.label || 'Séquence terminée' }}
            </div>
            <button 
              v-if="hasMilestones" 
              @click="$emit('reset')" 
              class="text-[9px] px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all uppercase font-black border border-red-500/20"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div class="flex gap-3">
          <template v-if="!videoUrl">
            <button 
              v-if="!isRecording" 
              @click="startRecording" 
              class="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/40 text-lg uppercase tracking-wider"
            >
              Démarrer
            </button>
            <button 
              v-else 
              @click="capture" 
              class="flex-[2] py-5 bg-white text-slate-900 sm:text-xl font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-white/10 uppercase tracking-widest"
            >
              Capturer
            </button>
            <button 
              v-if="isRecording" 
              @click="stopRecording" 
              class="flex-1 py-5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-2xl transition-all font-black uppercase text-xs"
            >
              Stop
            </button>
          </template>
          <template v-else>
            <button 
              @click="capture" 
              :disabled="!nextMilestone"
              :class="['flex-1 py-6 sm:text-xl font-black rounded-2xl transition-all active:scale-95 shadow-xl uppercase tracking-widest', nextMilestone ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40' : 'bg-slate-800 text-slate-600 cursor-not-allowed']"
            >
              {{ nextMilestone ? 'Capturer Frame' : 'Terminé' }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Shortcut Hint Footer -->
    <div class="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-400 flex justify-between font-bold">
      <div class="flex gap-4">
        <span>ESPACE : Capture</span>
        <span>FLÈCHES : Pas-à-pas</span>
        <span>SHIFT+FLÈCHES : +/- 1s</span>
        <span>L : Play/Pause</span>
      </div>
      <div v-if="videoUrl" class="text-blue-500 flex items-center gap-1 animate-pulse">
        <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        ANALYSE VIDÉO ACTIVE
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  nextMilestone: Object,
  hasMilestones: Boolean
});

const emit = defineEmits(['capture', 'reset', 'set-as-start']);

// Video Logic
const videoRef = ref(null);
const videoUrl = ref(null);
const videoPaused = ref(true);
const videoCurrentTime = ref(0);
const videoDuration = ref(0);
const videoPlaybackRate = ref(1);

// Timer Logic
const isRecording = ref(false);
const startTime = ref(0);
const currentTime = ref(0);
const timerInterval = ref(null);

const handleVideoUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    videoUrl.value = URL.createObjectURL(file);
    videoPaused.value = true;
  }
};

const clearVideo = () => {
  videoUrl.value = null;
  videoPaused.value = true;
};

const onVideoLoaded = () => {
  if (videoRef.value) {
    videoRef.value.playbackRate = videoPlaybackRate.value;
    videoDuration.value = videoRef.value.duration;
  }
};

const onVideoTimeUpdate = () => {
  if (videoRef.value) {
    videoCurrentTime.value = videoRef.value.currentTime;
  }
};

const seekVideo = () => {
  if (videoRef.value) {
    videoRef.value.currentTime = videoCurrentTime.value;
  }
};

const togglePlay = () => {
  if (!videoRef.value) return;
  if (videoRef.value.paused) {
    videoRef.value.play();
    videoPaused.value = false;
  } else {
    videoRef.value.pause();
    videoPaused.value = true;
  }
};

const stepFrame = (seconds) => {
  if (!videoRef.value) return;
  videoRef.value.pause();
  videoPaused.value = true;
  videoRef.value.currentTime += seconds;
};

watch(videoPlaybackRate, (newRate) => {
  if (videoRef.value) videoRef.value.playbackRate = newRate;
});

// Capture methods
const startRecording = () => {
  isRecording.value = true;
  startTime.value = performance.now();
  currentTime.value = 0;
  timerInterval.value = setInterval(() => {
    currentTime.value = (performance.now() - startTime.value) / 1000;
  }, 10);
};

const stopRecording = () => {
  isRecording.value = false;
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

const capture = () => {
  const time = videoUrl.value ? videoCurrentTime.value : currentTime.value;
  emit('capture', time);
  
  if (!props.nextMilestone && !videoUrl.value) {
    stopRecording();
  }
};

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0.00s';
  return seconds.toFixed(2) + 's';
};

// Expose internal state to parent
defineExpose({
  getCurrentTime: () => videoUrl.value ? videoCurrentTime.value : currentTime.value
});

// Keyboard Management
const handleKeyDown = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    if (e.repeat) return;

    if (videoUrl.value || isRecording.value) {
      capture();
    } else {
      startRecording();
    }
  }

  if (videoUrl.value) {
    const jumpSize = e.shiftKey ? 1 : 0.01;
    if (e.key === 'ArrowRight') { e.preventDefault(); stepFrame(jumpSize); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepFrame(-jumpSize); }
    if (e.key.toLowerCase() === 'l') { e.preventDefault(); togglePlay(); }
  }
};

onMounted(() => window.addEventListener('keydown', handleKeyDown));
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  stopRecording();
});
</script>
