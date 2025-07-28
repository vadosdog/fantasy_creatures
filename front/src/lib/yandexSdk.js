let yaGamesInstance = null; // Сохраняем экземпляр SDK

export const initYandexSdk = async () => {
    // Проверяем, находимся ли мы внутри Яндекс Игр
    const isYandexEnvironment = window.self !== window.top &&
        /yandex\.(ru|com|by|kz|ua)/.test(window.location.href);

    // Если не в Яндекс и не в продакшене - пропускаем инициализацию
    if (!isYandexEnvironment && !import.meta.env.PROD) {
        console.log('[Yandex SDK] Skipping init in local development');
        return null;
    }

    if (!window.YaGames) {
        console.warn('[Yandex SDK] YaGames global not found');
        return null;
    }

    try {
        yaGamesInstance = await window.YaGames.init();

        console.log('[Yandex SDK] Initialized successfully');
        return yaGamesInstance;
    } catch (error) {
        console.error('[Yandex SDK] Initialization failed:', error);
        return null;
    }
};

// Важно: эта функция должна возвращать инициализированный экземпляр
export const getYaGames = () => {
    if (!yaGamesInstance) {
        console.warn('[Yandex SDK] Instance not initialized yet');
    }
    return yaGamesInstance;
};