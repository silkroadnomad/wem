<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// Fahrzeug-ID aus der URL
	const vehicleId = $page.params.id;
	
	// Beispieldaten für Elektrofahrzeuge (in einer echten App würden diese von einer API kommen)
	const vehiclesData = [
		{
			id: 1,
			name: 'E-Scooter Model X',
			type: 'Scooter',
			batteryLevel: 85,
			range: 35,
			pricePerMinute: 2.5,
			pricePerHour: 120,
			image: 'https://placehold.co/600x400/4CAF50/FFFFFF?text=E-Scooter',
			description: 'Unser leistungsstärkster E-Scooter mit einer Höchstgeschwindigkeit von 25 km/h und einer Reichweite von bis zu 35 km. Perfekt für kurze bis mittlere Strecken in der Stadt.',
			features: ['Höchstgeschwindigkeit: 25 km/h', 'Gewicht: 15 kg', 'Beleuchtung: LED vorne und hinten', 'Bremsen: Elektronisch + Fußbremse'],
			location: { lat: 13.7563, lng: 100.5018 }
		},
		{
			id: 2,
			name: 'E-Bike City',
			type: 'Bike',
			batteryLevel: 92,
			range: 50,
			pricePerMinute: 3.0,
			pricePerHour: 150,
			image: 'https://placehold.co/600x400/2196F3/FFFFFF?text=E-Bike',
			description: 'Komfortables E-Bike für die Stadt mit einer Reichweite von bis zu 50 km. Mit 3 Unterstützungsstufen und bequemem Sattel für längere Fahrten.',
			features: ['Höchstgeschwindigkeit: 25 km/h', 'Gewicht: 22 kg', 'Gangschaltung: 7-Gang Shimano', 'Bremsen: Hydraulische Scheibenbremsen'],
			location: { lat: 13.7563, lng: 100.5028 }
		},
		{
			id: 3,
			name: 'E-Moped Cruiser',
			type: 'Moped',
			batteryLevel: 78,
			range: 60,
			pricePerMinute: 3.5,
			pricePerHour: 180,
			image: 'https://placehold.co/600x400/FF9800/FFFFFF?text=E-Moped',
			description: 'Stylisches E-Moped mit bequemer Sitzposition und großer Reichweite. Ideal für längere Strecken und Pendler.',
			features: ['Höchstgeschwindigkeit: 45 km/h', 'Gewicht: 65 kg', 'Sitzplätze: 2', 'Stauraum unter dem Sitz'],
			location: { lat: 13.7553, lng: 100.5018 }
		},
		{
			id: 4,
			name: 'E-Scooter Lite',
			type: 'Scooter',
			batteryLevel: 65,
			range: 25,
			pricePerMinute: 2.0,
			pricePerHour: 100,
			image: 'https://placehold.co/600x400/4CAF50/FFFFFF?text=E-Scooter+Lite',
			description: 'Leichter und kompakter E-Scooter, perfekt für kurze Strecken. Einfach zu bedienen und zu transportieren.',
			features: ['Höchstgeschwindigkeit: 20 km/h', 'Gewicht: 12 kg', 'Faltbar', 'Beleuchtung: LED vorne'],
			location: { lat: 13.7573, lng: 100.5008 }
		}
	];

	// Fahrzeugdaten basierend auf der ID finden
	let vehicle = vehiclesData.find(v => v.id === parseInt(vehicleId));
	
	// Buchungsdaten
	let bookingDuration = 1; // Stunden
	let bookingDate = '';
	let bookingTime = '';
	let isLoggedIn = false;

	onMount(() => {
		if (browser) {
			// Aktuelles Datum und Zeit für die Buchung vorausfüllen
			const now = new Date();
			const tomorrow = new Date(now);
			tomorrow.setDate(tomorrow.getDate() + 1);
			
			// Datum im Format YYYY-MM-DD
			bookingDate = tomorrow.toISOString().split('T')[0];
			
			// Zeit im Format HH:MM, auf die nächste volle Stunde gerundet
			const hours = now.getHours();
			bookingTime = `${hours < 10 ? '0' + hours : hours}:00`;
			
			// Überprüfen, ob der Benutzer angemeldet ist
			isLoggedIn = !!localStorage.getItem('auth_token');
		}
	});

	// Gesamtpreis berechnen
	$: totalPrice = vehicle ? vehicle.pricePerHour * bookingDuration : 0;

	// Funktion zum Starten des Buchungsprozesses
	function startBooking() {
		if (!isLoggedIn) {
			// Wenn nicht angemeldet, zur Anmeldeseite weiterleiten
			window.location.href = `/login?redirect=/vehicle/${vehicleId}`;
			return;
		}
		
		// Buchungsdaten in localStorage speichern
		const bookingData = {
			vehicleId: vehicle?.id,
			vehicleName: vehicle?.name,
			duration: bookingDuration,
			date: bookingDate,
			time: bookingTime,
			totalPrice: totalPrice
		};
		
		localStorage.setItem('current_booking', JSON.stringify(bookingData));
		
		// Zur Zahlungsseite weiterleiten
		window.location.href = '/payment';
	}
