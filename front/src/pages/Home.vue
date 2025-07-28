<script setup>
import {onMounted} from "vue";
import {useYandexStore} from "../store/yandexStore.js";

const emit = defineEmits(['current-active-scene', 'update-footer', 'update-left-drawer', 'update-right-drawer', 'update-header']);

onMounted(() => {
    emit('update-footer', null)
    emit('update-header', null)
    emit('update-left-drawer', null)
    emit('update-right-drawer', null)

});

const features = [
    {
        title: "Мистические Осколки",
        description:
            "Собирайте фрагменты божественной памяти по стихиям (огонь, вода, трава), формам (зверь, птица, рептилия) и эмоциям (ярость, азарт, надежда). Каждый осколок содержит частицу божественных снов.",
        iconName: "sparkle",
        rarity: "Обычные осколки белого сияния"
    },
    {
        title: "Создание Существ",
        description:
            "Пробуждайте легенды из осколков божественной памяти. Комбинируйте 3 осколка, чтобы создать уникальных существ с особыми характеристиками и навыками.",
        iconName: "crown",
        rarity: "Создайте свою первую легенду"
    },
    {
        title: "Стихийное Мастерство",
        description:
            "Используйте сильные и слабые стороны стихий в тактических битвах. Огненные атаки сильны против травяных существ, но слабы против водных.",
        iconName: "flash_on",
        rarity: "Три стихии, бесконечные комбинации"
    },
    {
        title: "Академия Мастеров",
        description:
            "Оттачивайте мастерство в тренировочных битвах против случайных существ. Создавайте команды до 6 существ и развивайте их до 10 уровня.",
        iconName: "terrain",
        rarity: "Начните своё обучение сегодня"
    }
];

const updates = [
    {
        version: "MVP 0.1",
        date: "Июль 2025",
        title: "Запуск минимальной версии",
        description:
            "Доступны базовые механики: создание существ из осколков, тактические битвы 6x6, система Power Points (PP), стихийные взаимодействия и эффекты в бою.",
        type: "Основное Обновление",
        iconName: "crown"
    },
    {
        version: "Будущее обновление",
        date: "Скоро",
        title: "Редкие Осколки и Эволюции",
        description:
            "В разработке: редкие осколки с улучшенными характеристиками, система эволюции существ и новые возможности прокачки.",
        type: "Планы",
        iconName: "sparkle"
    },
    {
        version: "Будущее обновление",
        date: "Скоро",
        title: "Уникальные Боссы и Синергии",
        description:
            "Планируем добавить: боссов с особыми механиками, пассивные эффекты существ, синергии в командах и систему артефактов.",
        type: "Планы",
        iconName: "shield"
    },
    {
        version: "Будущее обновление",
        date: "Скоро",
        title: "Сюжет и PvP",
        description:
            "В разработке: захватывающий сюжетный квест, ежедневные задания, PvP-арена и расширенная коллекция осколков.",
        type: "Планы",
        iconName: "groups"
    }
];

const getTypeColor = (type) => {
    switch (type) {
        case "Основное Обновление":
            return "bg-primary/20 text-primary border-primary/30";
        case "Планы":
            return "bg-accent/20 text-accent border-accent/30";
        case "Обновление Функций":
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        default:
            return "bg-muted/20 text-muted-foreground border-muted/30";
    }
};

const linkCategories = [
    {
        title: "Присоединиться к Сообществу",
        iconName: "group",
        links: [
            {
                name: "Telegram Канал",
                description: "Обсуждайте стратегии и делитесь находками",
                iconName: "chat_bubble_outline"
            },
            {
                name: "Предложить Идею",
                description: "Ваши идеи помогут сформировать будущее игры",
                iconName: "lightbulb_outline"
            },
            {
                name: "Стать Соавтором",
                description: "Приглашаем художников и дизайнеров к сотрудничеству",
                iconName: "brush"
            }
        ]
    },
    {
        title: "Будущие Возможности",
        iconName: "auto_awesome",
        links: [
            {
                name: "4 Стадии Эволюции",
                description: "Каждое существо получит уникальные трансформации",
                iconName: "change_circle"
            },
            {
                name: "Уникальные Боссы",
                description: "Испытайте себя против легендарных существ",
                iconName: "shield"
            },
            {
                name: "Синергии и Артефакты",
                description: "Создавайте мощные комбинации и собирайте реликвии",
                iconName: "auto_awesome"
            },
            {
                name: "PvP Арена",
                description: "Соревнуйтесь с другими Мастерами Осколков",
                iconName: "sports_esports"
            }
        ]
    }
];


