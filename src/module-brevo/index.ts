import { defineModule } from "@directus/extensions-sdk";
import SettingsComponent from "./pages/Settings.vue";
import ContactsComponent from "./pages/Contacts.vue";

export default defineModule({
	id: "brevo",
	name: "Brevo",
	icon: "forward_to_inbox",
	routes: [
		{
			name: "brevo-contacts-redirect",
			path: "",
			redirect: "/brevo/contacts"
		},
		{
			name: "brevo-contacts",
			path: "contacts",
			component: ContactsComponent
		},
		{
			name: "brevo-settings",
			path: "settings",
			component: SettingsComponent
		}
	]
});
