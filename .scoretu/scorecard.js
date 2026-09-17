var tplPopup = null;
var tplScore = null;
var tplTwitter = null;
var ndx = null; //workaround for now...
var partyChart = null;
let bar_country = null;
let wall = null; // Used in grid function

const countries = {
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
};

const Modal = {
  show: (id) => {
    const el = document.getElementById(id.replace("#", ""));
    if (!el) return;
    el.classList.add("is-active");
    document.documentElement.classList.add("is-clipped");
  },
  hide: (id) => {
    const el = document.getElementById(id.replace("#", ""));
    if (!el) return;
    el.classList.remove("is-active");
    document.documentElement.classList.remove("is-clipped");
  },
};

const Collapse = {
  toggle: (id) => {
    const el = document.querySelector(id);
    if (!el) return;
    el.classList.toggle("is-hidden");
  },
  show: (id) => {
    const el = document.querySelector(id);
    if (!el) return;
    el.classList.remove("is-hidden");
  },
};

const renderPopup = (d) => `
    <div class="modal-background" onclick="Modal.hide('infobox')"></div>
    <div class="modal-card" style="width: 95%; max-width: 1200px;">
      <header class="modal-card-head">
        <p class="modal-card-title">${d.firstname} ${d.lastname.formatName()}</p>
        <button class="delete" aria-label="close" onclick="Modal.hide('infobox')"></button>
      </header>
      <section class="modal-card-body infobox_content">
        <div class="columns">
          <div class="column is-narrow">
            <img src='https://www.europarl.europa.eu/mepphoto/${d.epid}.jpg' width=170 height=216 />
          </div>
          <div class="column">
            <ul id="infobox_info">
                ${d.tenure !== d.votes ? `<li title="number of votes analysed when the person was an MEP">Vote tenure: <strong>${d.tenure}/${d.votes}</strong> MEP from ${d.start}${d.end ? ` to ${d.end}` : ""} </li>` : ""}
                <li>Participation: <strong>${Math.round(d.effort)}%</strong></li>
                <li>Country: <strong>${countries[d.country]}</strong></li>
                <li>National party: <strong>${d.party}</strong></li>
                <li>European Party:<strong> ${d.eugroup} </strong></li>
                ${d.twitter ? `<li><div class='twitter' data-twitter='${d.twitter}'>This MEP is a candidate - share the score!</div></li>` : ""}
                <li style="font-size:2em"><strong>Voting score: ${d.score}/100</strong></li>
            </ul> 
          </div>
        </div>
        <div class="votes-container mt-4">
          <!-- Populated by tplScore -->
        </div>
      </section>
    </div>
`;

const voteIcon = (vote) => {
  switch (vote) {
    case 1:
    case "1":
      return "<i data-lucide='thumbs-up' /></i>";
    case -1:
    case "-1":
      return "<i data-lucide='thumbs-down' /></i>";
    case 0: // abtention
    case "0":
      return "<i data-lucide='user-minus' /></i>";
    case "X":
      return "<i data-lucide='clock-alert' ></i>";
  }
};

const renderScoreTable = (v, vote) => {
  let html = '<div class="columns is-multiline">';
  v.d
    .filter((item) => item.mep !== "")
    .forEach((item) => {
      let cardClass = "";
      if (item.type === "for") cardClass = "is-success";
      else if (item.type === "abstention") cardClass = "is-info";
      else if (item.type === "absent") cardClass = "is-light";
      else if (item.type === "against") cardClass = "is-danger";
      html += `
            <div class="column is-12-mobile is-6-tablet is-4-desktop">
              <div class="message ${cardClass}">
                <div class="message-header">
                  <p class="is-size-7">${item.title}</p>
                </div>
                <div class="message-body p-2">
                  <div class="is-size-7 mb-2">
                    Voted: <span class="tag is-light">
                      ${voteIcon(item.mep)} ${vote.type[item.mep]}
                    </span>
                    Recommended: <span class="tag  is-light">
                      ${voteIcon(item.recommendation)}
                    </span>
                  </div>
                  <p class="is-size-7" style="min-height: 3em;">${item.description || item.id}</p>
                  <div class="buttons are-small mt-2">
                    <a target="_blank" class="button is-small" href='https://mepwatch.eu/10/vote.html?v=${item.dbid}'>vote</a> 
                    ${item.url ? `<a href="${item.url}" class="button is-small" target='_blank'>law</a>` : ""}
                  </div>
                </div>
              </div>
            </div>
        `;
    });

  const nonMep = v.d.filter((item) => item.mep === "");
  if (nonMep.length > 0) {
    html +=
      '<div class="column is-12"><div class="content"><h3>Not an MEP during these votes</h3><ul>';
    nonMep.forEach((item) => {
      html += `<li>${item.title}</li>`;
    });
    html += "</ul></div></div>";
  }
  html += "</div>";
  return html;
};

