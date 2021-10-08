import {Hero, Spells} from './Hero.js'
import {shuffle} from './helpers.js'
import * as fs from 'fs'

function select(hero1, hero2, probability) {
  const rotDur1 = hero1.attack(hero2.hpAmount)
  const rotDur2 = hero2.attack(hero1.hpAmount)
  if (rotDur1 > rotDur2 && Math.random() < probability) {
    hero2.hpAmount = hero1.hpAmount
    hero2.manaAmount = hero1.manaAmount
    hero2.staminaAmount = hero1.staminaAmount
    hero2.criticalChance = hero1.criticalChance
    hero2.criticalMultiplier = hero1.criticalMultiplier
    hero2.rotation = hero1.rotation
  } else {
    hero1.hpAmount = hero2.hpAmount
    hero1.manaAmount = hero2.manaAmount
    hero1.staminaAmount = hero2.staminaAmount
    hero1.criticalChance = hero2.criticalChance
    hero1.criticalMultiplier = hero2.criticalMultiplier
    hero1.rotation = hero2.rotation
  }
}

function mutate(hero, probability) {
  if (Math.random() < probability) {
    hero.hpAmount += Math.random() * 20 - 10
    hero.hpAmount = hero.hpAmount > 1000 ? 1000 : hero.hpAmount
  }
  if (Math.random() < probability) {
    hero.manaAmount += Math.random() * 5 - 2.5
  }
  if (Math.random() < probability) {
    hero.staminaAmount += Math.random() * 5 - 2.5
  }
  if (Math.random() < probability) {
    hero.criticalChance += Math.random() * 0.1 - 0.05
    hero.criticalChance = hero.criticalChance >= 1 ? 1 : hero.criticalChance
  }
  if (Math.random() < probability) {
    hero.criticalMultiplier += Math.random() * 0.3 - 0.15
    hero.criticalMultiplier = hero.criticalMultiplier >= 3 ? 3 : hero.criticalMultiplier
    hero.criticalMultiplier = hero.criticalMultiplier < 1 ? 1 : hero.criticalMultiplier
  }
  for (let i = 0; i < hero.rotation.length; i++) {
    if (Math.random() < probability) {
      hero.rotation[i] = [...Spells.keys()][Math.floor(Math.random() * Spells.size)]
    }
  }
}

function cross(hero1, hero2, probability) {
  if (Math.random() < probability) {
    const tmp = hero1.hpAmount
    hero1.hpAmount = hero2.hpAmount
    hero2.hpAmount = tmp
  }
  if (Math.random() < probability) {
    const tmp = hero1.manaAmount
    hero1.manaAmount = hero2.manaAmount
    hero2.manaAmount = tmp
  }
  if (Math.random() < probability) {
    const tmp = hero1.staminaAmount
    hero1.staminaAmount = hero2.staminaAmount
    hero2.staminaAmount = tmp
  }
  if (Math.random() < probability) {
    const tmp = hero1.criticalChance
    hero1.criticalChance = hero2.criticalChance
    hero2.criticalChance = tmp
  }
  if (Math.random() < probability) {
    const tmp = hero1.criticalMultiplier
    hero1.criticalMultiplier = hero2.criticalMultiplier
    hero2.criticalMultiplier = tmp
  }
  for (let i = 0; i < hero1.rotation.length; i++) {
    if (Math.random() < probability) {
      const tmp = hero1.rotation[i]
      hero1.rotation[i] = hero2.rotation[i]
      hero2.rotation[i] = tmp
    }
  }
}

function createPopulation(amount = 100, spellCount = 4) {
  const heroList = []
  for (let i = 0; i < amount; i++) {
    heroList.push(new Hero(spellCount))
  }
  return heroList
}

function selection(population, probability) {
  shuffle(population)
  for (let i = 1; i < population.length; i += 2) {
    select(population[i - 1], population[i], probability)
  }
}

function crossover(population, probability) {
  shuffle(population)
  for (let i = 1; i < population.length; i += 2) {
    cross(population[i - 1], population[i], probability)
  }
}

function mutation(population, probability) {
  for (const hero of population) {
    mutate(hero, probability)
  }
}

function calcAverageDps(population) {
  let score = 0
  for (const hero of population) {
    score += hero.getDps()
  }
  return score / population.length
}

function calcAverageCharacteristic(population, characteristicName) {
  let score = 0
  for (const hero of population) {
    score += hero[characteristicName]
  }
  return score / population.length
}

function getMostPopularRotation(population) {
  const res = new Map()
  for (const hero of population) {
    const rotationString = hero.rotation.toString()
    if (res.has(rotationString)) {
      res.set(rotationString, res.get(rotationString) + 1)
    } else {
      res.set(rotationString, 1)
    }
  }
  let mostPopular = ''
  let mostPopularCount = 0
  for (const rot of res.keys()) {
    if (res.get(rot) > mostPopularCount) {
      mostPopularCount = res.get(rot)
      mostPopular = rot
    }
  }
  return {
    mostPopularRotation: mostPopular,
    popularity: mostPopularCount
  }
}

const generations = 1000
const populationSize = 1000
const rotCount = 6
const population = createPopulation(populationSize, rotCount)

const avgDps = []
const avgHp = []
const avgMana = []
const avgStamina = []
const avgCC = []
const avgCM = []
let mostPopularRotation = []
let rotationPopularity = 0

function printMetrics() {
  let data = `avgDps=[${avgDps}]
  \navgHp=[${avgHp}]
  \navgMana=[${avgMana}]
  \navgStamina=[${avgStamina}]
  \navgCC=[${avgCC}]
  \navgCM=[${avgCM}]
  \nmostPopularRotation=${JSON.stringify(mostPopularRotation)}
  \nrotationPopularity=${rotationPopularity}
  `
  fs.writeFileSync('./data.py', data)
}

for (let i = 0; i < generations; i++) {
  avgDps.push(calcAverageDps(population))
  avgHp.push(calcAverageCharacteristic(population, 'hpAmount'))
  avgMana.push(calcAverageCharacteristic(population, 'manaAmount'))
  avgStamina.push(calcAverageCharacteristic(population, 'staminaAmount'))
  avgCC.push(calcAverageCharacteristic(population, 'criticalChance'))
  avgCM.push(calcAverageCharacteristic(population, 'criticalMultiplier'))
  console.log(i, '/', generations)
  mutation(population, 0.5)
  crossover(population, 0.5)
  selection(population, 1)
}
const tmp = getMostPopularRotation(population)
mostPopularRotation = tmp.mostPopularRotation
rotationPopularity = tmp.popularity
printMetrics()
