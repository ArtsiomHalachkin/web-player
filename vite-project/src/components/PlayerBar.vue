<template>
  <div class="player-bar">
    <v-row align="center" justify="space-between" class="w-100 pa-4">
      <!-- Play/Pause Button -->
      <v-col cols="auto" class="d-flex align-center">
        <v-btn icon @click="togglePlayback">
          <v-icon>
            {{ isPlaying ? 'mdi-pause' : 'mdi-play' }}
          </v-icon>
        </v-btn>
      </v-col>

      <!-- Slider -->
      <v-col class="d-flex align-center">
        <v-slider
          color="green"
          hide-details
          :min="0"
          :max="duration"
          :model-value="position"
          @update:model-value="onSliderChange"
          class="player-slider"
        />
      </v-col>

      <!-- Time and Like Button -->
      <v-col cols="auto" class="d-flex align-center justify-end">
        <v-chip size="small" color="grey-lighten-1" class="me-2">
          {{ formatTime(position) }} / {{ formatTime(duration) }}
        </v-chip>
        <v-btn icon @click="toggleLike">
          <v-icon :color="isLiked ? 'green' : 'white'">
            {{ isLiked ? 'mdi-heart' : 'mdi-heart-outline' }}
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <div class="now-playing-big text-center text-white pb-2">
      Now playing {{ trackName }}<span v-if="artistName"> from {{ artistName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlaybackStore } from '../stores/playback';
import { useSearchStore } from '../stores/search';

const props = defineProps<{
  currentTrack?: any;
  position?: number;
  duration?: number;
}>();

const playbackStore = usePlaybackStore();
const searchStore = useSearchStore();

const position = computed(() => props.position ?? 0);
const duration = computed(() => props.duration ?? 0);

const isPlaying = computed(() =>
  props.currentTrack &&
  playbackStore.currentlyPlayingUri === props.currentTrack.uri &&
  playbackStore.isPlaying
);

const isLiked = computed(() =>
  props.currentTrack ? searchStore.likedTracks[props.currentTrack.id] : false
);

const trackName = computed(() => props.currentTrack?.name || '—');
const artistName = computed(() =>
  props.currentTrack?.artists?.map((a: { name: string }) => a.name).join(', ') || ''
);

function formatTime(ms: number) {
  if (!ms) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function togglePlayback() {
  if (props.currentTrack) {
    playbackStore.togglePlayback(props.currentTrack);
  }
}

function toggleLike() {
  if (props.currentTrack) {
    searchStore.toggleLike(props.currentTrack.id);
  }
}

function onSliderChange(val: number) {
  playbackStore.seek && playbackStore.seek(val);
}
</script>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background-color: #1e1e1e;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.now-playing-big {
  font-size: 1.15em;
  font-weight: 500;
  color: #fff;
  letter-spacing: 0.5px;
  margin-top: -1.2em;
}
.player-slider {
  margin-bottom: 0;
  margin-top: 0;
}
</style>