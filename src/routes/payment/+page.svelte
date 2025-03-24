<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { loadStripe } from '@stripe/stripe-js';

	// Typdefinitionen
	interface Booking {
		vehicleId: number;
		vehicleName: string;
		duration: number;
		date: string;
		time: string;
		totalPrice: number;
	}

	interface CompletedBooking extends Booking {
		paymentMethod: string;
		paymentStatus: string;
		bookingId: string;
		timestamp: string;
	}

	// Buchungsdaten
	let booking: Booking | null = null;
	let isLoading = false;
	let paymentSuccess = false;
	let paymentError = '';
	let cardNumber = '';
	let cardExpiry = '';
	let cardCvc = '';
	let cardName = '';

	// Zahlungsmethode
	let paymentMethod: 'card' | 'paypal' = 'card';

	onMount(async () => {
		if (browser) {
			// Überprüfen, ob der Benutzer angemeldet ist
			const token = localStorage.getItem('auth_token');
			if (!token) {
				// Wenn nicht angemeldet, zur Anmeldeseite weiterleiten
				goto('/login?redirect=/payment');
				return;
			}

			// Buchungsdaten aus dem localStorage abrufen
			const bookingData = localStorage.getItem('current_booking');
			if (!bookingData) {
				// Wenn keine Buchungsdaten vorhanden sind, zur Startseite weiterleiten
				goto('/');
				return;
			}

			booking = JSON.parse(bookingData) as Booking;
		}
	});

	async function processPayment() {
		if (!validateForm()) return;

		isLoading = true;
		paymentError = '';

		try {
			// In einer echten Anwendung würde hier die Stripe-Integration erfolgen
			// Für diese Demo simulieren wir eine erfolgreiche Zahlung
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Erfolgreiche Zahlung simulieren
			paymentSuccess = true;

			// Buchungsdaten mit Zahlungsinformationen speichern
			if (booking) {
				const completedBooking: CompletedBooking = {
					...booking,
					paymentMethod,
					paymentStatus: 'completed',
					bookingId: 'BK' + Math.floor(Math.random() * 1000000),
					timestamp: new Date().toISOString()
				};

				// Buchungshistorie im localStorage speichern
				const bookingHistory = JSON.parse(localStorage.getItem('booking_history') || '[]');
				bookingHistory.push(completedBooking);
				localStorage.setItem('booking_history', JSON.stringify(bookingHistory));

				// Aktuelle Buchung aus dem localStorage entfernen
				localStorage.removeItem('current_booking');
			}
		} catch (error) {
			console.error('Zahlungsfehler:', error);
			paymentError = 'Die Zahlung konnte nicht verarbeitet werden. Bitte versuchen Sie es später erneut.';
		} finally {
			isLoading = false;
		}
	}

	function validateForm(): boolean {
		if (paymentMethod === 'card') {
			if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
				paymentError = 'Bitte füllen Sie alle Felder aus.';
				return false;
			}

			// Einfache Validierung der Kartennummer (nur Zahlen und Länge)
			if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
				paymentError = 'Bitte geben Sie eine gültige Kartennummer ein.';
				return false;
			}

			// Einfache Validierung des Ablaufdatums (Format MM/YY)
			if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
				paymentError = 'Bitte geben Sie ein gültiges Ablaufdatum ein (MM/YY).';
				return false;
			}

			// Einfache Validierung der CVC (3 oder 4 Ziffern)
			if (!/^\d{3,4}$/.test(cardCvc)) {
				paymentError = 'Bitte geben Sie eine gültige CVC ein.';
				return false;
			}
		}

		return true;
	}

	// Formatierung der Kartennummer (Gruppen von 4 Ziffern)
	function formatCardNumber(e: Event) {
		const input = e.target as HTMLInputElement;
		let value = input.value.replace(/\D/g, '');
		let formattedValue = '';
		
		for (let i = 0; i < value.length; i++) {
			if (i > 0 && i % 4 === 0) {
				formattedValue += ' ';
			}
			formattedValue += value[i];
		}
		
		cardNumber = formattedValue;
	}

	// Formatierung des Ablaufdatums (MM/YY)
	function formatCardExpiry(e: Event) {
		const input = e.target as HTMLInputElement;
		let value = input.value.replace(/\D/g, '');
		
		if (value.length > 2) {
			cardExpiry = value.substring(0, 2) + '/' + value.substring(2, 4);
		} else {
			cardExpiry = value;
		}
	}
</script>

