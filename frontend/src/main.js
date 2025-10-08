// Import Bootstrap's JS and CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import * as bootstrap from 'bootstrap'

// Import Alpine.js
import Alpine from 'alpinejs'
window.Alpine = Alpine

import geoLLM from './geollm'
window.geoLLM = () => geoLLM()

// Initialize all tooltips on page load.
document.addEventListener('DOMContentLoaded', () => {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el))
})

Alpine.start()
