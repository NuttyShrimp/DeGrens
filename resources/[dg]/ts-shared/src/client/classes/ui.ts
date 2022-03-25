type UICallback = (info: { data: any; meta: { ok: boolean; message: string } }) => void;

class Ui {
	private static instance: Ui;
	private registered: string[];
	private resourceStarted: boolean;

	constructor() {
		this.registered = [];
		this.resourceStarted = false;
		// eventHandlers
		on("__dg_ui:Ready", () => {
			this.registered.forEach((evt) => {
				global.exports["dg-ui"].RegisterUIEvent(evt);
			});
		});

		on("onClientResourceStart", (resource: string) => {
			if (resource !== "dg-ui") return;
			this.resourceStarted = true;
		});

		on("onClientResourceStop", (resource: string) => {
			if (resource !== "dg-ui") return;
			this.resourceStarted = true;
		});
	}

	public static getInstance(): Ui {
		if (!Ui.instance) {
			Ui.instance = new Ui();
		}
		return Ui.instance;
	}

	public RegisterUICallback(name: string, callback: (data:any, cb: UICallback)=>void) {
		if (this.registered.indexOf(name) === -1) {
			this.registered.push(name);
		}
		AddEventHandler(`__dg_ui:${name}`, callback);
		if (this.resourceStarted && GetResourceState("dg-ui") == "started") {
			global.exports["dg-ui"].RegisterUIEvent(name);
		}
		this.registered.push(name);
	}

	public SendUIMessage(data: any) {
		global.exports["dg-ui"].SendUIMessage(data);
	}

	public SendAppEvent(name: string, data: any) {
		global.exports["dg-ui"].SendAppEvent(name, data);
	}

	public SetUIFocus(hasFocus: boolean, hasCursor: boolean) {
		global.exports["dg-ui"].SetUIFocus(hasFocus, hasCursor);
	}

	public SetUIFocusCustom(hasFocus: boolean, hasCursor: boolean) {
		global.exports["dg-ui"].SetUIFocusCustom(hasFocus, hasCursor);
	}

	public openApplication(app: string, data?: any, preventFocus?: boolean) {
		global.exports["dg-ui"].openApplication(app, data, preventFocus);
	}

	public closeApplication(app: string, data?: any) {
		global.exports["dg-ui"].closeApplication(app, data);
	}
}

const UI = Ui.getInstance();
export default UI;
