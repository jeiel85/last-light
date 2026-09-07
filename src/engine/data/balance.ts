/**
 * Every tuning constant in one file.
 *
 * These numbers were set from `npm run simulate` output rather than guessed: the headless
 * agent plays hundreds of runs per configuration and `sim/report.ts` flags starvation
 * spirals, runaway stockpiles, and unused content. Comments record the intent behind each
 * band so future tuning does not undo a deliberate decision.
 */

export const BALANCE = {
  /** Daily per-survivor needs before any modifiers. */
  needs: {
    foodPerSurvivor: 1.0,
    waterPerSurvivor: 1.0,
    /** Hunger rises this much per day when unfed; falls when fed. */
    hungerPerDay: 26,
    hungerRecoveryPerMeal: 42,
    /** Fatigue accumulated by a full day of facility work. */
    fatigueFromWork: 14,
    fatigueFromIdle: 3,
    fatigueFromExpedition: 20,
    fatigueRecoveryResting: 45,
    fatigueRecoveryBunks: [0, 18, 26, 34],
    /** Morale drift toward the base morale each night. */
    moraleDriftRate: 0.16,
    /** Hunger above this drains morale. */
    hungerMoraleThreshold: 55,
    hungerMoralePenalty: 6,
    /** Hunger above this drains health. */
    hungerHealthThreshold: 82,
    hungerHealthPenalty: 7,
    thirstHealthPenalty: 11,
    /** Fatigue above this reduces work output. */
    fatigueWorkThreshold: 50,
    fatigueInjuryThreshold: 78,
    /** Health below this prevents work. */
    incapacitatedBelow: 28,
    healthRegenPerDay: 3.5,
    healthRegenInfirmaryBonus: 3.0,
    moraleRefusalBelow: 22,
  },

  /** Work efficiency curve endpoints. Each factor is multiplicative. */
  efficiency: {
    skillMin: 0.55,
    skillMax: 1.6,
    healthMin: 0.4,
    healthMax: 1.0,
    fatigueMin: 0.55,
    fatigueMax: 1.05,
    moraleMin: 0.75,
    moraleMax: 1.15,
    facilityLevel: [1.0, 1.35, 1.75],
    brownoutFactor: 0.35,
    conditionPenaltyCap: 0.6,
    relationshipMin: 0.8,
    relationshipMax: 1.15,
  },

  /**
   * Construction labour.
   *
   * Survivors left idle are the construction crew and contribute the full rate. Survivors
   * on a facility shift still pitch in around their duties at `perAssignedDay`, which is
   * what stops a fully-staffed vault from being unable to build anything at all — a trap
   * the headless simulator walked straight into during the first balance pass.
   */
  labour: {
    perSurvivorDay: 10,
    perAssignedDay: 3.5,
    engineeringWeight: 0.55,
  },

  power: {
    /** Reactor stub output per level before staffing. */
    reactorOutput: [0, 21, 31, 43],
    /** Fuel burned per day per reactor level. */
    reactorFuel: [0, 1.1, 1.6, 2.1],
    /** Power carried over with Battery Bank research. */
    batteryCarry: 12,
    /** Morale penalty applied per day when facilities are browned out. */
    brownoutMorale: 4,
    brownoutHope: 2,
  },

  resources: {
    baseCaps: {
      food: 60,
      water: 60,
      power: 40,
      medicine: 30,
      components: 80,
      fuel: 45,
      ammo: 60,
      hope: 100,
    },
    /** Storage facility cap bonus per level. */
    storageCapBonus: [0, 40, 80, 130],
    /** Fraction of food lost per day without cold storage. */
    spoilageRate: 0.05,
    spoilageWithGalley: 0.025,
    spoilageWithColdCellar: 0,
    /** Hope drift toward the average survivor morale. */
    hopeDriftRate: 0.2,
    startingHope: 62,
  },

  facilities: {
    /** Condition below which breakdown rolls begin. */
    breakdownThreshold: 42,
    breakdownChanceAtZero: 0.34,
    repairPerLabour: 2.4,
    /** Extra decay per day when the facility is browned out. */
    brownoutDecay: 1.6,
    /** Components refunded when demolishing, as a fraction of build cost. */
    demolishRefund: 0.5,
  },

  research: {
    /**
     * Insight per day from a laboratory staffer at skill 5, level 1.
     *
     * Tuned up from 5.5 after the simulator reported 22 of 38 nodes never completed in 200
     * runs: at the old rate a 45-day run afforded barely a quarter of the tree, which made
     * research feel like a tax rather than a set of choices. A focused run should now finish
     * a branch and a half — enough to matter, far short of everything.
     */
    insightPerStaff: 7.2,
    /** Insight generated with no laboratory at all (thinking hard about it). */
    baselineInsight: 1.4,
    /** Multiplier per laboratory level. */
    labLevelBonus: [0, 1, 1.7, 2.4] as const,
  },

  world: {
    ringCounts: [6, 9, 7] as const,
    ringDistanceKm: [
      [0.4, 2.0],
      [2.2, 8.0],
      [8.5, 24.0],
    ] as const,
    travelDaysByRing: [0, 1, 2] as const,
    /**
      * Global multiplier on every loot roll. An expedition has to be worth the rations it
      * consumes and the injury risk it carries; at 1.0 it was not, and the simulator starved
      * every crew by day 12 regardless of play. Tuned so a three-person day trip to a Ring 0
      * site returns roughly four days of food for a crew of five.
      */
    lootScale: 1.5,
    /** Richness lost per visit. */
    depletionPerVisit: 0.2,
    /** Richness regained per day for unvisited sites. */
    regenPerDay: 0.02,
    /** Danger drift when a site is repeatedly raided. */
    dangerPerVisit: 0.35,
  },

  expedition: {
    basePackCapacity: 10,
    perMemberCapacity: 7,
    rationsPerMemberPerDay: 1,
    waterPerMemberPerDay: 1,
    /** Beats generated per expedition, by ring. */
    beatsByRing: [3, 4, 5] as const,
    /** Base injury chance per beat at danger 5. */
    injuryBase: 0.13,
    dangerInjuryScale: 0.028,
    /** Fraction of injuries that become life-threatening. */
    lethalFraction: 0.16,
    /** Wounded survivors can die; healthy ones cannot die from a single beat. */
    deathHealthCeiling: 55,
    fatigueRiskScale: 0.0016,
    retreatRelief: 0.55,
  },

  combat: {
    baseThreatAtDanger1: 4,
    threatPerDanger: 2.9,
    nightMultiplier: 1.18,
    /** Variance added to the margin, as ±this fraction of threat. */
    variance: 0.3,
    /** Margin bands, ascending. */
    bands: [
      { min: -999, outcome: 'disaster' },
      { min: -8, outcome: 'repulsed' },
      { min: -2, outcome: 'costly' },
      { min: 5, outcome: 'clean' },
      { min: 14, outcome: 'rout' },
    ] as const,
    /** Weapon skill scaling. */
    skillWeight: 1.15,
    armourWeight: 1.0,
    ammoBonusPerRound: 0.9,
  },

  events: {
    /** Events fired per dusk, by day band. */
    countByDay: [
      { min: 1, count: 1 },
      { min: 4, count: 1 },
      { min: 7, count: 2 },
      { min: 16, count: 2 },
      { min: 26, count: 3 },
    ] as const,
    /** Chance the second/third slot is skipped when nothing pressing applies. */
    quietChance: 0.22,
    defaultCooldown: 9,
    /** Weight bonus applied when a pressure signal matches. */
    pressureMatchFactor: 3.2,
  },

  relationships: {
    /** Drift per day for survivors sharing a facility. */
    coworkerDrift: 2.4,
    /** Drift per day for survivors sharing an expedition. */
    expeditionDrift: 4.0,
    bunkDrift: 1.0,
    /** Decay toward zero per day for pairs with no interaction. */
    decayRate: 0.35,
    hatredWorkPenalty: 0.8,
    hatredFightChance: 0.08,
    devotionInterposeChance: 0.55,
    grievingDays: 4,
    grievingMoralePenalty: 20,
    buckets: [
      { min: -100, bucket: 'hatred' },
      { min: -60, bucket: 'resentment' },
      { min: -25, bucket: 'rivalry' },
      { min: 0, bucket: 'acquaintance' },
      { min: 25, bucket: 'trust' },
      { min: 60, bucket: 'friendship' },
      { min: 85, bucket: 'devotion' },
    ] as const,
  },

  survivorGen: {
    ageRange: [17, 68] as const,
    /** Trait budget: positives cost, negatives refund. */
    traitBudget: 3,
    minTraits: 2,
    maxTraits: 4,
    /** Primary skill from occupation. */
    primarySkillRange: [4, 8] as const,
    secondarySkillRange: [2, 5] as const,
    otherSkillRange: [0, 3] as const,
    startingHealth: [78, 100] as const,
    startingMorale: [52, 78] as const,
  },

  endings: {
    /**
     * Days of self-sufficiency required for Deep Root.
     *
     * Lowered from 10 with the streak decay softened alongside it: at the old numbers a
     * single bad weather roll cost three days of progress, and the simulator showed most
     * stable vaults simply never resolving — a run that plateaus and never ends is the
     * worst outcome a roguelite can produce.
     */
    deepRootDays: 7,
    /** How much a non-self-sufficient day takes off the Deep Root streak. */
    deepRootDecay: 1,
    /** Consecutive days at zero water/power that fail the vault. */
    criticalFailureDays: 3,
    /**
     * The winter deepens. Past this day, machinery wears faster and stores keep worse, so a
     * vault that is neither thriving nor failing is pushed off the fence toward an ending.
     */
    attritionFromDay: 42,
    /** Extra facility decay per day, per ten days past the attrition threshold. */
    attritionDecayPerDecade: 0.5,
    /**
     * The day the winter breaks. A run has to have a destination: without one the common
     * outcome — a vault that is neither thriving nor dying — simply never resolved, and the
     * player was left pressing End Day into an empty horizon.
     */
    horizonDay: 60,
    /** Fuel required to launch the convoy. */
    convoyFuel: 60,
    convoyComponents: 45,
  },

  legacy: {
    perDaySurvived: 1.6,
    perSurvivorAlive: 12,
    perLoreFound: 3,
    perResearch: 2.5,
    perLocationExplored: 1.4,
    firstEndingBonus: 30,
  },
} as const;

export type BalanceConfig = typeof BALANCE;
