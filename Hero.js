class Spell {
  manaCost
  staminaCost
  damage
  castDuration

  constructor(manaCost, staminaCost, damage, castDuration) {
    this.manaCost = manaCost
    this.staminaCost = staminaCost
    this.damage = damage
    this.castDuration = castDuration
  }

  cast({mana, stamina}, criticalChance, criticalMultiplier) {
    let damage = 0
    let castDuration = 0
    let manaCost = 0
    let staminaCost = 0
    if (this.manaCost > 0 && mana > this.manaCost) {
      manaCost = this.manaCost
      damage = this.damage
      castDuration = this.castDuration
    }
    if (this.staminaCost > 0 && stamina > this.staminaCost) {
      staminaCost = this.staminaCost
      damage = this.damage
      castDuration = this.castDuration
    }
    if (Math.random() < criticalChance) {
      damage *= criticalMultiplier
      manaCost *= criticalMultiplier
      staminaCost *= criticalMultiplier
    }
    mana -= manaCost
    stamina -= staminaCost
    return {
      mana,
      stamina,
      damage,
      castDuration
    }
  }
}

export const Spells = new Map([
  ['fireball', new Spell(30, 0, 90, 6)],
  ['frostBolt', new Spell(15, 0, 40, 3)],
  ['smash', new Spell(0, 10, 60, 2)],
  ['charge', new Spell(0, 5, 20, 1)],
  ['strike', new Spell(0, 10, 30, 2)],
  ['cripplingStrike', new Spell(0, 50, 100, 6)],
])

export class Hero {
  hpAmount
  manaAmount
  staminaAmount
  criticalChance
  criticalMultiplier

  rotation = []

  setRotation(rotationSize) {
    for (let i = 0; i < rotationSize; i++) {
      const randomSpellName = [...Spells.keys()][Math.floor(Math.random() * Spells.size)]
      this.rotation.push(randomSpellName)
    }

  }

  constructor(rotationSize = 4) {
    this.hpAmount = Math.random() * 1000 + 400
    this.manaAmount = Math.random() * 150 + 50
    this.staminaAmount = Math.random() * 150 + 50
    this.criticalChance = Math.random()
    this.criticalMultiplier = Math.random() * 2 + 1
    this.setRotation(rotationSize)
  }

  attack(maxDamage) {
    let currentDamage = 0
    let currentRotationDuration = 0
    const resources = {
      mana: this.manaAmount,
      stamina: this.staminaAmount
    }
    while (true) {
      for (let i = 0; i < this.rotation.length; i++) {
        let spellName = this.rotation[i]
        const spell = Spells.get(spellName)
        const attackResult = spell.cast(resources, this.criticalChance, this.criticalMultiplier)

        resources.mana = attackResult.mana
        resources.stamina = attackResult.stamina

        currentDamage += attackResult.damage
        currentRotationDuration += attackResult.castDuration

        if (currentDamage >= maxDamage) {
          return currentRotationDuration
        }

        if (attackResult.damage === 0) {
          return 2107364012634
        }
      }
    }
  }

  getDps() {
    let duration = 0
    let totalDamage = 0
    const resources = {
      mana: this.manaAmount,
      stamina: this.staminaAmount
    }
    while (true) {
      const prevDamage = totalDamage
      for (let i = 0; i < this.rotation.length; i++) {
        let spellName = this.rotation[i]
        const spell = Spells.get(spellName)
        const attackResult = spell.cast(resources)

        resources.mana = attackResult.mana
        resources.stamina = attackResult.stamina
        let dmg = attackResult.damage
        if (Math.random() < this.criticalChance) {
          dmg *= this.criticalMultiplier
        }
        duration += attackResult.castDuration
        totalDamage += attackResult.damage
      }
      if (prevDamage === totalDamage) {
        return totalDamage / duration
      }
    }
  }
}

