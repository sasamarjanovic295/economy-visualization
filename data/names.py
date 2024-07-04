import json
import pycountry

def is_valid_country_name(country_name):
    try:
        pycountry.countries.lookup(country_name)
        return True
    except LookupError:
        return False

def find_unique_countries(data):
    unique_countries = set()
    non_valid_country_names = set()
    records = data.get('Root', {}).get('data', {}).get('record', [])
    i = 0
    for record in records:
        country_name = record.get('field', [None])[0]
        if country_name:
            if is_valid_country_name(country_name):
                unique_countries.add(country_name)
            else:
                non_valid_country_names.add(country_name)
    return list(unique_countries), list(non_valid_country_names)

def load_json(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

file_path = 'gdp.json'
data = load_json(file_path)

unique_countries, non_valid_country_names = find_unique_countries(data)
print("Non Valid Country Names:", sorted(non_valid_country_names))
print()
print("Unique Countries:", sorted(unique_countries))

def find_countries_in_topology(data):
    countries = set()
    geometries = data.get('objects', {}).get('countries', {}).get('geometries', [])
    for geometry in geometries:
        country_name = geometry.get('properties', {}).get('name')
        if country_name:
            countries.add(country_name)
    return countries

def find_countries_in_records(data):
    countries = set()
    records = data.get('Root', {}).get('data', {}).get('record', [])
    for record in records:
        country_name = record.get('field', [None])[0]
        if country_name:
            countries.add(country_name)
    return countries

def find_missing_countries(topology_countries, record_countries):
    missing_countries = topology_countries - record_countries
    return missing_countries

topology_file_path = 'countries-50m.json'
records_file_path = 'gdp.json'
topology_data = load_json(topology_file_path)
records_data = load_json(records_file_path)

topology_countries = find_countries_in_topology(topology_data)
record_countries = find_countries_in_records(records_data)

missing_countries = find_missing_countries(topology_countries, record_countries)
print()
print(f"missing country names in {records_file_path}:", sorted(list(missing_countries)))