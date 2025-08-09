function newGame() {
  let newGameObj = {
    resources: {
      population: {
        name: "Population",
        max: 0,
        owned: 0,
        military: 0,
        unlocked: true,
        growthProgress: 0,
        consumption: 0.75,
        starvation: 0,
      },
      food: {
        name: "Food",
        max: 100,
        owned: 0,
        unlocked: true,
      },
      wood: {
        name: "Wood",
        max: 100,
        owned: 0,
        unlocked: true,
      },
      stone: {
        name: "Stone",
        max: 100,
        owned: 0,
        unlocked: true,
      },
      iron: {
        name: "Iron",
        max: 100,
        owned: 0,
        unlocked: false,
      },
      brick: {
        name: "Brick",
        max: 100,
        owned: 0,
        unlocked: false,
      },
    },
    zones: {
      theVillages: {
        title: "The Villages",
        buildings: {
          woodHut: {
            name: "Wooden Hut",
            description: "Increases maximum population",
            owned: 0,
            cost: {
              wood: 10,
            },
            multiplier: 1.2,
            effects: {
              populationMax: 3,
            },
            unlocked: false,
            unlocksAt: {
              wood: 5,
            },
          },
          woodHutLg: {
            name: "Large Wooden Hut",
            description: "Increases maximum population more than wooden hut",
            owned: 0,
            cost: {
              wood: 100,
            },
            multiplier: 1.2,
            effects: {
              populationMax: 5,
            },
            unlocked: false,
            unlocksAt: {
              wood: 25,
            },
          },
        },
      },
      theOutpost: {
        title: "The Outpost",
        buildings: {
          barracks: {
            name: "Barracks",
            description:
              "Allows you to recruit soldiers for your military. Each upgrade past the first increases the effectiveness of each soldier.",
            owned: 0,
            cost: {
              wood: 100,
              stone: 100,
            },
            multiplier: 1.5,
            effects: {
              militarySoldierEffectiveness: 1.1,
            },
            unlocked: false,
            unlocksAt: {
              wood: 50,
              stone: 50,
            },
          },
        },
      },
    },
    workers: {
      unemployed: {
        name: "Unemployed",
        owned: 0,
        max: -1,
        unlocked: true,
      },
      farmer: {
        name: "Farmer",
        owned: 0,
        max: -1,
        unlocked: true,
      },
      logger: {
        name: "Logger",
        owned: 0,
        max: -1,
        unlocked: true,
      },
      miner: {
        name: "Miner",
        owned: 0,
        max: -1,
        unlocked: true,
      },
    },
    global: {
      tickDuration: 100,
      lastTick: null,
      totalTime: 0,
      unprocessedTime: 0,
      hireMode: true,
      purchaseAmount: 1,
      defaultJob: "unemployed",
    },
    settings: {
      maxTicks: 1000,
    },
    statistics: {
      period: 10,
      populationRate: 0,
      populationRateData: [],
      foodRate: 0,
      foodRateData: [],
      woodRate: 0,
      woodRateData: [],
      stoneRate: 0,
      stoneRateData: [],
    },
  };

  return newGameObj;
}

function loadGame() {
  //forcing new game each time right now, havent created save. Better get on that, it seems important.
  let gameSave = newGame();
  return gameSave;
}

function saveGame() {
  //much empty
}

function processTick() {
  increasePopulation();
  processFood();
  processWood();
  processStone();
}

function addResource(resource, amount) {
  if (resource === "food") {
    game.resources.food.owned += Math.min(
      amount,
      game.resources.food.max - game.resources.food.owned
    );
  }

  if (resource === "wood") {
    game.resources.wood.owned += Math.min(
      amount,
      game.resources.wood.max - game.resources.wood.owned
    );
  }

  if (resource === "stone") {
    game.resources.stone.owned += Math.min(
      amount,
      game.resources.stone.max - game.resources.stone.owned
    );
  }
}

function gatherResource(resource) {
  let baseAmount = 1;

  addResource(resource, baseAmount);
}

