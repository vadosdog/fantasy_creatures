export const locationsLib = {
    academy: {
        name: 'Двор Забытых Мастеров',
        description: 'Полуразрушенный двор академии, где осколки богов мерцают в трещинах камней. Здесь Драгомир наблюдает за "Стеной Отчаяния" - памятником тем, кто боролся с бессмысленностью этого мира.',
        image: '/assets/locations/academy.png',
        conditions: [], // Для доступности
        options: [
            {
                id: 'academy_training_room',
                label: 'Тренировочная комната',
            },
            {
                id: 'academy_forge',
                label: 'Кузня Осколков',
            },
            {
                id: 'academy_library',
                label: 'Библиотека',
            },
            {
                id: 'whispering_forest1',
                label: 'Выйти',
                caption: 'Закрыто'
            }
        ],
        npcs: [{id: 'dragomir', label: 'Драгомир'}],
    },
    academy_training_room: {
        name: 'Эхо Разлома',
        description: 'Гексагональная арена среди руин, где пульсируют осколочные жилы. Фантомы материализуются из тьмы, чтобы испытать ваших существ в бесконечных битвах.',
        image: '/assets/locations/academy_training_room.png',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'academy',
                label: 'Двор Забытых Мастеров',
            },
            {
                id: 'training_1',
                label: 'Бой 1 на 1',
                type: 'start_battle',
                config: {
                    limit: 1,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_2',
                label: 'Бой 2 на 2',
                type: 'start_battle',
                config: {
                    limit: 2,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_3',
                label: 'Бой 3 на 3',
                type: 'start_battle',
                config: {
                    limit: 3,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_4',
                label: 'Бой 4 на 4',
                type: 'start_battle',
                config: {
                    limit: 4,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_5',
                label: 'Бой 5 на 5',
                type: 'start_battle',
                config: {
                    limit: 5,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_6',
                label: 'Бой 6 на 6',
                type: 'start_battle',
                config: {
                    limit: 6,
                    type: 'random_battle',
                }
            },
        ],
    },
    academy_forge: {
        name: 'Кузня Осколков',
        description: 'Подвальная мастерская, где плавят кристаллы душ богов. В фиолетовом пламени печей рождаются новые существа - ваше оружие против хаоса.',
        image: '/assets/locations/academy_forge.png',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'academy',
                label: 'Двор Забытых Мастеров',
            },
            {
                id: 'craft',
                label: 'Горн Памяти',
                type: 'start_craft',
            },
        ],
    },
    academy_library: {
        name: 'Библиотека Теней',
        description: 'Заваленные руины с книгами, пожираемыми теневыми сущностями. Обломки знаний мерцают в темноте, но проход заблокирован - реальность здесь нестабильна.',
        image: '/assets/locations/academy_library.png',
        conditions: [], // Для доступности
        npcs: [],
        options: [{
            id: 'academy',
            label: 'Двор Забытых Мастеров',
        }],
    },
    whispering_forest1: {
        name: 'Шепчущий Лес',
        description: 'Зараженный лес, где деревья прорастают сквозь осколки богов. Ядовитый туман скрывает искаженных тварей, но путь сюда пока закрыт хаосом.',
        image: '/assets/locations/whispering_forest_1.png',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'academy',
                label: 'Двор Забытых Мастеров',
            },
            {
                id: 'whispering_forest2',
                label: 'Налево',
            },
            {
                id: 'whispering_forest3',
                label: 'Прямо',
            },
            {
                id: 'whispering_forest4',
                label: 'Направо',
            },
        ],
    },
    whispering_forest2: {
        name: 'Шепчущий Лес',
        description: 'Зараженный лес, где деревья прорастают сквозь осколки богов. Ядовитый туман скрывает искаженных тварей, но путь сюда пока закрыт хаосом.',
        image: '/assets/locations/whispering_forest_2.png',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'whispering_forest1',
                label: 'Налево',
            },
            {
                id: 'whispering_forest3',
                label: 'Прямо',
            },
            {
                id: 'whispering_forest4',
                label: 'Направо',
            },
        ],
    },
    whispering_forest3: {
        name: 'Шепчущий Лес',
        description: 'Зараженный лес, где деревья прорастают сквозь осколки богов. Ядовитый туман скрывает искаженных тварей, но путь сюда пока закрыт хаосом.',
        image: '/assets/locations/whispering_forest_3.png',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'whispering_forest2',
                label: 'Налево',
            },
            {
                id: 'whispering_forest1',
                label: 'Прямо',
            },
            {
                id: 'whispering_forest4',
                label: 'Направо',
            },
        ],
    },
    whispering_forest4: {
        name: 'Шепчущий Лес',
        description: 'Зараженный лес, где деревья прорастают сквозь осколки богов. Ядовитый туман скрывает искаженных тварей, но путь сюда пока закрыт хаосом.',
        image: '/assets/locations/whispering_forest_4.png',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'whispering_forest2',
                label: 'Налево',
            },
            {
                id: 'whispering_forest3',
                label: 'Прямо',
            },
            {
                id: 'whispering_forest1',
                label: 'Направо',
            },
        ],
    },
}

