import { Menu, Utils } from "github.com/octarine-public/wrapper/index"

const base = "github.com/octarine-public/visiblebyenemy/scripts_files/translations"

const Load = (fileName: string) =>
	new Map<string, string>(Object.entries(Utils.readJSON(`${base}/${fileName}.json`)))

Menu.Localization.AddLocalizationUnit("russian", Load("ru"))
Menu.Localization.AddLocalizationUnit("english", Load("en"))
Menu.Localization.AddLocalizationUnit("сhinese", Load("cn"))
