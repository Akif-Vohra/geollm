import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function geoLLM() {
  return {
    map: null,
    layerGroup: null,
    query: '',
    loading: false,
    apiKey: localStorage.getItem('openai_api_key') || 'TEST',
    useBackend: false,

    saveApiKey() {
      localStorage.setItem('openai_api_key', this.apiKey)
    },

    init() {
      this.map = L.map('map', { zoomControl: true }).setView([20, 0], 2)
      const baseLayers = {
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
      baseLayers.Light.addTo(this.map) // default
      L.control.layers(baseLayers).addTo(this.map) // adds a theme switcher
      this.layerGroup = L.layerGroup().addTo(this.map)
    },

    async run() {
      this.clearMap()
      this.loading = true
      try {
        const points = this.useBackend
          ? await this.runViaBackend(this.query)
          : await this.runViaOpenAI(this.query)

        if (!points?.length) {
          this.layerGroup.clearLayers()
          return
        }
        this.plotPoints(points)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    clearMap() {
      this.layerGroup.clearLayers()
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
        this.map.fitBounds(bounds, { padding: [24, 24], maxZoom: 6 })
      }
    },

    async runViaBackend(query) {
      alert('This function is not yet implemented')
      return []
    },

    async runViaOpenAI(query) {
      if (!this.apiKey) throw new Error('OpenAI API key missing.')

      // Ask model for plain JSON list of places
      const prompt = `
        Find modern geographic location names for the locations which can answer user's query.
        Return ONLY JSON with this exact shape:
        {"places":[{"name":"","year":"","context":""}]}
        
        Query: ${query}
            `.trim()

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!res.ok) throw new Error(`OpenAI error: `)
      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content || '{}'

      // Parse JSON from model output (be defensive)
      let places = []
      try {
        const parsed = JSON.parse(content)
        places = parsed?.places || []
      } catch {
        // If model responded with text, try to salvage JSON block
        const match = content.match(/\{[\s\S]*}/)
        if (match) {
          const parsed = JSON.parse(match[0])
          places = parsed?.places || []
        }
      }

      // Client-side geocode names → lat/lng
      const out = []
      for (const p of places.slice(0, 15)) {
        // keep it polite to the geocoder
        const coords = await this.geocodeName(p.name)
        if (coords) {
          out.push({
            name: p.name,
            lat: coords.lat,
            lng: coords.lng,
            year: p.year,
            context: p.context,
          })
          // small delay to be nice to Nominatim
          await this.sleep(300)
        }
      }
      return out
    },

    async geocodeName(name) {
      // Nominatim public endpoint (note: rate limits & usage policy apply)
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(name)}`
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) return null
      const arr = await res.json()
      if (!arr?.length) return null
      return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) }
    },

    sleep(ms) {
      return new Promise((r) => setTimeout(r, ms))
    },
  }
}
