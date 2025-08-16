export class SynergyController {

    constructor() {
        this.synergyLib = {
            "elemental": [
                {
                    "element": "fire",
                    "effects": [
                        {
                            "required_units": 2,
                            "effect": "+10% к урону от атак"
                        },
                        {
                            "required_units": 4,
                            "effect": "Криты поджигают врага (-5% HP за ход, 3 хода)"
                        },
                        {
                            "required_units": 6,
                            "effect": "При убийстве врага все огненные эхоны получают +15% атаки на 2 хода"
                        }
                    ]
                },
                {
                    "element": "water",
                    "effects": [
                        {
                            "required_units": 2,
                            "effect": "+10% к лечению"
                        },
                        {
                            "required_units": 4,
                            "effect": "Дебаффы снимаются на 1 ход раньше"
                        },
                        {
                            "required_units": 6,
                            "effect": "Раз в 3 хода водные эхоны очищают все негативные эффекты"
                        }
                    ]
                },
                {
                    "element": "nature",
                    "effects": [
                        {
                            "required_units": 2,
                            "effect": "+5% к макс. HP"
                        },
                        {
                            "required_units": 4,
                            "effect": "Шанс 15% отразить дебафф обратно на врага"
                        },
                        {
                            "required_units": 6,
                            "effect": "В начале хода восстанавливают 3% макс. HP"
                        }
                    ]
                }
            ],
            "shapes": [
                {
                    "shape": "beast",
                    "effects": [
                        {
                            "required_units": 2,
                            "effect": "+1 к дальности ближних атак"
                        },
                        {
                            "required_units": 4,
                            "effect": "При атаке есть шанс 20% оглушить цель (пропуск хода)"
                        },
                        {
                            "required_units": 6,
                            "effect": "Если зверь убит, остальные получают +25% к атаке до конца боя"
                        }
                    ]
                },
                {
                    "shape": "bird",
                    "effects": [
                        {
                            "required_units": 2,
                            "effect": "Игнорируют штрафы к скорости"
                        },
                        {
                            "required_units": 4,
                            "effect": "+15% к шансу крита"
                        },
                        {
                            "required_units": 6,
                            "effect": "Могут атаковать дважды за ход с 50% урона"
                        }
                    ]
                },
                {
                    "shape": "reptile",
                    "effects": [
                        {
                            "required_units": 2,
                            "effect": "+10% к защите"
                        },
                        {
                            "required_units": 4,
                            "effect": "При получении урона >30% HP накладывают \"Кровотечение\" на атакующего"
                        },
                        {
                            "required_units": 6,
                            "effect": "Каждый ход случайный рептилия получает невидимость (не может быть целью) на 1 ход"
                        }
                    ]
                }
            ],
            "emotions": [
                {
                    "emotion": "rage",
                    "effects": [
                        {
                            "required_units": 2,
                            "effect": "+5% к урону за каждый потерянный 10% HP"
                        },
                        {
                            "required_units": 4,
                            "effect": "При первом убийстве все яростные эхоны получают +2 к скорости"
                        },
                        {
                            "required_units": 6,
                            "effect": "Криты наносят двойной урон, но -20% к защите"
                        }
                    ]
                },
                {
                    "emotion": "gamble",
                    "effects": [
                        {
                            "required_units": 2,
                            "effect": "10% шанс повторить атаку"
                        },
                        {
                            "required_units": 4,
                            "effect": "При промахе следующий удар гарантированно попадает"
                        },
                        {
                            "required_units": 6,
                            "effect": "Каждый ход случайный навык стоит на 1 AP дешевле"
                        }
                    ]
                },
                {
                    "emotion": "hope",
                    "effects": [
                        {
                            "required_units": 2,
                            "effect": "+5% к сопротивлению дебаффам"
                        },
                        {
                            "required_units": 4,
                            "effect": "При смерти союзника все надеющиеся эхоны получают +15% защиты"
                        },
                        {
                            "required_units": 6,
                            "effect": "Раз в 5 ходов воскрешают случайного погибшего союзника с 30% HP"
                        }
                    ]
                }
            ],
        }
    }
}