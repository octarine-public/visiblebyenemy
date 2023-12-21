import {
	Color,
	ImageData,
	Menu,
	NotificationsSDK,
	ResetSettingsUpdated,
	Sleeper
} from "github.com/octarine-public/wrapper/index"

import { MenuAncestralSpirit } from "./any/ancestralSpirit"
import { MenuBear } from "./any/bears"
import { MenuCloud } from "./any/cloud"
import { MenuIceSpire } from "./any/iceSpire"
import { MenuIngisFatuus } from "./any/ingisFatuus"
import { MenuMinefieldSign } from "./any/minefieldSign"
import { MenuMine } from "./any/mines"
import { MenuPlagueWard } from "./any/plagueWards"
import { MenuRoshansBanner } from "./any/roshansBanner"
import { MenuSerpentWard } from "./any/serpentWard"
import { MenuSkeletonArmy } from "./any/skeletonArmy"
import { MenuTombstone } from "./any/tombstone"
import { MenuBuilding } from "./buildings"
import { MenuCourier } from "./couriers"
import { MenuCreep } from "./creeps"
import { MenuHero } from "./heroes"
import { MenuRoshan } from "./roshan"
import { MenuWard } from "./wards"

export class MenuManager {
	public readonly State: Menu.Toggle
	public readonly Color: Menu.ColorPicker
	public readonly EffectType: Menu.Dropdown
	public readonly HiddenUnitsState: Menu.Toggle
	public readonly AllAnyUnitsState: Menu.Toggle

	public readonly Bear: MenuBear
	public readonly Hero: MenuHero
	public readonly Creep: MenuCreep
	public readonly Building: MenuBuilding

	public readonly Mine: MenuMine
	public readonly Ward: MenuWard
	public readonly Cloud: MenuCloud
	public readonly Roshan: MenuRoshan
	public readonly Courier: MenuCourier

	public readonly IngisFatuus: MenuIngisFatuus
	public readonly SerpentWard: MenuSerpentWard
	public readonly SkeletonArmy: MenuSkeletonArmy
	public readonly AncestralSpirit: MenuAncestralSpirit
	public readonly MinefieldSign: MenuMinefieldSign

	public readonly IceSpire: MenuIceSpire
	public readonly Tombstone: MenuTombstone
	public readonly RoshanBanner: MenuRoshansBanner

	public readonly Thinker: Menu.Toggle
	public readonly WispSpirit: Menu.Toggle
	public readonly PlagueWard: MenuPlagueWard
	public readonly EyesInTheForest: Menu.Toggle
	public readonly PsionicTrap: Menu.Toggle
	public readonly Tormenter: Menu.Toggle

	public readonly GlowState: Menu.Toggle
	public readonly GlowColor: Menu.ColorPicker

	private readonly reset: Menu.Button
	private readonly sleeper = new Sleeper()
	private readonly defaultColor = Color.Aqua
	private readonly anyUnitsTree: Menu.Node

	private readonly particles = [
		{
			Path: "",
			Name: "Disable",
			CanChangeColor: false
		},
		{
			Name: "Shivas",
			Path: "particles/vbe/visiblebyenemy.vpcf_c"
		},
		{
			Name: "Omniknight",
			Path: "particles/vbe/visiblebyenemy_omniknight.vpcf_c"
		},
		{
			Name: "Arrow",
			Path: "particles/vbe/visiblebyenemy_arrow.vpcf_c"
		},
		{
			Name: "Glyph",
			Path: "particles/vbe/visiblebyenemy_glyph.vpcf_c"
		},
		{
			Name: "Lightning",
			Path: "particles/vbe/visiblebyenemy_lightning.vpcf_c"
		},
		{
			Name: "Energy Orb",
			Path: "particles/vbe/visiblebyenemy_energy_orb.vpcf_c"
		},
		{
			Name: "Pentagon",
			Path: "particles/vbe/visiblebyenemy_pentagon.vpcf_c"
		},
		{
			Name: "Axis",
			Path: "particles/vbe/visiblebyenemy_axis.vpcf_c"
		},
		{
			Name: "Beam Jagged",
			Path: "particles/vbe/visiblebyenemy_beam_jagged.vpcf_c"
		},
		{
			Name: "Beam Rainbow",
			Path: "particles/vbe/visiblebyenemy_beam_rainbow.vpcf_c"
		},
		{
			Name: "Walnut Statue",
			Path: "particles/vbe/visiblebyenemy_walnut_statue.vpcf_c"
		},
		{
			Name: "Thin Thick",
			Path: "particles/vbe/visiblebyenemy_thin_thick.vpcf_c"
		},
		{
			Name: "Ring Wave",
			Path: "particles/vbe/visiblebyenemy_ring_wave.vpcf_c"
		},
		{
			Name: "Radial",
			Path: "particles/ui/ui_sweeping_ring.vpcf",
			CanChangeColor: false
		},
		{
			Name: "Beam",
			Path: "particles/units/heroes/hero_omniknight/omniknight_heavenly_grace_beam.vpcf",
			CanChangeColor: false
		},
		{
			Name: "Beam light",
			Path: "particles/units/heroes/hero_spirit_breaker/spirit_breaker_haste_owner_status.vpcf",
			CanChangeColor: false
		},
		{
			Name: "Dark",
			Path: "particles/units/heroes/hero_spirit_breaker/spirit_breaker_haste_owner_dark.vpcf",
			CanChangeColor: false
		},
		{
			Name: "Purge",
			Path: "particles/units/heroes/hero_oracle/oracle_fortune_purge.vpcf",
			CanChangeColor: false
		},
		{
			Name: "Timer",
			Path: "particles/units/heroes/hero_spirit_breaker/spirit_breaker_haste_owner_timer.vpcf",
			CanChangeColor: false
		},
		{
			Name: "Text (Visible)",
			Path: "particles/vbe/visiblebyenemy_visible.vpcf_c"
		}
	]

