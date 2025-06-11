<template>
  <v-container class="py-10" style="max-width: 1000px;">
    <v-app-bar color="green" dark>
      <v-btn variant="text" class="me-2" @click="goBack">< </v-btn>
      <v-btn to="/home" variant="tonal" class="me-2">Home</v-btn>
      <v-btn to="/library" variant="tonal">Library</v-btn>
    </v-app-bar>

    <div class="mt-16" v-if="albumStore.album">
      <v-card class="pa-6 mb-8" style="background-color: #1e1e1e;">
        <v-row>
          <v-col cols="8">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-h4 text-white">{{ albumStore.album.name }}</div>
                <div class="text-subtitle-1 text-grey">
                  <span
                      v-for="(artist, idx) in albumStore.album.artists"
                      :key="artist.id"
                  >
                    <router-link
                        :to="{ name: 'artist', params: { id: artist.id } }"
                        class="artist-link"
                    >{{ artist.name }}</router-link
                    ><span v-if="idx < albumStore.album.artists.length - 1">, </span>
                  </span>
                </div>
              </div>
              <div class="d-flex align-center">
                <v-btn icon @click="albumStore.toggleLikeAlbum(albumStore.album.id)">
                  <v-icon :color="albumStore.likedAlbums[albumStore.album.id] ? 'green' : 'white'">
                    {{ albumStore.likedAlbums[albumStore.album.id] ? 'mdi-heart' : 'mdi-heart-outline' }}
                  </v-icon>
                </v-btn>
              </div>
            </div>
            <div class="text-caption text-grey">{{ albumStore.album.total_tracks }} Tracks</div>
          </v-col>
          <v-col cols="4" class="d-flex justify-end">
            <v-img :src="albumStore.album.images[0]?.url" height="180" width="180" />
          </v-col>
        </v-row>
      </v-card>

      <div v-if="albumStore.mostPopular" class="mb-8">
        <h3 class="text-h6 mb-2 text-white">Most popular track</h3>
        <v-card class="d-flex align-center justify-space-between pa-4 mb-6" style="background-color: #1e1e1e;">
          <div>
            <div
              class="text-subtitle-1"
              :class="playbackStore.currentlyPlayingUri === albumStore.mostPopular.uri ? 'text-green' : 'text-white'"
            >
              {{ albumStore.mostPopular.name }}
            </div>
            <div class="text-caption text-grey">
              <span
                  v-for="(artist, idx) in albumStore.mostPopular.artists"
                  :key="artist.id"
              >
                <router-link
                    :to="{ name: 'artist', params: { id: artist.id } }"
                    class="artist-link"
                >{{ artist.name }}</router-link
                ><span v-if="idx < albumStore.mostPopular.artists.length - 1">, </span>
              </span>
            </div>
          </div>
          <div class="d-flex align-center">
            <v-btn icon @click="playbackStore.togglePlayback(albumStore.mostPopular)" class="me-2">
              <v-icon>
                {{ playbackStore.currentlyPlayingUri === albumStore.mostPopular.uri ? 'mdi-stop' : 'mdi-play' }}
              </v-icon>
            </v-btn>
            <v-btn icon @click="albumStore.toggleLike(albumStore.mostPopular.id)">
              <v-icon :color="albumStore.likedTracks[albumStore.mostPopular.id] ? 'green' : 'white'">
                {{ albumStore.likedTracks[albumStore.mostPopular.id] ? 'mdi-heart' : 'mdi-heart-outline' }}
              </v-icon>
            </v-btn>
          </div>
        </v-card>
      </div>

      <h3 class="text-h6 mb-4 text-white">Tracks</h3>
      <v-row v-if="albumStore.albumTracks.length" dense>
        <v-col
            v-for="track in albumStore.albumTracks"
            :key="track.id"
            cols="12"
            class="d-flex align-center justify-space-between py-2 px-4 rounded mb-2"
            style="background-color: #1e1e1e;"
        >
          <div class="d-flex align-center">
            <v-avatar size="40" class="me-4">
              <img :src="track.album?.images[0]?.url || albumStore.album.images[0]?.url" alt="Obal" />
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
            <v-btn icon @click="albumStore.toggleLike(track.id)">
              <v-icon :color="albumStore.likedTracks[track.id] ? 'green' : 'white'">
                {{ albumStore.likedTracks[track.id] ? 'mdi-heart' : 'mdi-heart-outline' }}
              </v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </div>

    <div v-else class="text-center py-10 text-grey">
      Načítání detailů alba…
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAlbumStore } from '../../stores/album';
import { usePlaybackStore } from '../../stores/playback';

const route = useRoute();
const router = useRouter();
const goBack = () => {
  router.back();
};
const albumStore = useAlbumStore();
const playbackStore = usePlaybackStore();

onMounted(async () => {
  albumStore.fetchAlbum(route.params.id as string);
});
</script>

<style scoped>
.text-grey { color: #aaa; }
.text-white { color: #fff; }
.text-green { color: #4caf50; }
.artist-link { color: #aaa; text-decoration: none; }
.artist-link:hover { text-decoration: underline; }
</style>