function checkUnlocks() {
  unlockBuildings();
}

function unlockBuildings() {
  // Iterate through all buildings in the game object
  for (const zoneKey in game.zones) {
    const zone = game.zones[zoneKey];
    for (const buildingKey in zone.buildings) {
      const building = zone.buildings[buildingKey];

      // Skip if building is already unlocked
      if (building.unlocked) {
        continue;
      }

      console.log(`Checking building: ${building.name}`);

      // Check if building has unlock requirements
      if (!building.unlocksAt) {
        continue;
      }

      // Check if all unlock requirements are met
      let canUnlock = true;

      for (const resourceType in building.unlocksAt) {
        const requiredAmount = building.unlocksAt[resourceType];
        const currentAmount = game.resources[resourceType]?.owned || 0;

        if (currentAmount < requiredAmount) {
          canUnlock = false;
          break;
        }
      }

      // Unlock the building if all requirements are met
      if (canUnlock) {
        building.unlocked = true;
        let buildingElement = document.getElementById(buildingKey + "Building");
        buildingElement.classList.add("unlocked");
        buildingElement.classList.remove("d-none");
        console.log(`Building "${buildingKey}" has been unlocked!`);
      }
    }
  }
}
function formatNumber(input, place = 2) {
  let notation = "scientific";
  if (input < 1000000000000000) notation = "compact";
  return Intl.NumberFormat("en-US", {
    notation: notation,
    maximumFractionDigits: place,
  }).format(input);
}

function toggleItemDisplay(item) {
  let elements = document.getElementsByClassName(item);
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.toggle("d-none");
  }
}

function toggleTheOuterGates() {
  toggleItemDisplay("theOuterGatesBuilding");
}

function toggleTheVillages() {
  let elements = document.querySelectorAll(".unlocked.theVillagesBuilding");
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.toggle("d-none");
  }
}

function starve() {
  let foodDeficit = Math.abs(game.resources.food.owned);
  let populationStarved = foodDeficit / calculateFoodConsumptionRate() / 2;
  game.resources.population.starvation += populationStarved;
  while (game.resources.population.starvation > 1) {
    //reduce starvation level
    game.resources.population.starvation--;
    //reduce population count
    game.resources.population.owned--;
    //remove worker, priority level for removal is unemployed -> miner -> logger -> farmer
    game.workers.unemployed.owned > 0
      ? game.workers.unemployed.owned--
      : game.workers.miner.owned > 0
      ? game.workers.miner.owned--
      : game.workers.logger.owned > 0
      ? game.workers.logger.owned--
      : game.workers.farmer.owned--;
    console.log("A worker starved to death.");
  }
}

function calculateFoodConsumptionRate() {
  let baseConsumption = game.resources.population.consumption;

  return baseConsumption;
}

function processFood(returnForDisplay) {
  //TODO - update food consumed formula to account for upgrades
  //farmers generate food
  let totalPopulation = game.resources.population.owned;
  let totalUnemployed = game.workers.unemployed.owned;
  let totalWorkingPopulation = totalPopulation - totalUnemployed;

  let farmers = game.workers.farmer.owned;
  let baseConsumption = game.resources.population.consumption;
  let foodConsumed =
    (totalWorkingPopulation * baseConsumption +
      (totalUnemployed * baseConsumption) / 2) *
    (game.global.tickDuration / 1000);
  let foodProduced = farmers * (game.global.tickDuration / 1000);
  let result = foodProduced - foodConsumed;
  if (returnForDisplay) return result;

  if (result >= 0) game.resources.population.starvation = 0;

  addResource("food", result);
  pushStatisicsData("foodRate", result);
  if (game.resources.food.owned < 0) {
    starve();
    game.resources.food.owned = 0;
  }
}

function processWood(returnForDisplay) {
  let loggers = game.workers.logger.owned;
  let woodConsumed = 0;
  let woodProduced = loggers * (game.global.tickDuration / 1000);
  let result = woodProduced - woodConsumed;
  if (returnForDisplay) return result;

  addResource("wood", result);
  pushStatisicsData("woodRate", result);
}

