import logging
import time

from geopy.exc import GeocoderServiceError
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="geo_injector")
logger = logging.getLogger("uvicorn")


def get_geo_coordinates(places: dict):
    """Attach lat/lng to each place, dropping the ones that don't resolve.

    A place without coordinates crashes the frontend's L.marker(), so an
    unresolved name is removed rather than returned half-populated. One
    failing lookup must not lose the whole result set either, so geocoder
    errors are logged and skipped.
    """
    located = []
    for p in places.get("places", []):
        name = p.get("name")
        try:
            location = geolocator.geocode(name, timeout=10)
        except GeocoderServiceError as exc:
            logger.warning("Geocode failed for %r: %s", name, exc)
            location = None
        if location:
            p["lat"] = location.latitude
            p["lng"] = location.longitude
            located.append(p)
        else:
            logger.info("No geocode result for %r, dropping it", name)
        time.sleep(0.5)  # polite delay for Nominatim
    places["places"] = located
    return places
