# SDCovidGIFMap
Python notebook to generate GIF of SD daily COVID-19 cases by zipcode. Modify the globals to change  behavior / specify paths. Designed to run completely in memory and not write files if you do not want to.

- Run 'CovidMapFullMinimal.ipynb' notebook to generate up to date GIF Map.
- 'CovidMapFullMinimal.py' should run without Jupyter/IPython, but is less tested.
- Included working notebook in _old. It will probably not work.

## Author

Patrick Mulrooney &lt; mulroony@gmail.com &gt;

## Requirements
*versions used, others will probably work*

Built using Python 3.7.6

```
geopandas==0.7.0
pandas==1.0.1
matplotlib==3.1.3
ipython==7.12.0
jupyter==1.0.0
imageio==2.6.1
numpy==1.18.1
```

## Data Sources

- Zip Code Shape files - https://github.com/OpenDataDE/State-zip-code-GeoJSON
- SD County COVID-19 Data - https://sdgis-sandag.opendata.arcgis.com/datasets/covid-19-statistics-by-zip-code?geometry=-120.834%2C32.167%2C-112.891%2C33.780
