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

	// Zustandsvariablen
	let activeBookings: CompletedBooking[] = [];
	let selectedBooking: CompletedBooking | null = null;
	let isUnlocking = false;
	let unlockSuccess = false;
	let unlockError = '';
	let unlockCode = '';
	let remainingTime = '';
	let countdownInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		if (browser) {
			// Überprüfen, ob der Benutzer angemeldet ist
			const token = localStorage.getItem('auth_token');
			if (!token) {
				// Wenn nicht angemeldet, zur Anmeldeseite weiterleiten
				goto('/login?redirect=/unlock');
				return;
			}

			// Buchungshistorie aus dem localStorage abrufen
			const bookingHistory = JSON.parse(localStorage.getItem('booking_history') || '[]') as CompletedBooking[];
			
			// Aktive Buchungen filtern (Buchungen, die noch nicht abgelaufen sind)
			const now = new Date();
			activeBookings = bookingHistory.filter(booking => {
				const bookingDate = new Date(`${booking.date}T${booking.time}`);
				const endTime = new Date(bookingDate.getTime() + booking.duration * 60 * 60 * 1000);
				return endTime > now;
			});

			// Wenn keine aktiven Buchungen vorhanden sind, zur Startseite weiterleiten
			if (activeBookings.length === 0) {
				goto('/');
				return;
			}

			// Die neueste Buchung auswählen
			selectedBooking = activeBookings[0];
			
			// Countdown für die verbleibende Zeit starten
			startCountdown();
		}
	});

	// Countdown für die verbleibende Zeit
	function startCountdown() {
		if (!selectedBooking) return;
		
		// Countdown-Intervall löschen, falls bereits vorhanden
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}
		
		// Countdown-Intervall starten
		countdownInterval = setInterval(() => {
			if (!selectedBooking) return;
			
			const now = new Date();
			const bookingDate = new Date(`${selectedBooking.date}T${selectedBooking.time}`);
			const endTime = new Date(bookingDate.getTime() + selectedBooking.duration * 60 * 60 * 1000);
			
			// Wenn die Buchung abgelaufen ist, Countdown stoppen
			if (endTime <= now) {
				clearInterval(countdownInterval as ReturnType<typeof setInterval>);
				remainingTime = 'Abgelaufen';
				return;
			}
			
			// Verbleibende Zeit berechnen
			const diff = endTime.getTime() - now.getTime();
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);
			
			remainingTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}, 1000);
	}

	// Fahrzeug entsperren
	async function unlockVehicle() {
		if (!selectedBooking) return;
		
		isUnlocking = true;
		unlockError = '';
		
		try {
			// In einer echten Anwendung würde hier eine API-Anfrage erfolgen
			// Für diese Demo simulieren wir eine erfolgreiche Entsperrung
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Zufälligen Entsperrcode generieren
			unlockCode = Math.floor(1000 + Math.random() * 9000).toString();
			
			// Erfolgreiche Entsperrung simulieren
			unlockSuccess = true;
		} catch (error) {
			console.error('Entsperrungsfehler:', error);
			unlockError = 'Das Fahrzeug konnte nicht entsperrt werden. Bitte versuchen Sie es später erneut.';
		} finally {
			isUnlocking = false;
		}
	}

	// Buchung wechseln
	function changeBooking(booking: CompletedBooking) {
		selectedBooking = booking;
		unlockSuccess = false;
		unlockError = '';
		startCountdown();
	}
</script>

