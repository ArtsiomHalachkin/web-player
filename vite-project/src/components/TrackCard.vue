<template>
  <v-card elevation="2" class="track-card" id = "track-card">
    <div class="image-hover-wrapper">
      <v-img :src="Image" cover class="circle-img" />
      <div class="image-hover-overlay"></div>
      <v-icon
        class="play-icon"
        size="48"
        @click.stop="onPlayClick"
        style="cursor:pointer"
      >
        {{ isPlaying ? 'mdi-stop' : 'mdi-play-circle' }}
      </v-icon>
    </div>
    <v-card-text class="text-center">
      <div
        class="title text-subtitle-1"
        :class="isPlaying ? 'text-green' : 'text-white'"
        :title="Title"
      >
        {{ Title }}
      </div>
      <router-link
        :to="{ name: 'artist', params: { id: CreatorId } }"
        class="creator"
      >
        {{ Creator }}
      </router-link>
      <div class="like-btn-wrapper">
        <v-btn
          id ="like-btn"
          variant="plain"
          class="like-btn"
          :icon="props.liked ? 'mdi-heart' : 'mdi-heart-outline'"
          :color="props.liked ? 'green' : 'grey'"
          @click="$emit('toggleLike'); if (props.liked) $emit('unlike')"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { usePlaybackStore } from '../stores/playback';
import { computed } from 'vue';

const props = defineProps<{
  Creator: string;
  CreatorId: string;
  Title: string;
  Image: string;
  liked?: boolean;
  uri?: string;
}>();

defineEmits(["toggleLike", "unlike"]);

const playbackStore = usePlaybackStore();

const isPlaying = computed(() =>
  props.uri && playbackStore.currentlyPlayingUri === props.uri
);

function onPlayClick() {
  if (props.uri) {
    playbackStore.togglePlayback({ uri: props.uri });
    setTimeout(() => {}, 500);
  }
}
</script>

<style scoped>
.track-card {
  background-color: #2a2a2a;
  width: 100%;
  padding: 25px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 12px 24px 12px;
  height: 380px;         /* Set a fixed height */
  box-sizing: border-box;
  justify-content: flex-start;
}

.image-hover-wrapper {
  position: relative;
  width: 120px;
  aspect-ratio: 1 / 1;
  max-width: 180px;
  margin: auto;
  overflow: hidden;
  margin-bottom: 28px;
}

.v-card-text {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.circle-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.image-hover-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1;
  border-radius: 50%;
}

.play-icon {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
  pointer-events: auto;
}

.image-hover-wrapper:hover .image-hover-overlay,
.image-hover-wrapper:focus .image-hover-overlay {
  opacity: 1;
  pointer-events: none;
}

.image-hover-wrapper:hover .play-icon,
.image-hover-wrapper:focus .play-icon {
  opacity: 1;
}

.title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2; /* Standard property for compatibility */
  box-orient: vertical; /* Standard property for compatibility */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  max-width: 100%;
  min-height: 48px;;
  margin: 0 auto;
  text-align: center;
  word-break: break-word;
  padding-left: 8px;
  padding-right: 8px;
}

.text-green {
  color: #4caf50 !important;
}

.text-white {
  color: #fff !important;
}

.creator {
  display: block;
  margin-top: 4px;
  min-height: 20px;
  text-decoration: none;
  color: #aaa;
}

.creator:hover {
  text-decoration: underline;
}

.like-btn-wrapper {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
</style>