function processStone(returnForDisplay) {
  let miners = game.workers.miner.owned;
  let stoneConsumed = 0;
  let stoneProduced = miners * (game.global.tickDuration / 1000);
  let result = stoneProduced - stoneConsumed;
  if (returnForDisplay) return result;

  addResource("stone", result);
  pushStatisicsData("stoneRate", result);
}

function getPopulationGrowthRate() {
  //TODO - growth rate currently hardcoded, update it to actually calculate and be able to be upgraded.
  return 0.01;
}

function calculatePopulationGrowth() {
  let delta =
    getPopulationGrowthRate() *
    game.resources.population.owned *
    (1 - game.resources.population.owned / game.resources.population.max) *
    1;
  return game.resources.population.owned == game.resources.population.max
    ? 0
    : isNaN(delta)
    ? 0
    : game.resources.population.owned == 0
    ? getPopulationGrowthRate()
    : delta;
}

function increasePopulation() {
  let growth = Math.trunc(calculatePopulationGrowth() * 1000) / 1000;
  if (growth == 0) return;

  game.resources.population.growthProgress += growth;

  while (game.resources.population.growthProgress > 1) {
    game.resources.population.growthProgress--;
    if (game.resources.population.owned < game.resources.population.max) {
      game.resources.population.owned++;
      game.workers[game.global.defaultJob].owned++;
    }
  }
}

function renderGame() {
  checkUnlocks();
  renderResources();
  renderWorkers();
  renderBuildings();
  renderStatistics();
}

function renderResources() {
  //get population display elements
  let populationOwnedElement = document.getElementById("populationOwned");
  let populationMaxElement = document.getElementById("populationMax");
  //get food display elements
  let foodOwnedElement = document.getElementById("foodOwned");
  let foodMaxElement = document.getElementById("foodMax");
  let foodRateElement = document.getElementById("foodRate");
  //get wood display elements
  let woodOwnedElement = document.getElementById("woodOwned");
  let woodMaxElement = document.getElementById("woodMax");
  let woodRateElement = document.getElementById("woodRate");
  //get stone display elements
  let stoneOwnedElement = document.getElementById("stoneOwned");
  let stoneMaxElement = document.getElementById("stoneMax");
  let stoneRateElement = document.getElementById("stoneRate");

  //update their text to the amount of resources owned or max
  populationOwnedElement.innerText = formatNumber(
    game.resources.population.owned
  );
  populationMaxElement.innerText = formatNumber(
    game.resources.population.max,
    0
  );
  foodOwnedElement.innerText = formatNumber(game.resources.food.owned, 0);
  foodMaxElement.innerText = formatNumber(game.resources.food.max, 0);
  foodRateElement.innerText = formatNumber(0);
  woodOwnedElement.innerText = formatNumber(game.resources.wood.owned, 0);
  woodMaxElement.innerText = formatNumber(game.resources.wood.max, 0);
  stoneOwnedElement.innerText = formatNumber(game.resources.stone.owned, 0);
  stoneMaxElement.innerText = formatNumber(game.resources.stone.max, 0);
}

function renderWorkers() {
  let unemployedElement = document.getElementById("unemployedOwned");
  let farmerElement = document.getElementById("farmerOwned");
  let loggerElement = document.getElementById("loggerOwned");
  let minerElement = document.getElementById("minerOwned");

  unemployedElement.innerText = formatNumber(game.workers.unemployed.owned);
  farmerElement.innerText = formatNumber(game.workers.farmer.owned);
  loggerElement.innerText = formatNumber(game.workers.logger.owned);
  minerElement.innerText = formatNumber(game.workers.miner.owned);
}

function renderStatistics() {
  let foodRateElement = document.getElementById("foodRate");
  let woodRateElement = document.getElementById("woodRate");
  let stoneRateElement = document.getElementById("stoneRate");

  foodRateElement.innerText = formatNumber(game.statistics.foodRate);
  woodRateElement.innerText = formatNumber(game.statistics.woodRate);
  stoneRateElement.innerText = formatNumber(game.statistics.stoneRate);
}

