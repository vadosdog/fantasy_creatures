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
    <q-page>

        <div class="p-4">
            <h1 class="text-3xl font-bold text-gradient from-blue-100 to-purple-600">
                Tailwind работает!
            </h1>
            <QBtn class="rounded mystical-glow hover:scale-105 transition-all duration-300"
                  no-caps
                  icon="play_arrow"
                  color="primary"
                  text-color="primary-foreground"
                  label="Play Now"
                  to="/game"
            />
        </div>
    </q-page>
        
</template>