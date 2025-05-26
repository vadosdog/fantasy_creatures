import {BaseEffect} from "./Effects/BaseEffect.js";

export class Creature {
    constructor({
                    id,
                    name,
                    texture,
                    position,
                    direction,
                    control,

                    maxHealthStat,
                    speedStat,
                    attackStat,
                    defenseStat, //стойкость, защита
                    initiativeStat, // инициатива
                    willStat, // воля, сопротивление бафам/дебафам
                    element,
                    role,

                    actions,
                    effects = [],
                }) {

        this.id = id;
        this.name = name;
        this.texture = texture;
        this.position = position;
        this.direction = direction;
        this.control = control;

        this.maxHealthStat = maxHealthStat
        this.health = maxHealthStat
        this.speedStat = speedStat;
        this.attackStat = attackStat;
        this.defenseStat = defenseStat; //стойкость, защита
        this.initiativeStat = initiativeStat; // инициатива
        this.willStat = willStat; // воля, сопротивление бафам/дебафам
        this.element = element;
        this.role = role;

        this.actions = actions;


        // Бафы
        // {type: 'empower', duration: 1},
        // {type: 'haste', duration: 1},
        // {type: 'luck', duration: 1},
        // {type: 'regen', duration: 1},
        // {type: 'thorns', duration: 1}, //TODO Возвращает 20% полученного урона атакующему
        // {type: 'aegis', duration: 1}, //TODO сделать ауру
        //
        // // Дебафы
        // {type: 'poison', duration: 1},
        // {type: 'bleed', duration: 1},
        // {type: 'burn', duration: 1},
        // {type: 'chill', duration: 1},
        // {type: 'blind', duration: 1},
        // {type: 'curse', duration: 1},
        // {type: 'madness', duration: 1},
        // {type: 'fear', duration: 1}
        this.effects = effects // бафы и дебафы
    }

    getControl() {
        return this.control
    }

    getMaxHealth() {
        return this.effects.reduce((maxHealth, effect) => {
            return maxHealth * effect.getMaxHealthMultiplier()
        }, this.maxHealthStat)
    }

    getSpeed() {
        return this.effects.reduce((maxHealth, effect) => maxHealth + effect.getSpeedTerm(), this.speedStat)
    }

    getAttack() {
        return this.effects.reduce((maxHealth, effect) => maxHealth * effect.getAttackMultiplier(), this.attackStat)
    }

    getDefense() {
        return this.effects.reduce((maxHealth, effect) => maxHealth * effect.getDefenseMultiplier(), this.defenseStat)
    }

    getInitiative() {
        return this.effects.reduce((maxHealth, effect) => maxHealth * effect.getInitiativeMultiplier(), this.initiativeStat)
    }

    getHitChanceModifier() {
        return this.effects.reduce((maxHealth, effect) => maxHealth * effect.getHitChanceMultiplier(), 1)
    }

    getWill() {
        return this.willStat
    }

    getCritChanceTerm() {
        return this.effects.reduce((maxHealth, effect) => maxHealth * effect.getCritChanceTerm(), 0)
    }

    getActions() {
        return this.actions
    }

    hasEffect(effectType) {
        return this.effects.some(effect => effect.effect === effectType)
    }

    pushEffect(effectConfig) {
        const effect = BaseEffect.getEffectObject(effectConfig)
        let existsEffect
        // Если такой эффект уже есть, то увеличиваем его длительность
        existsEffect = this.effects.find(({effect}) => effectConfig.effect === effect)
        if (existsEffect) {
            existsEffect.duration += effectConfig.duration
            return ['Увеличен эффект ' + effectConfig.effect + ` на ${this.name} (${this.id})`]
        }

        // TODO добавить невосприимчивость к некоторым эфектам
        this.effects.push(effect)

        return ['Наложен эффект ' + effectConfig.effect + ` на ${this.name} (${this.id})`]
    }


    //Применить эффекты в начале раунда
    applyRoundEffects() {
        const maxHealth = this.getMaxHealth()
        const appliedEffects = []
        this.effects.forEach(effect => {
            if (effect.getRoundEffect()) {
                appliedEffects.push({
                    type: effect.effect,
                    damage: effect.getRoundEffect(), //на самом деле не дамаг
                    duration: effect.duration - 1
                })
            }
            const damage = maxHealth * effect.getRoundHealthEffect()
            if (damage === 0) {
                return
            }

            appliedEffects.push({
                    type: effect.effect,
                    damage,
                    duration: effect.duration - 1
                }
            )
            this.health += damage
        })

        this.health = Phaser.Math.Clamp(this.health, 0, maxHealth)

        return appliedEffects
    }

    removeRoundEffects() {
        const removedEffects = []
        this.effects.forEach(effect => {
            effect.duration--

            if (effect.duration === 0) {
                removedEffects.push(effect)
            }
        })
        this.effects = this.effects.filter(effect => effect.duration > 0)
        return removedEffects
    }

    removeEffect(effectType) {
        let existsEffectIndex = this.effects.findIndex(({type}) => effectType === type)
        if (existsEffectIndex === -1) {
            return
        }

        this.effects.splice(existsEffectIndex, 1)
    }

}

export class CreatureAction {
    constructor({
                    name,
                    element,
                    baseDamage,
                    hitChance,
                    critChance,
                    effects,
                    actionType,
                    range,
                }) {

        this.name = name
        this.element = element
        this.baseDamage = baseDamage
        this.hitChance = hitChance
        this.critChance = critChance
        this.actionType = actionType
        this.range = range
        this.effects = effects
    }
}