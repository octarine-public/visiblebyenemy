import "./translations"

import {
	Announcer,
	Building,
	Courier,
	Creep,
	Entity,
	EventsSDK,
	Fort,
	Fountain,
	MangoTree,
	Miniboss,
	npc_dota_base_blocker,
	npc_dota_beastmaster_boar,
	npc_dota_beastmaster_hawk,
	npc_dota_brewmaster_earth,
	npc_dota_brewmaster_fire,
	npc_dota_brewmaster_storm,
	npc_dota_brewmaster_void,
	npc_dota_broodmother_spiderling,
	npc_dota_clinkz_skeleton_archer,
	npc_dota_elder_titan_ancestral_spirit,
	npc_dota_ignis_fatuus,
	npc_dota_invoker_forged_spirit,
	npc_dota_lich_ice_spire,
	npc_dota_shadowshaman_serpentward,
	npc_dota_techies_minefield_sign,
	npc_dota_templar_assassin_psionic_trap,
	npc_dota_treant_eyes,
	npc_dota_unit_roshans_banner,
	npc_dota_unit_undying_tombstone,
	npc_dota_venomancer_plagueward,
	npc_dota_visage_familiar,
	npc_dota_wisp_spirit,
	npc_dota_zeus_cloud,
	ParticleAttachment,
	ParticlesSDK,
	SpiritBear,
	Team,
	TechiesMines,
	Thinker,
	TwinGate,
	UnderlordPortal,
	Unit,
	WardObserver,
	WardTrueSight
} from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "./menu/index"

