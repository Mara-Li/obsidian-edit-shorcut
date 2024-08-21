import { Notice, Plugin, sanitizeHTMLToDom, type FileView } from "obsidian";

export default class ShortcutEditMode extends Plugin {
	button!: {
		live: {
			icon: string;
			tooltip: string;
		};
		source: {
			icon: string;
			tooltip: string;
		};
	};
	async onload() {
		console.log(`[${this.manifest.name}] Loaded`);
		const translation = {
			live: i18next.t("plugins.editor-status.edit-live-preview"),
			source: i18next.t("plugins.editor-status.edit-source"),
			showViewHeader: i18next.t("setting.appearance.option-show-view-header"),
		};

		this.button = {
			live: {
				icon: "pencil-ruler",
				tooltip: translation.live,
			},
			source: {
				icon: "code",
				tooltip: translation.source,
			},
		};

		//verify if live-preview is enabled
		const config = this.app.vault.config;
		const errorMessage = function (type: "livePreview" | "showViewHeader") {
			const isDisabled =
				type === "livePreview" ? translation.live : translation.showViewHeader;
			const text = `<span class="error">Error: « <u>${isDisabled}</u> » is disabled. Enable it in settings.</span>`;

			return sanitizeHTMLToDom(text);
		};
		if (!config.livePreview || !config.showViewHeader) {
			new Notice(errorMessage(!config.livePreview ? "livePreview" : "showViewHeader"), 0);
		}

		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				//get if file is opened in edit mode
				this.removeAction();
				const lpState = this.app.workspace.getActiveFileView();
				if (lpState && lpState.getState().mode === "source") {
					const mode = lpState.getState().source === true ? "source" : "live";
					this.reloadButton(mode, lpState);
				}
			})
		);
	}

	onunload() {
		this.removeAction();
		console.log(`[${this.manifest.name}] Unloaded`);
	}

	removeAction() {
		const action = document.querySelectorAll(".edit-mode-button");
		action.forEach((el) => {
			el.remove();
		});
	}

	addButton(mode: "source" | "live", lpState: FileView) {
		const action = lpState.addAction(
			this.button[mode].icon,
			this.button[mode].tooltip,
			() => {
				this.app.commands.executeCommandById("editor:toggle-source");
			}
		);
		action.addClass("edit-mode-button");
	}

	reloadButton(mode: "source" | "live", lpState: FileView) {
		this.removeAction();
		this.addButton(mode, lpState);
	}
}