const renderMepCard = (d) => `
    <div style='background-color:${d.color};opacity: ${d.opacity}' class='mep card' data-id='${d.epid}' data-tenure='${d.tenure}' data-score='${d.score}'>
      <div class="card-content p-2 has-text-centered">
        <h2 class="title is-6 mb-1" title='MEP from ${d.country} in ${d.eugroup}'>${d.firstname} ${d.lastname.formatName()}</h2>
        <div class="image-container" style="position:relative;">
          <img loading='lazy' src='https://www.europarl.europa.eu/mepphoto/${d.epid}.jpg' alt='${d.lastname}' width=170 height=216 />
          ${d.twitter ? `<div class='twitter' data-twitter='${d.twitter}'></div>` : ""}
          <div class='score' style='font-size:${d.size}px;'>${d.score}${d.tenure !== d.votes ? `<span>(${d.tenure})</span>` : ""}</div>
        </div>
        <div class='is-size-7 has-text-weight-bold'>${d.party}</div>
      </div>
    </div>
`;

document.addEventListener("DOMContentLoaded", () => {
  const countryEl = document.querySelector(".country");
  if (countryEl) {
    countryEl.insertAdjacentHTML(
      "afterbegin",
      "<div id='alert_placeholder' class='notification is-info is-light' style='display:none'><span></span><button class='delete' onclick=\"this.parentElement.style.display='none'\"></button></div>",
    );
  }

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keyup", function () {
      const s = this.value.toLowerCase();
      if (wall) {
        wall.dimension().filter(function (d) {
          return d.indexOf(s) !== -1;
        });
      }
      document
        .querySelectorAll(".resetall")
        .forEach((el) => (el.disabled = true));
      dc.redrawAll();
    });
  }

  tplPopup = renderPopup;
  tplScore = renderScoreTable;
  tplTwitter = () => ""; // Placeholder

  document.querySelectorAll(".resetall").forEach((el) => {
    el.addEventListener("click", function () {
      const si = document.getElementById("search-input");
      if (si) si.value = "";
      document
        .querySelectorAll(".resetall")
        .forEach((el) => (el.disabled = false));
      dc.filterAll();
      dc.renderAll();
    });
  });

  document.addEventListener("click", (e) => {
    // Bulma navbar burger toggle
    const burger = e.target.closest(".navbar-burger");
    if (burger) {
      const target = document.getElementById(burger.dataset.target);
      burger.classList.toggle("is-active");
      target.classList.toggle("is-active");
    }

    const collapseToggle = e.target.closest('[data-toggle="collapse"]');
    if (collapseToggle) {
      e.preventDefault();
      const targetSelector =
        collapseToggle.getAttribute("data-target") ||
        collapseToggle.getAttribute("href");
      Collapse.toggle(targetSelector);
    }
  });

  if (!hasHashFilter()) {
    false &&
      fetch("http://country.proca.foundation")
        .then((res) => res.json())
        .then((data) => {
          if (!bar_country) return;
          const country = data.country.toLowerCase();

          bar_country
            .group()
            .top(28)
            .forEach((d) => {
              if (country === d.key) {
                location.hash = "#bar_country";
                notice("Show only MEPs from " + d.key);
                bar_country.filter(country);
                scrolled = true;
                dc.redrawAll();
                Collapse.show("#collapseOne");
              }
            });
        });
  }
  twitterize();
  if (window.lucide) lucide.createIcons();
});

