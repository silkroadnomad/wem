<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import 'leaflet/dist/leaflet.css';
	import type { Map as LeafletMap } from 'leaflet';
	import * as L from 'leaflet';

	// Typdefinitionen
	type VehicleType = 'Scooter' | 'Bike' | 'Moped';
	
	interface Location {
		lat: number;
		lng: number;
	}
	
	interface Vehicle {
		id: number;
		name: string;
		type: VehicleType;
		batteryLevel: number;
		range: number;
		pricePerMinute: number;
		image: string;
		location: Location;
	}
	
	interface IconOptions {
		iconUrl: string;
		shadowUrl: string;
		iconSize: number[];
		iconAnchor: number[];
		popupAnchor: number[];
		shadowSize: number[];
	}

	// Beispieldaten für Elektrofahrzeuge
	const vehicles: Vehicle[] = [
		{
			id: 1,
			name: 'E-Scooter Model X',
			type: 'Scooter',
			batteryLevel: 85,
			range: 35,
			pricePerMinute: 2.5,
			image: 'https://placehold.co/300x200/4CAF50/FFFFFF?text=E-Scooter',
			location: { lat: 13.7563, lng: 100.5018 }
		},
		{
			id: 2,
			name: 'E-Bike City',
			type: 'Bike',
			batteryLevel: 92,
			range: 50,
			pricePerMinute: 3.0,
			image: 'https://placehold.co/300x200/2196F3/FFFFFF?text=E-Bike',
			location: { lat: 13.7563, lng: 100.5028 }
		},
		{
			id: 3,
			name: 'E-Moped Cruiser',
			type: 'Moped',
			batteryLevel: 78,
			range: 60,
			pricePerMinute: 3.5,
			image: 'https://placehold.co/300x200/FF9800/FFFFFF?text=E-Moped',
			location: { lat: 13.7553, lng: 100.5018 }
		},
		{
			id: 4,
			name: 'E-Scooter Lite',
			type: 'Scooter',
			batteryLevel: 65,
			range: 25,
			pricePerMinute: 2.0,
			image: 'https://placehold.co/300x200/4CAF50/FFFFFF?text=E-Scooter+Lite',
			location: { lat: 13.7573, lng: 100.5008 }
		}
	];

	// Zentrum der Karte (Bangkok)
	const center: Location = { lat: 13.7563, lng: 100.5018 };
	const zoom = 15;

	// Benutzerdefinierte Icons für verschiedene Fahrzeugtypen
	const icons: Record<VehicleType, IconOptions> = {
		Scooter: {
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		},
		Bike: {
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		},
		Moped: {
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		}
	};

	// Pickup-Station
	const pickupStation = {
		name: 'Hauptstation',
		location: { lat: 13.7563, lng: 100.5018 },
		icon: {
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
			shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41]
		}
	};

	// Rückgabebereich (20km Radius)
	let returnRadius = 20000; // 20km in Metern
	let map: LeafletMap | null = null;
	let returnCircle: L.Circle | null = null;
	let mapContainer: HTMLElement;

	// Standort des Benutzers
	let userLocation: Location | null = null;
	let isLocating = false;

	// Benutzerstandort ermitteln
	function getUserLocation(): void {
		if (!browser) return;
		
		isLocating = true;
		
		navigator.geolocation.getCurrentPosition(
			(position) => {
				userLocation = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				
				// Karte auf Benutzerstandort zentrieren
				if (map) {
					map.setView([userLocation.lat, userLocation.lng], zoom);
				}
				
				isLocating = false;
			},
			(error) => {
				console.error('Fehler bei der Standortermittlung:', error);
				isLocating = false;
				alert('Ihr Standort konnte nicht ermittelt werden. Bitte überprüfen Sie Ihre Standorteinstellungen.');
			}
		);
	}

	// Karte initialisieren
	onMount(() => {
		if (!browser) return;

		// Leaflet-CSS laden
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
		document.head.appendChild(link);
		
		// Karte initialisieren
		map = L.map(mapContainer).setView([center.lat, center.lng], zoom);
		
		// Kartenlayer hinzufügen
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
		
		// Rückgabebereich als Kreis darstellen
		returnCircle = L.circle([center.lat, center.lng], {
			color: 'rgba(76, 175, 80, 0.3)',
			fillColor: 'rgba(76, 175, 80, 0.1)',
			fillOpacity: 0.5,
			radius: returnRadius
		}).addTo(map);
		
		// Pickup-Station Marker hinzufügen
		const stationIcon = L.icon({
			iconUrl: pickupStation.icon.iconUrl,
			shadowUrl: pickupStation.icon.shadowUrl,
			iconSize: pickupStation.icon.iconSize,
			iconAnchor: pickupStation.icon.iconAnchor,
			popupAnchor: pickupStation.icon.popupAnchor,
			shadowSize: pickupStation.icon.shadowSize
		});
		
		L.marker([pickupStation.location.lat, pickupStation.location.lng], { icon: stationIcon })
			.bindPopup(`
				<div class="text-center">
					<h3 class="font-bold">${pickupStation.name}</h3>
					<p>Hauptabholstation für alle Fahrzeuge</p>
				</div>
			`)
			.addTo(map);
		
		// Fahrzeug-Marker hinzufügen
		vehicles.forEach(vehicle => {
			const vehicleIcon = L.icon({
				iconUrl: icons[vehicle.type].iconUrl,
				shadowUrl: icons[vehicle.type].shadowUrl,
				iconSize: icons[vehicle.type].iconSize,
				iconAnchor: icons[vehicle.type].iconAnchor,
				popupAnchor: icons[vehicle.type].popupAnchor,
				shadowSize: icons[vehicle.type].shadowSize
			});
			
			L.marker([vehicle.location.lat, vehicle.location.lng], { icon: vehicleIcon })
				.bindPopup(`
					<div class="text-center">
						<h3 class="font-bold">${vehicle.name}</h3>
						<p>Akku: ${vehicle.batteryLevel}% | Reichweite: ${vehicle.range} km</p>
						<p class="mb-2">${vehicle.pricePerMinute} ฿/min</p>
						<a href="/vehicle/${vehicle.id}" class="inline-block bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
							Details
						</a>
					</div>
				`)
				.addTo(map);
		});
		
		// Cleanup beim Unmount
		return () => {
			if (map) {
				map.remove();
			}
		};
	});
