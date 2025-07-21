<script setup>
import {ref, onMounted, onBeforeUnmount} from 'vue';
import InventoryDialog from "../game/InventoryDialog.vue";
import CreaturesDialog from "../game/CreaturesDialog.vue";

const mainNavItems = [
    {label: 'Домой', path: '/'},
    {label: 'Мир', path: '/world'},
];

const inventoryTabs = [
    {label: 'Существа', name: 'creatures'},
    {label: 'Осколки', name: 'shards'},
]


const scrolled = ref(false);
const inventoryDialogOpen = ref(false);
const creaturesDialogOpen = ref(false);

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
    <q-btn stretch flat no-caps @click="inventoryDialogOpen = true" class="text-foreground/80 hover-text-primary">
        Инвентарь
    </q-btn>
    <q-btn stretch flat no-caps @click="creaturesDialogOpen = true" class="text-foreground/80 hover-text-primary">
        Существа
    </q-btn>

    <InventoryDialog v-model="inventoryDialogOpen"/>
    <CreaturesDialog v-model="creaturesDialogOpen"/>
</template>

<style scoped>
</style>