function renderBuildings() {
  Object.entries(game.zones).forEach(([zoneKey, zoneValue]) => {
    let zone = zoneValue;
    Object.entries(zone.buildings).forEach(([buildingKey, buildingValue]) => {
      let element = document.getElementById(buildingKey + "Building");
      let quantityElement = document.getElementById(
        buildingKey + "BuildingQuantity"
      );
      if (buildingValue.unlocked) {
        quantityElement.innerText = formatNumber(
          zone.buildings[buildingKey].owned
        );
        if (
          !canAffordBuilding(zoneKey, buildingKey, game.global.purchaseAmount)
        ) {
          element.querySelector("div").classList.add("not-affordable");
        } else {
          element.querySelector("div").classList.remove("not-affordable");
        }
      }
    });
  });
}

function initializeOnClickFunctions() {}

//returns cost object with a key:value for each resource totaled
function getBuildingCost(zone, building, amount) {
  if (!game.zones[zone].buildings.hasOwnProperty(building)) {
    console.log(`Invalid building: ${building}`);
    return undefined;
  }
  let buildingInfo = game.zones[zone].buildings[building];
  let currentLevel = game.zones[zone].buildings[building].owned;
  let newLevel = currentLevel + amount;
  let cost = {};
  Object.entries(buildingInfo.cost).forEach(([key, value]) => {
    cost[key] = Math.floor(
      (buildingInfo.cost[key] *
        (Math.pow(buildingInfo.multiplier, newLevel) -
          Math.pow(buildingInfo.multiplier, currentLevel))) /
        (buildingInfo.multiplier - 1)
    );
  });
  return cost;
}
//takes in building string and amount to check if you can afford to purchase that many
function canAffordBuilding(zone, building, amount) {
  let cost = getBuildingCost(zone, building, amount);
  if (cost === undefined) {
    return false;
  }
  let canAfford = true;
  Object.entries(cost).forEach(([key, value]) => {
    if (game.resources[key].owned < value) {
      canAfford = false;
    }
  });
  return canAfford;
}

//checks if you can afford, and if so, purchases the buildings
function purchaseBuilding(zone, building, amount) {
  if (canAffordBuilding(zone, building, amount)) {
    let cost = getBuildingCost(zone, building, amount);
    Object.entries(cost).forEach(([key, value]) => {
      game.resources[key].owned -= value;
    });
    game.zones[zone].buildings[building].owned += amount;

    if (
      game.zones[zone].buildings[building].effects.hasOwnProperty(
        "populationMax"
      )
    )
      calculatePopulationMax();

    if (game.zones[zone].buildings[building].effects.hasOwnProperty("ad"))
      return;
  }
}

function calculatePopulationMax() {
  let basePopulationMax = 0;
  for (const zone in game.zones) {
    let buildings = game.zones[zone].buildings;
    console.log(`buildings: ${buildings}`);
    for (const building in buildings) {
      let effects = buildings[building].effects;
      for (const effect in effects) {
        if (effect == "populationMax") {
          basePopulationMax += effects[effect] * buildings[building].owned;
        }
      }
    }
  }
  console.log(basePopulationMax);
  game.resources.population.max = basePopulationMax;
}

function clickPurchaseBuilding(zone, building) {
  let amount = game.global.purchaseAmount;
  purchaseBuilding(zone, building, amount);
}

function hireWorker(job) {
  if (game.workers.unemployed.owned > 0) {
    if (
      game.workers[job].owned < game.workers[job].max ||
      game.workers[job].max == -1
    ) {
      game.workers.unemployed.owned--;
      game.workers[job].owned++;
    }
  }
}

function fireWorker(job) {
  if (game.workers[job].owned > 0) {
    game.workers[job].owned--;
    game.workers.unemployed.owned++;
  }
}

