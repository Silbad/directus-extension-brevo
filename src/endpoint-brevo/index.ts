import { defineEndpoint } from '@directus/extensions-sdk';
import { createDirectus, rest, createCollection, createField, withToken, readCollection, readField } from '@directus/sdk';
import { createError } from '@directus/errors';

interface ErrorExtensions {
	message: string;
}

const messageConstructor = (extensions: ErrorExtensions) => `${extensions.message}`;

const ForbiddenError = createError<ErrorExtensions>('FORBIDDEN', messageConstructor, 403);
const UnauthorizedError = createError<ErrorExtensions>('UNAUTHORIZED', messageConstructor, 401);

const collectionExists = async (client: any, collectionName: string, token: string) => {
	try {
		await client.request(withToken(token, readCollection(collectionName)));
		return true;
	} catch (error) {
		return false;
	}
};

const fieldExists = async (client: any, collectionName: string, fieldName: string, token: string) => {
	try {
		await client.request(withToken(token, readField(collectionName, fieldName)));
		return true;
	} catch (error) {
		return false;
	}
};

const createSettingsCollection = async (url: string, token: string) => {
	const client = createDirectus(url).with(rest());

	if (await collectionExists(client, "brevo_settings", token)) {
		return;
	}

	const brevoSettingsObject = {
		collection: "brevo_settings",
		meta: {
			collection: "brevo_settings",
			icon: "forward_to_inbox",
			note: "Brevo plugin settings",
			hidden: true,
			singleton: true,
			versioning: true,
			translations: [
				{ language: "en-US", translation: "Brevo settings" },
				{ language: "fr-FR", translation: "Paramètres de Brevo" },
				{ language: "de-DE", translation: "Brevo-Einstellungen" },
				{ language: "es-ES", translation: "Configuración de Brevo" },
				{ language: "it-IT", translation: "Impostazioni di Brevo" },
				{ language: "pt-PT", translation: "Configurações do Brevo" }
			],
			archive_field: "status",
			archive_value: "archived",
			unarchive_value: "draft",
			archive_app_filter: true,
			sort_field: "sort",
			item_duplication_fields: null,
			sort: 1
		},
		schema: {
			name: "pages",
			comment: null
		}
	};

	return client.request(withToken(token, createCollection(brevoSettingsObject)));
}

const createSettingsApiKeyField = async (url: string, token: string) => {
	const client = createDirectus(url).with(rest());

	if (await fieldExists(client, "brevo_settings", "api_key", token)) {
		return;
	}

	const apiKeyField = {
		field: "api_key",
		type: "string",
		meta: {
			field: "api_key",
			interface: "input",
			options: { trim: true },
			display: "API Key",
			readonly: false,
			hidden: false,
			sort: 1,
			width: "full",
			translations: [
				{ language: "en-US", translation: "API Key" },
				{ language: "fr-FR", translation: "Clé API" },
				{ language: "de-DE", translation: "API-Schlüssel" },
				{ language: "es-ES", translation: "Clave API" },
				{ language: "it-IT", translation: "Chiave API" },
				{ language: "pt-PT", translation: "Chave da API" }
			],
			note: "Brevo API Key",
			required: true
		},
		schema: {
			name: "api_key",
			type: "string",
			max_length: 255,
			nullable: false,
			unique: true
		}
	};

	return client.request(withToken(token, createField("brevo_settings", apiKeyField)));
}

export default defineEndpoint({
	id: 'brevo',
	handler: (router, context) => {
		const checkAuthentication = (req: any, next: any) => {
			if (!req.accountability || !req.accountability.user) {
				return next(new UnauthorizedError({ message: `User is not authenticated.` }));
			}
		};

		router.get('/', (req: any, res, next) => {
			checkAuthentication(req, next);
			res.send('Endpoint Brevo active.');
		});

		router.get('/settings', async (req: any, res, next) => {
			checkAuthentication(req, next);

			const token = req.token;
			const { PUBLIC_URL } = context.env;

			if (!PUBLIC_URL || PUBLIC_URL === '' || PUBLIC_URL === '/') {
				return next(new ForbiddenError({ message: `PUBLIC_URL is not set.` }));
			}

			try {
				await createSettingsCollection(PUBLIC_URL, token);
				await createSettingsApiKeyField(PUBLIC_URL, token);
				res.json({ message: "ok" });
			} catch (error: any) {
				return next(new ForbiddenError({ message: `Failed to create settings: ${error.errors[0].message}` }));
			}
		});

		router.get('/account', (req: any, res, next) => {
			checkAuthentication(req, next);

			const { BREVO_API_KEY } = context.env;

			if (!BREVO_API_KEY || BREVO_API_KEY === '') {
				return next(new ForbiddenError({ message: `Brevo API Key is not set.` }));
			}

			const headers = new Headers();
			headers.append('Accept', 'application/json');
			headers.append('api-key', BREVO_API_KEY);

			fetch("https://api.brevo.com/v3/account", {
				method: 'GET',
				headers,
				redirect: 'follow',
			})
				.then(async (response) => {
					if (!response.ok) {
						const errorBody = await response.json();
						throw errorBody.statusText;
					}
					return response.json();
				})
				.then((result) => res.json(result))
				.catch((error) => next(new ForbiddenError({ message: error })));
		});
	}
});