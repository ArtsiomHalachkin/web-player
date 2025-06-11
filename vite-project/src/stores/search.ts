// File: vite-project/src/stores/search.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from './auth';

export const useSearchStore = defineStore('search', () => {
  const lastQuery = ref('');
  const tracks = ref<any[]>([]);
  const topAlbums = ref<any[]>([]);
  const artistName = ref<string>('');
  const likedTracks = ref<Record<string, boolean>>({});
  const error = ref<string | null>(null);

  const authStore = useAuthStore();

  function setQuery(q: string) {
    lastQuery.value = q;
  }

  async function ensureToken(): Promise<string | null> {
    let token = Cookies.get('spotify_access_token') || null;
    if (!token) {
      await authStore.refreshAccessToken();
      token = Cookies.get('spotify_access_token') || null;
    }
    return token;
  }

  async function performSearch(query: string) {
    setQuery(query);

    const token = await ensureToken();
    if (!token || !query) {
      return;
    }

    error.value = null;
    try {
      const res = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query, type: 'track', limit: 5 },
      });
      tracks.value = res.data.tracks.items;

      const ids = tracks.value.map((t: any) => t.id).join(',');
      if (ids) {
        try {
          const statusRes = await axios.get<boolean[]>(
            'https://api.spotify.com/v1/me/tracks/contains',
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { ids },
            }
          );
          statusRes.data.forEach((liked: boolean, i: number) => {
            likedTracks.value[tracks.value[i].id] = liked;
          });
        } catch (e) {
          error.value = 'Error checking liked status';
        }
      }

      const first = tracks.value[0];
      if (first) {
        artistName.value = first.artists.map((a: any) => a.name).join(', ');
        console.debug('[SearchStore] artistName set to:', artistName.value); // <-- Debug statement
        const artistId = first.artists[0].id;
        await fetchTopAlbums(artistId);
      } else {
        artistName.value = '';
        topAlbums.value = [];
      }

    } catch (e) {
      error.value = 'Error fetching data';
    }
  }

  async function fetchTopAlbums(artistId: string) {
    const token = await ensureToken();
    if (!token) {
      return;
    }
    try {
      const albRes = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}/albums`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { include_groups: 'album', limit: 5, market: 'US' },
        }
      );
      topAlbums.value = albRes.data.items;
    } catch (e) {
      error.value = 'Error fetching albums';
    }
  }

  async function toggleLike(id: string) {
    const token = await ensureToken();
    if (!token) {
      return;
    }
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
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      likedTracks.value[id] = !wasLiked;
    } catch (e) {
      error.value = 'Failed to toggle like';
    }
  }

  async function loadLikedStatusForTracks(trackIds: string[]) {
    const token = await ensureToken();
    if (!token || trackIds.length === 0) return;
    try {
      const res = await axios.get<boolean[]>('https://api.spotify.com/v1/me/tracks/contains', {
        headers: { Authorization: `Bearer ${token}` },
        params: { ids: trackIds.join(',') },
      });
      res.data.forEach((liked, i) => {
        likedTracks.value[trackIds[i]] = liked;
      });
    } catch (err) {
      console.error('Failed to load liked status:', err);
      error.value = 'Failed to load liked status';
    }
  }

  return {
    lastQuery,
    tracks,
    topAlbums,
    artistName,
    likedTracks,
    error,
    setQuery,
    performSearch,
    toggleLike,
    loadLikedStatusForTracks,
    fetchTopAlbums
  };
});
