import { ImageData, Menu } from "github.com/octarine-public/wrapper/index"

class CreepTypes {
	public readonly Hawk: Menu.Toggle
	public readonly Boar: Menu.Toggle
	public readonly Lane: Menu.Toggle
	public readonly Eidolon: Menu.Toggle
	public readonly Neutral: Menu.Toggle
	public readonly Zombies: Menu.Toggle
	public readonly Familiar: Menu.Toggle
	public readonly Spider: Menu.Toggle
	public readonly Panda: Menu.Toggle
	public readonly ForgedSpirit: Menu.Toggle

	constructor(menu: Menu.Node) {
		this.Lane = menu.AddToggle("Lines", true)
		this.Lane.IsHidden = true

		this.Neutral = menu.AddToggle("Neutrals", true)
		this.Neutral.IsHidden = true

		this.Boar = menu.AddToggle("Boars", true)
		this.Boar.IsHidden = true

		this.Hawk = menu.AddToggle("Hawks", true)
		this.Hawk.IsHidden = true

		this.Panda = menu.AddToggle("Pandas", true)
		this.Panda.IsHidden = true

		this.Eidolon = menu.AddToggle("Eidolons", true)
		this.Eidolon.IsHidden = true

		this.Spider = menu.AddToggle("Spiders", true)
		this.Spider.IsHidden = true

		this.Zombies = menu.AddToggle("Zombies", false)
		this.Zombies.IsHidden = true

		this.Familiar = menu.AddToggle("Familiars", true)
		this.Familiar.IsHidden = true

		this.ForgedSpirit = menu.AddToggle("Forged spirit", true)
		this.ForgedSpirit.IsHidden = true
	}

	public OnChanged(callback: () => void) {
		this.Lane.OnValue(() => callback())
		this.Panda.OnValue(() => callback())
		this.Boar.OnValue(() => callback())
		this.Hawk.OnValue(() => callback())
		this.Spider.OnValue(() => callback())
		this.Neutral.OnValue(() => callback())
		this.Zombies.OnValue(() => callback())
		this.Familiar.OnValue(() => callback())
		this.Eidolon.OnValue(() => callback())
		this.ForgedSpirit.OnValue(() => callback())
	}

	public ResetSettings(hideUnhide: boolean) {
		this.Lane.value = true
		this.Boar.value = true
		this.Hawk.value = true
		this.Panda.value = true
		this.Spider.value = true
		this.Neutral.value = true
		this.Zombies.value = false
		this.Familiar.value = true
		this.Eidolon.value = true
		this.ForgedSpirit.value = true
		this.HideUnhide(hideUnhide)
	}

	public HideUnhide(state: boolean) {
		this.Lane.IsHidden = state
		this.Boar.IsHidden = state
		this.Hawk.IsHidden = state
		this.Panda.IsHidden = state
		this.Spider.IsHidden = state
		this.Neutral.IsHidden = state
		this.Zombies.IsHidden = state
		this.Familiar.IsHidden = state
		this.Eidolon.IsHidden = state
		this.ForgedSpirit.IsHidden = state
	}
}

export class MenuCreep {
	public readonly State: Menu.Toggle
	public readonly AllState: Menu.Toggle
	public readonly Types: CreepTypes

	public readonly GlowState: Menu.Toggle
	public readonly ParticleState: Menu.Toggle

	private readonly tree: Menu.Node

	constructor(node: Menu.Node) {
		this.tree = node.AddNode("Creeps", ImageData.Paths.Icons.icon_svg_creep, "", 0)
		this.tree.SortNodes = false
		this.State = this.tree.AddToggle("State", true)
		this.GlowState = this.tree.AddToggle("Glow effect", true)
		this.ParticleState = this.tree.AddToggle("Particle effect", false)
		this.AllState = this.tree.AddToggle("All creeps", false)
		this.Types = new CreepTypes(this.tree)
	}

	public OnChanged(callback: () => void) {
		this.State.OnValue(() => callback())
		this.Types.OnChanged(() => callback())
		this.GlowState.OnValue(() => callback())
		this.ParticleState.OnValue(() => callback())
		this.AllState.OnValue(call => {
			this.Types.HideUnhide(call.value)
			this.tree.Update()
			callback()
		})
	}

	public ResetSettings() {
		this.State.value = true
		this.AllState.value = false
		this.GlowState.value = true
		this.ParticleState.value = false
		this.Types.ResetSettings(this.AllState.value)
		this.tree.Update()
	}
}