	constructor() {
		const visualNode = Menu.AddEntry("Visual")
		const menu = visualNode.AddNode(
			"VisibleByEnemy",
			"menu/icons/eye_vbe.svg",
			"Shows whether the enemy can see units"
		)
		menu.SortNodes = false

		this.State = menu.AddToggle("State", true)
		const general = menu.AddNode("General settings", "menu/icons/settings.svg")
		general.SortNodes = false

		this.GlowState = general.AddToggle(
			"Glow effect",
			true,
			"NOTE: disables on all units\nbut enables only on those where it is specifically enabled"
		)

		const particleNames = this.particles.map(x => x.Name)
		this.EffectType = general.AddDropdown(
			"Particle effect",
			particleNames,
			1,
			"NOTE: disables on all units\nbut enables only on those where it is specifically enabled"
		)

		this.Color = general.AddColorPicker("Particle color", this.defaultColor)
		this.GlowColor = general.AddColorPicker("Glow color", this.defaultColor)

		this.Hero = new MenuHero(menu)
		this.Creep = new MenuCreep(menu)
		this.Building = new MenuBuilding(menu)

		this.Ward = new MenuWard(menu)
		this.Roshan = new MenuRoshan(menu)
		this.Courier = new MenuCourier(menu)

		this.anyUnitsTree = menu.AddNode(
			"Any units",
			ImageData.Paths.Icons.icon_svg_other
		)
		this.anyUnitsTree.SortNodes = false
		this.AllAnyUnitsState = this.anyUnitsTree.AddToggle("State", true)
		this.Thinker = this.anyUnitsTree.AddToggle(
			"Thinker",
			false,
			"NOTE: Displayed on hidden units, for example:\nVoid Spirit (aether remnant)",
			-1,
			ImageData.Paths.Icons.icon_svg_other
		)
		this.HiddenUnitsState = this.anyUnitsTree.AddToggle(
			"Hidden units",
			false,
			"NOTE: Displayed on hidden units, for example:\nMirana, Windranger, Hoodwink arrows, but some units may interfere",
			-1,
			ImageData.Paths.Icons.icon_svg_other
		)
		this.Tormenter = this.anyUnitsTree.AddToggle(
			"Tormenter",
			true,
			undefined,
			-1,
			ImageData.GetSpellTexture("miniboss_reflect"),
			0
		)
		this.WispSpirit = this.anyUnitsTree.AddToggle(
			"Wisp spirits",
			false,
			undefined,
			-1,
			ImageData.GetSpellTexture("wisp_spirits"),
			0
		)

		this.PsionicTrap = this.anyUnitsTree.AddToggle(
			"Psionic traps",
			true,
			undefined,
			-1,
			ImageData.GetSpellTexture("templar_assassin_psionic_trap"),
			0
		)

		this.EyesInTheForest = this.anyUnitsTree.AddToggle(
			"Eyes in the forest",
			true,
			undefined,
			-1,
			ImageData.GetSpellTexture("treant_eyes_in_the_forest"),
			0
		)

		this.Mine = new MenuMine(this.anyUnitsTree)
		this.Bear = new MenuBear(this.anyUnitsTree)
		this.Cloud = new MenuCloud(this.anyUnitsTree)
		this.IceSpire = new MenuIceSpire(this.anyUnitsTree)
		this.Tombstone = new MenuTombstone(this.anyUnitsTree)
		this.PlagueWard = new MenuPlagueWard(this.anyUnitsTree)
		this.IngisFatuus = new MenuIngisFatuus(this.anyUnitsTree)
		this.SkeletonArmy = new MenuSkeletonArmy(this.anyUnitsTree)
		this.SerpentWard = new MenuSerpentWard(this.anyUnitsTree)
		this.RoshanBanner = new MenuRoshansBanner(this.anyUnitsTree)
		this.MinefieldSign = new MenuMinefieldSign(this.anyUnitsTree)
		this.AncestralSpirit = new MenuAncestralSpirit(this.anyUnitsTree)

		this.reset = menu.AddButton("Reset", "Reset settings")
	}

