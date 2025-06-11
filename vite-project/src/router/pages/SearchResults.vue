<template>
  <v-container class="py-10" style="max-width: 1000px;">
    <v-app-bar color="green" dark>
      <v-toolbar-title class="d-flex align-center justify-center">
        <v-btn text class="mr-2" to="/home">Home</v-btn>
        <v-btn text to="/library">Library</v-btn>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-text-field
        v-model="query"
        placeholder="Search"
        hide-details
        dense
        solo-inverted
        prepend-inner-icon="mdi-magnify"
        class="search-input"
        @keyup.enter="() => searchStore.performSearch(query)"
      />
    </v-app-bar>

    <h2 class="text-h6 mt-16 mb-4">Songs found based on your search</h2>
    <v-row v-if="searchStore.tracks.length" dense id="search-results">
      <v-col
        v-for="track in searchStore.tracks"
        :key="track.id"
        cols="12"
        class="d-flex align-center justify-space-between py-2 px-4 rounded mb-2"
        style="background-color: #1e1e1e;"
      >
        <div class="d-flex align-center">
          <v-avatar size="56" class="me-4">
            <img :src="track.album.images[0]?.url" alt="Cover" />
          </v-avatar>
          <div>
            <div
              class="text-subtitle-1"
              :class="playbackStore.currentlyPlayingUri === track.uri ? 'text-green' : 'text-white'"
            >
              {{ track.name }}
            </div>
            <div class="text-caption text-grey">
              <span
                v-for="(artist, idx) in track.artists"
                :key="artist.id"
              >
                <router-link
                  :to="{ name: 'artist', params: { id: artist.id } }"
                  class="artist-link"
                >{{ artist.name }}</router-link
                ><span v-if="idx < track.artists.length - 1">, </span>
              </span>
            </div>
          </div>
        </div>

        <div class="d-flex align-center">
          <v-btn icon @click="playbackStore.togglePlayback(track)" class="me-2">
            <v-icon>
              {{ playbackStore.currentlyPlayingUri === track.uri ? 'mdi-stop' : 'mdi-play' }}
            </v-icon>
          </v-btn>
          <v-btn icon @click="toggleLike(track.id)">
            <v-icon :color="likedTracks[track.id] ? 'green' : 'white'">
              {{ likedTracks[track.id] ? 'mdi-heart' : 'mdi-heart-outline' }}
            </v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>

    <h2 class="text-h6 mt-10 mb-4">{{ searchStore.artistName }}’s Top Albums</h2>
    <v-slide-group class="album-carousel-wrapper" show-arrows v-if="searchStore.topAlbums.length">
      <v-slide-group-item
        v-for="album in searchStore.topAlbums"
        :key="album.id"
      >
        <router-link
          :to="{ name: 'album', params: { id: album.id } }"
          style="text-decoration: none;"
        >
          <v-card class="mx-2 album-card" width="200" elevation="2">
            <v-img :src="album.images[0]?.url" height="200px" />
            <v-card-title class="text-sm text-white">{{ album.name }}</v-card-title>
            <v-card-subtitle class="text-xs text-grey px-3 pb-2">
              <span
                v-for="(artist, idx) in album.artists"
                :key="artist.id"
              >
                <router-link
                  :to="{ name: 'artist', params: { id: artist.id } }"
                  class="artist-link"
                >{{ artist.name }}</router-link
                ><span v-if="idx < album.artists.length - 1">, </span>
              </span>
            </v-card-subtitle>
          </v-card>
        </router-link>
      </v-slide-group-item>
    </v-slide-group>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSearchStore } from '../../stores/search';
import { usePlaybackStore } from '../../stores/playback';

const route = useRoute();
const router = useRouter();
const searchStore = useSearchStore();
const { likedTracks, error, toggleLike } = searchStore;
const query = ref(searchStore.lastQuery);

const playbackStore = usePlaybackStore();

watch(query, q => {
  searchStore.setQuery(q);
});

onMounted(() => {
  if (route.query.q) {
    const q = route.query.q as string;
    query.value = q;
    router.replace({ query: { ...route.query, q: undefined } });
    searchStore.performSearch(query.value);
  } else if (searchStore.lastQuery) {
    query.value = searchStore.lastQuery;
    searchStore.performSearch(query.value);
  }
});
</script>

<style scoped>
.text-grey { color: #aaa; }
.text-white { color: #fff; }
.text-green { color: #4caf50; }
.artist-link { color: #aaa; text-decoration: none; }
.artist-link:hover { text-decoration: underline; }

.album-carousel-wrapper ::v-deep .v-slide-group__wrapper,
.album-carousel-wrapper ::v-deep .v-slide-group__content {
  overflow: visible !important;
}
</style>