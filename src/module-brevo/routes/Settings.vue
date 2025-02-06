<template>
	<private-view title="Settings">
		<template #headline>Brevo</template>
		<template #title-outer:prepend>
			<v-button class="header-icon" rounded icon normal>
				<v-icon name="settings" />
			</v-button>
		</template>
		<template #navigation>
			<Navigation />
		</template>
		<template #actions>
			<v-button icon rounded>
				<v-icon :name="'check'" />
			</v-button>
		</template>
		<div class="content">
			<v-notice type="error" icon="warning" v-if="messageError">
				{{ messageError }}
			</v-notice>
			<v-notice type="info" icon="info" v-if="!show">
				<div>
					<p>{{ t("you have not yet configured your Brevo API key.") }}</p>
					<p>
						Si ce n'est pas déjà fait, vous devez
						<a class="link-info" href="https://onboarding.brevo.com/account/register" target="_blank">
							créer votre compte Brevo
						</a>.
					</p>
				</div>
			</v-notice>
			<div class="fields">
				<div class="field half">
					<label class="type-label" for="api-key">
						{{ t("api key") }}
					</label>
					<v-input id="api-key" v-model="settings.apiKey" autofocus :disabled :trim="true"
						:autocomplete="false" placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx
					"></v-input>
					<a class="link-help"
						href="https://help.brevo.com/hc/fr/articles/209467485-Cr%C3%A9er-ou-supprimer-une-cl%C3%A9-API"
						target="_blank" v-if="!show">{{ t("where find my API key?") }}</a>
				</div>
				<div class="field half" v-if="show">
					<label class="type-label" for="send-mails">
						{{ t("send transactional emails with Brevo's API") }}
					</label>
					<v-checkbox id="send-mails" v-model="settings.sendEmails" :disabled>
						Activé
					</v-checkbox>
				</div>
				<div class="field half" v-if="show">
					<label class="type-label">
						{{ t("send a test mail") }}
					</label>

					<label class="type-label-secondary">{{ t("sender") }}</label>

					<v-select v-model="sender" :items="senders"></v-select>

					<label class="type-label-secondary" for="to">{{ t("recipient") }}</label>

					<v-input id="to" v-model="recipient" autofocus :disabled :trim="true" :autocomplete="false"
						placeholder="your@email.com" type="email"></v-input>

					<div class="actions">
						<v-button @click="sendTestEmail" :disabled="disabled" :loading="disabled">{{ t("send")
							}}</v-button>
					</div>
				</div>
			</div>
		</div>
	</private-view>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Navigation from "../components/Navigation.vue";
import { useApi } from '@directus/extensions-sdk';
import { useI18n } from 'vue-i18n';
import en from "../locales/en.json";
import fr from "../locales/fr.json";

export default defineComponent({
	name: 'Settings',
	components: {
		Navigation
	},
	setup() {
		const api = useApi();
		const settings = ref<any>({});
		const user = ref<any>({});
		const disabled = ref(false);
		const sender = ref<string>('john@gmail.com');
		const recipient = ref<string>('');
		const show = ref(false);
		const messageError = ref('');
		const senders = ref<any>([
			{
				text: 'John Doe <john@gmail.com>',
				value: 'john@gmail.com'
			},
			{
				text: 'Jim Doe <test@gmail.com>',
				value: 'test@gmail.com'
			}
		]);

		const { t, locale } = useI18n({
			legacy: false,
			locale: 'en',
			fallbackLocale: 'en',
			messages: {
				en,
				fr
			}
		});

		settings.value = {
			apiKey: '',
			transactional: false,
			captcha: [
				{
					name: 'Turnstile',
					enabled: false,
					sitekey: '',
					secret: '',
					hosts: []
				}
			]
		};

		const sendTestEmail = async () => {
			disabled.value = true;

			try {
				await api.post('/brevo/send-test', {
					sender: sender.value,
					recipient: recipient.value
				});
			} catch (error) {
				console.error(error);
			}

			disabled.value = false;
		};

		const getMe = async () => {
			const response = await api.get('/users/me');
			user.value = response.data.data;
			locale.value = user.value.language.split('-')[0];
		};

		const getBrevoSettings = async () => {
			// Fetch the settings from the API with error handling
			try {
				const response = await api.get('/brevo/settings');
				console.log('response =>', response.data);
				// settings.value = response.data.data;
				// console.log('SETTINGS =>', settings.value);
				// show.value = true;
			} catch (error: any) {
				messageError.value = error.response.data.errors[0].message;
			}
		};

		// Fetch the user to get locale
		getMe();
		// Fetch the settings from the API with error handling
		getBrevoSettings();

		// if (settings.value.apiKey) {
		// 	show.value = true;
		// }
		// console.log(settings.value);


		return {
			disabled,
			settings,
			senders,
			sender,
			recipient,
			show,
			messageError,
			locale,
			t,
			sendTestEmail
		};
	}
});
</script>

<style scoped>
.fields {
	display: grid;
	grid-template-columns: [start] minmax(0, 1fr) [half] minmax(0, 1fr) [full];
	gap: var(--theme--form--row-gap) var(--theme--form--column-gap);
}

.type-label {
	margin-bottom: 8px;
}

.type-label-secondary {
	margin: 8px 0;
}

.actions {
	margin-top: 16px;
	display: flex;
	justify-content: flex-start;
}

.field {
	grid-column: start / fill;

	@media (min-width: 960px) {
		grid-column: start / full;
	}
}

.content {
	padding: var(--content-padding);
	padding-top: 0;
	padding-bottom: var(--content-padding);
}

.half {
	grid-column: start / fill;

	@media (min-width: 960px) {
		grid-column: start / half;
	}
}

.link-help {
	font-size: .8rem;
	color: var(--theme--primary);
}

.link-info {
	color: var(--theme--primary);
}

.v-notice {
	margin-bottom: 16px;
}
</style>