	public get Path() {
		return this.particles[this.EffectType.SelectedID].Path
	}

	protected get CanChangeColor() {
		return this.particles[this.EffectType.SelectedID].CanChangeColor ?? true
	}

	public OnChanged(callback: () => void) {
		this.State.OnValue(() => callback())
		this.Color.OnValue(() => callback())
		this.Thinker.OnValue(() => callback())
		this.Tormenter.OnValue(() => callback())
		this.GlowState.OnValue(() => callback())
		this.GlowColor.OnValue(() => callback())
		this.WispSpirit.OnValue(() => callback())
		this.PsionicTrap.OnValue(() => callback())
		this.HiddenUnitsState.OnValue(() => callback())
		this.EyesInTheForest.OnValue(() => callback())
		this.AllAnyUnitsState.OnValue(() => callback())

		this.Bear.OnChanged(() => callback())
		this.Ward.OnChanged(() => callback())
		this.Hero.OnChanged(() => callback())
		this.Mine.OnChanged(() => callback())
		this.Cloud.OnChanged(() => callback())
		this.Creep.OnChanged(() => callback())
		this.Roshan.OnChanged(() => callback())
		this.Building.OnChanged(() => callback())
		this.Courier.OnChanged(() => callback())
		this.IceSpire.OnChanged(() => callback())
		this.Tombstone.OnChanged(() => callback())
		this.PlagueWard.OnChanged(() => callback())
		this.IngisFatuus.OnChanged(() => callback())
		this.SkeletonArmy.OnChanged(() => callback())
		this.SerpentWard.OnChanged(() => callback())
		this.AncestralSpirit.OnChanged(() => callback())
		this.MinefieldSign.OnChanged(() => callback())
		this.RoshanBanner.OnChanged(() => callback())

		this.EffectType.OnValue(() => {
			callback()
			this.Color.IsHidden = !this.CanChangeColor
		})

		this.reset.OnValue(() => {
			if (this.sleeper.Sleeping("ResetSettings")) {
				return
			}
			this.ResetSettings()
			this.sleeper.Sleep(1000, "ResetSettings")
			NotificationsSDK.Push(new ResetSettingsUpdated())
			callback()
		})
	}

	public GameChanged() {
		this.sleeper.FullReset()
	}

	public ResetSettings() {
		this.State.value = this.State.defaultValue
		this.Thinker.value = this.Thinker.defaultValue
		this.GlowState.value = this.GlowState.defaultValue
		this.WispSpirit.value = this.WispSpirit.defaultValue
		this.Tormenter.value = this.Tormenter.defaultValue
		this.HiddenUnitsState.value = this.HiddenUnitsState.defaultValue
		this.EffectType.SelectedID = this.EffectType.defaultValue
		this.PsionicTrap.value = this.PsionicTrap.defaultValue
		this.EyesInTheForest.value = this.EyesInTheForest.defaultValue
		this.AllAnyUnitsState.value = this.AllAnyUnitsState.defaultValue
		this.Color.SelectedColor.CopyFrom(this.Color.defaultColor)
		this.GlowColor.SelectedColor.CopyFrom(this.GlowColor.defaultColor)
		this.ResetSettingsUnits()
	}

	protected ResetSettingsUnits() {
		this.Bear.ResetSettings()
		this.Ward.ResetSettings()
		this.Cloud.ResetSettings()
		this.Hero.ResetSettings()
		this.Mine.ResetSettings()
		this.Creep.ResetSettings()
		this.Roshan.ResetSettings()
		this.Courier.ResetSettings()
		this.Building.ResetSettings()
		this.IceSpire.ResetSettings()
		this.Tombstone.ResetSettings()
		this.PlagueWard.ResetSettings()
		this.SerpentWard.ResetSettings()
		this.IngisFatuus.ResetSettings()
		this.SkeletonArmy.ResetSettings()
		this.MinefieldSign.ResetSettings()
		this.AncestralSpirit.ResetSettings()
		this.RoshanBanner.ResetSettings()
	}
}
