import Cookies from "js-cookie";
import { defineStore } from "pinia";
import {setBearerAuthToken} from "../api/index.ts";
import axios from "axios";



function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc: string, x: number) => acc + possible[x % possible.length], "");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const TOKEN_COOKIE_NAME = "spotify_access_token";


export const useAuthStore = defineStore("auth", () => {

  async function redirectToSpotifyAuth() {
    const codeVerifier = generateRandomString(64);
    sha256(codeVerifier).then((hashed) => {
      const codeChallenge = base64encode(hashed);
      Cookies.set('code_verifier', codeVerifier, { expires: 1 });

      const authUrl = new URL("https://accounts.spotify.com/authorize");
      const params: Record<string, string> = {
        response_type: 'code',
        client_id: import.meta.env.VITE_CLIENT_ID,
        scope:
          [
            "streaming",
            "user-read-private",
            "user-read-email",
            "user-read-playback-state",
            "user-modify-playback-state",
            "user-library-read",
            "user-library-modify",
            "user-follow-read",
            "user-follow-modify",
            "user-top-read",
            "user-read-recently-played",
            "playlist-modify-public",
            "playlist-modify-private",
          ].join(" "),
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      };
      authUrl.search = new URLSearchParams(params).toString();
      window.location.href = authUrl.toString();
    });
  }

  async function getToken(): Promise<void> {

    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');


    const codeVerifier = Cookies.get('code_verifier');

    if (!code) {
      throw new Error("Authorization code not found in URL.");
    }

    if (!codeVerifier) {
      throw new Error("Code verifier not found in localStorage.");
    }

    const url = "https://accounts.spotify.com/api/token";

    const data = new URLSearchParams({
      client_id: import.meta.env.VITE_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    try {
      const response = await axios.post<{
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token?: string;
        scope?: string;
      }>(url, data.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      setBearerAuthToken(response.data.access_token);
      Cookies.set(TOKEN_COOKIE_NAME, response.data.access_token, { expires: 1 });


      if (response.data.refresh_token) {
        Cookies.set('refresh_token', response.data.refresh_token);


      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      throw new Error("Failed to fetch access token.");
    }
  }

  async function refreshAccessToken(): Promise<void> {
    const refreshToken = Cookies.get("refresh_token");

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const url = "https://accounts.spotify.com/api/token";

    const data = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: import.meta.env.VITE_CLIENT_ID,
    });

    try {
      const response = await axios.post(url, data.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const newAccessToken = response.data.access_token;
      setBearerAuthToken(newAccessToken);
      Cookies.set("spotify_access_token", newAccessToken, { expires: 1 });

      if (response.data.refresh_token) {
        Cookies.set("refresh_token", response.data.refresh_token);
      }

    } catch (error) {
      console.error("Failed to refresh token", error);
      throw new Error("Could not refresh access token");
    }
  }

  function logout() {
    Cookies.remove(TOKEN_COOKIE_NAME);
    setBearerAuthToken(undefined);
  }


  return { getToken, logout, redirectToSpotifyAuth,refreshAccessToken };
});
