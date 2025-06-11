<template>
  <v-app>
    <router-view />
    <PlayerBar
      :currentTrack="currentTrack"
      :position="position"
      :duration="duration"
    />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useAuthStore } from "./stores/auth.ts";
import { usePlaybackStore } from "./stores/playback.ts";
import { useTracksStore } from "./stores/track.ts";
import { useSearchStore } from "./stores/search";
import { useAlbumStore } from "./stores/album";
import PlayerBar from "./components/PlayerBar.vue";
import Cookies from "js-cookie";

const authStore = useAuthStore();
const playbackStore = usePlaybackStore();
const tracksStore = useTracksStore();
const searchStore = useSearchStore();
const albumStore = useAlbumStore();
const error = ref<string | null>(null);

// Helper to find a track by URI from all possible sources
function findTrackByUri(uri: string) {
  return (
    tracksStore.recentlyPlayedTracks?.find(t => t.uri === uri) ||
    tracksStore.topTracks?.find(t => t.uri === uri) ||
    tracksStore.savedTracks?.find?.(t => t.uri === uri) ||
    searchStore.tracks?.find?.(t => t.uri === uri) ||
    albumStore.albumTracks?.find?.(t => t.uri === uri) ||
    null
  );
}

const currentTrack = computed(() => {
  const uri = playbackStore.currentlyPlayingUri;
  if (!uri) return null;
  return findTrackByUri(uri);
});
const position = computed(() => playbackStore.position);
const duration = computed(() => playbackStore.duration);

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const token = Cookies.get("spotify_access_token");

  await authStore.logout();

  try {
    if (code && !token) {
      await authStore.getToken();
    }
    const currentToken = Cookies.get("spotify_access_token");
    if (!currentToken) {
      await authStore.redirectToSpotifyAuth();
      return;
    }
  } catch (err) {
    error.value = "Failed to load Spotify data.";
    console.error(err);
  } finally {
    if ((window as any).Spotify) {
      playbackStore.initializePlayer();
    } else {
      (window as any).onSpotifyWebPlaybackSDKReady = () => {
        playbackStore.initializePlayer();
      };
    }
  }
});
</script>