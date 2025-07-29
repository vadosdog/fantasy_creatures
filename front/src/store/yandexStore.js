import {defineStore} from 'pinia';
import {getYaGames, initYandexSdk} from "../lib/yandexSdk.js";

// Список разрешённых ключей, которые мы доверяем
export const ALLOWED_KEYS = ['inventory', 'knownCreatures', 'creatures', 'flags', 'currentState', 'currentLocationId', 'visitedLocations', 'metNpcs', 'dialogProgress'];

export const useYandexStore = defineStore('yandex', {
    state: () => ({
        sdk: null,
        yaPlayer: null,
        playerData: null,
        isSaving: false,
        isInitialized: false,

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
        async getPlayer() {
            if (this.yaPlayer) {
                return this.yaPlayer;
            }
            this.yaPlayer = await this.sdk.getPlayer();
            return this.yaPlayer;
        },
        createEmulator() {
            return {
                reachGoal: (event, params) => {
                    console.log(`[Emulator] Analytics event: ${event}`, params);
                },
                getPlayer: () => {
                    return Promise.resolve({
                        // setData принимает объект
                        setData: (data) => {
                            console.log('[Emulator] Saving data:', data);
                            try {
                                // Сохраняем как строку в localStorage
                                localStorage.setItem('gameState', JSON.stringify(data));
                                return Promise.resolve();
                            } catch (error) {
                                return Promise.reject(error);
                            }
                        },
                        // getData возвращает объект (как в Yandex SDK)
                        getData: () => {
                            console.log('[Emulator] Loading data');
                            const saved = localStorage.getItem('gameState');
                            return Promise.resolve(saved ? JSON.parse(saved) : {});
                        }
                    });
                },
                adv: {
                    showRewardedVideo: () => {
                        console.log('[Emulator] Showing rewarded video');
                        return Promise.resolve({rewarded: true});
                    }
                }
            };
        },

        async loadGame() {
            try {
                const player = await this.getPlayer();
                const rawData = await player.getData(); // объект

                if (!rawData || typeof rawData !== 'object') {
                    return {};
                }

                // Фильтруем только нужные поля
                const filteredData = {};
                for (const key of ALLOWED_KEYS) {
                    if (rawData.hasOwnProperty(key)) {
                        filteredData[key] = rawData[key];
                    }
                }

                return filteredData;
            } catch (error) {
                console.error("Failed to load data", error);
                return {};
            }
        },

        sendAnalyticsEvent(eventName, params = {}) {
            // Прямой вызов метода
            // this.sdk.reachGoal(eventName, params);
        },

        // Основная функция сохранения
        async saveGame(state) {
            if (this.isSaving) return;
            this.isSaving = true;

            if (this.throttleTimer) {
                clearTimeout(this.throttleTimer);
                this.throttleTimer = null;
            }
            this.pendingSave = false;

            try {
                const player = await this.getPlayer();
                console.log(state)
                await player.setData(state); // ← передаём объект, не строку!
                console.log('Game saved successfully');
            } catch (error) {
                console.error('Yandex save error:', error);
            } finally {
                this.isSaving = false;
                this.lastSaveCall = Date.now();
            }
        },

        // Троттлинг-версия для частых событий (500ms)
        throttledSave(data) {
            const now = Date.now();
            this.pendingSave = true;

            if (this.throttleTimer) {
                clearTimeout(this.throttleTimer);
            }

            const timeSinceLastSave = now - this.lastSaveCall;
            const delay = Math.max(this.throttleDelay - timeSinceLastSave, 0);

            this.throttleTimer = setTimeout(async () => {
                this.throttleTimer = null;
                if (this.pendingSave) {
                    await this.saveGame(data);
                    this.lastSaveCall = Date.now();
                }
            }, delay);
        },
    }
});