var eu_groups = {
  "GUE/NGL": "#800c00",
  "S&D": "#ec2335",
  "Verts/ALE": "#67bd1b",
  "Greens/EFA": "#67bd1b",
  ALDE: "#f1cb01",
  Renew: "#f1cb01",
  EFD: "#60c0e2",
  ID: "#8a5d19",
  PPE: "blue",
  EPP: "blue",
  ECR: "darkblue",
  "NA/NI": "grey",
  NA: "grey",
  NI: "grey",
  Patriots: "#9b20a9",
  ESN: "#808080",
  Array: "#df73be",
};

var scoreCard = function (list_votes) {
  var votes = function (all) {
    this.all = all; // votes to be taken into account. [dbid] is the voteid key
    this.index = {}; // column number in the cvs of a voteid
    this.mepindex = {}; //row number in the csv of a mepid
    this.type = {
      1: "for",
      "-1": "against",
      0: "abstention",
      X: "absent",
      "": "not an MEP at the time of this vote",
    };
    this.direction = { 1: "up", "-1": "down" };
    all.forEach((v, i) => {
      v.for =
        v.pro =
        v.against =
        v.abstention =
        v.absent =
        v["not an MEP at the time of this vote"] =
          0;
      v.date = new Date(v.date);
      if (!v.recommendation) {
        console.log("missing recommendation for ", v.dbid, v.title);
        v.recommendation = 0;
      }
      if (typeof v.dbid !== "undefined") {
        this.index[v.dbid] = i;
      }
    });
  };

  votes.prototype.get = function (id) {
    if (this.index[id] !== undefined) return this.all[this.index[id]];
    return null;
  };

  votes.prototype.setRollCall = function (rolls) {
    this.rollcalls = rolls;
    rolls.forEach((v, i) => {
      var mep = v;
      this.mepindex[v.mep] = i;
      this.all.forEach((vote, id) => {
        ++vote[this.type[mep[vote.dbid]]];
      });
    });
    var max = 0,
      min = Infinity;
    this.all.forEach((vote) => {
      vote.cast = vote.pro + vote.against + vote.abstention;
      vote.weight = Math.abs(vote.cast / (vote.against - vote.pro)) || 1;
      if (min > vote.weight) min = vote.weight;
      if (max < vote.weight) max = vote.weight;
    });
    this.all.forEach((vote) => {
      vote.weight = 1;
    });
  };

  votes.prototype.getEffort = function (mepid) {
    var effort = 0;
    var nbvote = 0;
    if (!this.exists(mepid)) {
      return { effort: 0, tenure: 0 };
    }
    var mep = this.rollcalls[this.mepindex[mepid]];
    this.all.forEach((vote) => {
      if (mep[vote.dbid]) {
        ++nbvote;
        if (Math.abs(mep[vote.dbid]) == 1 || mep[vote.dbid] == 0) ++effort;
      }
    });
    return { effort: nbvote ? (effort / nbvote) * 100 : 0, tenure: nbvote };
  };

  votes.prototype.exists = function (mepid) {
    return this.mepindex.hasOwnProperty(mepid);
  };

  votes.prototype.getVotes = function (mepid) {
    if (!this.exists(mepid)) {
      return {};
    }
    return this.rollcalls[this.mepindex[mepid]];
  };

  votes.prototype.getScore = function (mepid) {
    var score = 0;
    var nbvote = 0;
    if (!this.exists(mepid)) {
      return 50;
    }
    var mep = this.rollcalls[this.mepindex[mepid]];
    this.all.forEach((vote) => {
      if (mep[vote.dbid]) {
        nbvote = nbvote + vote.weight;
        if (mep[vote.dbid] !== "X") {
          score = score + vote.recommendation * mep[vote.dbid] * vote.weight;
        }
      }
    });
    if (nbvote == 0) return 50;
    return Math.floor(50 + (100 * (score / nbvote)) / 2);
  };

  var vote = new votes(list_votes);

  const tpl = renderMepCard;

  const tplGroup = function (d) {
    return (
      "<div class='dc-grid-group nodc-grid-item country_" +
      getCountryKey(d.key) +
      "'><h1 class='title is-4'>" +
      countries[d.key] +
      "</h1></div>"
    );
  };

  var getMEP = function (id) {
    return meps.find((m) => m.epid === id);
  };

  function grid(selector) {
    adjust(meps);

    ndx = crossfilter(meps);
    var all = ndx.groupAll();

    function getScore(mep) {
      return vote.getScore(mep.epid);
    }
    var opacity = d3.scale
      .linear()
      .clamp(true)
      .domain([0, vote.all.length])
      .range([0.2, 1]);

    var color = d3.scale
      .linear()
      .clamp(true)
      .domain([0, 49, 50, 51, 100])
      .range(["#CF1919", "#FA9B9B", "#ccc", "#d0e5cc", "#2C851C"])
      .interpolate(d3.interpolateHcl);

    function adjust(data) {
      var dateFormat = d3.time.format("%Y-%m-%d");
      var now = Date.now();
      var filteredMeps = data.filter((e) => {
        if (!vote.exists(e.epid)) return false;
        const t = vote.getEffort(e.epid);
        e.effort = t.effort;
        e.tenure = t.tenure;
        if (t.tenure === 0 || t.effort === 0) {
          return false;
        }
        e.scores = [getScore(e)];
        e.birthdate = dateFormat.parse(e.birthdate);
        e.age = ~~((now - e.birthdate) / 31557600000);
        return true;
      });
      meps.length = 0;
      meps.push(...filteredMeps);
    }

    var chart_age = dc.lineChart(selector + " .age");
    var age = ndx.dimension(function (d) {
      return d.age || "";
    });
    var ageGroup = age.group().reduceSum(function (d) {
      return 1;
    });

    chart_age
      .width(444)
      .height(200)
      .margins({ top: 0, right: 0, bottom: 95, left: 30 })
      .x(d3.scale.linear().domain([20, 100]))
      .brushOn(true)
      .renderArea(true)
      .elasticY(true)
      .yAxisLabel("Number of MEPs")
      .dimension(age)
      .group(ageGroup);

    var pie_gender = dc.pieChart(selector + " .gender").radius(70);
    var gender = ndx.dimension(function (d) {
      return d.gender || "";
    });
    var groupGender = gender.group().reduceSum(function (d) {
      return 1;
    });

    var NameGender = { M: "Male", F: "Female", "": "missing data" };
    var SymbolGender = { M: "\u2642", F: "\u2640", "": "" };

    pie_gender
      .width(140)
      .height(140)
      .dimension(gender)
      .label(function (d) {
        return SymbolGender[d.key];
      })
      .title(function (d) {
        return NameGender[d.key] + ": " + d.value;
      })
      .group(groupGender);

    var score = ndx.dimension(function (d) {
      return d.scores[0];
    });
    var scoreGroup = score.group().reduceSum(function (d) {
      return 1;
    });
    var bar_score = dc
      .barChart(".bar_score")
      .width(245)
      .height(130)
      .outerPadding(5)
      .gap(0)
      .margins({ top: 10, right: 10, bottom: 20, left: 30 })
      .x(d3.scale.linear().domain([0, 101]))
      .elasticY(true)
      .yAxisLabel("Number of MEPs")
      .round(dc.round.floor)
      .colorCalculator(function (d, i) {
        return color(d.key);
      })
      .dimension(score)
      .group(scoreGroup)
      .renderlet(function (chart) {
        var d = chart.dimension().top(Number.POSITIVE_INFINITY);
        var total = 0;
        var nb = 0;
        d.forEach(function (a) {
          ++nb;
          total += a.scores[0];
        });
        const avgEl = document.querySelector(".bar_score div#avg_score");
        if (avgEl) {
          avgEl.textContent = nb ? Math.round(total / nb) : "";
        }
        const resetAllBtn = document.querySelectorAll(".resetall");
        if (ndx.size() !== nb) {
          resetAllBtn.forEach((btn) => (btn.disabled = false));
        } else {
          resetAllBtn.forEach((btn) => (btn.disabled = true));
        }
      });

    bar_score.yAxis().ticks(4).tickFormat(d3.format(",.0f"));

    bar_country = dc.barChart(selector + " .country");
    var country = ndx.dimension(function (d) {
      return d.country || "";
    });
    var countryGroup = country.group().reduce(
      function (a, d) {
        a.count += 1;
        a.score += d.scores[0];
        return a;
      },
      function (a, d) {
        a.count -= 1;
        a.score -= d.scores[0];
        return a;
      },
      function () {
        return { count: 0, score: 0 };
      },
    );

    bar_country
      .colorCalculator(function (d, i) {
        return color(d.value.score / d.value.count);
      })
      .valueAccessor(function (d) {
        return d.value.count;
      })
      .width(700)
      .height(300)
      .outerPadding(0)
      .gap(1)
      .margins({ top: 10, right: 0, bottom: 95, left: 30 })
      .x(d3.scale.ordinal())
      .xUnits(dc.units.ordinal)
      .brushOn(false)
      .elasticY(true)
      .yAxisLabel("Number of MEPs")
      .dimension(country)
      .group(countryGroup)
      .on("postRender", function (c) {
        adjustBarChartLabels(c);
        c.svg()
          .selectAll("rect.bar")
          .on("click.scroll", function (d) {
            scrollTo(d.data.key);
          });
      });

    function adjustBarChartLabels(chart) {
      chart
        .svg()
        .selectAll(".axis.x text")
        .on("click", function (d) {
          chart.filter(d);
          dc.redrawAll();
          scrollTo(d);
        })
        .style("text-anchor", "end")
        .attr("dx", "-0.6em")
        .attr("dy", "-5px");
    }

    partyChart = chartParty(selector, ndx, color);
    chartGroup(selector, ndx, color);

    dc.dataCount(".dc-data-count").dimension(ndx).group(all);

    var name = ndx.dimension(function (d) {
      return (
        d.firstname.toLowerCase() +
        " " +
        d.lastname.toLowerCase() +
        " " +
        d.party.toLowerCase()
      );
    });

    wall = dc
      .dataGrid(".dc-data-grid")
      .dimension(name)
      .group(function (d) {
        return d.country;
      })
      .size(1000)
      .html((d) => {
        d.score = d.scores[0];
        d.color = color(d.score);
        d.size = 20 + (20 * d.effort) / 100;
        d.opacity = opacity(d.tenure);
        d.votes = vote.all.length;
        return tpl(d);
      })
      .htmlGroup(tplGroup)
      .sortBy(function (d) {
        return d.lastname;
      })
      .renderlet(function (grid) {
        grid.selectAll(".dc-grid-item").on("click", function (d) {
          MEPpopup(d);
        });
      });

    dc.renderAll();
    twitterize();
    hashFilter();
  }

  function hashFilter() {
    var hash = window.location.hash;
    if (hash.indexOf("#party") === 0) {
      var filter = decodeURIComponent(hash.substring(6));
      notice("Show only MEPs from " + filter);
      setTimeout(() => {
        partyChart.filter(filter);
        dc.redrawAll();
        Collapse.show("#collapseOne");
      }, 2000);
    }

    if (hash.indexOf("#mep") === 0) {
      var mep = getMEP(hash.substring(4));
      if (mep) MEPpopup(mep);
    } else if (hash.length == 3) {
      var iso = hash.substring(1);
      setTimeout(() => {
        bar_country.filter(iso);
        dc.redrawAll();
        Collapse.show("#collapseOne");
      }, 2000);
    }
  }

  function MEPpopup(d) {
    d.votes = vote.getVotes(d.epid);

    var v = { d: vote.all };
    v.d.forEach(function (x) {
      x.mep = d.votes[x.dbid];
      x.direction = vote.direction[x.mep];
      if (x.mep == "") {
        x.type = "not an MEP at the time of this vote";
        return;
      }
      if (x.mep == "X") {
        x.type = "absent";
        return;
      } else {
        x.type = vote.type[x.mep * x.recommendation];
      }
    });

    const headerEl = document.getElementById("infobox");
    if (headerEl) {
      headerEl.innerHTML = tplPopup({ ...d, votes: vote.all.length });
      const votesContainer = headerEl.querySelector(".votes-container");
      if (votesContainer) votesContainer.innerHTML = tplScore(v, vote);
    }
    Modal.show("infobox");
    window.location.hash = "mep" + d.epid;
    if (window.lucide) lucide.createIcons();
  }
  function getCountryKey(name) {
    return name.replace(/ /g, "_").toLowerCase();
  }

  scrolled = false;
  function scrollTo(id) {
    if (scrolled) return;
    scrolled = true;
    Collapse.show("#collapseOne");
    const targetEl = document.querySelector(".country_" + getCountryKey(id));
    if (targetEl) {
      window.scrollTo({
        top: targetEl.getBoundingClientRect().top + window.pageYOffset,
        behavior: "smooth",
      });
    }
  }

  function chartGroup(selector, ndx, color) {
    var chart = dc
      .pieChart(selector + " .group")
      .innerRadius(20)
      .radius(70);
    var dimension = ndx.dimension(function (d) {
      return d.eugroup || "";
    });
    var group = dimension
      .group()
      .reduce(
        function (a, d) {
          a.count += 1;
          a.score += d.scores[0];
          a.effort += d.effort;
          return a;
        },
        function (a, d) {
          a.count -= 1;
          a.score -= d.scores[0];
          a.effort -= d.effort;
          return a;
        },
        function () {
          return { count: 0, score: 0, effort: 0 };
        },
      )
      .order(function (p) {
        return p.count;
      });

    var tip = d3
      .tip()
      .attr("class", "d3-tip")
      .html(function (p) {
        return (
          "<span><h2 class='title is-6 mb-1'>" +
          p.data.key +
          "</h2><ul>" +
          "<li>Number of MEPs: " +
          p.data.value.count +
          "</li>" +
          "<li>Average participation: " +
          Math.floor(p.data.value.effort / p.data.value.count) +
          "</li>" +
          "<li>score: " +
          Math.floor(p.data.value.score / p.data.value.count) +
          "</li></ul></span>"
        );
      })
      .offset([-12, 0]);

    chart
      .width(140)
      .height(140)
      .dimension(dimension)
      .valueAccessor(function (d) {
        return d.value.count;
      })
      .colorCalculator(function (d, i) {
        return eu_groups[d.key];
      })
      .group(group)
      .on("postRender", function (c) {
        c.svg()
          .selectAll("path")
          .call(tip)
          .on("mouseover", function (d) {
            tip.attr("class", "d3-tip animate").show(d);
          })
          .on("mouseout", function (d) {
            tip.attr("class", "d3-tip").show(d);
            tip.hide();
          });
      });
  }

  function chartParty(selector, ndx, color) {
    var bubble_party = dc.bubbleChart(selector + " .party");
    var party = ndx.dimension(function (d) {
      return d.party || "";
    });
    var tip = d3
      .tip()
      .attr("class", "d3-tip")
      .html(function (p) {
        return (
          "<span><h2 class='title is-6 mb-1'>" +
          p.key +
          "</h2><ul>" +
          "<li>Number of MEPs: " +
          p.value.count +
          "</li>" +
          "<li>Average participation: " +
          Math.floor(p.value.effort / p.value.count) +
          "</li>" +
          "<li>Average score: " +
          Math.floor(p.value.score / p.value.count) +
          "</li></ul></span>"
        );
      })
      .offset([-12, 0]);

    var partyGroup = party
      .group()
      .reduce(
        function (a, d) {
          a.count += 1;
          a.score += d.scores[0];
          a.effort += d.effort;
          return a;
        },
        function (a, d) {
          a.count -= 1;
          a.score -= d.scores[0];
          a.effort -= d.effort;
          return a;
        },
        function () {
          return { count: 0, score: 0, effort: 0 };
        },
      )
      .order(function (p) {
        return p.count;
      });
    bubble_party
      .colorCalculator(function (d, i) {
        return color(d.value.score / d.value.count);
      })
      .valueAccessor(function (d) {
        return d.value.count;
      })
      .width(460)
      .height(200)
      .margins({ top: 20, right: 20, bottom: 20, left: 30 })
      .yAxisLabel("%Votes attended")
      .dimension(party)
      .group(partyGroup)
      .keyAccessor(function (p) {
        return p.value.score / p.value.count;
      })
      .valueAccessor(function (p) {
        return p.value.effort / p.value.count;
      })
      .radiusValueAccessor(function (p) {
        return p.value.count;
      })
      .x(d3.scale.linear().domain([0, 100]))
      .r(d3.scale.linear().domain([0, 50]))
      .minRadiusWithLabel(15)
      .elasticY(false)
      .yAxisPadding(0)
      .elasticX(false)
      .elasticRadius(false)
      .xAxisPadding(0)
      .maxBubbleRelativeSize(0.15)
      .renderHorizontalGridLines(false)
      .renderVerticalGridLines(true)
      .renderLabel(false)
      .renderTitle(false)
      .on("postRender", function (c) {
        c.svg()
          .selectAll("circle")
          .call(tip)
          .on("click.setHash", function (d) {
            window.location.hash = encodeURIComponent("party" + d.key);
          })
          .on("mouseover", function (d) {
            tip.attr("class", "d3-tip animate").show(d);
          })
          .on("mouseout", function (d) {
            tip.attr("class", "d3-tip").show(d);
            tip.hide();
          });
      });
    return bubble_party;
  }

  this.vote = vote;
  this.grid = grid;
  return this;
};

