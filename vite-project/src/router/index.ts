import {
    createRouter,
    createWebHistory,
    type RouteRecordRaw,
} from "vue-router";

import HomePage from "./pages/HomePage.vue";
import Library from "./pages/Library.vue";
import SearchResults from "./pages/SearchResults.vue";
import AlbumDetail from "./pages/AlbumDetail.vue";
import ArtistDetail from "./pages/ArtistDetail.vue";


const routes: RouteRecordRaw[] = [
    {
        path: "/",
        redirect: "/home",
    },
    {
        path: "/home",
        component: HomePage,
        name: "homepage",
    },
    {
        path: "/library",
        component: Library,
        name: "library",
  
    },
    {
        path: '/search',
        component: SearchResults,
        name: 'search',
    },
    {
        path: '/album/:id',
        name: 'album',            
        component: AlbumDetail,   
        props: true,             
    },
    {
        path: '/artist/:id',
        name: 'artist',
        component: ArtistDetail,
        props: true
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});



export default router;