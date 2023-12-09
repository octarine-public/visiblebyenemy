import { Menu } from "github.com/octarine-public/wrapper/index"

export class MenuHero {
	public readonly State: Menu.Toggle
	public readonly Clone: Menu.Toggle
	public readonly OnlySelf: Menu.Toggle
	public readonly Illusion: Menu.Toggle
	public readonly GlowState: Menu.Toggle
	public readonly ParticleState: Menu.Toggle

	constructor(node: Menu.Node) {
		const menu = node.AddNode("Heroes", "menu/icons/juggernaut.svg")
		menu.SortNodes = false
		this.State = menu.AddToggle("State", true)
		this.Clone = menu.AddToggle("Clones", true)
		this.Illusion = menu.AddToggle("Illusion", true)
		this.OnlySelf = menu.AddToggle("Only self", false)
		this.GlowState = menu.AddToggle("Glow effect", true)
		this.ParticleState = menu.AddToggle("Particle effect", true)
	}

	public OnChanged(callback: () => void) {
		this.State.OnValue(() => callback())
		this.Clone.OnValue(() => callback())
		this.OnlySelf.OnValue(() => callback())
		this.Illusion.OnValue(() => callback())
		this.GlowState.OnValue(() => callback())
		this.ParticleState.OnValue(() => callback())
	}

	public ResetSettings() {
		this.State.value = this.State.defaultValue
		this.Clone.value = this.Clone.defaultValue
		this.Clone.value = this.Clone.defaultValue
		this.OnlySelf.value = this.OnlySelf.defaultValue
		this.GlowState.value = this.GlowState.defaultValue
		this.ParticleState.value = this.ParticleState.defaultValue
	}
}
