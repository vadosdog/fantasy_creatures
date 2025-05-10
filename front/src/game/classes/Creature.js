export class Creature {
    constructor({
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
                    form, // Форма
                    mass, // Массивность
                    element,

                    actions,
                }) {

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
        this.form = form; // Форма
        this.mass = mass; // Массивность
        this.element = element; // Массивность

        this.actions = actions;

        this.effects = [] // бафы и дебафы
    }

    getControl() {
        return this.control
    }

    getMaxHealth() {
        return this.maxHealthStat
    }

    getSpeed() {
        return this.speedStat
    }

    getAttack() {
        return this.attackStat
    }

    getDefense() {
        return this.defenseStat
    }

    getInitiative() {
        return this.initiativeStat
    }

    getWill() {
        return this.willStat
    }

    getForm() {
        return this.form
    }

    getMass() {
        return this.mass
    }

    getActions() {
        return this.actions
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