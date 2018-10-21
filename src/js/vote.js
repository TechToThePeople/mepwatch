"use strict";
var ndx = null;
var graphs = {};
var q = d3.queue();
var meps = [];
var votes = [];
var config = {};

var voteid = Number(urlParam("v") || 92926);
var results = "for,against,abstention,no show,excused,attended".split(",");
var groups = "NA/NI,ENF,EFDD,ECR,PPE,ALDE,Verts/ALE,S&D,GUE/NGL".split(",");

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
  gb: "United Kingdom"
};

var iconify = function(name, prefix) {
  prefix = prefix || "icon";
  return (
    '<svg class="icon" class="' +
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

var resultscolor = d3
  .scaleOrdinal()
  .domain(results)
  .range("#27ae60,#c0392b,#2980b9,#95a5a6,#34495e,#bdc3c7".split(","));
var percentagecolor = d3
  .scaleLinear()
  .domain([0, 49, 50, 51, 100])
  .range(["#27ae60", "#C8E6C9", "#9E9E9E", "#ffcdd2", "#d35400"])
  .interpolate(d3.interpolateHcl);

var dateParse = d3.timeParse("%Y-%m-%d");
var dateTimeParse = d3.timeParse("%Y-%m-%d %H:%M:%S");
var dayFormat = d3.timeFormat("%Y-%m-%d");
var dateFormat = d3.timeFormat("%Y-%m-%d %H:%M:%S");
var formatPercent = d3.format(".0%");

function download(voteid, callback) {
  q
    .defer(dl_meps)
    .defer(dl_details)
    .defer(dl_votes)
    .awaitAll(function(error, r) {
      if (error) throw error;
      var length = votes.length;
      meps = r[0]; //first deferred download
      for (var j = 0; j < meps.length; j++) {
        var m = meps[j];
        if (!m) console.log(j);
        if (m.start > config.date) {
          meps.splice(j, 1);
          j--;
          continue;
        }
        if (m.end && m.end < config.date) {
          meps.splice(j, 1);
          j--;
          continue;
        }
        for (var i = 0; i < length; i++) {
          if (votes[i].mepid == m.voteid) {
            meps[j].vote = votes[i].result;
            votes[i].processed = true;
            //          votes.splice(i,1);
            break;
          }
        }
        if (!meps[j].vote) {
          meps[j].vote = "no show";
        }
      }
      //TODO: handle this properly, this is a big problem
      var errors = [];
      votes.map(function(v) {
        if (!v.processed) errors.push(v);
      });
      if (errors.length) {
        d3
          .select("main")
          .insert("div", ":first-child")
          .attr("class", "alert alert-danger")
          .html(
            "<h1>They are " +
              errors.length +
              " votes that we couldn't process. Contact Xavier</h1>"
          );
        console.log(errors);
      }
      votes = null;

      config.nb = meps.length;
      ndx = crossfilter(meps);
      meps = null;
      callback();
    });
}

d3.text("img/eu-flags.svg").then(function(xml) {
  d3.select("body").append("svg").attr("id","flags").html(xml).classed("d-none",true);
  d3.selectAll("#flags symbol").attr("fill","#000");
//  document.body.appendChild(xml.documentElement);
});

function dl_details(callback) {
  d3.json("cards/" + voteid + ".json").then(function(d) {
    document.title = d.name + " "+ d.report+" "+d.date;
    d.date = dateTimeParse(d.date);
    config = d;
    config.win = config.for > config.against ? "for" : "against";
    callback(null);
  });
}
function dl_votes(callback) {
  d3
    .csv("cards/" + voteid + ".csv", function(d) {
      if (!d.mepid) return null;
      d.mepid = +d.mepid;
      d.identifier = +d.identifier;
      return d;
    })
    .then(function(d) {
      votes = d;
      callback(null);
    });
}

function dl_meps(callback) {
  d3
    .csv("data/meps.csv", function(d) {
      //      d.date=dateParse(d.date.substring(0,10));
      //      if (!d.date) {console.log(d)};
      d.voteid = +d.voteid;
      d.epid = +d.epid;
      d.active = d.active == "true";
      d.birthdate = dateParse(d.birthdate);
      d.start = dateParse(d.start);
      d.end = d.end == "" ? null : dateParse(d.end);
      return d;
    })
    .then(function(d) {
      //      draw();
      callback(null, d);
    });
}

d3.select(window).on("resize.updatedc", function() {
  dc.events.trigger(function() {
    dc.chartRegistry.list().forEach(function(chart) {
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
