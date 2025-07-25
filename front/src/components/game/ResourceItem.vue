<script setup>
import {ref, onMounted} from 'vue';
import AnimatedNumber from './AnimatedNumber.vue';
import {resourcesLib} from "../../database/resourcesLib.js";

const props = defineProps({
    type: String,
    amount: Number
});

const resource = resourcesLib[props.type] || {}
</script>

<template>
    <div class="resource-item flex flex-col items-center p-3 rounded-lg bg-[var(--muted)]">
        <img
            :src="resource.img"
            class="w-14 h-14 mb-2 object-contain"
        />

        <div class="text-lg font-bold text-[var(--primary)]">
            <AnimatedNumber :value="amount"/>
        </div>

        <div class="text-sm text-[var(--muted-foreground)] capitalize">
            {{ resource.name }}
        </div>
        <q-tooltip>
            <div><b>{{ resource.name }}</b></div>
            <div v-if="resource.description">{{ resource.description }}</div>
        </q-tooltip>
    </div>
</template>