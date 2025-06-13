<template>
    <!-- Логотип и название -->
    <router-link to="/" class="row items-center no-wrap">
        <q-avatar class="float-animation pulse-glow">
            <img src="/favicon-32x32.png">
        </q-avatar>
        <span class="q-ml-sm text-2xl font-bold gradient-text">Rune Shards</span>
    </router-link>
    <q-space/> <!-- Заполняет доступное пространство -->

    <!-- Табы - теперь в одной строке с лого -->
    <q-tabs inline-label align="left" class="q-ml-md" no-caps>
        <q-route-tab
            v-for="tab in mainNavItems" 
            :to="tab.path"
            :label="tab.label"
            class="text-foreground/80 hover-text-primary"
        />
    </q-tabs>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';

const mainNavItems = [
    {label: 'Home', path: '/'},
    {label: 'Explore', path: '#explore'},
    {label: 'Market', path: '#market'},
    {label: 'Activity', path: '#activity'},
];


const isMobileMenuOpen = ref(false);
const scrolled = ref(false);
// Эффект затемнения при скролле
const handleScroll = () => {
    scrolled.value = window.scrollY > 10;
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.play-now-btn {
    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
    @apply text-white font-medium rounded-full px-6 py-2 transition-all duration-300;
    @apply hover:shadow-lg hover:shadow-indigo-500/30 flex items-center;
}

.backdrop-blur-md {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

/* Анимация для выпадающего меню */
.q-expansion-item__content {
    transition: max-height 0.3s ease, opacity 0.3s ease;
}
</style>