import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from './auth';

export const useArtistStore = defineStore('artist', () => {
  const artist = ref<any>(null);
  const isFollowing = ref(false);
  const topTracks = ref<any[]>([]);
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

  async function fetchArtist(id: string) {
    error.value = null;
    const token = await ensureToken();
    if (!token) {
        error.value = 'No token';
        return;
    }

    try {
        const { data: art } = await axios.get(`https://api.spotify.com/v1/artists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        });
        artist.value = art;
    } catch (e) {
        console.error('Failed to fetch artist:', e);
        error.value = 'Failed to load artist details';
        artist.value = null;
    }

    try {
        const { data: follow } = await axios.get<boolean[]>(
        'https://api.spotify.com/v1/me/following/contains',
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { type: 'artist', ids: id },
        }
        );
        isFollowing.value = follow[0];
    } catch (e) {
        console.warn('Could not check following status (maybe missing scope):', e);
        isFollowing.value = false;
    }

    try {
        const { data } = await axios.get(
        `https://api.spotify.com/v1/artists/${id}/top-tracks`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { market: 'US' },
        }
        );
        topTracks.value = data.tracks.slice(0, 10);
    } catch (e) {
        console.error('Failed to fetch top tracks:', e);
        topTracks.value = [];
    }
  }

  async function toggleFollow(id: string) {
    try {
      const token = await ensureToken();
      if (!token) return;
      if (isFollowing.value) {
        await axios.delete('https://api.spotify.com/v1/me/following', {
          headers: { Authorization: `Bearer ${token}` },
          params: { type: 'artist', ids: id },
        });
      } else {
        await axios.put(
          'https://api.spotify.com/v1/me/following',
          null,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { type: 'artist', ids: id },
          }
        );
      }
      isFollowing.value = !isFollowing.value;
    } catch (e) {
      console.error('Toggle follow failed:', e);
    }
  }

  return {
    artist,
    isFollowing,
    topTracks,
    error,
    fetchArtist,
    toggleFollow,
  };
});