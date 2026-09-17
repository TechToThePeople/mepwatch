#!/usr/bin/env node
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { parseArgs } = require("node:util");

const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify/sync");
// Note, the `stream/promises` module is only available
// starting with Node.js version 16
const { finished } = require("stream/promises");

const options = {
  verbose: {
    type: "boolean",
    short: "v",
  },
  pull: {
    type: "boolean",
    short: "p",
  },
  genderify: {
    type: "boolean",
  },
  help: {
    type: "boolean",
    short: "h",
  },
};
const opts = parseArgs({
  options,
  allowPositionals: true,
  strict: false,
  tokens: true,
});

let docs = {};
let meps = [];
//            this.type = {1:"for","-1":"against",0:"abstention","X":"absent","":"not an MEP at the time of this vote"};
const encoding = {
  for: 1,
  against: -1,
  abstention: 0,
  undefined: "X",
};
const rcvs = {};
let _votes = {};
let date = { min: null, max: null };

const readCsv = async (fileName, transform) => {
  const parser = fs.createReadStream(fileName).pipe(
    parse({
      columns: true, // Treat the first line as column names
      skip_empty_lines: true,
    }),
  );
  parser.on("readable", function () {
    let record;
    while ((record = parser.read()) !== null) {
      transform(record);
    }
  });
  await finished(parser);
};

const readReports = async () => {
  fileName = "../10/data/text_tabled.csv";
  const parser = fs.createReadStream(fileName).pipe(
    parse({
      columns: true, // Treat the first line as column names
      skip_empty_lines: true,
    }),
  );
  parser.on("readable", function () {
    let record;
    while ((record = parser.read()) !== null) {
      docs[record.reference] = record;
    }
  });
  await finished(parser);
};

const readMeps = async () => {
  //  const jsonString = await fs.promises.readFile("../10/data/meps.json",    "utf8"  );
  //  meps = JSON.parse(jsonString);
  fileName = "../data/meps.csv";
  const parser = fs.createReadStream(fileName).pipe(
    parse({
      columns: true, // Treat the first line as column names
      skip_empty_lines: true,
    }),
  );
  parser.on("readable", function () {
    let record;
    while ((record = parser.read()) !== null) {
      // Work with each record
      record.start = new Date(record.start);
      if (record.end) record.end = new Date(record.end);
      record.voteid = parseInt(record.voteid, 10);
      record.epid = parseInt(record.epid, 10);
      if (!record.voteid) record.voteid = record.epid;
      record.term = parseInt(record.term, 10);
      meps.push(record);
      rcvs[record.voteid] = [];
    }
  });
  await finished(parser);
};

const readVotes = async () => {
  await readCsv("../10/data/item_rollcall.csv", (record) => {
    // Work with each record
    const id = parseInt(record.identifier, 10);
    record.identifier = id;
    record.date = new Date(record.date);
    _votes[id] = record;
  });
};

const readVote = async (id) => {
  const records = {};
  await readCsv("../10/cards/" + id + ".csv", (record) => {
    const id = parseInt(record.mepid, 10);

    records[id] = record.result;
  });
  return records;
};

const getVote = async (id) => {
  //../mepwatch/9/cards/164132.csv
};

const writeJson = async (name, data) => {
  console.log(name);
  const jsonData = JSON.stringify(data, null, 2);
  await fsp.writeFile(name, jsonData);
};

const writeCsv = async (name, votes, data) => {
  //  const headers ='mep'.split(",");
  const ids = votes.map((d) => d.identifier);
  ids.unshift("mep");
  //record.epid = parseInt(record.epid, 10);
  const r = Object.entries(data).map(([voteid, rcv]) => {
    voteid = parseInt(voteid);
    const mep = meps.find((d) => d.voteid === voteid);
    rcv.unshift(mep.epid);
    return rcv;
  });
  r.unshift(ids);
  fs.writeFileSync("data/" + name + ".csv", stringify(r));
};

const processFile = async (filePath, extraVotes) => {
  const name = path.parse(filePath).name;
  const votes = [];
  console.log("processing", name);
  await readVotes();
  await readReports();
  await readMeps();
  // Read the JSON file
  try {
    const jsonString = await fs.promises.readFile(filePath, "utf8");
    const data = JSON.parse(jsonString);
    // Loop through the items and their votesa
    if (data.topics.length > 1) {
      console.error("too many topics");
      process.exit(1);
    }
    let updated = false;
    for (const topic of data.topics) {
      console.log(`topic: ${topic.name}`);
      const dates = topic.votings.map((item) => {
        console.log(item.dbid);
        if (!_votes[item.dbid]) {
          console.error("no vote ", item.dbid);
          return;
        }
        return new Date(_votes[item.dbid].date);
      });
      date.min = new Date(Math.min(...dates));
      date.max = new Date(Math.max(...dates));
      const extra = extraVotes.filter(
        (d) => !topic.votings.some((existing) => existing.dbid === d),
      );
      //console.log(topic.votings.some ( existing => {return existing.dbid === 99164186 })); process.exit(1);

      Array.prototype.push.apply(
        topic.votings,
        extra.map((id) => ({
          dbid: id,
          recommendation: 0,
          title: "",
          id: undefined,
          description: "",
        })),
      );
      for (const vote of topic.votings) {
        const t = _votes[vote.dbid];
        if (!t) {
          console.error("can't find the vote", vote.dbid);
        }
        votes.push({ ...vote, ...t });
        if (!vote.id) {
          updated = true;
          vote.id = t.report;
        }
        if (!vote.url && docs[vote.id]) {
          vote.url = docs[vote.id].oeil;
          updated = true;
        }
        if (!vote.date) {
          updated = true;
          vote.date = t.date.toISOString().substr(0, 10);
        }
        if (!vote.title) {
          updated = true;
          vote.title = t.title;
        }
        const rcv = await readVote(vote.dbid);
        for (const mep of meps) {
          let d = encoding[rcv[mep.voteid || mep.epid]];
          if (
            d === "X" &&
            (t.date < mep.start || (mep.end && t.date > mep.end))
          ) {
            d = "";
          }
          //rcvs[mep.voteid].push(d);
          if (!mep.voteid) {
            console.log("oops", mep);
          }
          rcvs[mep.voteid].push(d);
        }
      }
    }
    if (updated) {
      writeJson(filePath, data);
    }
    await writeCsv(name, votes, rcvs);
  } catch (err) {
    console.log("Error processing ", filePath, err);
  }
};

const files = opts.positionals.filter((d) => isNaN(d));
const votes = opts.positionals.filter((d) => !isNaN(d)).map((d) => parseInt(d));

if (files.length === 0) {
  console.error(
    "param: path of the campaign config (in data usually) or votes",
  );
  process.exit(1);
}

console.log(files, votes);
// Get the file path from the command-line arguments
files.forEach((file) => processFile(path.resolve(file), votes));
