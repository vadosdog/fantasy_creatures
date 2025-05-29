export const EFFECT_TYPE_ROUND = 'effect_type_round' // Эффекты, которе длятся определенное количество раундов
export const EFFECT_TYPE_LOCATION = 'effect_type_location' // Эффекты, которые работают, пока существо находится на определенной ячейке
export const EFFECT_TYPE_PASSIVE = 'effect_type_passive' // Пассивные эффекты работают весь бой
export const EFFECT_TYPE_SYNERGY = 'effect_Type_synergy' // Эффекты боя, пока работает синергия

export class BaseEffect {
    constructor({
                    effect,
                    duration, //обязательна для эфектов типа round
                }) {
        this.effect = effect
        this.duration = duration
    }

    static getEffectObject(config) {
        switch (config.effect) {
            // TODO cleanse (очищение дебаффов
            case 'empower':
                return new EmpowerEffect(config)
            case 'haste':
                return new HasteEffect(config)
            case 'luck':
                return new LuckEffect(config)
            case 'regen':
                return new RegenEffect(config)
            case 'thorns':
                return new ThornsEffect(config)
            case 'aegis':
                return new AegisEffect(config)
            case 'poison':
                return new PoisonEffect(config)
            case 'bleed':
                return new BleedEffect(config)
            case 'burn':
                return new BurnEffect(config)
            case 'chill':
                return new ChillEffect(config)
            case 'blind':
                return new BlindEffect(config)
            case 'curse':
                return new CurseEffect(config)
            case 'madness':
                return new MadnessEffect(config)
            case 'fear':
                return new FearEffect(config)
            case 'defense':
                return new DefenseEffect(config)
            case 'confusion':
                return new ConfusionEffect(config)
            case 'freeze':
                return new FreezeEffect(config)
            case 'cleanse':
                return new CleanseEffect(config)
        }
    }

    getMaxHealthMultiplier() {
        return 1
    }

    getAttackMultiplier() {
        return 1
    }

    getDefenseMultiplier() {
        return 1
    }

    getInitiativeMultiplier() {
        return 1
    }

    getHitChanceMultiplier() {
        return 1
    }

    getCritChanceTerm() {
        return 0
    }

    getSpeedTerm() {
        return 0
    }

    getRoundHealthEffect() {
        return 0
    }

    getRoundEffect() {
        return false
    }
}


export class AegisEffect extends BaseEffect {

    getDefenseMultiplier() {
        return 1.1
    }
}

export class BleedEffect extends BaseEffect {

    getRoundHealthEffect() {
        return -0.08
    }
}

export class BlindEffect extends BaseEffect {
    getHitChanceMultiplier() {
        return 0.75
    }
}

export class BurnEffect extends BaseEffect {

    getDefenseMultiplier() {
        return 0.95
    }

    getRoundHealthEffect() {
        return -0.05
    }
}

export class ChillEffect extends BaseEffect {
    getSpeedTerm() {
        return -1
    }

    getInitiativeMultiplier() {
        return 0.8
    }
}

export class ConfusionEffect extends BaseEffect {

    getInitiativeMultiplier() {
        return 0.8
    }
}

export class CurseEffect extends BaseEffect {

    getMaxHealthMultiplier() {
        return 0.9
    }
}

export class DefenseEffect extends BaseEffect {
    getDefenseMultiplier() {
        return 1.1
    }

    getInitiativeMultiplier() {
        return 1.2
    }
}

export class EmpowerEffect extends BaseEffect {
    getAttackMultiplier() {
        return 1.1
    }
}

export class FearEffect extends BaseEffect {
    getAttackMultiplier() {
        return 0.85
    }
}

export class HasteEffect extends BaseEffect {
    getSpeedTerm() {
        return 2
    }
}

export class LuckEffect extends BaseEffect {
    getCritChanceTerm() {
        return 0.15
    }
}

export class MadnessEffect extends BaseEffect {
    getAttackMultiplier() {
        return 1.2
    }

    getDefenseMultiplier() {
        return 0.85
    }

    getRoundHealthEffect() {
        return -0.1
    }
}

export class PoisonEffect extends BaseEffect {

    getRoundHealthEffect() {
        return -0.07
    }
}

export class RegenEffect extends BaseEffect {

    getRoundHealthEffect() {
        return 0.05
    }
}

export class ThornsEffect extends BaseEffect {
}

export class FreezeEffect extends BaseEffect {
    getRoundEffect() {
        return 'Пропуск хода'
    }
}

export class TauntEffect extends BaseEffect { //TODO taunt (провокация, принуждение атаковать)
}

export class KnockbackEffect extends BaseEffect { //TODO knockback (отбрасывание
}

export class CleanseEffect extends BaseEffect { //TODO cleanse (очищение дебафов
}