"use strict";

var request = require('request'),
  file = require("fs"),
  cheerio = require('cheerio'),
  cachedRequest = require('cached-request')(request),
  cacheDirectory = "/tmp";

cachedRequest.setCacheDirectory(cacheDirectory);

cachedRequest.setValue('ttl', 100000);
cachedRequest({
  url: 'https://www.europarl.europa.eu/delegations/en/list/byname'
}, function(error, response, html) {
  if (error) {
    console.log("error:" + error);
    process.exit(1)
  }
  const $ = cheerio.load(html);
  var r = {};
  $(".erpl_delegations-list-item a").each(function(i, d) {
    console.log(i,d.children);
    var id = $(this).attr("href");
//    var name = $(this).text();
    console.log(id,name);
//    if (!id) return;
//    r[id] = $(this).text();
  });
  if (Object.keys(r).length < 10) {
    console.log("can't parse europarl");
    process.exit(1);
  }
  file.writeFileSync("./data/delegations.json", JSON.stringify(r));
});

cachedRequest({
  url: 'http://www.europarl.europa.eu/committees/en/home.html'
}, function(error, response, html) {
  if (error) {
    console.log("error:" + error);
    process.exit(1)
  }
  const $ = cheerio.load(html);
  var r = {};
  $(".js_selectmenu_committees option").each(function(i, d) {
    var id = $(this).attr("value");
    if (!id) return;
    r[id] = $(this).attr("title");
  });
  if (Object.keys(r).length < 10) {
    console.log("can't parse europarl");
    process.exit(1);
  }
  file.writeFileSync("./data/committees.json", JSON.stringify(r));
});
