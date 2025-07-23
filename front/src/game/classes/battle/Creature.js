import {EffectAPI} from "./Effects/BaseEffect.js";

export function createCreature(config) {
    config = calcCreatureStats(config)
    
    return {
        id: config.id,
        name: config.name,
        texture: config.texture,
        textureType: config.textureType,
        position: config.position,
        direction: config.direction,
        control: config.control,
        
        //base
        baseMaxHealthStat: config.baseMaxHealthStat,
        baseSpeedStat: config.baseSpeedStat,
        baseAttackStat: config.baseAttackStat,
        baseDefenseStat: config.baseDefenseStat,
        baseInitiativeStat: config.baseInitiativeStat,
        baseWillStat: config.baseWillStat,
        baseMaxPP: config.baseMaxPP || 100,
        basePpRegen: config.basePpRegen || 3,

        //manual
        manualMaxHealthStat: config.manualMaxHealthStat,
        manualSpeedStat: config.manualSpeedStat,
        manualAttackStat: config.manualAttackStat,
        manualDefenseStat: config.manualDefenseStat,
        manualInitiativeStat: config.manualInitiativeStat,
        manualWillStat: config.manualWillStat,
        manualMaxPP: config.manualMaxPP || 100,
        manualPpRegen: config.manualPpRegen || 3,
        
        //current
        maxHealthStat: config.maxHealthStat,
        speedStat: config.speedStat,
        attackStat: config.attackStat,
        defenseStat: config.defenseStat,
        initiativeStat: config.initiativeStat,
        willStat: config.willStat,
        maxPP: config.maxPP || 100,
        ppRegen: config.ppRegen || 3,
        
        element: config.element,
        emotion: config.emotion,
        shape: config.shape,
        level: config.level,

        health: config.maxHealthStat,
        pp: config.maxPP || 10,

        actions: config.actions.map(action => createCreatureAction(action)),

        effects: config.effects || []
    }
}

export function calcCreatureStats(config) {
    const level = config.level || 1;
    console.log(config.baseMaxHealthStat, level, config.baseMaxHealthStat * (1 + 0.03 * (level - 1)))


    config.maxHealthStat = Math.floor(config.baseMaxHealthStat * (1 + 0.03 * (level - 1))) + (config.manualMaxHealthStat || 0);
    config.speedStat = Math.floor(config.baseSpeedStat + (config.manualAttackStat || 0));
    config.attackStat = Math.floor(config.baseAttackStat * (1 + 0.03 * (level - 1))) + (config.manualAttackStat || 0);
    config.defenseStat = Math.floor(config.baseDefenseStat * (1 + 0.03 * (level - 1))) + (config.manualDefenseStat || 0);
    config.initiativeStat = Math.floor(config.baseInitiativeStat * (1 + 0.03 * (level - 1))) + (config.manualInitiativeStat || 0);
    config.willStat = Math.floor(config.baseWillStat * (1 + 0.03 * (level - 1))) + (config.manualWillStat || 0);
    config.maxPP = Math.floor(config.baseMaxPP * (1 + 0.03 * (level - 1))) + (config.manualMaxPP || 0);
    config.ppRegen = Math.floor(config.basePpRegen * (1 + 0.03 * (level - 1))) + (config.manualPpRegen || 0);
    console.log(config)

    return config
}

export function createCreatureAction(config) {
    return {
        id: config.id,
        name: config.name,
        element: config.element,
        shape: config.shape,
        emotion: config.emotion,
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
        return Math.floor((creature.effects || []).reduce((maxHealth, effect) => {
            return maxHealth * EffectAPI.getMaxHealthMultiplier(effect)
        }, creature.maxHealthStat))
    },

    getMaxPP(creature) {
        return Math.floor((creature.effects || []).reduce((maxPP, effect) => {
            return maxPP * EffectAPI.getMaxPPMultiplier(effect)
        }, creature.maxPP))
    },
    getPpRegen(creature) {
        return creature.ppRegen || 3
    },

    getSpeed(creature) {
        return Math.floor((creature.effects || []).reduce((maxHealth, effect) => maxHealth + EffectAPI.getSpeedTerm(effect), creature.speedStat))
    },

    getAttack(creature) {
        return Math.floor((creature.effects || []).reduce((maxHealth, effect) => maxHealth * EffectAPI.getAttackMultiplier(effect), creature.attackStat))
    },

    getDefense(creature) {
        return Math.floor((creature.effects || []).reduce((maxHealth, effect) => maxHealth * EffectAPI.getDefenseMultiplier(effect), creature.defenseStat))
    },

    getInitiative(creature) {
        return Math.floor((creature.effects || []).reduce((maxHealth, effect) => maxHealth * EffectAPI.getInitiativeMultiplier(effect), creature.initiativeStat))
    },

    getHitChanceModifier(creature) {
        return Math.floor((creature.effects || []).reduce((maxHealth, effect) => maxHealth * EffectAPI.getHitChanceMultiplier(effect), 1))
    },

    getWill(creature) {
        return Math.floor(creature.willStat)
    },

    getCritChanceTerm(creature) {
        return Math.floor((creature.effects || []).reduce((maxHealth, effect) => maxHealth * EffectAPI.getCritChanceTerm(effect), 0))
    },

    getBackDamageTerm(creature) {
        return Math.floor((creature.effects || []).reduce((backDamage, effect) => backDamage + EffectAPI.getBackDamage(effect), 0))
    },

    hasEffect(creature, effectType) {
        const existsEffect = (creature.effects || []).find(({effect}) => effectType === effect)
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
        if (!creature.effects) {
            creature.effects = []
        }
        
        const effect = effectConfig
        // Если такой эффект уже есть, то увеличиваем его длительность
        const existsEffect = creature.effects.find(({effect}) => effectConfig.effect === effect)
        if (existsEffect) {
            existsEffect.duration += effectConfig.duration
            return true
        }

        // TODO добавить невосприимчивость к некоторым эфектам
        creature.effects.push(effect)

        return true
    },


    //Применить эффекты в начале раунда
    applyRoundEffects(creature) {
        if (!creature.effects) {
            return []
        }
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
        if (!creature || !creature.effects) {
            return []
        }
        const removedEffects = []
        creature.effects.forEach(effect => {
            if (!effect) {
                console.error('Почему-то нет effect', creature.effects)
            }
            effect.duration--

            if (effect.duration === 0) {
                removedEffects.push(effect)
            }
        })
        creature.effects = creature.effects.filter(effect => effect.duration > 0)
        return removedEffects
    },

    removeEffect(creature, effectType) {
        if (!creature || !creature.effects) {
            return []
        }
        let existsEffectIndex = creature.effects.findIndex(({type}) => effectType === type)
        if (existsEffectIndex === -1) {
            return
        }

        creature.effects.splice(existsEffectIndex, 1)
    },

    // восстанавливает ПП каждый раунд
    roundRestorePP(creature) {
        creature.pp += this.getPpRegen(creature) // TODO должен зависеть от характеристики ppRegen!
        const maxPP = this.getMaxPP(creature)
        if (creature.pp >= maxPP) {
            creature.pp = maxPP
        }

        creature.actions.forEach(action => {
            if (action.currentCooldown > 0) {
                action.currentCooldown--
            }
        })
    },

    getSimpleObject(creature) {
        return {
            control: creature.control,
            direction: creature.direction,
            element: creature.element,
            shape: creature.shape,
            emotion: creature.emotion,
            health: creature.health,
            id: creature.id,
            name: creature.name,
            position: creature.position,
            texture: creature.texture,
        }
    }
}