function pushStatisicsData(stat, data) {
  if (stat === "foodRate") {
    game.statistics.foodRateData.push(data);
    if (game.statistics.foodRateData.length > game.statistics.period * 10)
      game.statistics.foodRateData.shift();

    return;
  }

  if (stat === "woodRate") {
    game.statistics.woodRateData.push(data);
    if (game.statistics.woodRateData.length > game.statistics.period * 10)
      game.statistics.woodRateData.shift();

    return;
  }

  if (stat === "stoneRate") {
    game.statistics.stoneRateData.push(data);
    if (game.statistics.stoneRateData.length > game.statistics.period * 10)
      game.statistics.stoneRateData.shift();

    return;
  }
}

function updateStatistics() {
  let foodRateData = game.statistics.foodRateData;
  let woodRateData = game.statistics.woodRateData;
  let stoneRateData = game.statistics.stoneRateData;

  let foodRateSum = 0;
  let woodRateSum = 0;
  let stoneRateSum = 0;

  for (let i = 0; i < foodRateData.length; i++) {
    foodRateSum += foodRateData[i];
  }

  for (let i = 0; i < woodRateData.length; i++) {
    woodRateSum += woodRateData[i];
  }

  for (let i = 0; i < stoneRateData.length; i++) {
    stoneRateSum += stoneRateData[i];
  }

  game.statistics.foodRate = foodRateSum / game.statistics.period;
  game.statistics.woodRate = woodRateSum / game.statistics.period;
  game.statistics.stoneRate = stoneRateSum / game.statistics.period;
}

function gameLoop(currentTime) {
  //if this is the first time last tick has been used (new game) set it
  if (game.global.lastTick === null) game.global.lastTick = currentTime;

  const delta = currentTime - game.global.lastTick;
  let ticksProcessed = 0;

  game.global.totalTime += delta;
  game.global.unprocessedTime += delta;
  game.global.lastTick = currentTime;

  while (
    game.global.unprocessedTime >= game.global.tickDuration &&
    ticksProcessed < game.settings.maxTicks
  ) {
    game.global.unprocessedTime -= game.global.tickDuration;
    ticksProcessed++;
    processTick();
  }

  renderGame();
  requestAnimationFrame(gameLoop);
}

function initDOM() {
  initBuildingDOM();
  initResourceDOM();
  initWorkerDOM();
}

let game = loadGame();
document.body.onload = initDOM();

requestAnimationFrame(gameLoop);

setInterval(updateStatistics, 1000);

var popoverTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="popover"]')
);
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl);
});

function initBuildingDOM() {
  for (const zone in game.zones) {
    let buildings = game.zones[zone].buildings;
    let divZoneHeaderElement = document.createElement("div");
    let divZoneHeaderElementInner = document.createElement("div");
    let spanZoneHeaderElement = document.createElement("span");
    let targetElement = document.querySelector("#" + zone + "Zone");

    divZoneHeaderElement.classList.add("col-12");
    divZoneHeaderElementInner.classList.add(
      "area-header",
      "text-center",
      "text-bold"
    );
    divZoneHeaderElement.appendChild(divZoneHeaderElementInner);
    divZoneHeaderElementInner.appendChild(spanZoneHeaderElement);
    spanZoneHeaderElement.innerText = game.zones[zone].title;
    targetElement.appendChild(divZoneHeaderElement);

    for (const building in buildings) {
      let divBuildingColumnElement = document.createElement("div");
      let divBuildingButtonElement = document.createElement("div");
      let divBuildingNameElement = document.createElement("div");
      let divBuildingQuantityElement = document.createElement("div");
      let spanBuildingQuantityElement = document.createElement("span");

      divBuildingColumnElement.appendChild(divBuildingButtonElement);
      divBuildingButtonElement.appendChild(divBuildingNameElement);
      divBuildingButtonElement.appendChild(divBuildingQuantityElement);
      divBuildingQuantityElement.appendChild(spanBuildingQuantityElement);

      divBuildingColumnElement.classList.add(
        "col-6",
        "col-md-3",
        "text-center",
        "noselect",
        "d-none",
        "theVillagesBuilding"
      );

      divBuildingColumnElement.id = building + "Building";
      divBuildingColumnElement.title =
        game.zones[zone].buildings[building].name;
      divBuildingColumnElement.setAttribute("data-bs-toggle", "popover");
      divBuildingColumnElement.setAttribute("data-bs-trigger", "hover");
      divBuildingColumnElement.setAttribute(
        "data-bs-content",
        game.zones[zone].buildings[building].description
      );
      divBuildingButtonElement.classList.add(
        "button",
        "py-2",
        "pointer",
        "h-100"
      );
      divBuildingButtonElement.id = building + "Button";
      divBuildingButtonElement.addEventListener("click", function () {
        clickPurchaseBuilding(zone, building);
      });
      divBuildingNameElement.innerText =
        game.zones[zone].buildings[building].name;
      divBuildingQuantityElement.innerText = 0;
      divBuildingQuantityElement.id = building + "BuildingQuantity";
      targetElement.appendChild(divBuildingColumnElement);
    }
  }
}

