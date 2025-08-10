export const locationsLib = {
    academy: {
        id: 'academy',
        name: 'Двор Забытых Мастеров',
        description: 'Полуразрушенный двор академии, где осколки богов мерцают в трещинах камней. Здесь Драгомир наблюдает за "Стеной Отчаяния" - памятником тем, кто боролся с бессмысленностью этого мира.',
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
                label: 'Библиотека Легенд',
            },
            {
                id: 'whispering_forest',
                label: 'Ворота в Шепчущий Лес',
            }
        ],
        npcs: [
            {id: 'dragomir', label: 'Драгомир'},
            {id: 'alice', label: 'Алиса'},
        ],
    },
    academy_training_room: {
        id: 'academy_training_room',
        name: 'Тренировочная комната',
        description: 'Гексагональная арена среди руин, где пульсируют осколочные жилы. Фантомы материализуются из тьмы, чтобы испытать ваших существ в бесконечных битвах.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'academy',
                label: 'Двор Забытых Мастеров',
            },
            {
                id: 'training_1_5',
                label: 'Бой 1 на 1 (До 5 уровня)',
                type: 'start_battle',
                config: {
                    count: 1,
                    levelLimit: 5,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_1_9',
                label: 'Бой 1 на 1 (До 9 уровня)',
                type: 'start_battle',
                config: {
                    count: 1,
                    levelLimit: 9,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_3_5',
                label: 'Бой 3 на 3 (До 5 уровня)',
                type: 'start_battle',
                config: {
                    count: 3,
                    levelLimit: 5,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_3_9',
                label: 'Бой 3 на 3 (До 9 уровня)',
                type: 'start_battle',
                config: {
                    count: 3,
                    levelLimit: 9,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_5_5',
                label: 'Бой 5 на 5 (До 5 уровня)',
                type: 'start_battle',
                config: {
                    count: 5,
                    levelLimit: 5,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_5_9',
                label: 'Бой 5 на 5 (До 9 уровня)',
                type: 'start_battle',
                config: {
                    count: 5,
                    levelLimit: 9,
                    type: 'random_battle',
                }
            },
            {
                id: 'training_6_9',
                label: 'Бой 6 на 6 (До 9 уровня)',
                type: 'start_battle',
                config: {
                    count: 6,
                    levelLimit: 9,
                    type: 'random_battle',
                }
            },
        ],
    },
    academy_forge: {
        id: 'academy_forge',
        name: 'Кузня Осколков',
        description: 'Подвальная мастерская, где плавят кристаллы душ богов. В фиолетовом пламени печей рождаются новые существа - ваше оружие против хаоса.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'gromar', label: 'Громар'},
        ],
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
        id: 'academy_library',
        name: 'Библиотека Легенд',
        description: 'Заваленные руины с книгами, пожираемыми теневыми сущностями. Обломки знаний мерцают в темноте, но проход заблокирован - реальность здесь нестабильна.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'lucian', label: 'Люциан'},
        ],
        options: [
            {
                id: 'academy',
                label: 'Двор Забытых Мастеров',
            },
            {
                id: 'library',
                label: 'Рабочий стол',
                type: 'start_library',
            },
        ],
    },
    whispering_forest: {
        id: 'whispering_forest',
        name: 'Шепчущий Лес',
        description: 'Зараженный лес, где деревья прорастают сквозь осколки богов. Ядовитый туман скрывает искаженных тварей.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'academy',
                label: 'Двор Забытых Мастеров',
            },
            {
                id: 'survivors_village',
                label: 'Поселок Уцелевших',
            },
            {
                id: 'forest_crossing',
                label: 'Лесная Переправа',
            },
            {
                id: 'oblivion_path',
                label: 'Тропа Забвения',
            },
        ],
        exploration: {
            playerCountLimit: 3,
            playerLevelLimit: 7,
            variants: [
                {
                    chance: 0.7,
                    type: 'battle',
                    config: {
                        enemyCount: [2, 3],
                        enemyLevel: [1, 3],
                        type: 'exploration_battle',
                        comment: '70%: 2-3 существа (ур. 1-3) | Игрок: до 3 сущ. (макс. ур. 5)'
                    }
                },
                {
                    chance: 0.25,
                    type: 'battle',
                    config: {
                        enemyCount: [2, 2],
                        enemyLevel: [4, 5],
                        type: 'exploration_battle',
                        comment: '25%: 1 существо + 1 элит (ур. 4-5) | Игрок: до 2 сущ. (макс. ур. 7)'
                    }
                },
                {
                    chance: 0.05,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [2, 4],
                        type: 'exploration_battle',
                        comment: '25%: 1 существо + 1 элит (ур. 4-5) | Игрок: до 2 сущ. (макс. ур. 7)'
                    }
                },
            ]

        }
    },
    forest_crossing: {
        id: 'forest_crossing',
        name: 'Лесная Переправа',
        description: 'Заросшая тропа с мостом через ядовитый ручей. Стволы деревьев прорастают сквозь синие осколки воды.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'faceless', label: 'Безликий'},
        ],
        options: [
            {
                id: 'whispering_forest',
                label: 'Шепчущий Лес',
            },
            {
                id: 'rotten_swamp',
                label: 'Гнилое Болото',
            },
            {
                id: 'whispering_stones_glade',
                label: 'Поляна Шепчущих Камней',
            },
            {
                id: 'sleeping_statues_garden',
                label: 'Сад Спящих Статуй',
            },
        ],
        exploration: {
            playerCountLimit: 3,
            playerLevelLimit: 7,
            variants: [
                {
                    chance: 0.7,
                    type: 'battle',
                    config: {
                        enemyCount: [2, 3],
                        enemyLevel: [1, 3],
                        type: 'exploration_battle',
                        comment: '70%: 2-3 существа (ур. 1-3) | Игрок: до 3 сущ. (макс. ур. 5)'
                    }
                },
                {
                    chance: 0.25,
                    type: 'battle',
                    config: {
                        enemyCount: [2, 2],
                        enemyLevel: [4, 5],
                        type: 'exploration_battle',
                        comment: '25%: 1 существо + 1 элит (ур. 4-5) | Игрок: до 2 сущ. (макс. ур. 7)'
                    }
                },
                {
                    chance: 0.05,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [2, 4],
                        type: 'exploration_battle',
                        comment: '25%: 1 существо + 1 элит (ур. 4-5) | Игрок: до 2 сущ. (макс. ур. 7)'
                    }
                },
            ]
        }
    },
    rotten_swamp: {
        id: 'rotten_swamp',
        name: 'Гнилое Болото',
        description: 'Топи с пузырящимися лужами. Над водой парят зеленоватые осколки, отравляющие воздух.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'forest_crossing',
                label: 'Лесная Переправа',
            },
            {
                id: 'shadows_crossroad',
                label: 'Перекресток Теней',
            },
        ],
        exploration: {
            playerCountLimit: 5,
            playerLevelLimit: 15,
            variants: [
                {
                    chance: 0.6,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 5],
                        enemyLevel: [6, 8],
                        type: 'exploration_battle',
                        comment: '60%: 4-5 существ (ур. 6-8) | Игрок: до 5 сущ. (макс. ур. 10)'
                    }
                },
                {
                    chance: 0.3,
                    type: 'battle',
                    config: {
                        enemyCount: [3, 3],
                        enemyLevel: [9, 10],
                        type: 'exploration_battle',
                        comment: '30%: 3 элита (ур. 9-10) | Игрок: до 4 сущ. (макс. ур. 12)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [12, 12],
                        type: 'exploration_battle',
                        comment: '10%: 1 уникальный (ур. 12) | Игрок: до 2 сущ. (макс. ур. 15)'
                    }
                },
            ]

        }

    },
    whispering_stones_glade: {
        id: 'whispering_stones_glade',
        name: 'Поляна Шепчущих Камней',
        description: 'Круг менгиров с выгравированными рунами. Камни шепчут обрывки фраз на языке богов.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'kiara', label: 'Киара'},
        ],
        options: [
            {
                id: 'forest_crossing',
                label: 'Лесная Переправа',
            },
            {
                id: 'smoldering_wasteland',
                label: 'Тлеющая Пустошь',
            },
            {
                id: 'giants_causeway',
                label: 'Тропа Великанов',
            },
        ],
        exploration: {
            playerCountLimit: 4,
            playerLevelLimit: 9,
            variants: [
                {
                    chance: 0.6,
                    type: 'battle',
                    config: {
                        enemyCount: [3, 4],
                        enemyLevel: [3, 5],
                        type: 'exploration_battle',
                        comment: '60%: 3-4 существа (ур. 3-5) | Игрок: до 4 сущ. (макс. ур. 7)'
                    }
                },
                {
                    chance: 0.3,
                    type: 'battle',
                    config: {
                        enemyCount: [2, 2],
                        enemyLevel: [6, 6],
                        type: 'exploration_battle',
                        comment: '30%: 2 элита (ур. 6) | Игрок: до 3 сущ. (макс. ур. 8)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [3, 3],
                        enemyLevel: [3, 7],
                        type: 'exploration_battle',
                        comment: '10%: 1 сильный + 2 обычных (ур. 7/3) | Игрок: до 3 сущ. (макс. ур. 9)'
                    }
                },
            ]

        }

    },
    smoldering_wasteland: {
        id: 'smoldering_wasteland',
        name: 'Тлеющая Пустошь',
        description: 'Выжженная равнина с трещинами в земле. Из разломов вырываются языки пламени и красные осколки.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'roran', label: 'Роран'},
        ],
        options: [
            {
                id: 'whispering_stones_glade',
                label: 'Поляна Шепчущих Камней',
            },
            {
                id: 'prophetic_stone_cave',
                label: 'Пещера Вещего Камня',
            },
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 20,
            variants: [
                {
                    chance: 0.5,
                    type: 'battle',
                    config: {
                        enemyCount: [5, 6],
                        enemyLevel: [11, 13],
                        type: 'exploration_battle',
                        comment: '50%: 5-6 существ (ур. 11-13) | Игрок: до 6 сущ. (макс. ур. 15)'
                    }
                },
                {
                    chance: 0.4,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [14, 15],
                        type: 'exploration_battle',
                        comment: '40%: 4 элита (ур. 14-15) | Игрок: до 5 сущ. (макс. ур. 17)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [18, 18],
                        type: 'exploration_battle',
                        comment: '10%: 1 уникальный (ур. 18) | Игрок: до 3 сущ. (макс. ур. 20)'
                    }
                },
            ]

        }

    },
    prophetic_stone_cave: {
        id: 'prophetic_stone_cave',
        name: 'Пещера Вещего Камня',
        description: 'Грот с кристаллами, проецирующими видения будущего. В центре - гигантский осколок-оракул.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'stone_voice', label: 'Голос Камня'},
        ],
        options: [
            {
                id: 'smoldering_wasteland',
                label: 'Тлеющая Пустошь',
            },
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 28,
            variants: [
                {
                    chance: 0.7,
                    type: 'battle',
                    config: {
                        enemyCount: [5, 6],
                        enemyLevel: [20, 22],
                        type: 'exploration_battle',
                        comment: '50%: 5-6 существ (ур. 20-22) | Игрок: до 6 сущ. (макс. ур. 24)'
                    }
                },
                {
                    chance: 0.4,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [23, 24],
                        type: 'exploration_battle',
                        comment: '40%: 4 уникальных (ур. 23-24) | Игрок: до 5 сущ. (макс. ур. 26)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [25, 25],
                        type: 'exploration_battle',
                        comment: '10%: 1 легендарный (ур. 25) | Игрок: до 3 сущ. (макс. ур. 28)'
                    }
                },
            ]

        }

    },
    ruins_of_altar: {
        id: 'ruins_of_altar',
        name: 'Развалины Алтаря',
        description: 'Остов древнего храма. Статуи богов с отбитыми головами. В воздухе висят осколки, как застывшие слезы.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'oblivion_path',
                label: 'Тропа Забвения',
            },
            {
                id: 'sanctuary_of_the_first_dreams',
                label: 'Святилище Первых Снов',
            },
        ],
    },
    sanctuary_of_the_first_dreams: {
        id: 'sanctuary_of_the_first_dreams',
        name: 'Святилище Первых Снов',
        description: 'Подземный грот с деревьями из света. В центре - озеро, где плавает Осколок-Сердце. Источник гармонии.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'first_god_echo', label: 'Эхо Первого Бога'},
        ],
        options: [
            {
                id: 'ruins_of_altar',
                label: 'Развалины Алтаря',
            },
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 30,
            variants: [
                {
                    chance: 0.7,
                    type: 'battle',
                    config: {
                        enemyCount: [6, 6],
                        enemyLevel: [26, 28],
                        type: 'exploration_battle',
                        comment: '70%: 6 существ (ур. 26-28) | Игрок: до 6 сущ. (макс. ур. 30)'
                    }
                },
                {
                    chance: 0.25,
                    type: 'battle',
                    config: {
                        enemyCount: [3, 3],
                        enemyLevel: [29, 29],
                        type: 'exploration_battle',
                        comment: '25%: 3 легендарных (ур. 29) | Игрок: до 4 сущ. (макс. ур. 30)'
                    }
                },
                {
                    chance: 0.05,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [30, 30],
                        type: 'exploration_battle',
                        comment: '5%: 1 финальный босс (ур. 30) | Игрок: до 6 сущ. (макс. ур. 30)'
                    }
                },
            ]

        }
    },
    oblivion_path: {
        id: 'oblivion_path',
        name: 'Тропа Забвения',
        description: 'Узкая тропа между скал. На камнях - выцветшие имена мастеров. Ветер свистит, как чей-то шепот.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'wanderer', label: 'Странник'},
        ],
        options: [
            {
                id: 'whispering_forest',
                label: 'Шепчущий Лес',
            },
            {
                id: 'survivors_village',
                label: 'Поселок Уцелевших',
            },
            {
                id: 'rusty_marshes',
                label: 'Ржавые Топи',
            },
            {
                id: 'ruins_of_altar',
                label: 'Развалины Алтаря',
            },
            {
                id: 'salt_caves',
                label: 'Соленые Пещеры',
            },
            {
                id: 'shadows_crossroad',
                label: 'Перекресток Теней',
            },
        ],
        exploration: {
            playerCountLimit: 4,
            playerLevelLimit: 10,
            variants: [
                {
                    chance: 0.5,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [4, 6],
                        type: 'exploration_battle',
                        comment: '50%: 4 существа (ур. 4-6) | Игрок: до 4 сущ. (макс. ур. 8)'
                    }
                },
                {
                    chance: 0.4,
                    type: 'battle',
                    config: {
                        enemyCount: [3, 3],
                        enemyLevel: [5, 7],
                        type: 'exploration_battle',
                        comment: '40%: 3 элита (ур. 5-7) | Игрок: до 4 сущ. (макс. ур. 9)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [3, 3],
                        enemyLevel: [8, 8],
                        type: 'exploration_battle',
                        comment: '10%: 1 босс-миньон (ур. 8) + 2 слабых | Игрок: до 3 сущ. (макс. ур. 10)'
                    }
                },
            ]
        }
    },
    shadows_crossroad: {
        id: 'shadows_crossroad',
        name: 'Перекресток Теней',
        description: 'Заброшенная развилка с покосившимся указателем. Земля проваливается в черные дыры, мерцающие осколками.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'oblivion_path',
                label: 'Тропа Забвения',
            },
            {
                id: 'rotten_swamp',
                label: 'Гнилое Болото',
            },
            {
                id: 'nightmares_grove',
                label: 'Роща Кошмаров',
            },
            {
                id: 'sleeping_serpent_lair',
                label: 'Логово Спящего Змея',
            },
            {
                id: 'cursed_quarry',
                label: 'Проклятый Карьер',
            },
        ],
    },
    nightmares_grove: {
        id: 'nightmares_grove',
        name: 'Роща Кошмаров',
        description: 'Лес с деревьями-скелетами. Ветви образуют клетки, где заточены кошмары. Воздух густой от страха.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'shadows_crossroad',
                label: 'Перекресток Теней',
            },
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 28,
            variants: [
                {
                    chance: 0.6,
                    type: 'battle',
                    config: {
                        enemyCount: [6, 6],
                        enemyLevel: [21, 23],
                        type: 'exploration_battle',
                        comment: '60%: 6 существ (ур. 21-23) | Игрок: до 6 сущ. (макс. ур. 25)'
                    }
                },
                {
                    chance: 0.3,
                    type: 'battle',
                    config: {
                        enemyCount: [5, 5],
                        enemyLevel: [22, 24],
                        type: 'exploration_battle',
                        comment: '30%: 3 элита + 2 уникальных (ур. 24/22) | Игрок: до 5 сущ. (макс. ур. 27)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [26, 26],
                        type: 'exploration_battle',
                        comment: '10%: 1 босс (ур. 26) | Игрок: до 4 сущ. (макс. ур. 28)'
                    }
                },
            ]

        }

    },
    survivors_village: {
        id: 'survivors_village',
        name: 'Поселок Уцелевших',
        description: 'Укрепленное поселение у подножия Академии. Дома из камня и кристаллов осколков. Здесь собираются выжившие мастера и торговцы.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'headman_boris', label: 'Староста Борис'},
            {id: 'bulletin_board', label: 'Доска объявлений'},
        ],
        options: [
            {
                id: 'whispering_forest',
                label: 'Шепчущий Лес',
            },
            {
                id: 'survivors_village_market',
                label: 'Рынок',
            },
            {
                id: 'oblivion_path',
                label: 'Тропа Забвения',
            },
        ],
    },
    survivors_village_market: {
        id: 'survivors_village_market',
        name: 'Рынок',
        description: 'Площадь с лотками, где торгуют осколками и артефактами. В воздухе витает запах жареных грибов и магии.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'trader_elena', label: 'Торговец Елена'},
            {id: 'alchemist_bartholomew', label: 'Алхимик Варфоломей'},
            {id: 'collector_archibald', label: 'Коллекционер Арчибальд'},
        ],
        options: [
            {
                id: 'survivors_village',
                label: 'Поселок Уцелевших',
            },
        ],
    },
    sleeping_serpent_lair: {
        id: 'sleeping_serpent_lair',
        name: 'Логово Спящего Змея',
        description: 'Пещера с гигантским змеиным скелетом. Осколки вросли в кости, как рубины.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'shadows_crossroad',
                label: 'Перекресток Теней',
            },
            {
                id: 'leaning_tower',
                label: 'Падающая Башня',
            },
        ],
        exploration: {
            playerCountLimit: 3,
            playerLevelLimit: 7,
            variants: [
                {
                    chance: 0.7,
                    type: 'battle',
                    config: {
                        enemyCount: [5, 5],
                        enemyLevel: [7, 9],
                        type: 'exploration_battle',
                        comment: '70%: 5 существ (ур. 7-9) | Игрок: до 5 сущ. (макс. ур. 11)'
                    }
                },
                {
                    chance: 0.25,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [8, 10],
                        type: 'exploration_battle',
                        comment: '25%: 3 сильных + 1 элит (ур. 10/8) | Игрок: до 4 сущ. (макс. ур. 13)'
                    }
                },
                {
                    chance: 0.05,
                    type: 'battle',
                    config: {
                        enemyCount: [2, 2],
                        enemyLevel: [12, 12],
                        type: 'exploration_battle',
                        comment: '5%: 2 уникальных (ур. 12) | Игрок: до 3 сущ. (макс. ур. 14)'
                    }
                },
            ]

        }

    },
    leaning_tower: {
        id: 'leaning_tower',
        name: 'Падающая Башня',
        description: 'Накренившаяся башня, пронзенная кристаллами льда. Внутри - замерзшие библиотеки.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'archivist_ghost', label: 'Призрак архивариуса'},
        ],
        options: [
            {
                id: 'sleeping_serpent_lair',
                label: 'Логово Спящего Змея',
            },
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 20,
            variants: [
                {
                    chance: 0.6,
                    type: 'battle',
                    config: {
                        enemyCount: [6, 6],
                        enemyLevel: [12, 14],
                        type: 'exploration_battle',
                        comment: '60%: 6 существ (ур. 12-14) | Игрок: до 6 сущ. (макс. ур. 16)'
                    }
                },
                {
                    chance: 0.3,
                    type: 'battle',
                    config: {
                        enemyCount: [6, 6],
                        enemyLevel: [13, 15],
                        type: 'exploration_battle',
                        comment: '30%: 3 сильных + 3 элита (ур. 15/13) | Игрок: до 6 сущ. (макс. ур. 18)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [2, 2],
                        enemyLevel: [17, 17],
                        type: 'exploration_battle',
                        comment: '10%: 2 уникальных (ур. 17) | Игрок: до 4 сущ. (макс. ур. 20)'
                    }
                },
            ]

        }

    },
    cursed_quarry: {
        id: 'cursed_quarry',
        name: 'Проклятый Карьер',
        description: 'Глубокий котлован с кроваво-красными осколками. На дне - озеро лавы.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'shadows_crossroad',
                label: 'Перекресток Теней',
            },
            {
                id: 'lava_fortress',
                label: 'Лавовая Твердыня',
            },
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 22,
            variants: [
                {
                    chance: 0.7,
                    type: 'battle',
                    config: {
                        enemyCount: [6, 6],
                        enemyLevel: [13, 15],
                        type: 'exploration_battle',
                        comment: '70%: 6 существ (ур. 13-15) | Игрок: до 6 сущ. (макс. ур. 17)'
                    }
                },
                {
                    chance: 0.25,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [16, 17],
                        type: 'exploration_battle',
                        comment: '25%: 4 элита (ур. 16-17) | Игрок: до 5 сущ. (макс. ур. 19)'
                    }
                },
                {
                    chance: 0.05,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [20, 20],
                        type: 'exploration_battle',
                        comment: '5%: 1 босс-миньон (ур. 20) | Игрок: до 3 сущ. (макс. ур. 22)'
                    }
                },
            ]

        }

    },
    lava_fortress: {
        id: 'lava_fortress',
        name: 'Лавовая Твердыня',
        description: 'Цитадель из застывшей магмы. В центре - трон из легендарного осколка.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'cursed_quarry',
                label: 'Проклятый Карьер',
            },
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 30,
            variants: [
                {
                    chance: 0.7,
                    type: 'battle',
                    config: {
                        enemyCount: [6, 6],
                        enemyLevel: [22, 24],
                        type: 'exploration_battle',
                        comment: '70%: 6 существ (ур. 22-24) | Игрок: до 6 сущ. (макс. ур. 26)'
                    }
                },
                {
                    chance: 0.3,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [25, 26],
                        type: 'exploration_battle',
                        comment: '25%: 4 уникальных (ур. 25-26) | Игрок: до 5 сущ. (макс. ур. 28)'
                    }
                },
                {
                    chance: 0.05,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [28, 28],
                        type: 'exploration_battle',
                        comment: '5%: 1 финальный босс-миньон (ур. 28) | Игрок: до 3 сущ. (макс. ур. 30)'
                    }
                },
            ]

        }

    },
    rusty_marshes: {
        id: 'rusty_marshes',
        name: 'Ржавые Топи',
        description: 'Болото с кислотной водой и металлическими "растениями". Воздух разъедает легкие.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'watchman_garth', label: 'Дозорный Гарт'},
        ],
        options: [
            {
                id: 'oblivion_path',
                label: 'Тропа Забвения',
            },
            {
                id: 'ship_cemetery',
                label: 'Кладбище Кораблей',
            },
        ],
    },
    ship_cemetery: {
        id: 'ship_cemetery',
        name: 'Кладбище Кораблей',
        description: 'Гигантские корабли, застрявшие в топи. На мачтах - гнезда теневых птиц.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {
                id: 'rusty_marshes',
                label: 'Ржавые Топи',
            },
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 26,
            variants: [
                {
                    chance: 0.7,
                    type: 'battle',
                    config: {
                        enemyCount: [6, 6],
                        enemyLevel: [18, 20],
                        type: 'exploration_battle',
                        comment: '70%: 6 существ (ур. 18-20) | Игрок: до 6 сущ. (макс. ур. 22)'
                    }
                },
                {
                    chance: 0.25,
                    type: 'battle',
                    config: {
                        enemyCount: [5, 5],
                        enemyLevel: [19, 21],
                        type: 'exploration_battle',
                        comment: '25%: 3 сильных + 2 элита (ур. 21/19) | Игрок: до 5 сущ. (макс. ур. 24)'
                    }
                },
                {
                    chance: 0.05,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [23, 23],
                        type: 'exploration_battle',
                        comment: '5%: 1 уникальный босс (ур. 23) | Игрок: до 3 сущ. (макс. ур. 26)'
                    }
                },
            ]

        }
    },
    salt_caves: {
        id: 'salt_caves',
        name: 'Соленые Пещеры',
        description: 'Гроты с кристаллизованной солью. Осколки света преломляются в тысячах граней.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {id: 'oblivion_path', label: 'Тропа Забвения'},
            {id: 'weeping_cave', label: 'Грот Стенаний'},
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 25,
            variants: [
                {
                    chance: 0.5,
                    type: 'battle',
                    config: {
                        enemyCount: [5, 6],
                        enemyLevel: [14, 16],
                        type: 'exploration_battle',
                        comment: '50%: 5-6 существ (ур. 14-16) | Игрок: до 6 сущ. (макс. ур. 18)'
                    }
                },
                {
                    chance: 0.4,
                    type: 'battle',
                    config: {
                        enemyCount: [3, 3],
                        enemyLevel: [17, 18],
                        type: 'exploration_battle',
                        comment: '40%: 3 уникальных (ур. 17-18) | Игрок: до 4 сущ. (макс. ур. 20)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [19, 19],
                        type: 'exploration_battle',
                        comment: '10%: 1 легендарный миньон (ур. 19) | Игрок: до 2 сущ. (макс. ур. 25)'
                    }
                },
            ]

        }

    },
    weeping_cave: {
        id: 'weeping_cave',
        name: 'Грот Стенаний',
        description: 'Сквозняки "рыдают" в узких тоннелях. В большом зале вдоль стен столбы с плачущими лицами.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'Weeping Spirit', label: 'Плачущий Дух'},
        ],
        options: [
            {id: 'salt_caves', label: 'Соленые Пещеры'},
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 30,
            variants: [
                {
                    chance: 0.5,
                    type: 'battle',
                    config: {
                        enemyCount: [5, 6],
                        enemyLevel: [24, 26],
                        type: 'exploration_battle',
                        comment: '50%: 5-6 существ (ур. 24-26) | Игрок: до 6 сущ. (макс. ур. 28)'
                    }
                },
                {
                    chance: 0.4,
                    type: 'battle',
                    config: {
                        enemyCount: [5, 5],
                        enemyLevel: [25, 27],
                        type: 'exploration_battle',
                        comment: '40%: 3 уникальных + 2 элита (ур. 27/25) | Игрок: до 5 сущ. (макс. ур. 29)/22) | Игрок: до 5 сущ. (макс. ур. 27)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [29, 29],
                        type: 'exploration_battle',
                        comment: '10%: 1 легендарный босс (ур. 29) | Игрок: до 4 сущ. (макс. ур. 30)'
                    }
                },
            ]

        }

    },
    sleeping_statues_garden: {
        id: 'sleeping_statues_garden',
        name: 'Сад Спящих Статуй',
        description: 'Парк с мраморными статуями, опутанными корнями. Некоторые статуи плачут осколками.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'gardener_lis', label: 'Садовник Лис'},
        ],
        options: [
            {id: 'forest_crossing', label: 'Лесная Переправа'},
            {id: 'whispers_grove', label: 'Роща Шепотов'},
        ],
        exploration: {
            playerCountLimit: 3,
            playerLevelLimit: 7,
            variants: [
                {
                    chance: 0.5,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [5, 7],
                        type: 'exploration_battle',
                        comment: '50%: 4 существа (ур. 5-7) | Игрок: до 4 сущ. (макс. ур. 9)'
                    }
                },
                {
                    chance: 0.4,
                    type: 'battle',
                    config: {
                        enemyCount: [3, 3],
                        enemyLevel: [8, 10],
                        type: 'exploration_battle',
                        comment: '40%: 3 элита (ур. 8-10) | Игрок: до 4 сущ. (макс. ур. 12)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [11, 11],
                        type: 'exploration_battle',
                        comment: '10%: 1 босс-миньон (ур. 11) | Игрок: до 2 сущ. (макс. ур. 14)'
                    }
                },
            ]

        }

    },
    whispers_grove: {
        id: 'whispers_grove',
        name: 'Роща Шепотов',
        description: 'Деревья с листьями-колокольчиками. Шум листвы складывается в предсказания.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {id: 'sleeping_statues_garden', label: 'Сад Спящих Статуй'},
            {id: 'bottomless_dreams_lake', label: 'Озеро Бездонных Снов'},
        ],
        exploration: {
            playerCountLimit: 3,
            playerLevelLimit: 7,
            variants: [
                {
                    chance: 0.6,
                    type: 'battle',
                    config: {
                        enemyCount: [5, 6],
                        enemyLevel: [8, 10],
                        type: 'exploration_battle',
                        comment: '60%: 5-6 существ (ур. 8-10) | Игрок: до 6 сущ. (макс. ур. 12)'
                    }
                },
                {
                    chance: 0.3,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [11, 12],
                        type: 'exploration_battle',
                        comment: '30%: 4 элита (ур. 11-12) | Игрок: до 5 сущ. (макс. ур. 14)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [2, 2],
                        enemyLevel: [13, 13],
                        type: 'exploration_battle',
                        comment: '10%: 2 уникальных (ур. 13) | Игрок: до 3 сущ. (макс. ур. 16)'
                    }
                },
            ]

        }

    },
    bottomless_dreams_lake: {
        id: 'bottomless_dreams_lake',
        name: 'Озеро Бездонных Снов',
        description: 'Водоем, отражающий звездное небо днем. В центре - остров с древом.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {id: 'whispers_grove', label: 'Роща Шепотов'},
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 24,
            variants: [
                {
                    chance: 0.6,
                    type: 'battle',
                    config: {
                        enemyCount: [6, 6],
                        enemyLevel: [16, 18],
                        type: 'exploration_battle',
                        comment: '60%: 6 существ (ур. 16-18) | Игрок: до 6 сущ. (макс. ур. 20)'
                    }
                },
                {
                    chance: 0.3,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [19, 20],
                        type: 'exploration_battle',
                        comment: '30%: 4 элита (ур. 19-20) | Игрок: до 5 сущ. (макс. ур. 22)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [2, 2],
                        enemyLevel: [22, 22],
                        type: 'exploration_battle',
                        comment: '10%: 2 уникальных (ур. 22) | Игрок: до 4 сущ. (макс. ур. 24)'
                    }
                },
            ]

        }

    },
    giants_causeway: {
        id: 'giants_causeway',
        name: 'Тропа Великанов',
        description: 'Дорога между каменных стоп размером с дом. На камнях - древние граффити.',
        conditions: [], // Для доступности
        npcs: [],
        options: [
            {id: 'whispering_stones_glade', label: 'Поляна Шепчущих Камней'},
            {id: 'stone_bridge', label: 'Каменный Мост'},
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 18,
            variants: [
                {
                    chance: 0.7,
                    type: 'battle',
                    config: {
                        enemyCount: [6, 6],
                        enemyLevel: [9, 11],
                        type: 'exploration_battle',
                        comment: '70%: 6 существ (ур. 9-11) | Игрок: до 6 сущ. (макс. ур. 13)'
                    }
                },
                {
                    chance: 0.25,
                    type: 'battle',
                    config: {
                        enemyCount: [5, 5],
                        enemyLevel: [10, 12],
                        type: 'exploration_battle',
                        comment: '25%: 3 сильных + 2 элита (ур. 12/10) | Игрок: до 5 сущ. (макс. ур. 15)'
                    }
                },
                {
                    chance: 0.05,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [14, 14],
                        type: 'exploration_battle',
                        comment: '5%: 1 босс-миньон (ур. 14) | Игрок: до 2 сущ. (макс. ур. 18)'
                    }
                },
            ]

        }

    },
    stone_bridge: {
        id: 'stone_bridge',
        name: 'Каменный Мост',
        description: 'Гигантский арочный мост через пропасть. Под мостом - вихри снов.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'gardener_lis', label: 'Страж Моста'},
        ],
        options: [
            {id: 'giants_causeway', label: 'Тропа Великанов'},
            {id: 'heavenly_ruins', label: 'Небесные Руины'},
        ],
    },
    heavenly_ruins: {
        id: 'heavenly_ruins',
        name: 'Небесные Руины',
        description: 'Парящие острова с разрушенными храмами. Между островами - хрустальные мосты.',
        conditions: [], // Для доступности
        npcs: [
            {id: 'gardener_lis', label: 'Страж Моста'},
        ],
        options: [
            {id: 'stone_bridge', label: 'Каменный Мост'},
        ],
        exploration: {
            playerCountLimit: 6,
            playerLevelLimit: 30,
            variants: [
                {
                    chance: 0.6,
                    type: 'battle',
                    config: {
                        enemyCount: [6, 6],
                        enemyLevel: [25, 27],
                        type: 'exploration_battle',
                        comment: '60%: 6 существ (ур. 25-27) | Игрок: до 6 сущ. (макс. ур. 29)'
                    }
                },
                {
                    chance: 0.3,
                    type: 'battle',
                    config: {
                        enemyCount: [4, 4],
                        enemyLevel: [28, 29],
                        type: 'exploration_battle',
                        comment: '30%: 4 уникальных (ур. 28-29) | Игрок: до 5 сущ. (макс. ур. 30)'
                    }
                },
                {
                    chance: 0.1,
                    type: 'battle',
                    config: {
                        enemyCount: [1, 1],
                        enemyLevel: [30, 30],
                        type: 'exploration_battle',
                        comment: '10%: 1 архетип (ур. 30) | Игрок: до 3 сущ. (макс. ур. 30)'
                    }
                },
            ]

        }
    },
}

