// Класс расчет всех формул битвы
export class CombatHandler {
    static getElementMultiplier(attackElement, defenseElement) {
        // return 1
        const normal = 1
        const enlarged = 1.5
        const reduced = 0.75

        return {
            'fire->fire': reduced,
            'fire->water': reduced,
            'fire->grass': enlarged,
            'water->water': reduced,
            'water->fire': enlarged,
            'water->grass': reduced,
            'grass->grass': reduced,
            'grass->water': enlarged,
            'grass->fire': reduced,
        }[attackElement + '->' + defenseElement] || 1.0
    }
    
    static getHitChance(attacker, defender, attack) {
        return Phaser.Math.Clamp(
            attack.hitChance
            * attacker.getHitChanceModifier(),
            0.05, // всегда есть шанс на поподание
            0.99 // всегда есть шанс на промах
        )
    }

    static getCritAttackChance(attacker, defender, attack) {
        return Math.min(0.25, (attack.critChance
            + (attacker.getWill() - defender.getWill()) / 100 + attacker.getCritChanceTerm()))
    }

    static getAttackDamage(attacker, defender, attack, isCrit = false, potential = false) {
        return Math.floor(Math.max(
            attack.baseDamage * 0.3,
            attack.baseDamage
            * (attacker.getAttack() / defender.getDefense())
            * this.getElementMultiplier(attack.element, defender.element)
            * (isCrit ? 1.5 : 1)
            * (potential ? 1 : Math.random() * 0.3 + 0.85) // +- 15% рандом
        ))
    }

    static getPushEffectChance(attacker, defender, effect) {
        let chance = effect.chance
        if (effect.target === 'target') {
            chance += (attacker.getWill() - defender.getWill()) / 100 // если цель - противник, то добавляем к шансу разницу воли
        }
        return chance
    }
    
    static getTreatHitChance(treater, treated, action) {
        return action.hitChance
            + (treater.getWill() - treated.getWill()) / 100
    }
    
    static getTreatCritChance(treater, treated, action) {
        return (0.05 + treater.getWill() / 100 + treater.getCritChanceTerm())
    }
    
    static getTreatDamage(treater, treated, action, isCrit) {
        return Math.floor(action.baseDamage
            * (treater.getAttack() / treated.getDefense())
            * this.getElementMultiplier(action.element, treated.element)
            * (isCrit ? 1.2 : 1)
        )
    }
}