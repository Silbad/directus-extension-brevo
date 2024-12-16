import { defineEndpoint } from '@directus/extensions-sdk';
import { createError } from '@directus/errors';

interface ErrorExtensions {
	message: string;
}

const messageConstructor = (extensions: ErrorExtensions) => `${extensions.message}`;

const ForbiddenError = createError<ErrorExtensions>('FORBIDDEN', messageConstructor, 403);
const UnauthorizedError = createError<ErrorExtensions>('UNAUTHORIZED', messageConstructor, 401);

export default defineEndpoint({
	id: 'brevo',
	handler: (router, context) => {
		// ENDPOINT ROOT
		// ***************************************************************************
		router.get('/', (req, res, next) => {
			res.send('Endpoint Brevo active.');
		});
		// ENDPOINT GET ACCOUNT
		// ***************************************************************************
		router.get('/account', (req, res, next) => {
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