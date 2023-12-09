import { ImageData, Menu } from "github.com/octarine-public/wrapper/index"

export class MenuCloud {
	public readonly State: Menu.Toggle
	public readonly GlowState: Menu.Toggle
	public readonly ParticleState: Menu.Toggle

	constructor(node: Menu.Node) {
		const menu = node.AddNode(
			"Nimbus",
			ImageData.GetSpellTexture("zuus_cloud"),
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
		this.State.value = this.State.defaultValue
		this.GlowState.value = this.GlowState.defaultValue
		this.ParticleState.value = this.ParticleState.defaultValue
	}
}