const yandexStore = useYandexStore();

const saveGameProgress = async () => {
    console.log(123)
    const success = await yandexStore.savePlayerData({
        level: 5,
        coins: 1000,
        inventory: ['sword', 'potion']
    });
    console.log(success)

    if (success) {
        console.log('Game saved successfully!');
        yandexStore.sendAnalyticsEvent('game_save');
    }
};

const showAd = async () => {
    if (!yandexStore.sdk) return;

    try {
        await yandexStore.sdk.adv.showRewardedVideo();
        console.log('Reward granted!');
        yandexStore.sendAnalyticsEvent('ad_watched');
    } catch (error) {
        console.error('Ad error:', error);
    }
};


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
                        <img src="/Logo_transperent-Photoroom.png"
                             alt="Лого Рунные осколки"
                             class="w-40 h-40 mx-auto float-animation mystical-glow-transparent"/>
                    </div>

                    <!-- Main title -->
                    <h1 class="hero-title mb-8 gradient-text">
                        Рунные Осколки
                    </h1>

                    <!-- Subtitle -->
                    <div class="text-xl md:text-2xl mb-6 text-accent font-semibold tracking-wide">
                        Пробуди божественные легенды
                    </div>

                    <!-- Description -->
                    <p class="text-lg md:text-xl mb-12 text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        В мире, где боги погрузились в вечный сон, их мечты кристаллизовались в мистические
                        <span class="text-primary font-semibold mx-2">Рунные Осколки</span> -
                        фрагменты божественной памяти, ждущие своего пробуждения. Станьте
                        <span class="text-accent font-semibold mx-2">Мастером Осколков</span>
                        и вдохните жизнь в забытые легенды.
                    </p>

                    <!-- Action buttons -->
                    <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                        <q-btn size="lg" unelevated no-caps
                               class="mystical-glow hover:scale-105 transition-all duration-300 text-lg px-10 py-4"
                               color="primary"
                               text-color="primary-foreground"
                               to="/game"
                        >
                            <q-icon name="play_arrow" class="w-5 h-5 mr-3"/>
                            Начать Игру
                        </q-btn>

                        <q-btn size="lg" outline no-caps
                               class="text-lg px-10 py-4 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300">
                            <q-icon name="auto_stories" class="w-5 h-5 mr-3"/>
                            Узнать Историю Мира
                        </q-btn>

                        <!-- ...ваш существующий код... -->
                        <q-btn label="Save Game" @click="saveGameProgress" />
                        <q-btn label="Show Ad" @click="showAd" />
                    </div>

                    <!-- Mystical quote -->
                    <div class="max-w-3xl mx-auto">
                        <div class="relative">
                            <div class="absolute -top-4 -left-4 text-6xl text-primary/30 font-serif">"</div>
                            <div class="absolute -bottom-4 -right-4 text-6xl text-primary/30 font-serif rotate-180">"
                            </div>
                            <blockquote
                                class="text-lg md:text-xl italic text-muted-foreground leading-relaxed px-8 py-4">
                                Слышишь их шёпот? Осколки зовут тебя... но будь осторожен. Некоторые сны лучше не тревожить.
                            </blockquote>
                        </div>
                        <cite class="text-sm text-primary/80 mt-4 block">— Древний Мастер Осколков</cite>
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
                        Освойте Искусство Осколков
                    </h2>
                    <p class="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        Откройте тайны мира, где мифы переплетаются с приключениями, а каждый осколок хранит память богов
                    </p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    <q-card v-for="(feature, index) in features"
                            :key="index"
                            class="shard-shimmer hover:border-primary/50 transition-all duration-2000 group overflow-hidden"
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
                        Хроника Изменений
                    </h2>
                    <p class="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        Следите за развитием нашего мистического мира через важные обновления и будущие возможности
                    </p>
                </div>

                <div class="max-w-5xl mx-auto space-y-8">
                    <q-card v-for="(update, index) in updates"
                            :key="index"
                            class="shard-shimmer hover:border-primary/30 transition-all duration-2000 group"
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
                        Присоединяйтесь к Созиданию
                    </h2>
                    <p class="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                        Ваши идеи и таланты помогут создать уникальный мир. Станьте частью нашей истории!
                    </p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    <q-card v-for="(category, categoryIndex) in linkCategories"
                            :key="categoryIndex"
                            class="shard-shimmer hover:border-primary/50 transition-all duration-2000 group"
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