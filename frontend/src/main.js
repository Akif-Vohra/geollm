// Import Bootstrap's JS and CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Import Alpine.js
import Alpine from 'alpinejs'
window.Alpine = Alpine

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'


window.geoLLM = () => ({

    init() {
        this.map = L.map('map', {zoomControl: true}).setView([20, 0], 2)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.map)
        this.layerGroup = L.layerGroup().addTo(this.map)
        // Ensure proper sizing after Alpine finishes layout
        setTimeout(() => this.map.invalidateSize(), 0)
    },

    run() {
        // Placeholder: you’ll replace this with your AJAX.
        // For now, just drop a demo marker so you see the flow.
        this.status = 'Running… (demo marker added). Replace with AJAX later.'
        const demoData = [
          { name: 'Delhi', lat: 28.6139, lng: 77.2090, year: '1526 (Babur conquers Delhi)' },
          { name: 'Agra', lat: 27.1767, lng: 78.0081, year: 'Akbar establishes capital, 1556–1658' },
          { name: 'Fatehpur Sikri', lat: 27.0946, lng: 77.6677, year: 'Akbar’s planned city, 1571–1585' },
          { name: 'Lahore', lat: 31.5497, lng: 74.3436, year: 'Capital under Akbar, 1584–1598' },
          { name: 'Kabul', lat: 34.5553, lng: 69.2075, year: 'Babur’s base before Indian campaign, early 1500s' },
          { name: 'Multan', lat: 30.1575, lng: 71.5249, year: 'Important provincial city, mid-1500s' },
          { name: 'Ajmer', lat: 26.4499, lng: 74.6399, year: 'Jahangir’s court and Khwaja Moinuddin Chishti shrine, 1613' },
          { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, year: 'Annexed by Akbar, 1573' },
          { name: 'Burhanpur', lat: 21.3195, lng: 76.2220, year: 'Southern military base, 1600s' },
          { name: 'Aurangabad', lat: 19.8762, lng: 75.3433, year: 'Capital under Aurangzeb, late 1600s' }
        ];
        demoData.forEach(city => {
            const marker = L.marker([city.lat, city.lng]).addTo(this.layerGroup);
            marker.bindPopup(`<strong>${city.name}</strong><br>${city.year}`);
        });
        this.map.setView([26.5, 78], 5);
    },

    clearMap() {
        this.layerGroup.clearLayers()
        this.status = 'Cleared.'
    }



})

Alpine.start()