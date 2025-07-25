<template>
    <span>{{ animatedValue }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
    value: Number,
    duration: {
        type: Number,
        default: 1500
    }
});

const animatedValue = ref(0);
const startTimestamp = ref(null);

function animate(timestamp) {
    if (!startTimestamp.value) startTimestamp.value = timestamp;

    const progress = Math.min((timestamp - startTimestamp.value) / props.duration, 1);
    animatedValue.value = Math.floor(props.value * progress);

    if (progress < 1) {
        requestAnimationFrame(animate);
    }
}

onMounted(() => {
    requestAnimationFrame(animate);
});

watch(() => props.value, (newVal) => {
    animatedValue.value = 0;
    startTimestamp.value = null;
    requestAnimationFrame(animate);
});
</script>