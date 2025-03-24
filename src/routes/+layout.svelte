	<script lang="ts">
		import '../app.css';
		import { page } from '$app/stores';
		import { onMount } from 'svelte';
	
		let { children } = $props();
		let isLoggedIn = $state(false);
	
		onMount(() => {
			// Überprüfen, ob der Benutzer angemeldet ist
			const token = localStorage.getItem('auth_token');
			isLoggedIn = !!token;
		});
	
		function logout() {
			localStorage.removeItem('auth_token');
			isLoggedIn = false;
			window.location.href = '/';
		}
	</script>
	
	<div class="flex flex-col min-h-screen">
		<!-- Header -->
		<header class="bg-green-600 text-white shadow-md">
			<div class="container mx-auto px-4 py-3">
				<nav class="flex justify-between items-center">
					<a href="/" class="text-xl font-bold">World Electric Mobility</a>
					
					<div class="flex space-x-4">
						<a href="/map" class="hover:underline">Karte</a>
						{#if isLoggedIn}
							<a href="/profile" class="hover:underline">Profil</a>
							<button onclick={logout} class="hover:underline">Abmelden</button>
						{:else}
							<a href="/login" class="hover:underline">Anmelden</a>
							<a href="/register" class="hover:underline">Registrieren</a>
						{/if}
					</div>
				</nav>
			</div>
		</header>
	
		<!-- Main Content -->
		<main class="flex-grow container mx-auto px-4 py-6">
			{@render children()}
		</main>
	
		<!-- Footer -->
		<footer class="bg-gray-800 text-white py-6">
			<div class="container mx-auto px-4">
				<div class="flex flex-col md:flex-row justify-between">
					<div class="mb-4 md:mb-0">
						<h3 class="text-lg font-semibold mb-2">World Electric Mobility</h3>
						<p class="text-gray-400">Elektrofahrzeuge mieten und fahren</p>
					</div>
					<div>
						<h4 class="text-lg font-semibold mb-2">Kontakt</h4>
						<p class="text-gray-400">info@world-electric-mobility.com</p>
						<p class="text-gray-400">+66 123 456 789</p>
					</div>
				</div>
				<div class="mt-6 pt-6 border-t border-gray-700 text-center text-gray-400">
					<p>&copy; {new Date().getFullYear()} World Electric Mobility. Alle Rechte vorbehalten.</p>
				</div>
			</div>
		</footer>
	</div>
