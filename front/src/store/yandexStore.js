import { defineStore } from 'pinia';
import {getYaGames, initYandexSdk} from "../lib/yandexSdk.js";

export const useYandexStore = defineStore('yandex', {
    state: () => ({
        sdk: null,
        playerData: null,
        isInitialized: false
    }),
    actions: {
        async initialize() {
            if (this.isInitialized) return;

            try {
                // 1. Инициализируем SDK
                await initYandexSdk();

                // 2. Получаем экземпляр SDK
                this.sdk = getYaGames();

                // 3. Если в dev-режиме и SDK не инициализирован - создаем эмулятор
                if (import.meta.env.DEV && !this.sdk) {
                    console.warn('Using fallback emulator');
                    this.sdk = this.createEmulator();
                }

                // 4. Загружаем данные игрока
                if (this.sdk) {
                    await this.loadPlayerData();
                }

                this.isInitialized = true;
            } catch (error) {
                console.error('Yandex store initialization failed:', error);
            }
        },

        createEmulator() {
            return {
                getData: async () => {
                    const data = localStorage.getItem('yandex_save') || '{}';
                    console.log('[Emulator] Loading data:', data);
                    return data;
                },
                setData: async (data) => {
                    localStorage.setItem('yandex_save', data);
                    console.log('[Emulator] Saving data:', data);
                    return true;
                },
                reachGoal: (event, params) => {
                    console.log(`[Emulator] Analytics event: ${event}`, params);
                },
                adv: {
                    showRewardedVideo: () => {
                        console.log('[Emulator] Showing rewarded video');
                        return Promise.resolve();
                    }
                }
            };
        },

        async loadPlayerData() {
            try {
                // Новый путь к методам
                const data = await this.sdk?.features?.getData();
                this.playerData = JSON.parse(data || '{}');
            } catch (error) {
                console.error("Failed to load data", error);
                this.playerData = {};
            }
        },

        async savePlayerData(data) {
            // Новый путь к методам
            await this.sdk.features.setData(JSON.stringify(data), true);
        },

        sendAnalyticsEvent(eventName, params = {}) {
            // Прямой вызов метода
            this.sdk.reachGoal(eventName, params);
        }
    }
});