</script>

<svelte:head>
	<!-- Fix für Leaflet-Icons in Svelte -->
	<style>
		.leaflet-default-icon-path {
			background-image: url(https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png);
		}
		.leaflet-default-shadow-path {
			background-image: url(https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png);
		}
	</style>
</svelte:head>

<div class="space-y-6">
	<div class="text-center">
		<h1 class="text-3xl font-bold mb-2">Fahrzeuge in der Nähe</h1>
		<p class="text-gray-600 mb-6">Finden Sie verfügbare Elektrofahrzeuge in Bangkok</p>
	</div>

	<!-- Standortbutton -->
	<div class="flex justify-center mb-4">
		<button
			on:click={getUserLocation}
			class="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
			disabled={isLocating}
		>
			{#if isLocating}
				<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				Standort wird ermittelt...
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
				</svg>
				Meinen Standort verwenden
			{/if}
		</button>
	</div>

	<!-- Kartenlegende -->
	<div class="bg-white p-4 rounded-md shadow-md mb-4">
		<h3 class="font-semibold mb-2">Legende:</h3>
		<div class="grid grid-cols-2 gap-2">
			<div class="flex items-center">
				<div class="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
				<span>Abholstation</span>
			</div>
			<div class="flex items-center">
				<div class="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
				<span>E-Scooter</span>
			</div>
			<div class="flex items-center">
				<div class="w-4 h-4 bg-blue-600 rounded-full mr-2"></div>
				<span>E-Bike</span>
			</div>
			<div class="flex items-center">
				<div class="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
				<span>E-Moped</span>
			</div>
		</div>
		<div class="mt-2 flex items-center">
			<div class="w-4 h-4 border-2 border-green-600 bg-green-100 bg-opacity-30 rounded-full mr-2"></div>
			<span>Rückgabebereich (20km Radius)</span>
		</div>
	</div>

	<!-- Karte -->
	<div class="h-[70vh] z-0 rounded-lg overflow-hidden shadow-lg" bind:this={mapContainer}>
		<!-- Die Karte wird in onMount initialisiert -->
	</div>

	<div class="text-center mt-4">
		<p class="text-gray-600 mb-2">Fahrzeuge können an der Hauptstation abgeholt und innerhalb des 20km-Radius zurückgegeben werden.</p>
		<a href="/" class="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
			Zurück zur Übersicht
		</a>
	</div>
</div>