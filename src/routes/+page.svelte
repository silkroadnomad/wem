<script lang="ts">
	import { onMount } from 'svelte';

	// Beispieldaten für Elektrofahrzeuge
	let vehicles = [
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

	let filteredVehicles = [...vehicles];
	let selectedType = 'all';

	function filterVehicles(type: string) {
		selectedType = type;
		if (type === 'all') {
			filteredVehicles = [...vehicles];
		} else {
			filteredVehicles = vehicles.filter(vehicle => vehicle.type.toLowerCase() === type.toLowerCase());
		}
	}

	onMount(() => {
		// Hier könnten wir Fahrzeugdaten von einer API laden
		console.log('Komponente wurde geladen');
	});
</script>

<div class="space-y-6">
	<div class="text-center">
		<h1 class="text-3xl font-bold mb-2">Elektrofahrzeuge in Thailand</h1>
		<p class="text-gray-600 mb-6">Buchen, entsperren und bezahlen Sie Elektrofahrzeuge in Thailand</p>
	</div>

	<!-- Filter-Optionen -->
	<div class="flex justify-center space-x-4 mb-8">
		<button
			class="px-4 py-2 rounded-full {selectedType === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200'}"
			onclick={() => filterVehicles('all')}
		>
			Alle
		</button>
		<button
			class="px-4 py-2 rounded-full {selectedType === 'scooter' ? 'bg-green-600 text-white' : 'bg-gray-200'}"
			onclick={() => filterVehicles('scooter')}
		>
			E-Scooter
		</button>
		<button
			class="px-4 py-2 rounded-full {selectedType === 'bike' ? 'bg-green-600 text-white' : 'bg-gray-200'}"
			onclick={() => filterVehicles('bike')}
		>
			E-Bikes
		</button>
		<button
			class="px-4 py-2 rounded-full {selectedType === 'moped' ? 'bg-green-600 text-white' : 'bg-gray-200'}"
			onclick={() => filterVehicles('moped')}
		>
			E-Mopeds
		</button>
	</div>

	<!-- Fahrzeugliste -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each filteredVehicles as vehicle}
			<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
				<img src={vehicle.image} alt={vehicle.name} class="w-full h-48 object-cover" />
				<div class="p-4">
					<h3 class="text-xl font-semibold mb-2">{vehicle.name}</h3>
					<div class="flex justify-between mb-2">
						<span class="text-gray-600">Typ: {vehicle.type}</span>
						<span class="text-gray-600">{vehicle.pricePerMinute} ฿/min</span>
					</div>
					<div class="mb-3">
						<div class="flex items-center mb-1">
							<span class="text-gray-600 mr-2">Akku:</span>
							<div class="w-full bg-gray-200 rounded-full h-2.5">
								<div class="bg-green-600 h-2.5 rounded-full" style="width: {vehicle.batteryLevel}%"></div>
							</div>
							<span class="ml-2 text-gray-600">{vehicle.batteryLevel}%</span>
						</div>
						<p class="text-gray-600">Reichweite: ca. {vehicle.range} km</p>
					</div>
					<a href="/vehicle/{vehicle.id}" class="block text-center bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors">
						Details anzeigen
					</a>
				</div>
			</div>
		{/each}
	</div>

	<!-- Karte anzeigen Button -->
	<div class="text-center mt-8">
		<a href="/map" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
			Fahrzeuge auf der Karte anzeigen
		</a>
	</div>
</div>
