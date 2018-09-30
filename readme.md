#install
sudo -H pip install autocrop
npm install
gulp


#pictures
gulp face
autocrop -i tmp/mepphoto -o img/mepphoto -w50 -H50 --facePercent=100

process manually the non detected faces


# data and geo
https://ec.europa.eu/eurostat/web/gisco/geodata
https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/TopoJSON/europe.topojson

ndjson-cat europe.geojson | ndjson-split 'd.features' > europe.ndjson
ndjson-map 'd.id = d.properties.ISO2,d' < europe.ndjson > europe-id.ndjson
ndjson-map 'd.properties = {pop:d.properties.POP2005},d' < europe-id.ndjson > europe-idprop.ndjson
ndjson-reduce < europe-idprop.ndjson | ndjson-map '{type: "FeatureCollection", features: d}' > europe-id.geojson
geo2topo countries=europe-id.geojson > europe.topojson

