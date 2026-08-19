const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { toPng } from 'html-to-image'

export default function geoLLM() {
  return {
    map: null,
    layerGroup: null,
    query: '',
    graphType: 'interactive_point',
    loading: false,
    models: [],
    model: '',

    async loadModels() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/models`)
        if (!res.ok) throw new Error(`models request failed: ${res.status}`)
        this.models = await res.json()
        if (this.models.length && !this.models.some((m) => m.id === this.model)) {
          this.model = this.models[0].id
        }
      } catch (error) {
        console.error('Failed to load models:', error)
      }
    },

    init() {
      this.loadModels()
      this.map = L.map('map', { zoomControl: true }).setView([20, 0], 2)
      const baseLayers = {
        Terrain: L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
          {
            maxNativeZoom: 13,
            maxZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
          },
        ),
        Light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap, © CartoDB',
        }),
        Dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap, © CartoDB',
        }),
        Esri_WorldImagery: L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution:
              'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          },
        ),
      }
      baseLayers.Terrain.addTo(this.map) // default
      L.control.layers(baseLayers).addTo(this.map) // adds a theme switcher
      this.layerGroup = L.layerGroup().addTo(this.map)
    },

    resetMapTitle(title) {
      title = title || ''
      document.getElementById('map-title').innerText = `${title}`
    },

    async run() {
      this.clearMap()
      this.loading = true
      try {
        const points = await this.runViaBackend()

        if (!points?.length) {
          this.layerGroup.clearLayers()
          return
        }
        this.plotPoints(points)
        this.resetMapTitle(this.query)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    clearMap() {
      this.layerGroup.clearLayers()
      this.resetMapTitle()
    },

    plotPoints(points) {
      this.layerGroup.clearLayers()
      points.forEach((pt) => {
        const m = L.marker([pt.lat, pt.lng]).addTo(this.layerGroup)
        const ctx = pt.context ? `<br/><em>${pt.context}</em>` : ''
        const yr = pt.year ? `<br/>Year: ${pt.year}` : ''
        m.bindPopup(`<strong>${pt.name}</strong>${yr}${ctx}`)
      })
      if (points.length > 0) {
        // fit bounds or center on first
        const latlngs = points.map((p) => [p.lat, p.lng])
        const bounds = L.latLngBounds(latlngs)
        this.map.fitBounds(bounds, { padding: [24, 24], maxZoom: 6, animate: false })
      }
    },

    async runViaBackend() {
      try {
        const endpoint = `${BACKEND_URL}/api/generate_geo_data?query=${encodeURIComponent(this.query)}&model_name=${this.model}`
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        })

        if (!res.ok) {
          console.error('Backend request failed:', res.status, res.statusText)
          throw new Error(`Backend error ${res.status}`)
        }

        const data = (await res.json()).data

        if (!data || !Array.isArray(data.places)) {
          console.warn('Unexpected backend response:', data)
          return []
        }

        return data.places
      } catch (error) {
        console.error('Error in runViaBackend:', error)
        return []
      }
    },

    async exportImage() {
      const el = document.getElementById('map-container')
      if (!el) return

      // optional: temporarily hide Leaflet controls/attribution
      const controls = el.querySelector('.leaflet-control-container')
      if (controls) controls.style.opacity = '0'

      try {
        const dataUrl = await toPng(el, {
          cacheBust: true,
          pixelRatio: 2, // higher-res export
          backgroundColor: '#ffffff',
        })
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `geollm-map-${Date.now()}.png`
        a.click()
      } finally {
        if (controls) controls.style.opacity = ''
      }
    },
  }
}
