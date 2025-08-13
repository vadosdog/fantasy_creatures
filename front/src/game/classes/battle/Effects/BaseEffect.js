// export class TauntEffect extends BaseEffect { //TODO taunt (провокация, принуждение атаковать)
// }
//
// export class KnockbackEffect extends BaseEffect { //TODO knockback (отбрасывание
// }
//
// export class CleanseEffect extends BaseEffect { //TODO cleanse (очищение дебафов
// }

export const EffectAPI = {

    getMaxHealthMultiplier(effect) {
        switch (effect.effect) {
            case 'aegis':
                return 1.3
            case 'curse':
                return 1.3
        }
        return 1
    },

    getMaxPPMultiplier(effect) {
        return 1
    },

    getAttackMultiplier(effect) {
        switch (effect.effect) {
            case 'empower':
                return 1.3
            case 'fear':
                return 0.85
            case 'madness':
                return 1.2
        }
        return 1
    },

    getDefenseMultiplier(effect) {
        switch (effect.effect) {
            case 'burn':
                return 0.95
            case 'defense':
                return 1.1
            case 'madness':
                return 0.85
        }
        return 1
    },

    getInitiativeMultiplier(effect) {
        switch (effect.effect) {
            case 'chill':
                return 0.8
            case 'confusion':
                return 0.8
            case 'defense':
                return 1.2
        }
        return 1
    },

    getHitChanceMultiplier(effect) {
        switch (effect.effect) {
            case 'blind':
                return 0.75
        }
        return 1
    },

    getCritChanceTerm(effect) {
        switch (effect.effect) {
            case 'luck':
                return 0.15
        }
        return 0
    },

    getSpeedTerm(effect) {
        switch (effect.effect) {
            case 'chill':
                return -1
            case 'haste':
                return 2
        }
        return 0
    },

    getRoundHealthEffect(effect) {
        switch (effect.effect) {
            case 'bleed':
                return -0.06
            case 'burn':
                return -0.05
            case 'madness':
                return -0.1
            case 'poison':
                return -0.07
            case 'regen':
                return 0.05
        }
        return 0
    },

    getRoundEffect(effect) {
        switch (effect.effect) {
            case 'freeze':
                return 'Пропуск хода'
        }
        return false
    },

    getBackDamage(effect) {
        switch (effect.effect) {
            case 'thorns':
                return 0.2
        }
        return 0
    },
}