function initResourceDOM() {
  for (const resource in game.resources) {
    let trResourceTableRow = document.createElement("tr");
    let tdResourceTableDataName = document.createElement("td");
    let tdResourceTableDataOwned = document.createElement("td");
    let tdResourceTableDataMax = document.createElement("td");
    let tdResourceTableDataRate = document.createElement("td");
    let targetElement = document.querySelector("#resourceTableBody");

    if (!game.resources[resource].unlocked)
      trResourceTableRow.classList.add("d-none");
    trResourceTableRow.appendChild(tdResourceTableDataName);
    trResourceTableRow.appendChild(tdResourceTableDataOwned);
    trResourceTableRow.appendChild(tdResourceTableDataMax);
    trResourceTableRow.appendChild(tdResourceTableDataRate);

    tdResourceTableDataName.innerText = game.resources[resource].name;
    tdResourceTableDataOwned.id = resource + "Owned";
    tdResourceTableDataOwned.innerText = game.resources[resource].owned;
    tdResourceTableDataMax.id = resource + "Max";
    tdResourceTableDataMax.innerText = game.resources[resource].max;
    tdResourceTableDataRate.id = resource + "Rate";
    tdResourceTableDataRate.innerText = 0;

    targetElement.appendChild(trResourceTableRow);
  }
}

function initWorkerDOM() {
  for (const worker in game.workers) {
    let trWorkerTableRow = document.createElement("tr");
    let tdWorkerTableDataName = document.createElement("td");
    let tdWorkerTableDataFireButton = document.createElement("td");
    let tdWorkerTableDataOwned = document.createElement("td");
    let tdWorkerTableDataHireButton = document.createElement("td");
    let buttonWorkerFireButton = document.createElement("button");
    let buttonWorkerHireButton = document.createElement("button");
    let targetElement = document.querySelector("#workerTableBody");

    trWorkerTableRow.appendChild(tdWorkerTableDataName);
    trWorkerTableRow.appendChild(tdWorkerTableDataFireButton);
    trWorkerTableRow.appendChild(tdWorkerTableDataOwned);
    trWorkerTableRow.appendChild(tdWorkerTableDataHireButton);
    tdWorkerTableDataFireButton.appendChild(buttonWorkerFireButton);
    tdWorkerTableDataHireButton.appendChild(buttonWorkerHireButton);
    tdWorkerTableDataOwned.id = worker + "Owned";

    tdWorkerTableDataName.innerText = game.workers[worker].name;
    tdWorkerTableDataOwned.innerText = 0;
    buttonWorkerFireButton.innerText = "<";
    buttonWorkerHireButton.innerText = ">";
    buttonWorkerFireButton.addEventListener("click", function () {
      fireWorker(worker);
    });
    buttonWorkerHireButton.addEventListener("click", function () {
      hireWorker(worker);
    });

    targetElement.appendChild(trWorkerTableRow);
    if (worker == "unemployed") {
      tdWorkerTableDataFireButton.removeChild(buttonWorkerFireButton);
      tdWorkerTableDataHireButton.removeChild(buttonWorkerHireButton);
    }
  }
}