const bootstrap = new (class CVisibleByEnemy {
	private readonly units: Unit[] = []
	private readonly menu = new MenuManager()
	private readonly pSDK = new ParticlesSDK()

	constructor() {
		this.menu.OnChanged(() => this.OnChangedMenu())
	}

	protected get IsCourierState() {
		return this.menu.Courier.State.value
	}

	protected get IsWardState() {
		return this.menu.Ward.State.value
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
			(unit instanceof npc_dota_wisp_spirit && unit.IsNeutral) ||
			(unit instanceof SpiritBear && !unit.ShouldRespawn)
		) {
			return false
		}
		if (unit.IsEnemy() && unit.Team !== Team.Neutral) {
			return false
		}
		if (unit.IsHero) {
			return this.IsHero(unit)
		}
		if (unit.IsCreep) {
			return this.IsCreep(unit)
		}
		if (unit.IsBuilding) {
			return this.IsBuilding(unit)
		}
		if (unit instanceof Courier) {
			return this.IsCourierState
		}
		if (unit instanceof WardObserver || unit instanceof WardTrueSight) {
			return this.IsWardState
		}
		return this.IsOtherUnit(unit)
	}

	protected UpdateUnits(unit: Unit) {
		if (!unit.ClassName.length || unit instanceof Fountain) {
			return
		}
		if (
			unit instanceof Thinker ||
			unit instanceof Announcer ||
			unit instanceof npc_dota_base_blocker
		) {
			return
		}
		const menu = this.menu
		const effectType = menu.EffectType
		const isVisibleForEnemies = unit.IsVisibleForEnemies() // TODO: add support methods
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

		const isDisableParticleUnit = this.IsDisableParticleUnit(unit)
		if (!isVisibleValid || effectType.SelectedID === 0 || isDisableParticleUnit) {
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
		if (unit instanceof Courier) {
			unit.CustomGlowColor = menu.Courier.GlowState.value ? glowColor : undefined
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
		if (unit instanceof WardObserver || unit instanceof WardTrueSight) {
			unit.CustomGlowColor = menu.Ward.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof TechiesMines) {
			unit.CustomGlowColor = menu.Mine.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof npc_dota_zeus_cloud) {
			unit.CustomGlowColor = menu.Cloud.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof npc_dota_unit_undying_tombstone) {
			unit.CustomGlowColor = menu.Tombstone.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof npc_dota_venomancer_plagueward) {
			unit.CustomGlowColor = menu.PlagueWard.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof npc_dota_lich_ice_spire) {
			unit.CustomGlowColor = menu.IceSpire.GlowState.value ? glowColor : undefined
			return
		}
		if (unit instanceof npc_dota_unit_roshans_banner) {
			unit.CustomGlowColor = menu.RoshanBanner.GlowState.value
				? glowColor
				: undefined
			return
		}
		if (unit instanceof npc_dota_elder_titan_ancestral_spirit) {
			unit.CustomGlowColor = menu.AncestralSpirit.GlowState.value
				? glowColor
				: undefined
			return
		}
		if (unit instanceof npc_dota_shadowshaman_serpentward) {
			unit.CustomGlowColor = menu.SerpentWard.GlowState.value
				? glowColor
				: undefined
			return
		}
		if (unit instanceof npc_dota_clinkz_skeleton_archer) {
			unit.CustomGlowColor = menu.SkeletonArmy.GlowState.value
				? glowColor
				: undefined
			return
		}
		if (unit instanceof npc_dota_ignis_fatuus) {
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
		if (menu.OnlySelf.value) {
			return unit.IsMyHero
		}
		if (unit.IsClone) {
			return menu.Clone.value
		}
		if (unit.IsIllusion) {
			return menu.Illusion.value
		}
		return true
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
		if (!menu.AllAnyUnitsState.value || unit instanceof Courier) {
			return false
		}
		if (unit.IsHero || unit.IsCreep || unit.IsBuilding) {
			return false
		}
		if (unit.IsSpiritBear) {
			return menu.Bear.State.value
		}
		if (unit.IsRoshan) {
			return menu.Roshan.State.value
		}
		if (unit instanceof Miniboss) {
			return menu.Tormenter.value
		}
		if (unit instanceof TechiesMines) {
			return menu.Mine.State.value
		}
		if (unit instanceof npc_dota_unit_roshans_banner) {
			return menu.RoshanBanner.State.value
		}
		if (unit instanceof npc_dota_techies_minefield_sign) {
			return menu.MinefieldSign.State.value
		}
		if (unit instanceof npc_dota_zeus_cloud) {
			return menu.Cloud.State.value
		}
		if (unit instanceof npc_dota_wisp_spirit) {
			return menu.WispSpirit.value
		}
		if (unit instanceof npc_dota_shadowshaman_serpentward) {
			return menu.SerpentWard.State.value
		}
		if (unit instanceof npc_dota_lich_ice_spire) {
			return menu.IceSpire.State.value
		}
		if (unit instanceof npc_dota_clinkz_skeleton_archer) {
			return menu.SkeletonArmy.State.value
		}
		if (unit instanceof npc_dota_ignis_fatuus) {
			return menu.IngisFatuus.State.value
		}
		if (unit instanceof npc_dota_unit_undying_tombstone) {
			return menu.Tombstone.State.value
		}
		if (unit instanceof npc_dota_venomancer_plagueward) {
			return menu.PlagueWard.State.value
		}
		if (unit instanceof npc_dota_treant_eyes) {
			return menu.EyesInTheForest.value
		}
		if (unit instanceof npc_dota_templar_assassin_psionic_trap) {
			return menu.PsionicTrap.value
		}
		if (unit instanceof npc_dota_elder_titan_ancestral_spirit) {
			return menu.AncestralSpirit.State.value
		}
		return menu.HiddenUnitsState.value
	}

	protected IsDisableParticleUnit(unit: Unit) {
		const menu = this.menu
		return (
			(unit.IsHero && !menu.Hero.ParticleState.value) ||
			(unit.IsCreep && !menu.Creep.ParticleState.value) ||
			(unit.IsRoshan && !menu.Roshan.ParticleState.value) ||
			(unit.IsSpiritBear && !menu.Bear.ParticleState.value) ||
			(unit.IsBuilding && !menu.Building.ParticleState.value) ||
			(unit instanceof TechiesMines && !menu.Mine.ParticleState.value) ||
			(unit instanceof npc_dota_zeus_cloud && !menu.Cloud.ParticleState.value) ||
			(unit instanceof npc_dota_lich_ice_spire &&
				!menu.IceSpire.ParticleState.value) ||
			(unit instanceof npc_dota_ignis_fatuus &&
				!menu.IngisFatuus.ParticleState.value) ||
			(unit instanceof npc_dota_unit_undying_tombstone &&
				!menu.Tombstone.ParticleState.value) ||
			(unit instanceof npc_dota_techies_minefield_sign &&
				!menu.MinefieldSign.ParticleState.value) ||
			(unit instanceof npc_dota_clinkz_skeleton_archer &&
				!menu.SkeletonArmy.ParticleState.value) ||
			(unit instanceof npc_dota_shadowshaman_serpentward &&
				!menu.SerpentWard.ParticleState.value) ||
			(unit instanceof npc_dota_venomancer_plagueward &&
				!menu.PlagueWard.ParticleState.value) ||
			(unit instanceof npc_dota_elder_titan_ancestral_spirit &&
				!menu.AncestralSpirit.ParticleState.value) ||
			((unit instanceof WardObserver || unit instanceof WardTrueSight) &&
				!menu.Ward.ParticleState.value) ||
			(unit instanceof npc_dota_unit_roshans_banner &&
				!menu.RoshanBanner.ParticleState.value)
		)
	}
})()

EventsSDK.on("GameEnded", () => bootstrap.GameChanged())

EventsSDK.on("GameStarted", () => bootstrap.GameChanged())

EventsSDK.on("EntityCreated", entity => bootstrap.EntityCreated(entity))

EventsSDK.on("EntityDestroyed", entity => bootstrap.EntityDestroyed(entity))

EventsSDK.on("LifeStateChanged", entity => bootstrap.LifeStateChanged(entity))

EventsSDK.on("EntityTeamChanged", entity => bootstrap.EntityTeamChanged(entity))

EventsSDK.on("UnitPropertyChanged", unit => bootstrap.UnitPropertyChanged(unit))

EventsSDK.on("UnitTeamVisibilityChanged", unit =>
	bootstrap.UnitTeamVisibilityChanged(unit)
)
