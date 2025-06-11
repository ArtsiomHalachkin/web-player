import Config  from "../config";
import axios from "axios";

//It sets a default base URL for all HTTP requests, taken from Config.apiUrl
// Now, instead of writing: axios.get('https://your-backend.com/users'); you can just do: api.get('/users');
export const spotifyApi = axios.create({
  baseURL: "https://api.spotify.com/v1",
});


//This is a helper function that sets the Authorization header globally for your api instance.
//Meaning: every future request made with api will include the header: Authorization: Bearer your-token-here

//
export const setBearerAuthToken = (token: string | undefined) => {
  if (token) {
    spotifyApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Token set:", token);
  } else {
    console.log("No token provided");
  }
};