<div class="max-w-3xl mx-auto">
	{#if unlockSuccess}
		<div class="bg-white p-8 rounded-lg shadow-md text-center">
			<div class="mb-6 text-green-600">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold mb-4">Fahrzeug entsperrt!</h1>
			<p class="text-gray-600 mb-6">Ihr Fahrzeug wurde erfolgreich entsperrt. Verwenden Sie den folgenden Code, um das Fahrzeug zu starten:</p>
			
			<div class="bg-gray-100 p-6 rounded-md mb-6">
				<p class="text-3xl font-bold tracking-widest">{unlockCode}</p>
			</div>
			
			<div class="mb-6">
				<h2 class="text-lg font-semibold mb-2">Verbleibende Zeit</h2>
				<p class="text-xl font-bold">{remainingTime}</p>
			</div>
			
			<div class="flex justify-center space-x-4">
				<a href="/map" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
					Karte anzeigen
				</a>
				<a href="/profile" class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
					Meine Buchungen
				</a>
			</div>
		</div>
	{:else if selectedBooking}
		<div class="bg-white p-8 rounded-lg shadow-md">
			<h1 class="text-2xl font-bold mb-6">Fahrzeug entsperren</h1>

			{#if unlockError}
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
					<span class="block sm:inline">{unlockError}</span>
				</div>
			{/if}

			<div class="mb-8">
				<h2 class="text-lg font-semibold mb-2">Buchungsdetails</h2>
				<div class="bg-gray-100 p-4 rounded-md">
					<div class="flex justify-between mb-2">
						<span>Fahrzeug:</span>
						<span class="font-medium">{selectedBooking.vehicleName}</span>
					</div>
					<div class="flex justify-between mb-2">
						<span>Buchungs-ID:</span>
						<span>{selectedBooking.bookingId}</span>
					</div>
					<div class="flex justify-between mb-2">
						<span>Datum:</span>
						<span>{selectedBooking.date}</span>
					</div>
					<div class="flex justify-between mb-2">
						<span>Uhrzeit:</span>
						<span>{selectedBooking.time}</span>
					</div>
					<div class="flex justify-between mb-2">
						<span>Dauer:</span>
						<span>{selectedBooking.duration} Stunden</span>
					</div>
					<div class="flex justify-between font-bold">
						<span>Verbleibende Zeit:</span>
						<span>{remainingTime}</span>
					</div>
				</div>
			</div>

			{#if activeBookings.length > 1}
				<div class="mb-8">
					<h2 class="text-lg font-semibold mb-2">Andere aktive Buchungen</h2>
					<div class="space-y-2">
						{#each activeBookings as booking}
							{#if booking !== selectedBooking}
								<button 
									on:click={() => changeBooking(booking)}
									class="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-gray-50"
								>
									<div class="flex justify-between">
										<span class="font-medium">{booking.vehicleName}</span>
										<span>{booking.date}, {booking.time}</span>
									</div>
								</button>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			<div class="mb-6">
				<p class="text-gray-600 mb-4">
					Klicken Sie auf den Button unten, um das Fahrzeug zu entsperren. Sie erhalten einen Code, mit dem Sie das Fahrzeug starten können.
				</p>
				<p class="text-gray-600 mb-4">
					Bitte stellen Sie sicher, dass Sie sich in der Nähe des Fahrzeugs befinden, bevor Sie es entsperren.
				</p>
			</div>

			<button
				on:click={unlockVehicle}
				class="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors flex justify-center items-center"
				disabled={isUnlocking}
			>
				{#if isUnlocking}
					<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Fahrzeug wird entsperrt...
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M14.5 1A4.5 4.5 0 0019 5.5V18a2 2 0 01-2 2H7a2 2 0 01-2-2V5.5A4.5 4.5 0 019.5 1h5zM13 8V6a1 1 0 10-2 0v2a1 1 0 102 0z" clip-rule="evenodd" />
					</svg>
					Fahrzeug entsperren
				{/if}
			</button>

			<div class="mt-6 text-center">
				<a href="/map" class="text-green-600 hover:underline">Zurück zur Karte</a>
			</div>
		</div>
	{:else}
		<div class="bg-white p-8 rounded-lg shadow-md text-center">
			<h1 class="text-2xl font-bold mb-4">Keine aktiven Buchungen</h1>
			<p class="text-gray-600 mb-6">Sie haben keine aktiven Buchungen. Bitte buchen Sie zuerst ein Fahrzeug.</p>
			<a href="/" class="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
				Zur Fahrzeugauswahl
			</a>
		</div>
	{/if}
</div>