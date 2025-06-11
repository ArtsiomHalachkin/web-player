import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from './auth';

export const useAlbumStore = defineStore('album', () => {
  const album = ref<any | null>(null);
  const albumTracks = ref<any[]>([]);
  const mostPopular = ref<any | null>(null);
  const likedTracks = ref<Record<string, boolean>>({});
  const likedAlbums = ref<Record<string, boolean>>({})
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  async function ensureToken(): Promise<string | null> {
    let token = Cookies.get('spotify_access_token') || null;
    if (!token) {
      await authStore.refreshAccessToken();
      token = Cookies.get('spotify_access_token') || null;
    }
    return token;
  }

  async function fetchAlbum(id: string) {
    error.value = null;
    try {
      const token = await ensureToken();
      if (!token) throw new Error('No token');

      const { data: alb } = await axios.get(`https://api.spotify.com/v1/albums/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      album.value = alb;
      albumTracks.value = alb.tracks.items;

      const ids = albumTracks.value.map((t: any) => t.id).join(',');
      if (ids) {
        const { data: likes } = await axios.get<boolean[]>(
            'https://api.spotify.com/v1/me/tracks/contains',
            { headers: { Authorization: `Bearer ${token}` }, params: { ids } }
        );
        likes.forEach((liked, i) => {
          likedTracks.value[albumTracks.value[i].id] = liked;
        });
      }

      const { data: albumLiked } = await axios.get<boolean[]>(
          'https://api.spotify.com/v1/me/albums/contains',
          { headers: { Authorization: `Bearer ${token}` }, params: { ids: id } }
      );
      likedAlbums.value[id] = albumLiked[0];

      mostPopular.value = [...albumTracks.value].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))[0] || null;

    } catch (e) {
      console.error(e);
      error.value = 'Failed to load album details';
    }
  }


  async function toggleLike(id: string) {
    const token = await ensureToken();
    if (!token) return;
    const wasLiked = likedTracks.value[id];
    try {
      if (wasLiked) {
        await axios.delete('https://api.spotify.com/v1/me/tracks', {
          headers: { Authorization: `Bearer ${token}` },
          data: { ids: [id] },
        });
      } else {
        await axios.put(
          'https://api.spotify.com/v1/me/tracks',
          { ids: [id] },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
      }
      likedTracks.value[id] = !wasLiked;
    } catch {
      console.error('Like toggle failed');
    }
  }

  async function toggleLikeAlbum(id: string) { // Nová funkce pro lajkování alba
    const token = await ensureToken();
    if (!token) return;
    const wasLiked = likedAlbums.value[id];
    try {
      if (wasLiked) {
        await axios.delete('https://api.spotify.com/v1/me/albums', {
          headers: { Authorization: `Bearer ${token}` },
          data: { ids: [id] },
        });
      } else {
        await axios.put(
            'https://api.spotify.com/v1/me/albums',
            { ids: [id] },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
      }
      likedAlbums.value[id] = !wasLiked;
    } catch {
      console.error('Přepnutí lajku alba selhalo');
      error.value = 'Nepodařilo se uložit změnu alba';
    }
  }

  function playPreview(url: string) {
    if (!url) return;
    if ((window as any)._albumAudio) (window as any)._albumAudio.pause();
    (window as any)._albumAudio = new Audio(url);
    (window as any)._albumAudio.play();
  }

  return {
    album,
    albumTracks,
    mostPopular,
    likedTracks,
    error,
    fetchAlbum,
    toggleLike,
    toggleLikeAlbum,
    playPreview,
    likedAlbums,
  };
});