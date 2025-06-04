<script setup>
import {onMounted} from "vue";

const emit = defineEmits(['current-active-scene', 'update-footer', 'update-drawer', 'update-header']);

onMounted(() => {
    emit('update-footer', null)
    emit('update-header', null)
    emit('update-drawer', null)

});
</script>
<template>
    <q-btn label="Click"/>
</template>