function hasHashFilter() {
  var hash = window.location.hash;
  return hash.indexOf("#mep") === 0 || hash.indexOf("#party") === 0;
}

function notice(message, callback) {
  const ap = document.getElementById("alert_placeholder");
  if (!ap) return;
  ap.style.display = "";
  const span = ap.querySelector("span");
  if (span) span.innerHTML = message;
  setTimeout(function () {
    ap.style.transition = "opacity 1s";
    ap.style.opacity = "0";
    setTimeout(() => {
      ap.style.display = "none";
      ap.style.opacity = "1";
      callback && callback();
    }, 1000);
  }, 3000);
}

function twitterize() {
  document.body.addEventListener("click", function (event) {
    const twitterBtn = event.target.closest(".twitter");
    if (!twitterBtn) return;

    event.preventDefault();
    const _twitterMsg =
      typeof twitterMsg === "undefined"
        ? "How does @ score of #score compare to the other MEPs? #ep2014"
        : twitterMsg;

    const t = twitterBtn.dataset.twitter;
    const mep = twitterBtn.closest("div.mep");
    if (!mep) return;

    let msg = _twitterMsg.replace("@ ", t + " ");
    msg =
      msg.replace("#score", mep.dataset.score) +
      " " +
      document.URL.replace(/#.*/, "") +
      "#mep" +
      mep.dataset.id;

    const url = "http://twitter.com/home/?status=";
    window.open(url + encodeURIComponent(msg), "twitter");
  });
}

String.prototype.formatName = function () {
  return this.toLowerCase().replace(/(?:^|\s|-)\S/g, function (word) {
    return word.toUpperCase();
  });
};