</script>

{#if vehicle}
	<div class="max-w-4xl mx-auto">
		<div class="mb-6">
			<a href="/" class="text-green-600 hover:underline flex items-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
				</svg>
				Zurück zur Übersicht
			</a>
		</div>

		<div class="bg-white rounded-lg shadow-lg overflow-hidden">
			<img src={vehicle.image} alt={vehicle.name} class="w-full h-64 object-cover" />
			
			<div class="p-6">
				<div class="flex justify-between items-start mb-4">
					<div>
						<h1 class="text-3xl font-bold">{vehicle.name}</h1>
						<p class="text-gray-600">Typ: {vehicle.type}</p>
					</div>
					<div class="text-right">
						<p class="text-2xl font-bold text-green-600">{vehicle.pricePerHour} ฿/Stunde</p>
						<p class="text-gray-600">{vehicle.pricePerMinute} ฿/Minute</p>
					</div>
				</div>
				
				<div class="mb-6">
					<div class="flex items-center mb-2">
						<span class="text-gray-700 mr-2">Akku:</span>
						<div class="w-full bg-gray-200 rounded-full h-2.5">
							<div class="bg-green-600 h-2.5 rounded-full" style="width: {vehicle.batteryLevel}%"></div>
						</div>
						<span class="ml-2 text-gray-700">{vehicle.batteryLevel}%</span>
					</div>
					<p class="text-gray-700">Reichweite: ca. {vehicle.range} km</p>
				</div>
				
				<div class="mb-6">
					<h2 class="text-xl font-semibold mb-2">Beschreibung</h2>
					<p class="text-gray-700">{vehicle.description}</p>
				</div>
				
				<div class="mb-8">
					<h2 class="text-xl font-semibold mb-2">Ausstattung</h2>
					<ul class="list-disc pl-5 text-gray-700">
						{#each vehicle.features as feature}
							<li>{feature}</li>
						{/each}
					</ul>
				</div>
				
				<div class="border-t border-gray-200 pt-6">
					<h2 class="text-xl font-semibold mb-4">Fahrzeug buchen</h2>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<label for="booking-date" class="block text-gray-700 mb-1">Datum</label>
							<input 
								type="date" 
								id="booking-date" 
								bind:value={bookingDate}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
							>
						</div>
						<div>
							<label for="booking-time" class="block text-gray-700 mb-1">Uhrzeit</label>
							<input 
								type="time" 
								id="booking-time" 
								bind:value={bookingTime}
								class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
							>
						</div>
					</div>
					
					<div class="mb-6">
						<label for="booking-duration" class="block text-gray-700 mb-1">Dauer (Stunden)</label>
						<input 
							type="range" 
							id="booking-duration" 
							bind:value={bookingDuration}
							min="1" 
							max="24" 
							step="1"
							class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
						>
						<div class="flex justify-between text-gray-600 text-sm mt-1">
							<span>1h</span>
							<span>{bookingDuration}h</span>
							<span>24h</span>
						</div>
					</div>
					
					<div class="bg-gray-100 p-4 rounded-md mb-6">
						<div class="flex justify-between mb-2">
							<span>Preis pro Stunde:</span>
							<span>{vehicle.pricePerHour} ฿</span>
						</div>
						<div class="flex justify-between mb-2">
							<span>Dauer:</span>
							<span>{bookingDuration} Stunden</span>
						</div>
						<div class="flex justify-between font-bold text-lg">
							<span>Gesamtpreis:</span>
							<span>{totalPrice} ฿</span>
						</div>
					</div>
					
					<button 
						on:click={startBooking}
						class="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
					>
						{isLoggedIn ? 'Jetzt buchen' : 'Anmelden und buchen'}
					</button>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="text-center py-12">
		<h1 class="text-2xl font-bold mb-4">Fahrzeug nicht gefunden</h1>
		<p class="text-gray-600 mb-6">Das gesuchte Fahrzeug konnte nicht gefunden werden.</p>
		<a href="/" class="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
			Zurück zur Übersicht
		</a>
	</div>
{/if}