<div class="max-w-3xl mx-auto">
	{#if paymentSuccess}
		<div class="bg-white p-8 rounded-lg shadow-md text-center">
			<div class="mb-6 text-green-600">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold mb-4">Zahlung erfolgreich!</h1>
			<p class="text-gray-600 mb-6">Ihre Buchung wurde erfolgreich abgeschlossen. Sie können das Fahrzeug nun entsperren und nutzen.</p>
			<div class="flex justify-center space-x-4">
				<a href="/profile" class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
					Meine Buchungen
				</a>
				<a href="/unlock" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
					Fahrzeug entsperren
				</a>
			</div>
		</div>
	{:else if booking}
		<div class="bg-white p-8 rounded-lg shadow-md">
			<h1 class="text-2xl font-bold mb-6">Zahlung</h1>

			{#if paymentError}
				<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
					<span class="block sm:inline">{paymentError}</span>
				</div>
			{/if}

			<div class="mb-8">
				<h2 class="text-lg font-semibold mb-2">Buchungsübersicht</h2>
				<div class="bg-gray-100 p-4 rounded-md">
					<div class="flex justify-between mb-2">
						<span>Fahrzeug:</span>
						<span class="font-medium">{booking.vehicleName}</span>
					</div>
					<div class="flex justify-between mb-2">
						<span>Datum:</span>
						<span>{booking.date}</span>
					</div>
					<div class="flex justify-between mb-2">
						<span>Uhrzeit:</span>
						<span>{booking.time}</span>
					</div>
					<div class="flex justify-between mb-2">
						<span>Dauer:</span>
						<span>{booking.duration} Stunden</span>
					</div>
					<div class="flex justify-between font-bold text-lg">
						<span>Gesamtpreis:</span>
						<span>{booking.totalPrice} ฿</span>
					</div>
				</div>
			</div>

			<div class="mb-6">
				<h2 class="text-lg font-semibold mb-2">Zahlungsmethode</h2>
				<div class="flex space-x-4 mb-4">
					<button 
						class={`flex-1 py-2 px-4 border rounded-md ${paymentMethod === 'card' ? 'bg-green-50 border-green-500' : 'border-gray-300'}`}
						on:click={() => paymentMethod = 'card'}
					>
						<div class="flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
								<path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
								<path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
							</svg>
							Kreditkarte
						</div>
					</button>
					<button 
						class={`flex-1 py-2 px-4 border rounded-md ${paymentMethod === 'paypal' ? 'bg-green-50 border-green-500' : 'border-gray-300'}`}
						on:click={() => paymentMethod = 'paypal'}
					>
						<div class="flex items-center justify-center text-blue-700">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
								<path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 6.082-8.558 6.082h-2.19c-1.57 0-2.908 1.147-3.153 2.705l-1.124 7.13c-.024.172.011.343.099.49a.639.639 0 0 0 .534.292h4.604c.523 0 .968-.383 1.05-.9l.89-5.67c.083-.519.526-.9 1.05-.9h.7c4.298 0 7.664-1.747 8.646-6.798.286-1.476.372-2.824-.9-4.285v.011z"/>
							</svg>
							PayPal
						</div>
					</button>
				</div>

				{#if paymentMethod === 'card'}
					<div class="space-y-4">
						<div>
							<label for="card-name" class="block text-gray-700 mb-1">Name auf der Karte</label>
							<input
								type="text"
								id="card-name"
								bind:value={cardName}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
								placeholder="Max Mustermann"
							/>
						</div>
						<div>
							<label for="card-number" class="block text-gray-700 mb-1">Kartennummer</label>
							<input
								type="text"
								id="card-number"
								bind:value={cardNumber}
								on:input={formatCardNumber}
								maxlength="19"
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
								placeholder="4242 4242 4242 4242"
							/>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="card-expiry" class="block text-gray-700 mb-1">Ablaufdatum</label>
								<input
									type="text"
									id="card-expiry"
									bind:value={cardExpiry}
									on:input={formatCardExpiry}
									maxlength="5"
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
									placeholder="MM/YY"
								/>
							</div>
							<div>
								<label for="card-cvc" class="block text-gray-700 mb-1">CVC</label>
								<input
									type="text"
									id="card-cvc"
									bind:value={cardCvc}
									maxlength="4"
									class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
									placeholder="123"
								/>
							</div>
						</div>
					</div>
				{:else if paymentMethod === 'paypal'}
					<div class="text-center p-6 border border-gray-200 rounded-md">
						<p class="text-gray-600 mb-4">Sie werden zur PayPal-Website weitergeleitet, um die Zahlung abzuschließen.</p>
						<img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" class="h-12 mx-auto" />
					</div>
				{/if}
			</div>

			<button
				on:click={processPayment}
				class="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors flex justify-center items-center"
				disabled={isLoading}
			>
				{#if isLoading}
					<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Zahlung wird verarbeitet...
				{:else}
					{booking.totalPrice} ฿ bezahlen
				{/if}
			</button>

			<div class="mt-6 text-center">
				<a href="/" class="text-green-600 hover:underline">Abbrechen und zur Startseite zurückkehren</a>
			</div>
		</div>
	{:else}
		<div class="bg-white p-8 rounded-lg shadow-md text-center">
			<h1 class="text-2xl font-bold mb-4">Keine Buchungsdaten gefunden</h1>
			<p class="text-gray-600 mb-6">Es wurden keine Buchungsdaten gefunden. Bitte wählen Sie zuerst ein Fahrzeug aus.</p>
			<a href="/" class="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
				Zur Fahrzeugauswahl
			</a>
		</div>
	{/if}
</div>