<script setup>
import {onMounted} from "vue";

const emit = defineEmits(['current-active-scene', 'update-footer', 'update-drawer', 'update-header']);

onMounted(() => {
    emit('update-footer', null)
    emit('update-header', null)
    emit('update-drawer', null)

});

const features = [
    {
        title: "Mystical Shards",
        description:
            "Collect fragments of divine memory across elements (fire, water, grass), forms (beast, bird, reptile), and emotions (rage, passion, hope). Each shard tells a story of the gods who once ruled these lands.",
        iconName: "sparkle",
        rarity: "From common white to legendary gold"
    },
    {
        title: "Living Legends",
        description:
            "Awaken creatures from the gods' forgotten dreams. Watch as your companions evolve through 4 magnificent stages, each more powerful than the last, culminating in divine awakening.",
        iconName: "crown",
        rarity: "Unlock their true potential"
    },
    {
        title: "Elemental Mastery",
        description:
            "Master the ancient arts of shard combination. Fire burns with passion, water flows with wisdom, and grass grows with hope. Each element responds to different emotions and forms.",
        iconName: "flash_on",
        rarity: "Three elements, endless possibilities"
    },
    {
        title: "Sacred Realms",
        description:
            "Journey through mystical zones from ancient forests shrouded in mist to volcanic peaks where dragons once soared. Prove your worth to enter Olympus itself.",
        iconName: "terrain",
        rarity: "Olympus awaits the worthy"
    }
];

const updates = [
    {
        version: "Alpha 0.3.1",
        date: "December 10, 2024",
        title: "Olympus Awakening",
        description:
            "The sacred gates to Olympus now stand open for masters who have successfully awakened 6 divine creatures. Face the ultimate trials where gods once walked among mortals.",
        type: "Major Update",
        iconName: "crown"
    },
    {
        version: "Alpha 0.3.0",
        date: "November 28, 2024",
        title: "Evolution Mastery",
        description:
            "The complete creature evolution system has been forged. Witness your companions transform through 4 breathtaking stages of divine metamorphosis.",
        type: "Major Update",
        iconName: "sparkle"
    },
    {
        version: "Alpha 0.2.5",
        date: "November 15, 2024",
        title: "Legendary Shards",
        description:
            "Golden legendary shards now pulse with unique divine properties. Balance has been restored to the eternal dance between fire and water elements.",
        type: "Content Update",
        iconName: "flash_on"
    },
    {
        version: "Alpha 0.2.0",
        date: "October 30, 2024",
        title: "Emotion System",
        description:
            "The gods' emotions now flow through the shards: rage burns bright, passion flows deep, and hope springs eternal. Each emotion unlocks hidden powers and ancient stories.",
        type: "Feature Update",
        iconName: "sparkle"
    }
];

const getTypeColor = (type) => {
    switch (type) {
        case "Major Update":
            return "bg-primary/20 text-primary border-primary/30";
        case "Content Update":
            return "bg-accent/20 text-accent border-accent/30";
        case "Feature Update":
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        default:
            return "bg-muted/20 text-muted-foreground border-muted/30";
    }
};

