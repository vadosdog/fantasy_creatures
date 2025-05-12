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
                    effects = [],
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


        // Бафы
        // {type: 'empower', duration: 1},
        // {type: 'haste', duration: 1},
        // {type: 'lifesteal', duration: 1}, //TODO Восстанавливает 30% от нанесённого урона как HP
        // {type: 'luck', duration: 1}, //TODO шанс крита на +15% 
        // {type: 'regeneration', duration: 1},
        // {type: 'thorns', duration: 1}, //TODO Возвращает 20% полученного урона атакующему
        // {type: 'aegis', duration: 1}, //TODO сделать ауру
        //
        // // Дебафы
        // {type: 'poison', duration: 1},
        // {type: 'bleed', duration: 1}, //TODO прекращается при лечении
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
        if (this.hasEffect('curse')) {
            console.log('Effect: Проклятие снижает max HP на 20%')
        }
        return this.maxHealthStat
            * (this.hasEffect('curse') ? 0.8 : 1)
    }

    getSpeed() {
        if (this.hasEffect('haste')) {
            console.log('Effect: Ускорение увеличивает скорость')
        }
        if (this.hasEffect('chill')) {
            console.log('Effect: Холод снижает скорость')
        }
        return this.speedStat
            + (this.hasEffect('haste') ? 2 : 0) // Ускорение
            - (this.hasEffect('сhill') ? 1 : 0)
    }

    getAttack() {
        if (this.hasEffect('empower')) {
            console.log('Effect: Усиление увеличивает атаку')
        }
        if (this.hasEffect('madness')) {
            console.log('Effect: Безумие +30% к атаке')
        }
        if (this.hasEffect('fear')) {
            console.log('Effect: Страх -15% к атаке')
        }
        return this.attackStat
            * (this.hasEffect('empower') ? 1.1 : 1)
            * (this.hasEffect('madness') ? 1.3 : 1)
            * (this.hasEffect('fear') ? 0.85 : 1)
    }

    getDefense() {
        if (this.hasEffect('aegis')) {
            console.log('Effect: Защитная аура увеличивает защиту')
        }
        if (this.hasEffect('burn')) {
            console.log('Effect: Горение ухудшает защиту')
        }
        if (this.hasEffect('madness')) {
            console.log('Effect: Безумие -20% к защите')
        }
        return this.defenseStat
            * (this.hasEffect('aegis') ? 1.1 : 1) //Защитная аура увеличивает защиту на 10%
            * (this.hasEffect('burn') ? 0.85 : 1) //Горение уменьшает защиту на 15%
            * (this.hasEffect('madness') ? 0.8 : 1) //Безумие -20% к защите
    }

    getInitiative() {
        if (this.hasEffect('chill')) {
            console.log('Effect: Холод снижает инициативу')
        }
        return this.initiativeStat
            * (this.hasEffect('сhill') ? 0.8 : 1)
    }

    // Делаем отдельный метод для инициативы атаки, чтобы обыграть слепоту
    getInitiativeToAttack() {
        if (this.hasEffect('blind')) {
            console.log('Effect: Слепота снижает шанс попадания')
        }
        return this.initiativeStat
            * (this.hasEffect('blind') ? 0.75 : 1)
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

    hasEffect(effectType) {
        return this.effects.some(effect => effect.type === effectType)
    }

    pushEffect(effect) {
        let existsEffect
        // Если такой эффект уже есть, то увеличиваем его длительность
        existsEffect = this.effects.find(({type}) => effect.type === type)
        if (existsEffect) {
            existsEffect.duration += effect.duration
            console.log('Увеличен эфaект ' + effect.type + ' на ' + this.name, effect)
            return
        }

        console.log('Наложен эфaект ' + effect.type + ' на ' + this.name, effect)
        // TODO добавить невосприимчивость к некоторым эфектам
        this.effects.push(effect)
    }


    //Применить эффекты в начале раунда
    applyRoundEffects() {
        const maxHealth = this.getMaxHealth()
        const appliedEffects = []
        if (this.hasEffect('regeneration')) {
            appliedEffects.push({
                effect: 'regeneration',
                damage: +0.05 * maxHealth
            })
        }
        if (this.hasEffect('poison')) {
            appliedEffects.push({
                effect: 'poison',
                damage: -0.05 * maxHealth
            })
        }
        if (this.hasEffect('bleed')) {
            appliedEffects.push({
                effect: 'bleed',
                damage: -0.08 * maxHealth
            })
        }
        if (this.hasEffect('burn')) {
            appliedEffects.push({
                effect: 'burn',
                damage: -0.07 * maxHealth
            })
        }
        if (this.hasEffect('madness')) {
            appliedEffects.push({
                effect: 'madness',
                damage: -0.1 * maxHealth
            })
        }

        appliedEffects.forEach(effect => {
            console.log(this.name + ' HP ' + effect.damage + ' (' + effect.effect + ')' + ' осталось еще: ' + effect.duration)
            this.health += (effect.damage)
        })

        this.health = Phaser.Math.Clamp(this.health, 0, maxHealth)

        return appliedEffects
    }

    removeRoundEffects() {
        this.effects.forEach(effect => {
            effect.duration--

            if (effect.duration === 0) {
                console.log(effect.name + ' перестал действовать на ' + this.name)
            }
        })
        this.effects = this.effects.filter(effect => effect.duration > 0)
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