// Класс расчет всех формул битвы
import {CreatureAPI} from "./Creature.js";

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

    static getHitChance(attacker, defender, attack, distance) {
        let distanceMultiplayer = 1
        if (attack.actionType === 'ranged') {
            if (distance < attack.range * 0.3) {
                // На ближних дистанциях увеличиваем точность
                distanceMultiplayer = 1.1
            } else if (distance > attack.range * 0.7) {
                // На дальних дистанциях снижаем точность до 60% от базовой
                distanceMultiplayer = 1 - 0.4 * (distance - 0.7 * attack.range) / (0.3 * attack.range)
            }
        }

        return Phaser.Math.Clamp(
            attack.hitChance
            * CreatureAPI.getHitChanceModifier(attacker)
            * distanceMultiplayer
            ,
            0.05, // всегда есть шанс на поподание
            0.99 // всегда есть шанс на промах
        )
    }

    static getCritAttackChance(attacker, defender, attack) {
        return Math.min(0.25, (attack.critChance
            + (CreatureAPI.getWill(attacker) - CreatureAPI.getWill(defender)) / 100 + CreatureAPI.getCritChanceTerm(attacker)))
    }

    static getAttackDamage(attacker, defender, attack, distance, isCrit = false, potential = false) {
        // урон рандомный +- 15%
        let random = potential ? 1 : Math.random() * 0.3 + 0.85
        if (CreatureAPI.hasEffect(attacker, 'luck')) {
            // Если навык удача, то урон раздоится 1 - 1.15 (0 - +15%)
            // При этом потенциальный урон вырастает на 7.5%
            random = potential ? 1.075 : Math.random() * 0.15 + 1
        }

        let distanceMultiplayer = 1
        if (attack.actionType === 'ranged') {
            if (distance > attack.range * 0.7) {
                // На дальних дистанциях снижаем урон до 50% от базовой
                distanceMultiplayer = 1 - 0.5 * (distance - 0.7 * attack.range) / (0.3 * attack.range)
            }
        }

        return Math.floor(Math.max(
            attack.baseDamage * 0.3,
            attack.baseDamage
            * (CreatureAPI.getAttack(attacker) / CreatureAPI.getDefense(defender))
            * this.getElementMultiplier(attack.element, defender.element)
            * (isCrit ? 1.5 : 1)
            * random
            * distanceMultiplayer
        ))
    }

    static getPushEffectChance(attacker, defender, effect) {
        let chance = effect.chance
        if (effect.target === 'target') {
            chance += (CreatureAPI.getWill(attacker) - CreatureAPI.getWill(defender)) / 100 // если цель - противник, то добавляем к шансу разницу воли
        }
        return chance
    }

    static getTreatHitChance(treater, treated, action) {
        return action.hitChance
            + (CreatureAPI.getWill(treater) - CreatureAPI.getWill(treated)) / 100
    }

    static getTreatCritChance(treater, treated, action) {
        return (0.05 + CreatureAPI.getWill(treater) / 100 + CreatureAPI.getCritChanceTerm(treater))
    }

    static getTreatDamage(treater, treated, action, isCrit) {
        return Math.floor(action.baseDamage
            * (CreatureAPI.getAttack(treater) / CreatureAPI.getDefense(treated))
            * this.getElementMultiplier(action.element, treated.element)
            * (isCrit ? 1.2 : 1)
        )
    }

    // Расчитывает массово все шансы на попадания, урон, крит удары и шанс наложить эффекты
// Расчитывает массово все шансы на попадания, урон, крит удары и шанс наложить эффекты
// Расчитывает массово все шансы на попадания, урон, крит удары и шанс наложить эффекты
    static getActionData(activeCreature, creatures, actions, distances) {
        const result = {};

        // Предварительные значения атакующего
        const attackerWill = CreatureAPI.getWill(activeCreature);
        const attackerAttack = CreatureAPI.getAttack(activeCreature);
        const attackerHitMod = CreatureAPI.getHitChanceModifier(activeCreature);
        const hasLuck = CreatureAPI.hasEffect(activeCreature, 'luck');

        for (const target of creatures) {
            if (target.id === activeCreature.id) continue;
            result[target.id] = {}

            const defenderWill = CreatureAPI.getWill(target);
            const defenderDefense = CreatureAPI.getDefense(target);

            const distance = distances[target.id].withoutObstacles || 1

            // getPushEffectChance
            const pushEffectChanceMod = (attackerWill - defenderWill) / 100

            for (const action of actions) {
                result[target.id][action.id] = {pushEffectChanceMod}

                if ((action.actionType === 'melee' || action.actionType === 'ranged')
                    && target.direction !== activeCreature.direction) {
                    // Повтор getHitChance
                    let distanceMultiplayer = 1
                    if (action.actionType === 'ranged') {
                        if (distance < action.range * 0.3) {
                            // На ближних дистанциях увеличиваем точность
                            distanceMultiplayer = 1.1
                        } else if (distance > action.range * 0.7) {
                            // На дальних дистанциях снижаем точность до 60% от базовой
                            distanceMultiplayer = 1 - 0.4 * (distance - 0.7 * action.range) / (0.3 * action.range)
                        }
                    }

                    const hitChance = Phaser.Math.Clamp(
                        action.hitChance
                        * attackerHitMod
                        * distanceMultiplayer
                        ,
                        0.05, // всегда есть шанс на поподание
                        0.99 // всегда есть шанс на промах
                    )


                    // ===== Attack Damage
                    // урон рандомный +- 15%
                    let random = 1
                    if (hasLuck) {
                        // Если навык удача, то урон раздоится 1 - 1.15 (0 - +15%)
                        // При этом потенциальный урон вырастает на 7.5%
                        random = 1.075
                    }

                    distanceMultiplayer = 1
                    if (action.actionType === 'ranged') {
                        if (distance > action.range * 0.7) {
                            // На дальних дистанциях снижаем урон до 50% от базовой
                            distanceMultiplayer = 1 - 0.5 * (distance - 0.7 * action.range) / (0.3 * action.range)
                        }
                    }

                    const attackDamage = Math.floor(Math.max(
                        action.baseDamage * 0.3,
                        action.baseDamage
                        * (attackerAttack / defenderDefense)
                        * this.getElementMultiplier(action.element, target.element)
                        * random
                        * distanceMultiplayer
                    ))

                    result[target.id][action.id]['hitChance'] = hitChance
                    result[target.id][action.id]['attackDamage'] = attackDamage
                }
            }
        }

        return result;
    }
}