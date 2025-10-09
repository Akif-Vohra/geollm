import time

from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="geo_injector")


def get_geo_coordinates(places: dict):
    for p in places.get("places", []):
        location = geolocator.geocode(p.get("name"))
        if location:
            p["lat"] = location.latitude
            p["lng"] = location.longitude
        time.sleep(0.5)  # polite delay for Nominatim
    return places
