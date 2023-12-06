import { ImageData, Menu } from "github.com/octarine-public/wrapper/index"

export class MenuWispSpirit {
	public readonly State: Menu.Toggle

	constructor(node: Menu.Node) {
		const menu = node.AddNode(
			"Spirits",
			ImageData.GetSpellTexture("wisp_spirits"),
			"",
			0
		)
		menu.SortNodes = false
		this.State = menu.AddToggle("State", true)
	}

	public OnChanged(callback: () => void) {
		this.State.OnValue(() => callback())
	}

	public ResetSettings() {
		this.State.value = true
	}
}
