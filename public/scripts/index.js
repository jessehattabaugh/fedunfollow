/* eslint-disable camelcase */

/** prepends the protocol to the hostname if it's missing
 * @param {Event} event - the blur event
 */
function prependProtocol(event) {
	const { target } = event;
	const protocol = 'https://';
	if (!target.value.startsWith(protocol)) {
		target.value = protocol + target.value;
	}
}

/** handles the login form submit event
 * @param {SubmitEvent} event - the submit event
 */
async function handleLogin(event) {
	try {
		event.preventDefault();
		const { target } = event;
		const hostname = target.hostname.value;

		/** create an app on the instance
		 * @see https://docs.joinmastodon.org/methods/apps/#create
		 */
		const body = new FormData({
			client_name: 'FedUnfollow',
			redirect_uris: 'authorized',
			scopes: 'read',
		});
		const method = 'POST';
		console.debug('creating app', { body, method, hostname });
		const response = await fetch(`${hostname}/api/v1/apps`, { method, body });
		const app = await response.json();
		console.debug(`app created: ${app}`);

		// store the app id and secret in local storage
		const { client_id, client_secret } = app;
		localStorage.setItem('client_id', client_id);
		localStorage.setItem('client_secret', client_secret);
		console.debug('app id and secret stored in local storage', { client_id, client_secret });

		/** redirect to the instance's authorization page
		 * @see https://docs.joinmastodon.org/methods/oauth/#authorize
		 */
		const params = new URLSearchParams({
			client_id,
			redirect_uri: `${window.location.origin}/authorized`,
			response_type: 'code',
			scope: 'read',
		});

		window.location = `${hostname}/oauth/authorize?${params}`;
	} catch (error) {
		console.error(error);
	}
}

// attach submit handler to login form
const { login } = document.forms;
login.addEventListener('submit', handleLogin);

// attach onblur to hostname field
const { hostname } = login;
hostname.addEventListener('blur', prependProtocol);
