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

#wikidata

parties twitter

https://query.wikidata.org/#SELECT%20DISTINCT%20%3Fparty%20%3FpartyLabel%20%3FcountryLabel%20%3Ftwitter%0AWHERE%20%0A%7B%0A%20%20%3Fparty%20wdt%3AP31%20wd%3AQ7278%20.%0A%20%20%3Fparty%20wdt%3AP17%20%3Fcountry%20.%0A%20%20%3Fcountry%20wdt%3AP463%20wd%3AQ458%20.%0A%20%20%0A%20%20%3Fparty%20wdt%3AP2002%20%3Ftwitter%20.%0A%20%20%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22fr%2Cen%22.%20%7D%0A%7D%20ORDER%20BY%20%3FcountryLabel%20%3FpartyLabel

Group discipline:

select "group",count(*) from (select identifier,"group",count(*) from (select identifier,"group",result,count(*) as count from mep_rollcall group by identifier,"group",result) t group by identifier,"group" having count(*) > 1) n group by "group";

