import { ImageData, Menu } from "github.com/octarine-public/wrapper/index"

export class MenuAncestralSpirit {
	public readonly State: Menu.Toggle
	public readonly GlowState: Menu.Toggle
	public readonly ParticleState: Menu.Toggle

	constructor(node: Menu.Node) {
		const menu = node.AddNode(
			"Ancestral spirit",
			ImageData.GetSpellTexture("elder_titan_return_spirit"),
			"",
			0
		)
		menu.SortNodes = false
		this.State = menu.AddToggle("State", true)
		this.GlowState = menu.AddToggle("Glow effect", true)
		this.ParticleState = menu.AddToggle("Particle effect", false)
	}

	public OnChanged(callback: () => void) {
		this.State.OnValue(() => callback())
		this.GlowState.OnValue(() => callback())
		this.ParticleState.OnValue(() => callback())
	}

	public ResetSettings() {
		this.State.value = true
		this.GlowState.value = true
		this.ParticleState.value = false
	}
}
