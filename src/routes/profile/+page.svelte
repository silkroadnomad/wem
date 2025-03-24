<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	// Typdefinitionen
	interface CompletedBooking {
		vehicleId: number;
		vehicleName: string;
		duration: number;
		date: string;
		time: string;
		totalPrice: number;
		paymentMethod: string;
		paymentStatus: string;
		bookingId: string;
		timestamp: string;
	}

	// Benutzerdaten
	let userName = '';
	let userEmail = '';
	let userPhone = '';
	let isLoggedIn = false;

	// Buchungshistorie
	let bookingHistory: CompletedBooking[] = [];
	let activeBookings: CompletedBooking[] = [];
	let pastBookings: CompletedBooking[] = [];

	// Tabs
	let activeTab: 'profile' | 'active' | 'history' = 'profile';

	onMount(() => {
		if (browser) {
			// Überprüfen, ob der Benutzer angemeldet ist
			const token = localStorage.getItem('auth_token');
			if (!token) {
				// Wenn nicht angemeldet, zur Anmeldeseite weiterleiten
				goto('/login?redirect=/profile');
				return;
			}

			isLoggedIn = true;

			// Benutzerdaten aus dem localStorage abrufen
			userName = localStorage.getItem('user_name') || 'Max Mustermann';
			userEmail = localStorage.getItem('user_email') || 'max.mustermann@example.com';
			userPhone = localStorage.getItem('user_phone') || '+66 123 456 789';

			// Buchungshistorie aus dem localStorage abrufen
			bookingHistory = JSON.parse(localStorage.getItem('booking_history') || '[]');
			
			// Aktive und vergangene Buchungen filtern
			const now = new Date();
			activeBookings = bookingHistory.filter(booking => {
				const bookingDate = new Date(`${booking.date}T${booking.time}`);
				const endTime = new Date(bookingDate.getTime() + booking.duration * 60 * 60 * 1000);
				return endTime > now;
			});
			
			pastBookings = bookingHistory.filter(booking => {
				const bookingDate = new Date(`${booking.date}T${booking.time}`);
				const endTime = new Date(bookingDate.getTime() + booking.duration * 60 * 60 * 1000);
				return endTime <= now;
			});
		}
	});

	// Abmelden
	function logout() {
		if (browser) {
			localStorage.removeItem('auth_token');
			localStorage.removeItem('user_name');
			localStorage.removeItem('user_email');
			localStorage.removeItem('user_phone');
			goto('/login');
		}
	}

	// Formatierung des Datums
	function formatDate(dateString: string, timeString: string): string {
		const date = new Date(`${dateString}T${timeString}`);
		return date.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Berechnung der verbleibenden Zeit
	function getRemainingTime(booking: CompletedBooking): string {
		const now = new Date();
		const bookingDate = new Date(`${booking.date}T${booking.time}`);
		const endTime = new Date(bookingDate.getTime() + booking.duration * 60 * 60 * 1000);
		
		if (endTime <= now) {
			return 'Abgelaufen';
		}
		
		const diff = endTime.getTime() - now.getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		
		return `${hours}h ${minutes}m`;
	}
</script>

<div class="max-w-4xl mx-auto">
	<div class="bg-white rounded-lg shadow-md overflow-hidden">
		<!-- Tabs -->
		<div class="flex border-b">
			<button 
				class={`flex-1 py-3 font-medium ${activeTab === 'profile' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => activeTab = 'profile'}
			>
				Profil
			</button>
			<button 
				class={`flex-1 py-3 font-medium ${activeTab === 'active' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => activeTab = 'active'}
			>
				Aktive Buchungen {#if activeBookings.length > 0}<span class="ml-1 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">{activeBookings.length}</span>{/if}
			</button>
			<button 
				class={`flex-1 py-3 font-medium ${activeTab === 'history' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
				on:click={() => activeTab = 'history'}
			>
				Buchungshistorie
			</button>
		</div>

		<!-- Tab-Inhalte -->
		<div class="p-6">
			{#if activeTab === 'profile'}
				<div>
					<h1 class="text-2xl font-bold mb-6">Mein Profil</h1>
					
					<div class="mb-8">
						<div class="flex items-center mb-6">
							<div class="bg-green-100 text-green-800 p-3 rounded-full mr-4">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
								</svg>
							</div>
							<div>
								<h2 class="text-xl font-semibold">{userName}</h2>
								<p class="text-gray-600">Mitglied seit {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</p>
							</div>
						</div>
						
						<div class="space-y-4">
							<div class="flex flex-col sm:flex-row sm:items-center">
								<span class="text-gray-600 sm:w-32">E-Mail:</span>
								<span class="font-medium">{userEmail}</span>
							</div>
							<div class="flex flex-col sm:flex-row sm:items-center">
								<span class="text-gray-600 sm:w-32">Telefon:</span>
								<span class="font-medium">{userPhone}</span>
							</div>
						</div>
					</div>
					
					<div class="border-t border-gray-200 pt-6">
						<h2 class="text-lg font-semibold mb-4">Einstellungen</h2>
						
						<div class="space-y-4">
							<button class="flex items-center text-gray-700 hover:text-gray-900">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
									<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
								</svg>
								Profil bearbeiten
							</button>
							<button class="flex items-center text-gray-700 hover:text-gray-900">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
								</svg>
								Passwort ändern
							</button>
							<button class="flex items-center text-gray-700 hover:text-gray-900">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
								</svg>
								Kontoeinstellungen
							</button>
							<button class="flex items-center text-red-600 hover:text-red-800" on:click={logout}>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.586V8z" clip-rule="evenodd" />
								</svg>
								Abmelden
							</button>
						</div>
					</div>
				</div>
			{:else if activeTab === 'active'}
				<div>
					<h1 class="text-2xl font-bold mb-6">Aktive Buchungen</h1>
					
					{#if activeBookings.length > 0}
						<div class="space-y-4">
							{#each activeBookings as booking}
								<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
									<div class="flex justify-between items-start mb-2">
										<h3 class="text-lg font-semibold">{booking.vehicleName}</h3>
										<span class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">Aktiv</span>
									</div>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
										<div class="text-gray-600">
											<span class="font-medium">Buchungs-ID:</span> {booking.bookingId}
										</div>
										<div class="text-gray-600">
											<span class="font-medium">Datum:</span> {formatDate(booking.date, booking.time)}
										</div>
										<div class="text-gray-600">
											<span class="font-medium">Dauer:</span> {booking.duration} Stunden
										</div>
										<div class="text-gray-600">
											<span class="font-medium">Verbleibend:</span> {getRemainingTime(booking)}
										</div>
									</div>
									<div class="flex justify-between items-center">
										<span class="font-bold">{booking.totalPrice} ฿</span>
										<div class="flex space-x-2">
											<a href="/unlock" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
												Entsperren
											</a>
											<a href="/map" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
												Auf Karte zeigen
											</a>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<h3 class="text-lg font-medium text-gray-900 mb-2">Keine aktiven Buchungen</h3>
							<p class="text-gray-600 mb-4">Sie haben derzeit keine aktiven Buchungen.</p>
							<a href="/" class="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
								Fahrzeug buchen
							</a>
						</div>
					{/if}
				</div>
			{:else if activeTab === 'history'}
				<div>
					<h1 class="text-2xl font-bold mb-6">Buchungshistorie</h1>
					
					{#if pastBookings.length > 0}
						<div class="space-y-4">
							{#each pastBookings as booking}
								<div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
									<div class="flex justify-between items-start mb-2">
										<h3 class="text-lg font-semibold">{booking.vehicleName}</h3>
										<span class="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">Abgeschlossen</span>
									</div>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
										<div class="text-gray-600">
											<span class="font-medium">Buchungs-ID:</span> {booking.bookingId}
										</div>
										<div class="text-gray-600">
											<span class="font-medium">Datum:</span> {formatDate(booking.date, booking.time)}
										</div>
										<div class="text-gray-600">
											<span class="font-medium">Dauer:</span> {booking.duration} Stunden
										</div>
										<div class="text-gray-600">
											<span class="font-medium">Zahlungsmethode:</span> {booking.paymentMethod === 'card' ? 'Kreditkarte' : 'PayPal'}
										</div>
									</div>
									<div class="flex justify-between items-center">
										<span class="font-bold">{booking.totalPrice} ฿</span>
										<button class="text-green-600 hover:text-green-800 text-sm font-medium">
											Rechnung herunterladen
										</button>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
							<h3 class="text-lg font-medium text-gray-900 mb-2">Keine Buchungshistorie</h3>
							<p class="text-gray-600 mb-4">Sie haben noch keine abgeschlossenen Buchungen.</p>
							<a href="/" class="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
								Fahrzeug buchen
							</a>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>