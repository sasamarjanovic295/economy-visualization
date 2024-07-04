import json

def load_json(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

def merge_data(gdp_data, gdppc_data, inflation_data):
    merged_data = {}

    for record in gdp_data.get('Root', {}).get('data', {}).get('record', []):
        country = record['field'][0]
        year = record['field'][2]
        value = record['field'][3]
        if country not in merged_data:
            merged_data[country] = {}
        if year not in merged_data[country]:
            merged_data[country][year] = {}
        merged_data[country][year]['gdp'] = value

    for record in gdppc_data.get('Root', {}).get('data', {}).get('record', []):
        country = record['field'][0]
        year = record['field'][2]
        value = record['field'][3]
        if country not in merged_data:
            merged_data[country] = {}
        if year not in merged_data[country]:
            merged_data[country][year] = {}
        merged_data[country][year]['gdppc'] = value

    for record in inflation_data.get('Root', {}).get('data', {}).get('record', []):
        country = record['field'][0]
        year = record['field'][2]
        value = record['field'][3]
        if country not in merged_data:
            merged_data[country] = {}
        if year not in merged_data[country]:
            merged_data[country][year] = {}
        merged_data[country][year]['inflation'] = value

    return merged_data

gdp_data = load_json('gdp.json')
gdppc_data = load_json('gdppc.json')
inflation_data = load_json('inflation.json')

merged_data = merge_data(gdp_data, gdppc_data, inflation_data)

output_file_path = 'merged_data.json'
with open(output_file_path, 'w') as output_file:
    json.dump(merged_data, output_file, indent=4)