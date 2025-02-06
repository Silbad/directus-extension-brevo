import { defineModule } from "@directus/extensions-sdk";
import SettingsComponent from "./routes/Settings.vue";
import FormsComponent from "./routes/Forms.vue";

console.log("Unofficial Brevo plugin made in 🇫🇷 by https://devbit.me");

export default defineModule({
	id: "brevo",
	name: "Brevo",
	icon: "forward_to_inbox",
	routes: [
		{
			name: "brevo-contacts-redirect",
			path: "",
			redirect: "/brevo/settings"
		},
		{
			name: "brevo-forms",
			path: "forms",
			component: FormsComponent
		},
		{
			name: "brevo-settings",
			path: "settings",
			component: SettingsComponent
		}
	]
});
