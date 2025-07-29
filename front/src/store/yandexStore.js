import {defineStore} from 'pinia';
import {getYaGames, initYandexSdk} from "../lib/yandexSdk.js";

export const useYandexStore = defineStore('yandex', {
    state: () => ({
        sdk: null,
        playerData: null,
        isSaving: false,

        // Троттлинг-система
        throttleTimer: null,
        lastSaveCall: 0,
        pendingSave: false,
        throttleDelay: 500
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

                this.isInitialized = true;
            } catch (error) {
                console.error('Yandex store initialization failed:', error);
            }
        },

        createEmulator() {
            return {
                reachGoal: (event, params) => {
                    console.log(`[Emulator] Analytics event: ${event}`, params);
                },
                features: {
                    getData: async () => {
                        const data = localStorage.getItem('gameState') || '{}';
                        console.log('[Emulator] Loading data:', data);
                        return data;
                    },
                    setData: async (data) => {
                        localStorage.setItem('gameState', data);
                        console.log('[Emulator] Saving data:', data);
                        return true;
                    },
                },
                adv: {
                    showRewardedVideo: () => {
                        console.log('[Emulator] Showing rewarded video');
                        return Promise.resolve();
                    }
                }
            };
        },

        async loadGame() {
            try {
                // Новый путь к методам
                const data = await this.sdk?.features?.getData();
                return JSON.parse(data || '{}');
            } catch (error) {
                console.error("Failed to load data", error);
                return {};
            }
        },

        sendAnalyticsEvent(eventName, params = {}) {
            // Прямой вызов метода
            this.sdk.reachGoal(eventName, params);
        },

        // Основная функция сохранения
        async saveGame(state) {
            // Отменяем ожидающий троттлинг-вызов
            if (this.throttleTimer) {
                clearTimeout(this.throttleTimer)
                this.throttleTimer = null
            }
            this.pendingSave = false
            if (this.isSaving) return
            this.isSaving = true
            
            try {


                console.log(state)
                const data = JSON.stringify(state)
                this.sdk.features.setData(data, false)
            } catch (error) {
                console.error('Yandex save error:', error)
            } finally {
                this.isSaving = false
            }

        },

        // Троттлинг-версия для частых событий (500ms)
        throttledSave(data) {
            const now = Date.now()
            this.pendingSave = true

            // Если таймер уже установлен - сбросить его
            if (this.throttleTimer) {
                clearTimeout(this.throttleTimer)
            }

            // Рассчитать время до следующего возможного сохранения
            const timeSinceLastSave = now - this.lastSaveCall
            const delay = Math.max(this.throttleDelay - timeSinceLastSave, 0)

            // Установить новый таймер
            this.throttleTimer = setTimeout(() => {
                if (this.pendingSave) {
                    this.saveGame(data)
                }
            }, delay)
        },
    }
});