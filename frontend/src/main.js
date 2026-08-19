import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './theme.css'

import Alpine from 'alpinejs'
window.Alpine = Alpine

import geoLLM from './geollm'
window.geoLLM = () => geoLLM()

Alpine.start()
