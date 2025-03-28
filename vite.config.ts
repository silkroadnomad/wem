import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.png', 'robots.txt'],
			manifest: {
				name: 'World Electric Mobility',
				short_name: 'WEM',
				description: 'Buchen, entsperren und bezahlen Sie Elektrofahrzeuge in Thailand',
				theme_color: '#4CAF50',
				background_color: '#ffffff',
				display: 'standalone',
				icons: [
					{
						src: 'pwa-192x192.png.svg',
						sizes: '192x192',
						type: 'image/svg+xml'
					},
					{
						src: 'pwa-512x512.png.svg',
						sizes: '512x512',
						type: 'image/svg+xml'
					},
					{
						src: 'pwa-512x512.png.svg',
						sizes: '512x512',
						type: 'image/svg+xml',
						purpose: 'maskable'
					}
				]
			},
			// Änderung der Strategie von 'injectManifest' zu 'generateSW'
			// damit der Service Worker automatisch generiert wird
			strategies: 'generateSW',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/placehold\.co\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'image-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Tage
							}
						}
					}
				]
			},
			devOptions: {
				enabled: true,
				type: 'module'
			}
		})
	]
});
