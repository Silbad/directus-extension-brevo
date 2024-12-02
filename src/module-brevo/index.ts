import { defineModule } from "@directus/extensions-sdk";
import SettingsComponent from "./Settings.vue";

export default defineModule({
	id: "brevo",
	name: "Brevo",
	icon: "forward_to_inbox",
	routes: [
		{
			path: "brevo/settings",
			component: SettingsComponent,
			alias: ""
		}
	]
});
