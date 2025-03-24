<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let rememberMe = false;
	let isLoading = false;
	let errorMessage = '';
	let redirectUrl = '/';

	onMount(() => {
		if (browser) {
			// Überprüfen, ob ein Redirect-Parameter in der URL vorhanden ist
			const urlParams = new URLSearchParams(window.location.search);
			const redirect = urlParams.get('redirect');
			if (redirect) {
				redirectUrl = redirect;
			}

			// Überprüfen, ob der Benutzer bereits angemeldet ist
			const token = localStorage.getItem('auth_token');
			if (token) {
				// Wenn bereits angemeldet, zur Startseite weiterleiten
				goto('/');
			}
		}
	});

	async function handleLogin() {
		// Formularvalidierung
		if (!email || !password) {
			errorMessage = 'Bitte füllen Sie alle Felder aus.';
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			// In einer echten Anwendung würde hier eine API-Anfrage erfolgen
			// Für diese Demo simulieren wir eine erfolgreiche Anmeldung
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Erfolgreiche Anmeldung simulieren
			const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
			localStorage.setItem('auth_token', mockToken);
			
			if (rememberMe) {
				localStorage.setItem('remember_email', email);
			} else {
				localStorage.removeItem('remember_email');
			}

			// Zur Startseite oder zur Redirect-URL weiterleiten
			goto(redirectUrl);
		} catch (error) {
			console.error('Anmeldefehler:', error);
			errorMessage = 'Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
	<h1 class="text-2xl font-bold mb-6 text-center">Anmelden</h1>

	{#if errorMessage}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
			<span class="block sm:inline">{errorMessage}</span>
		</div>
	{/if}

	<form on:submit|preventDefault={handleLogin} class="space-y-4">
		<div>
			<label for="email" class="block text-gray-700 mb-1">E-Mail</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
				placeholder="ihre@email.com"
				required
			/>
		</div>

		<div>
			<label for="password" class="block text-gray-700 mb-1">Passwort</label>
			<input
				type="password"
				id="password"
				bind:value={password}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
				placeholder="••••••••"
				required
			/>
		</div>

		<div class="flex items-center justify-between">
			<div class="flex items-center">
				<input
					type="checkbox"
					id="remember-me"
					bind:checked={rememberMe}
					class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
				/>
				<label for="remember-me" class="ml-2 block text-gray-700">
					Angemeldet bleiben
				</label>
			</div>
			<a href="/forgot-password" class="text-sm text-green-600 hover:underline">
				Passwort vergessen?
			</a>
		</div>

		<button
			type="submit"
			class="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition-colors flex justify-center items-center"
			disabled={isLoading}
		>
			{#if isLoading}
				<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				Anmelden...
			{:else}
				Anmelden
			{/if}
		</button>
	</form>

	<div class="mt-6 text-center">
		<p class="text-gray-600">
			Noch kein Konto? <a href="/register" class="text-green-600 hover:underline">Registrieren</a>
		</p>
	</div>

	<div class="mt-8 border-t border-gray-200 pt-6">
		<p class="text-center text-gray-600 text-sm mb-4">Oder anmelden mit</p>
		<div class="flex justify-center space-x-4">
			<button class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
				<svg class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
					<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
					<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
					<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
					<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
				</svg>
				Google
			</button>
			<button class="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
				<svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
					<path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
				</svg>
				Facebook
			</button>
		</div>
	</div>
</div>