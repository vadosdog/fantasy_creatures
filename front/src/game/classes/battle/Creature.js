import {EffectAPI} from "./Effects/BaseEffect.js";

export function createCreature(config) {
    return {
        id: config.id,
        name: config.name,
        texture: config.texture,
        position: config.position,
        direction: config.direction,
        control: config.control,

        maxHealthStat: config.maxHealthStat,
        health: config.maxHealthStat,
        speedStat: config.speedStat,
        attackStat: config.attackStat,
        defenseStat: config.defenseStat,
        initiativeStat: config.initiativeStat,
        willStat: config.willStat,
        element: config.element,
        role: config.role,
        form: config.form,
        level: config.level,

        maxPP: config.maxPP || 100,
        pp: config.maxPP || 10,

        actions: config.actions.map(action => createCreatureAction(action)),

        effects: config.effects || []
    }
}

export function createCreatureAction(config) {
    return {
        id: config.id,
        name: config.name,
        element: config.element,
        form: config.form,
        role: config.role,
        baseDamage: config.baseDamage,
        hitChance: config.hitChance,
        critChance: config.critChance,
        effects: config.effects,
        actionType: config.actionType,
        range: config.range,
        pp: config.pp,
        cooldown: config.cooldown,
        currentCooldown: 0
    }

}

export const CreatureAPI = {
    getMaxHealth(creature) {
        return Math.floor(creature.effects.reduce((maxHealth, effect) => {
            return maxHealth * EffectAPI.getMaxHealthMultiplier(effect)
        }, creature.maxHealthStat))
    },

    getMaxPP(creature) {
        return Math.floor(creature.effects.reduce((maxPP, effect) => {
            return maxPP * EffectAPI.getMaxPPMultiplier(effect)
        }, creature.maxPP))
    },

    getSpeed(creature) {
        return Math.floor(creature.effects.reduce((maxHealth, effect) => maxHealth + EffectAPI.getSpeedTerm(effect), creature.speedStat))
    },

    getAttack(creature) {
        return Math.floor(creature.effects.reduce((maxHealth, effect) => maxHealth * EffectAPI.getAttackMultiplier(effect), creature.attackStat))
    },

    getDefense(creature) {
        return Math.floor(creature.effects.reduce((maxHealth, effect) => maxHealth * EffectAPI.getDefenseMultiplier(effect), creature.defenseStat))
    },

    getInitiative(creature) {
        return Math.floor(creature.effects.reduce((maxHealth, effect) => maxHealth * EffectAPI.getInitiativeMultiplier(effect), creature.initiativeStat))
    },

    getHitChanceModifier(creature) {
        return Math.floor(creature.effects.reduce((maxHealth, effect) => maxHealth * EffectAPI.getHitChanceMultiplier(effect), 1))
    },

    getWill(creature) {
        return Math.floor(creature.willStat)
    },

    getCritChanceTerm(creature) {
        return Math.floor(creature.effects.reduce((maxHealth, effect) => maxHealth * EffectAPI.getCritChanceTerm(effect), 0))
    },

    getBackDamageTerm(creature) {
        return Math.floor(creature.effects.reduce((backDamage, effect) => backDamage + EffectAPI.getBackDamage(effect), 0))
    },

    hasEffect(creature, effectType) {
        const existsEffect = creature.effects.find(({effect}) => effectType === effect)
        if (!existsEffect) {
            return 0
        }

        return existsEffect.duration
    },

    hasDebuff(creature) {
        const debuffs = ['freeze',
            'bleed',
            'burn',
            'poison',
            'blind',
            'fear',
            'chill',
            'curse',
            'confusion'
        ]

        return debuffs.some(debuff => CreatureAPI.hasEffect(creature, debuff));
    },

    pushEffect(creature, effectConfig) {
        const effect = effectConfig
        // Если такой эффект уже есть, то увеличиваем его длительность
        const existsEffect = creature.effects.find(({effect}) => effectConfig.effect === effect)
        if (existsEffect) {
            existsEffect.duration += effectConfig.duration
            return ['Увеличен эффект ' + effectConfig.effect + ` на ${this.name} (${this.id})`]
        }

        // TODO добавить невосприимчивость к некоторым эфектам
        creature.effects.push(effect)

        return ['Наложен эффект ' + effectConfig.effect + ` на ${this.name} (${this.id})`]
    },


    //Применить эффекты в начале раунда
    applyRoundEffects(creature) {
        const maxHealth = this.getMaxHealth(creature)
        const appliedEffects = []
        creature.effects.forEach(effect => {
            if (EffectAPI.getRoundEffect(effect)) {
                appliedEffects.push({
                    type: effect.effect,
                    damage: EffectAPI.getRoundEffect(effect), //на самом деле не дамаг
                    duration: effect.duration - 1
                })
            }
            const damage = Math.floor(maxHealth * EffectAPI.getRoundHealthEffect(effect))
            if (damage === 0) {
                return
            }

            appliedEffects.push({
                    type: effect.effect,
                    damage,
                    duration: effect.duration - 1
                }
            )
            creature.health = Math.floor(creature.health + damage)
        })

        creature.health = Phaser.Math.Clamp(creature.health, 0, maxHealth)

        return appliedEffects
    },

    removeRoundEffects(creature) {
        const removedEffects = []
        creature.effects.forEach(effect => {
            effect.duration--

            if (effect.duration === 0) {
                removedEffects.push(effect)
            }
        })
        creature.effects = creature.effects.filter(effect => effect.duration > 0)
        return removedEffects
    },

    removeEffect(creature, effectType) {
        let existsEffectIndex = creature.effects.findIndex(({type}) => effectType === type)
        if (existsEffectIndex === -1) {
            return
        }

        creature.effects.splice(existsEffectIndex, 1)
    },

    // восстанавливает ПП каждый раунд
    roundRestorePP(creature) {
        creature.pp += 3 // Отбалансить и сделать зависимым от навыка
        const maxPP = this.getMaxPP(creature)
        if (creature.pp >= maxPP) {
            creature.pp = maxPP
        }

        creature.actions.forEach(action => {
            if (action.currentCooldown > 0) {
                action.currentCooldown--
            }
        })
    }
}