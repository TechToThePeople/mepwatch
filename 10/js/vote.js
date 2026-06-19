"use strict";

let ndx = null;
const graphs = {};

let meps = [];
let votes = [];
let config = {};

let voteid = urlParam("v");
//const results = "for,against,abstention,no show,excused,attended".split(",");
const results = "for,against,abstention,attended,no show,excused".split(",");

const flag = (isoCode) => {
  const offset = 127397;
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + offset));
  // U+1F6A9
};

// Function to convert array of objects to CSV
function arrayToCSV(data) {
  const csvRows = [];
  // Get the headers
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(","));

  // Loop over the rows
  for (const row of data) {
    const values = headers.map((header) => {
      const escaped = ("" + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

function downloadCSV(id) {
  const data =graphs.table.dimension().top(Infinity).map (d => ({vote:d.vote,firstname:d.firstname,lastname:d.lastname,country:d.country,id:d.epid,group:d.eugroup,party:d.party}));
//  const data = ndx.all().map (...
  const csvData = arrayToCSV(data);
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", id? 'mepwatch-' + id +'.csv' : 'mepwatch-vote.csv');
  a.click();
}


const groupAlias = {
  "Verts/ALE": "Greens/EFA",
  PPE: "EPP",
  NI: "NA",
  //  "The Left": "GUE/NGL",
  "GUE/NGL": "The Left",
  "PfE": "Patriots",
};

var countries = {
  be: "Belgium",
  bg: "Bulgaria",
  cz: "Czech Republic",
  dk: "Denmark",
  de: "Germany",
  ee: "Estonia",
  ie: "Ireland",
  gr: "Greece",
  es: "Spain",
  fr: "France",
  hr: "Croatia",
  it: "Italy",
  cy: "Cyprus",
  lv: "Latvia",
  lt: "Lithuania",
  lu: "Luxembourg",
  hu: "Hungary",
  mt: "Malta",
  nl: "Netherlands",
  at: "Austria",
  pl: "Poland",
  pt: "Portugal",
  ro: "Romania",
  si: "Slovenia",
  sk: "Slovakia",
  fi: "Finland",
  se: "Sweden",
  gb: "United Kingdom",
};

var iconify = function (name, prefix) { 
  if (prefix === "flag") return flag(name);
  prefix = prefix || "icon";
  return (
    '<svg class="icon icon-' +
    name +
    '"><title>' +
    name +
    '</title><use href="#' +
    prefix +
    "-" +
    name +
    '" /></svg>'
  );
};


var percentagecolor = d3
  .scaleLinear()
  .domain([0, 49, 50, 51, 100])
  .range(["#27ae60", "#C8E6C9", "#9E9E9E", "#ffcdd2", "#d35400"])
  .interpolate(d3.interpolateHcl);

const dateParse = d3.utcParse("%Y-%m-%d");
const dateTimeParse = d3.utcParse("%Y-%m-%d %H:%M:%S");
const dayFormat = d3.timeFormat("%Y-%m-%d");
const dateFormat = d3.timeFormat("%Y-%m-%d %H:%M:%S");
const formatPercent = d3.format(".0%");

var mwbaseUrl = new URL(document.currentScript && document.currentScript.src); 

function dataUrl (path) {
  if (!mwbaseUrl)
    console.error("mwbaseUrl undefined",document.currentScript?.src);
  
  const url = new URL("../"+path, mwbaseUrl);
  return url;
}

function download(voteid, callback) {
  function isActive(d) {
    //relies on global config.date, the date of the vote 
//TODO : add start10 and use it
    return d.start9 <= config.date && (d.end == null || d.end >= config.date);
  }
  const q = d3.queue();

console.log ("download...");
  q.defer(dl_meps)
    .defer(dl_details)
    .defer(dl_votes)
    .awaitAll(function (error, r) {
      if (error) throw error;
      let length = votes.length;
      meps = r[0].filter(isActive); //first deferred download is the list of all meps, only keep the active during the vote
      for (let j = 0; j < meps.length; j++) {
        let m = meps[j];
        if (groupAlias[m.eugroup]) {
          m.eugroup = groupAlias[m.eugroup];
        }
        for (let i = 0; i < length; i++) {
          if (votes[i].mepid == m.voteid) {
            if (
              votes[i].eugroup !== m.eugroup &&
              groupAlias[votes[i].eugroup] !== m.eugroup
            ) {
              m.prevGroup = groupAlias[votes[i].eugroup] || votes[i].eugroup;
              console.log(
                "group change",
                m.lastname,
                m.eugroup,
                votes[i].eugroup,
                m.prevGroup
              );
            }
            meps[j].vote = votes[i].result;
            votes[i].processed = true;
            break;
          }
        }
        if (!meps[j].vote) {
          meps[j].vote = "no show";
        }
      }
      //TODO: handle this properly, this is a big problem
      var errors = [];
      votes.forEach(function (v) {
        if (!v.processed) {
          errors.push(v);
          //          meps.push({firstname:"aaa",lastname:v.name,eugroup:"?",country:"?",vote:v.result});
        }
      });
      if (errors.length) {
        console.log(errors);
        /*        d3
          .select("main")
          .insert("div", ":first-child")
          .attr("class", "alert alert-danger")
          .html(
            "<h1>They are " +
              errors.length +
              " votes that we couldn't process. Contact Xavier</h1>"
          );*/
      }
      votes = null;

      config.nb = meps.length;
      ndx = crossfilter(meps);
      meps = null;
      callback();
    });
}


function dl_details(callback) {
  d3.json(dataUrl("cards/" + voteid + ".json"))
    .then(function (d) {
      document.title =
        (d.name == "CHANGE ME" ? "" : d.name) +
        " " +
        d.report +
        " " +
        d.date +
        " " +
        d.description;
      d.day = dateParse(d.date.substring(0, 10));
      d.date = dateTimeParse(d.date) || d.day; //bug, on some rollcalls, the date isn't the voting timestamp but the day
      config = d;
      config.win = config.for > config.against ? "for" : "against";
      callback(null);
    })
    .catch(function (d) {
      //we have a problem with the json
      d3.csv("data/item_rollcall.csv", function (d) {
        if (d.identifier != voteid) return;
        d.day = dateParse(d.date.substring(0, 10));
        d.date = dateTimeParse(d.date);
        config = d;
        config.win = config.for > config.against ? "for" : "against";
        return d;
      }).then(function (d) {
        //      draw();
        callback(null);
      });
      d3.select("main")
        .insert("div", ":first-child")
        .attr("class", "alert alert-danger")
        .html(
          "<h1>There is an error in the file that we couldn't process. Contact Xavier</h1>"
        );
      console.log(d);
      //    callback(null);
    });
}
function dl_votes(callback) {
  d3.csv(dataUrl("cards/" + voteid + ".csv"), function (d) {
    if (!d.mepid) return null;
    d.mepid = +d.mepid;
    d.vote_id = +d.vote_id;
    d.identifier = +d.identifier;
    if (groupAlias[d.eugroup]) {
      d.eugroup = groupAlias[d.eugroup];
    }
    return d;
  }).then(function (d) {
    votes = d;
    callback(null);
  });
}

function dl_meps(callback) {
  d3.csv(dataUrl ("data/meps.csv"), function (d) {
    //      d.date=dateParse(d.date.substring(0,10));
    //      if (!d.date) {console.log(d)};
    d.voteid = +d.epid; // we are now joining on the epid
    d.epid = +d.epid;
    d.active = d.active == "true";
    d.birthdate = dateParse(d.birthdate);
    d.start = dateParse(d.start);
    d.start9 = d.start;
    //      d.end = d.end == "" ? null : dateParse(d.end);
    if (d.end !== "") {
      d.end = dateParse(d.end);
      d.end.setDate(d.end.getDate() + 1);
    } else {
      d.end = null;
    }
    return d;
  }).then(function (d) {
    //      draw();
    callback(null, d);
  });
}

function dl_parties(callback) {
  return d3.csv(dataUrl("data/parties.csv"), function (d) {
//    if (!d.mepid) return null;
//    d.mepid = +d.mepid;
//    d.vote_id = +d.vote_id;
//    d.identifier = +d.identifier;
//    if (groupAlias[d.eugroup]) {
//      d.eugroup = groupAlias[d.eugroup];
//    }
    return d;
  })
}


d3.select(window).on("resize.updatedc", function () {
  dc.events.trigger(function () {
    dc.chartRegistry.list().forEach(function (chart) {
      if (chart.fixedSize) return;
      var container = chart.root().node();
      if (!container) return; // some graphs don't have a node (?!)
      container = container.parentNode.getBoundingClientRect();
      chart.width(container.width);
      chart.rescale && chart.rescale(); // some graphs don't have a rescale
    });

    dc.redrawAll();
  }, 500);
});

dc.config.defaultColors(d3.schemeCategory10);

function urlParam(name, value) {
  if (typeof value == "string") {
    var uri = window.location.href;
    value = encodeURIComponent(value);
    var re = new RegExp("([?&])" + name + "=.*?(&|#|$)", "i");
    if (uri.match(re)) {
      uri = uri.replace(re, "$1" + name + "=" + value + "$2");
    } else {
      var hash = "";
      if (uri.indexOf("#") !== -1) {
        hash = uri.replace(/.*#/, "#");
        uri = uri.replace(/#.*/, "");
      }
      var separator = uri.indexOf("?") !== -1 ? "&" : "?";
      uri = uri + separator + name + "=" + value + hash;
    }
    history.pushState({ q: value }, "search for " + value, uri);
    return uri;
  } else {
    var results = new RegExp("[?&]" + name + "=([^&#]*)").exec(
      window.location.href
    );
    if (results == null) {
      return null;
    } else {
      return decodeURIComponent(results[1]) || 0;
    }
  }
}

setTimeout ( () => {

document.dispatchEvent(new CustomEvent('mepwatch.vote_ready', {
  detail: {
    ndx,
    graphs,
    meps,
    config,
    baseUrl:mwbaseUrl,
  }
}));

}, 0);


