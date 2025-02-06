import { defineEndpoint } from '@directus/extensions-sdk';
import { createDirectus, rest, createCollection, createField } from '@directus/sdk';

import { createError } from '@directus/errors';

interface ErrorExtensions {
	message: string;
}

const messageConstructor = (extensions: ErrorExtensions) => `${extensions.message}`;

const ForbiddenError = createError<ErrorExtensions>('FORBIDDEN', messageConstructor, 403);
const UnauthorizedError = createError<ErrorExtensions>('UNAUTHORIZED', messageConstructor, 401);

const createSettingsCollection = async (url: string) => {
	const client = createDirectus(url).with(rest());

	const brevo_settings_object = {
		"collection": "brevo_settings",
		"meta": {
			"collection": "brevo_settings",
			"icon": "settings",
			"note": "Brevo plugin settings",
			"hidden": true,
			"singleton": true,
			"translations": [
				{
					"language": "en-US",
					"translation": "Brevo settings"
				},
				{
					"language": "fr-FR",
					"translation": "Paramètres de Brevo"
				},
				{
					"language": "de-DE",
					"translation": "Brevo-Einstellungen"
				},
				{
					"language": "es-ES",
					"translation": "Configuración de Brevo"
				},
				{
					"language": "it-IT",
					"translation": "Impostazioni di Brevo"
				},
				{
					"language": "pt-PT",
					"translation": "Configurações do Brevo"
				}
			],
			"archive_field": "status",
			"archive_value": "archived",
			"unarchive_value": "draft",
			"archive_app_filter": true,
			"sort_field": "sort",
			"item_duplication_fields": null,
			"sort": 1
		},
		"schema": {
			"name": "pages",
			"comment": null
		}
	};

	const result = await client.request(
		createCollection(brevo_settings_object)
	);

	return result;
}

const createApiKeyField = async (url: string) => {
	const client = createDirectus(url).with(rest());

	const apiKeyField = {
			"field": "api_key",
			"type": "string",
			"meta": {
				"field": "api_key",
				"interface": "input",
				"options": {
					"trim": true
				},
				"display": "API Key",
				"required": true,
				"unique": true,
				"hidden": false,
				"readonly": false,
				"sort": 1
			},
			"schema": {
				"name": "api_key",
				"type": "string",
				"max_length": 255,
				"nullable": false,
				"unique": true
			}
		};

	const result = await client.request(
		createField("brevo_settings", apiKeyField)
	);

	return result;
}

export default defineEndpoint({
	id: 'brevo',
	handler: (router, context) => {
		// ENDPOINT ROOT
		// ***************************************************************************
		router.get('/', (req: any, res, next) => {
			// Check if the user is authenticated
			if (!req.accountability || !req.accountability.user) {
				return next(
					new UnauthorizedError({
						message: `User is not authenticated.`
					})
				);
			}

			res.send('Endpoint Brevo active.');
		});
		// ENDPOINT GET CHECK-SETTINGS
		// ***************************************************************************
		router.get('/settings', async (req: any, res, next) => {
			// Check if the user is authenticated
			if (!req.accountability || !req.accountability.user) {
				return next(
					new UnauthorizedError({
						message: `User is not authenticated.`
					})
				);
			}

			// Get the Brevo API Key
			const {
				PUBLIC_URL
			} = context.env;

			// Check if PUBLIC_URL is set
			if (!PUBLIC_URL || PUBLIC_URL === '' || PUBLIC_URL === '/') {
				return next(
					new ForbiddenError({
						message: `PUBLIC_URL is not set.`
					})
				);
			}

			// Create brevo_settings Directus collection if not exist
			try {
				await createSettingsCollection(PUBLIC_URL);
			} catch (error) {
				return next(
					new ForbiddenError({
						message: `Failed to create brevo_settings collection: ${error}`
					})
				);
			}

			// Create api_key field in brevo_settings collection if not exist
			try {
				await createApiKeyField(PUBLIC_URL);
			} catch (error) {
				return next(
					new ForbiddenError({
						message: `Failed to create api_key field: ${error}`
					})
				);
			}

			res.json({
				message: 'PUBLIC_URL is set.'
			});
		});
		// ENDPOINT GET ACCOUNT
		// ***************************************************************************
		router.get('/account', (req: any, res, next) => {
			// Check if the user is authenticated
			if (!req.accountability || !req.accountability.user) {
				return next(
					new UnauthorizedError({
						message: `User is not authenticated.`
					})
				);
			}

			// Get the Brevo API Key
			const {
				BREVO_API_KEY
			} = context.env;

			// Check if the Brevo API Key is set
			if (!BREVO_API_KEY || BREVO_API_KEY === '') {
				return next(
					new ForbiddenError({
						message: `Brevo API Key is not set.`
					})
				);
			}

			// Fetch the Brevo API
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
				.then((result) => {
					res.json(result);
				})
				.catch((error) => {
					return next(
						new ForbiddenError({
							message: error
						})
					);
				});
		});
	}
});