const linkCategories = [
    {
        title: "Join the Fellowship",
        iconName: "group",
        links: [
            {
                name: "Discord Sanctuary",
                description: "Gather with fellow Shard Masters",
                iconName: "chat_bubble_outline"
            },
            {
                name: "Reddit Commune",
                description: "Share ancient strategies and discoveries",
                iconName: "question_answer"
            },
            {
                name: "Sacred Forums",
                description: "Commune with the divine developers",
                iconName: "description"
            }
        ]
    },
    {
        title: "Ancient Wisdom",
        iconName: "menu_book",
        links: [
            {
                name: "Master's Codex",
                description: "Unlock the secrets of shard mastery",
                iconName: "menu_book"
            },
            {
                name: "Creature Bestiary",
                description: "Chronicle of all divine beings",
                iconName: "person"
            },
            {
                name: "Mythic Lore",
                description: "Delve into the gods' forgotten stories",
                iconName: "description"
            }
        ]
    },
    {
        title: "Divine Support",
        iconName: "help_outline",
        links: [
            {
                name: "Oracle's Aid",
                description: "Report disturbances in the realm",
                iconName: "help_outline"
            },
            {
                name: "Visions Request",
                description: "Share your divine inspirations",
                iconName: "edit_document"
            },
            {
                name: "Temple of Help",
                description: "Seek guidance from the masters",
                iconName: "group"
            }
        ]
    }
];
</script>
<template>
    <q-page class="flex flex-center">

        <section id="home"
                 class="min-h-screen flex items-center justify-center relative atmospheric-bg overflow-hidden"
        >
            <!-- Floating particles -->
            <div class="absolute inset-0 pointer-events-none">
                <div v-for="i in 20" :key="i"
                     class="absolute w-1 h-1 bg-primary/30 rounded-full"
                     :style="{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             animationDelay: `${Math.random() * 5}s`
           }"
                />
            </div>

            <!-- Large decorative runes -->
            <div class="absolute top-20 left-10 text-6xl text-primary/10 font-bold transform rotate-12">⟐</div>
            <div class="absolute bottom-20 right-10 text-4xl text-accent/10 font-bold transform -rotate-12">◈</div>
            <div class="absolute top-1/3 right-20 text-5xl text-primary/10 font-bold">✦</div>
            <div class="absolute bottom-1/3 left-20 text-3xl text-accent/10 font-bold">◊</div>

            <div class="container mx-auto px-4 text-center content-layer">
                <div class="max-w-6xl mx-auto">
                    <!-- Logo with enhanced glow -->
                    <div class="mb-12">
                        <img src="/favicon-32x32.png"
                             alt="Rune Shards Logo"
                             class="w-40 h-40 mx-auto float-animation mystical-glow"/>
                    </div>

                    <!-- Main title -->
                    <h1 class="hero-title mb-8 gradient-text">
                        Rune Shards
                    </h1>

                    <!-- Subtitle -->
                    <div class="text-xl md:text-2xl mb-6 text-accent font-semibold tracking-wide">
                        Forge Legends from Divine Dreams
                    </div>

                    <!-- Description -->
                    <p class="text-lg md:text-xl mb-12 text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        In a world where gods have fallen silent, their dreams crystallize into mystical
                        <span class="text-primary font-semibold mx-2">Rune Shards</span> -
                        fragments of divine memory waiting to be awakened. Step into the role of a
                        <span class="text-accent font-semibold mx-2">Shard Master</span>
                        and breathe life into forgotten legends.
                    </p>

                    <!-- Action buttons -->
                    <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                        <q-btn size="lg" unelevated no-caps
                               class="mystical-glow hover:scale-105 transition-all duration-300 text-lg px-10 py-4"
                               color="primary"
                               text-color="primary-foreground"
                        >
                            <q-icon name="play_arrow" class="w-5 h-5 mr-3"/>
                            Begin Your Legend
                        </q-btn>

                        <q-btn size="lg" outline no-caps
                               class="text-lg px-10 py-4 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300">
                            <q-icon name="remove_red_eye" class="w-5 h-5 mr-3"/>
                            Watch Trailer
                        </q-btn>
                    </div>

                    <!-- Mystical quote -->
                    <div class="max-w-3xl mx-auto">
                        <div class="relative">
                            <div class="absolute -top-4 -left-4 text-6xl text-primary/30 font-serif">"</div>
                            <div class="absolute -bottom-4 -right-4 text-6xl text-primary/30 font-serif rotate-180">"
                            </div>
                            <blockquote
                                class="text-lg md:text-xl italic text-muted-foreground leading-relaxed px-8 py-4">
                                Do you hear their whispers? The Shards are calling you... but be careful.
                                Some dreams are best left undisturbed.
                            </blockquote>
                        </div>
                        <cite class="text-sm text-primary/80 mt-4 block">— Ancient Shard Master</cite>
                    </div>
                </div>
            </div>

            <!-- Bottom fade gradient -->
            <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
        </section>
        <section id="features" class="py-24 relative atmospheric-bg">
            <div class="section-divider"></div>

            <div class="container mx-auto px-4 content-layer">
                <div class="text-center mb-20">
                    <h2 class="text-5xl md:text-6xl font-bold mb-8 gradient-text">
                        Master the Divine Arts
                    </h2>
                    <p class="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        Discover the secrets of a world where mythology meets adventure,
                        where every shard holds the memory of gods
                    </p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    <q-card v-for="(feature, index) in features"
                            :key="index"
                            class="shard-shimmer hover:border-primary/50 transition-all duration-500 group overflow-hidden"
                            bordered
                    >
                        <q-card-section class="pb-4">
                            <div class="flex items-center space-x-4 mb-6">
                                <div
                                    class="p-3 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-all duration-300">
                                    <q-icon :name="feature.iconName"
                                            class="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300"/>
                                </div>
                                <div>
                                    <div class="text-2xl md:text-3xl text-foreground mb-2">
                                        {{ feature.title }}
                                    </div>
                                    <div class="text-sm text-accent font-medium">
                                        {{ feature.rarity }}
                                    </div>
                                </div>
                            </div>
                        </q-card-section>

                        <q-card-section>
                            <div class="text-muted-foreground text-lg leading-relaxed">
                                {{ feature.description }}
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </section>
        <section id="updates" class="py-24 relative atmospheric-bg">
            <div class="section-divider"></div>

            <div class="container mx-auto px-4 content-layer">
                <div class="text-center mb-20">
                    <h2 class="text-5xl md:text-6xl font-bold mb-8 gradient-text">
                        Chronicle of Divine Changes
                    </h2>
                    <p class="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        Follow the evolution of our mystical realm through sacred updates and divine revelations
                    </p>
                </div>

                <div class="max-w-5xl mx-auto space-y-8">
                    <q-card v-for="(update, index) in updates"
                            :key="index"
                            class="shard-shimmer hover:border-primary/30 transition-all duration-500 group"
                            bordered
                    >
                        <q-card-section>
                            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div class="flex items-start space-x-4">
                                    <div class="p-3 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-all duration-300 mt-1">
                                        <q-icon :name="update.iconName"
                                                class="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-2xl md:text-3xl text-foreground mb-3">{{ update.title }}</div>
                                        <div class="flex flex-wrap items-center gap-3 mb-4">
                                            <div class="flex items-center text-sm text-muted-foreground">
                                                <q-icon name="event" size="14px" class="mr-2" />
                                                {{ update.date }}
                                            </div>
                                            <span class="text-sm text-muted-foreground">•</span>
                                            <span class="text-sm text-muted-foreground font-medium">{{ update.version }}</span>
                                        </div>
                                    </div>
                                </div>
                                <q-badge :class="[getTypeColor(update.type), 'whitespace-nowrap']">
                                    {{ update.type }}
                                </q-badge>
                            </div>
                        </q-card-section>

                        <q-card-section class="pl-16">
                            <div class="text-muted-foreground text-lg leading-relaxed">
                                {{ update.description }}
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </section>
        <section id="community" class="py-24 relative atmospheric-bg">
            <div class="section-divider"></div>

            <div class="container mx-auto px-4 content-layer">
                <div class="text-center mb-20">
                    <h2 class="text-5xl md:text-6xl font-bold mb-8 gradient-text">
                        Enter the Sacred Realm
                    </h2>
                    <p class="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        Unite with the brotherhood of Shard Masters and access the ancient archives of wisdom
                    </p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    <q-card v-for="(category, categoryIndex) in linkCategories"
                            :key="categoryIndex"
                            class="shard-shimmer hover:border-primary/50 transition-all duration-500 group"
                            bordered
                    >
                        <q-card-section class="text-center pb-6">
                            <div class="mx-auto p-4 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-all duration-300 w-fit mb-4">
                                <q-icon :name="category.iconName"
                                        class="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div class="text-2xl md:text-3xl gradient-text">
                                {{ category.title }}
                            </div>
                        </q-card-section>

                        <q-card-section class="space-y-4">
                            <div v-for="(link, linkIndex) in category.links"
                                 :key="linkIndex"
                                 @click.prevent
                                 class="w-full justify-start text-left p-6 h-auto hover:bg-primary/10 hover:text-primary transition-all duration-300 group/link cursor-pointer"
                            >
                                <div class="flex items-start space-x-4 w-full">
                                    <q-icon :name="link.iconName"
                                            class="w-5 h-5 mt-1 text-primary/70 group-hover/link:text-primary group-hover/link:scale-110 transition-all duration-300" />
                                    <div class="flex-1">
                                        <div class="font-semibold text-lg mb-1">{{ link.name }}</div>
                                        <div class="text-sm text-muted-foreground group-hover/link:text-muted-foreground/80">
                                            {{ link.description }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </section>
    </q-page>

</template>
<style scoped>
/* Можно добавить анимации или кастомные классы */
.float-animation {
    animation: float 6s ease-in-out infinite;
}

@keyframes float {
    0%, 100% {
        transform: translate(0, 0);
    }
    50% {
        transform: translate(0, -10px);
    }
}
</style>