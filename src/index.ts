import "./translate"

import {
	Announcer,
	BaseBlocker,
	Building,
	ClinkzSkeletonArmy,
	Creep,
	ElderTitanAncestralSpirit,
	Entity,
	EventsSDK,
	EyesInTheForest,
	Fort,
	Fountain,
	IngisFatuus,
	LichIceSpire,
	MangoTree,
	npc_dota_beastmaster_boar,
	npc_dota_beastmaster_hawk,
	npc_dota_brewmaster_earth,
	npc_dota_brewmaster_fire,
	npc_dota_brewmaster_storm,
	npc_dota_brewmaster_void,
	npc_dota_broodmother_spiderling,
	npc_dota_invoker_forged_spirit,
	npc_dota_visage_familiar,
	ParticleAttachment,
	ParticlesSDK,
	ShamanSerpentWard,
	SpiritBear,
	Team,
	TechiesMines,
	TemplarPsionicTrap,
	Thinker,
	TwinGate,
	UnderlordPortal,
	UndyingTombstone,
	Unit,
	VenomancerPlagueWard,
	WispSpirit,
	ZeusCloud
} from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "./menu/index"

const bootstrap = new (class CVisibleByEnemy {
	private readonly units: Unit[] = []
	private readonly menu = new MenuManager()
	private readonly pSDK = new ParticlesSDK()

	constructor() {
		this.menu.OnChanged(() => this.OnChangedMenu())
	}

	private get state() {
		return this.menu.State.value
	}

	public EntityCreated(entity: Entity) {
		if (entity instanceof Unit) {
			this.units.push(entity)
			this.UpdateUnits(entity)
		}
	}

	public EntityDestroyed(entity: Entity) {
		if (entity instanceof Unit) {
			this.UpdateUnits(entity)
			this.units.remove(entity)
		}
	}

	public LifeStateChanged(entity: Entity) {
		if (entity instanceof Unit) {
			this.UpdateUnits(entity)
		}
	}

	public EntityTeamChanged(entity: Entity) {
		if (entity instanceof Unit) {
			this.UpdateUnits(entity)
		}
	}

	public UnitTeamVisibilityChanged(unit: Unit) {
		this.UpdateUnits(unit)
	}

	public UnitPropertyChanged(unit: Unit) {
		this.UpdateUnits(unit)
	}

	public GameChanged() {
		this.menu.GameChanged()
	}

	protected IsUnitShouldBeHighlighted(unit: Unit) {
		if (
			!this.state ||
			!unit.IsAlive ||
			(unit instanceof WispSpirit && unit.IsNeutral) ||
			(unit instanceof SpiritBear && !unit.ShouldRespawn)
		) {
			return false
		}
		if (unit.IsEnemy() && unit.Team !== Team.Neutral) {
			return false
		}
		return (
			this.IsHero(unit) ||
			this.IsCreep(unit) ||
			this.IsBuilding(unit) ||
			this.IsOtherUnit(unit)
		)
	}

	protected UpdateUnits(unit: Unit) {
		if (!unit.ClassName.length || unit instanceof Fountain) {
			return
		}
		if (unit instanceof Announcer || unit instanceof BaseBlocker) {
			return
		}
		const menu = this.menu
		const effectType = menu.EffectType
		const isVisibleForEnemies = unit.IsVisibleForEnemies()
		const shouldBeHighlighted = this.IsUnitShouldBeHighlighted(unit)
		const isVisibleValid = isVisibleForEnemies && shouldBeHighlighted

		this.SetUnitGlow(unit, isVisibleValid)

		if (
			// only glow supported or only effects Ids 3, 5, 8
			unit instanceof Building &&
			(unit.IsBarrack || unit instanceof Fort) &&
			effectType.SelectedID !== 3 &&
			effectType.SelectedID !== 5 &&
			effectType.SelectedID !== 8
		) {
			return
		}

		const isDisabledUnit = this.IsDisableParticleState(unit)
		if (!isVisibleValid || effectType.SelectedID === 0 || isDisabledUnit) {
			this.pSDK.DestroyByKey(this.KeyName(unit))
			return
		}

		const key = this.KeyName(unit)
		const color = menu.Color.SelectedColor
		const attachment = ParticleAttachment.PATTACH_ABSORIGIN_FOLLOW
		this.pSDK.AddOrUpdate(key, menu.Path, attachment, unit, [1, color], [2, color.a])
	}

	protected KeyName(unit: Unit) {
		return `vbe_${unit.Index}`
	}

	protected OnChangedMenu() {
		for (let index = this.units.length - 1; index > -1; index--) {
			this.UpdateUnits(this.units[index])
		}
	}

	protected SetUnitGlow(unit: Unit, visible: boolean) {
		const menu = this.menu
		const glowColor = menu.GlowColor.SelectedColor
		if (!menu.GlowState.value || !visible) {
			unit.CustomGlowColor = undefined
			return
		}
		if (unit instanceof SpiritBear) {
			const isValidBear = menu.Bear.GlowState.value && unit.ShouldRespawn
			unit.CustomGlowColor = isValidBear ? glowColor : undefined
			return
		}
		if (unit.IsSpiritBear) {
			unit.CustomGlowColor = menu.Bear.GlowState.value ? glowColor : undefined
			return
		}
		if (unit.IsRoshan) {
			unit.CustomGlowColor = menu.Roshan.GlowState.value ? glowColor : undefined
			return
		}
		if (unit.IsHero) {
			unit.CustomGlowColor = menu.Hero.GlowState.value ? glowColor : undefined
			return
		}
		if (unit.IsBuilding) {
			unit.CustomGlowColor = menu.Building.GlowState.value ? glowColor : undefined
			return
		}
		if (unit.IsCreep) {
			unit.CustomGlowColor = menu.Creep.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof TechiesMines) {
			unit.CustomGlowColor = menu.Mine.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof ZeusCloud) {
			unit.CustomGlowColor = menu.Cloud.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof UndyingTombstone) {
			unit.CustomGlowColor = menu.Tombstone.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof VenomancerPlagueWard) {
			unit.CustomGlowColor = menu.PlagueWard.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof LichIceSpire) {
			unit.CustomGlowColor = menu.IceSpire.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof ElderTitanAncestralSpirit) {
			unit.CustomGlowColor = menu.AncestralSpirit.GlowState.value
				? glowColor
				: undefined
			return
		}
		if (unit instanceof ShamanSerpentWard) {
			unit.CustomGlowColor = menu.SerpentWard.GlowState.value
				? glowColor
				: undefined
			return
		}
		if (unit instanceof ClinkzSkeletonArmy) {
			unit.CustomGlowColor = menu.SkeletonArmy.GlowState.value
				? glowColor
				: undefined
			return
		}
		if (unit instanceof IngisFatuus) {
			unit.CustomGlowColor = menu.IngisFatuus.GlowState.value
				? glowColor
				: undefined
		}
	}

	protected IsCreep(unit: Unit) {
		const menu = this.menu.Creep
		if (unit.IsCreep && !menu.State.value) {
			return false
		}
		if (!(unit instanceof Creep)) {
			return false
		}
		if (menu.AllState.value) {
			return true
		}
		if (unit.IsLaneCreep) {
			return menu.Types.Lane.value
		}
		if (unit.IsEidolon) {
			return menu.Types.Eidolon.value
		}
		if (unit.IsNeutral) {
			return menu.Types.Neutral.value
		}
		if (unit instanceof npc_dota_visage_familiar) {
			return menu.Types.Familiar.value
		}
		if (unit instanceof npc_dota_beastmaster_hawk) {
			return menu.Types.Hawk.value
		}
		if (unit instanceof npc_dota_beastmaster_boar) {
			return menu.Types.Boar.value
		}
		if (unit instanceof npc_dota_invoker_forged_spirit) {
			return menu.Types.ForgedSpirit.value
		}
		if (unit instanceof npc_dota_broodmother_spiderling) {
			return menu.Types.Spider.value
		}
		if (
			unit instanceof npc_dota_brewmaster_earth ||
			unit instanceof npc_dota_brewmaster_fire ||
			unit instanceof npc_dota_brewmaster_storm ||
			unit instanceof npc_dota_brewmaster_void
		) {
			return menu.Types.Panda.value
		}
		return false
	}

	protected IsHero(unit: Unit) {
		const menu = this.menu.Hero
		if (unit.IsHero && !menu.State.value) {
			return false
		}
		if (unit.IsClone) {
			return menu.Clone.value
		}
		if (unit.IsIllusion) {
			return menu.Illusion.value
		}
		return unit.IsHero
	}

	protected IsBuilding(unit: Unit) {
		const menu = this.menu.Building
		if (!menu.State.value && unit.IsBuilding) {
			return false
		}
		// outpost not supported
		if (unit.IsShop || unit.IsOutpost /* && menu.Outpost.value */) {
			return false
		}
		if (!(unit instanceof Building)) {
			return false
		}
		if (unit instanceof MangoTree || unit instanceof TwinGate) {
			return false
		}
		if (menu.AllState.value) {
			return true
		}
		if (unit.IsTower) {
			return menu.Tower.value
		}
		if (unit.IsBarrack) {
			return menu.Barrack.value
		}
		if (unit.IsFiller) {
			return menu.Filler.value
		}
		if (unit.IsWatcher) {
			return menu.Watcher.value
		}
		if (unit instanceof Fort) {
			return menu.Fort.value
		}
		if (unit instanceof UnderlordPortal) {
			return menu.UnderlordPortal.value
		}
		return false
	}

	protected IsOtherUnit(unit: Unit) {
		const menu = this.menu
		if (unit.IsHero || unit.IsCreep || unit.IsBuilding) {
			return false
		}
		if (!menu.AllAnyUnitsState.value) {
			return false
		}
		if (unit instanceof Thinker) {
			return menu.Thinker.value
		}
		if (unit.IsSpiritBear) {
			return menu.Bear.State.value
		}
		if (unit.IsRoshan) {
			return menu.Roshan.State.value
		}
		if (unit instanceof TechiesMines) {
			return menu.Mine.State.value
		}
		if (unit instanceof ZeusCloud) {
			return menu.Cloud.State.value
		}
		if (unit instanceof WispSpirit) {
			return menu.WispSpirit.value
		}
		if (unit instanceof ShamanSerpentWard) {
			return menu.SerpentWard.State.value
		}
		if (unit instanceof LichIceSpire) {
			return menu.IceSpire.State.value
		}
		if (unit instanceof ClinkzSkeletonArmy) {
			return menu.SkeletonArmy.State.value
		}
		if (unit instanceof IngisFatuus) {
			return menu.IngisFatuus.State.value
		}
		if (unit instanceof UndyingTombstone) {
			return menu.Tombstone.State.value
		}
		if (unit instanceof VenomancerPlagueWard) {
			return menu.PlagueWard.State.value
		}
		if (unit instanceof EyesInTheForest) {
			return menu.EyesInTheForest.value
		}
		if (unit instanceof TemplarPsionicTrap) {
			return menu.PsionicTrap.value
		}
		if (unit instanceof ElderTitanAncestralSpirit) {
			return menu.AncestralSpirit.State.value
		}
		return menu.HiddenUnitsState.value
	}

	protected IsDisableParticleState(unit: Unit) {
		const menu = this.menu
		return (
			(unit.IsHero && !menu.Hero.ParticleState.value) ||
			(unit.IsCreep && !menu.Creep.ParticleState.value) ||
			(unit.IsRoshan && !menu.Roshan.ParticleState.value) ||
			(unit.IsSpiritBear && !menu.Bear.ParticleState.value) ||
			(unit.IsBuilding && !menu.Building.ParticleState.value) ||
			(unit instanceof TechiesMines && !menu.Mine.ParticleState.value) ||
			(unit instanceof ZeusCloud && !menu.Cloud.ParticleState.value) ||
			(unit instanceof LichIceSpire && !menu.IceSpire.ParticleState.value) ||
			(unit instanceof IngisFatuus && !menu.IngisFatuus.ParticleState.value) ||
			(unit instanceof UndyingTombstone && !menu.Tombstone.ParticleState.value) ||
			(unit instanceof ClinkzSkeletonArmy &&
				!menu.SkeletonArmy.ParticleState.value) ||
			(unit instanceof ShamanSerpentWard &&
				!menu.SerpentWard.ParticleState.value) ||
			(unit instanceof VenomancerPlagueWard &&
				!menu.PlagueWard.ParticleState.value) ||
			(unit instanceof ElderTitanAncestralSpirit &&
				!menu.PlagueWard.ParticleState.value)
		)
	}
})()

EventsSDK.on("GameEnded", () => bootstrap.GameChanged())

EventsSDK.on("GameStarted", () => bootstrap.GameChanged())

EventsSDK.on("EntityCreated", entity => bootstrap.EntityCreated(entity))

EventsSDK.on("EntityCreated", entity => bootstrap.EntityCreated(entity))

EventsSDK.on("EntityDestroyed", entity => bootstrap.EntityDestroyed(entity))

EventsSDK.on("LifeStateChanged", entity => bootstrap.LifeStateChanged(entity))

EventsSDK.on("EntityTeamChanged", entity => bootstrap.EntityTeamChanged(entity))

EventsSDK.on("UnitPropertyChanged", unit => bootstrap.UnitPropertyChanged(unit))

EventsSDK.on("UnitTeamVisibilityChanged", unit =>
	bootstrap.UnitTeamVisibilityChanged(unit)
)
