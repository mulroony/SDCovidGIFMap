#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import matplotlib.pyplot as plt
import geopandas as gpd

import requests

# For storing png files in memory
import io

# For generating GIF
import imageio

###########################################################
########## Globals....
###########################################################
# Top value to use in scale, 0 = mean + 2 std devs
max_value = 0

# Bottom value to use in scale, should be zero
min_value = 0

# SANDAG API Link
sd_api = "https://opendata.arcgis.com/datasets/854d7e48e3dc451aa93b9daf82789089_0.geojson"

# Zipcode shape file link
zip_shape_full = "https://github.com/mulroony/State-zip-code-GeoJSON/raw/master/ca_california_zip_codes_geo.min.json"

# File to write gif to. Leave blank to just render inline
# Probably won't work in this script...
gif_path = "/tmp/SD_Covid_cases.gif"
#gif_path = ""

# Select ColorMap: https://matplotlib.org/3.2.1/tutorials/colors/colormaps.html
color_map = 'YlOrRd'
###########################################################
###########################################################

r = requests.get(sd_api)
rd =  [ _r['properties'] for _r in r.json()['features'] ]

case_df = pd.DataFrame(rd)

# Cleanup, reduce mem
del [r, rd]


known_zips = list(case_df['ziptext'].unique())
print("Zipcodes in data: %s"%(len(known_zips)))


# Got API link from: https://sdgis-sandag.opendata.arcgis.com/datasets/covid-19-statistics-by-zip-code

r = requests.get(zip_shape_full)
rd = r.json()

zip_shape_known = {}
zip_shape_known['type'] = rd['type']
zip_shape_known['features'] = []

for i in rd['features']:
    if i['properties']['ZCTA5CE10'] in known_zips:
        zip_shape_known['features'].append(i)
        
print("Found %s matching zip codes in shape file"%(len(zip_shape_known['features'])))
  
del [r, rd]

gdf = gpd.GeoDataFrame.from_features(zip_shape_known)
gdf.rename(columns={'ZCTA5CE10': 'zipcode'}, inplace=True)
gdf.set_index('zipcode',inplace=True)

# Drop time from date, not useful
case_df['date'] = case_df['updatedate'].apply(lambda x: x.split(" ")[0])

# Drop unused fields
case_df.drop(inplace=True, columns=['FID',
                                    'zipcode_zip',
                                    'created_date',
                                    'updatedate',
                                    'created_date', 
                                    'created_user', 
                                    'last_edited_date', 
                                    'last_edited_user',
                                    'globalid'])

# Missing data becomes zeros
case_df.fillna(0, inplace=True)

# Rename column
case_df.rename(columns={'ziptext': 'zipcode'}, inplace=True)

# Drop duplicates, have seen some
case_df.drop_duplicates(subset=['zipcode','date'], inplace=True)

# Ugly, but creates table I want
case_df = case_df.groupby(['zipcode', 'date']).sum().unstack().fillna(0)

# End up with nested column name, remove it
case_df.columns = case_df.columns.droplevel()



# Create super list of all case values so we can get stats if we are going to use it
if max_value == 0:
    _tmp_case_list = []

# Not necessary, but can't hurt
dates = sorted(case_df.columns.values)
    
# subtract tomorrow from today, and set that as the value for today. repeat, skipping last day...
for i in range(len(dates)-1):
    today = dates[i]
    tomorrow = dates[i+1]
    
    case_df[today] = case_df[tomorrow] - case_df[today]
    
#     #Uncomment to find all negative values. Happens due to adjusting the numbers, we handle it
#     #Good to do though
#     _tmp_df = case_df[today].apply(lambda x: x if x < -1 else None).dropna()
#     if _tmp_df.values.size > 0:
#         print("%s"%(today))
#         print(_tmp_df)

    if max_value == 0:
        _tmp_case_list += list(case_df[today].values)

if max_value == 0:
    _tmp_case_df = pd.DataFrame(_tmp_case_list)
    max_value = int(_tmp_case_df.mean()[0] + (2 * _tmp_case_df.std()[0]))
    
print("max_value = %s"%(max_value))

# Limit values based on max / min
for i in dates[:-1]:
    case_df[i] = case_df[i].apply(lambda x: min_value if x < min_value else x)
    case_df[i] = case_df[i].apply(lambda x: max_value if x > max_value else x)

# Remove last day
case_df.drop(inplace=True, columns=[case_df.columns[-1]])



# ## Merge shape file with zipcodes gdf and case_df, create case_gdf

case_gdf = gdf.merge(case_df, left_on='zipcode', right_on='zipcode')

output_files = []

for idx in dates[:-1]:

    # Create inmemory file
    output_files.append(io.BytesIO())
    
    fig = case_gdf.plot(cmap=color_map, 
             column=idx,
             linewidth=0.8, 
             edgecolor='0.8',
             vmax=int(max_value),
             vmin=min_value,
             legend=True,
             figsize=(14,8))

    fig.axis('off')

    fig.annotate("Daily Cases COVID-19 : %s - %s"%(dates[0],dates[-2]),
                xy=(.1, .9), xycoords='figure fraction',
                horizontalalignment='left', verticalalignment='top',
                fontsize=20)
    fig.annotate("""P. Mulrooney <mulroony@gmail.com>
* Upper case count limited to mean + 2 std devs
* Missing replaced with zeros
* Decreases between days set to zero
* https://sdgis-sandag.opendata.arcgis.com/datasets/covid-19-statistics-by-zip-code""",
                xy=(.5, .1), xycoords='figure fraction',
                horizontalalignment='left', verticalalignment='top',
                fontsize=8)
    
    fig.annotate(idx,
                xy=(0.1, .1), xycoords='figure fraction',
                horizontalalignment='left', verticalalignment='top',
                fontsize=20)
    
    fig.annotate(idx,
                xy=(0.1, .1), xycoords='figure fraction',
                horizontalalignment='left', verticalalignment='top',
                fontsize=20)


    chart = fig.get_figure()
    chart.savefig(output_files[-1], dpi=150)
    plt.close('all')
    
    output_files[-1].seek(0)

print("Generated %s in memory PNG files\n"%(len(output_files)))

images = []
for output_file in output_files:
    images.append(imageio.imread(output_file))

if not gif_path:
    gif_path = io.BytesIO()

imageio.mimsave(gif_path, images, format="gif", duration=0.75, loop=1)


