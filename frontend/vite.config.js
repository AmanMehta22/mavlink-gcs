export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          map: ['leaflet', 'react-leaflet'],
          charts: ['chart.js', 'react-chartjs-2'] // If you use charts
        }
      }
    }
  },
  // Add for better caching
  esbuild: {
    drop: ['console', 'debugger'] // Remove in production
  }
})