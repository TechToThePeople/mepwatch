'use strict';
const   file = require("fs");

var finished = function(n) {
  console.log("Processed " + n)
};
var total = 0;
const fs = require('fs');
const util = require('util');
const path = require('path');
const {chain}  = require('stream-chain');

const streamToPromise = require('stream-to-promise');
const {parser} = require('stream-json');
const {pick}   = require('stream-json/filters/Pick');
const {ignore} = require('stream-json/filters/Ignore');
const {streamArray} = require('stream-json/streamers/StreamArray');

const xz = require("xz");
const decompression = new xz.Decompressor();

 

//var mepid= require('../data/mepid.json'); // direct from EP site, for QA
//var csvparse=require('csv-parse/lib/sync.js');


function write(options = {
  from: "data/ep_votes.json.xz",
  ddfrom: "data/vote1.json",
  since:Date.parse("2014-07-01"),
  summary: "data/ep_votes.csv",
  rollcalls: "data/rollcalls.csv"
}, callback) {
  var overview = writeSummary(options.summary);


  const mepvotes = mepstream(options.rollcalls);
  mepvotes.on("data",data => {
    console.log(data);
  });
  const pipeline = chain([
    fs.createReadStream(options.from),
    decompression,
//    .pipe(decompression)
    parseVotes(options.since),
    writeMEPvotes(mepvotes)
//    .pipe(writeSummary(options.summary))
  ]);
  
  pipeline.on('end', () =>
    mepvotes.end());
  const p1=streamToPromise(mepvotes);
  const p2=streamToPromise(pipeline);
  Promise.all([p1,p2]).then( ()=>{
      console.log("the end")
    }
  );

};

function parseVotes(since) {
  let counter = 0;
  const pipeline = chain([
//    decompression,
    parser(),
    ignore({filter: /url/}),
    ignore({filter: /^_id$/}),
    streamArray(),
    data => {
      console.log(data.value.ts.substring(0,10));
      if (Date.parse(data.value.ts.substring(0,10)) <= since) return false; // ignore the votes beside the current 8th term
      return data.value;
    }
  ]);
  pipeline.on('data', data => {
    //console.log(data);
    //    process.exit(1);
    ++counter});
  pipeline.on('end', () =>
    console.log(`The MEP voted ${counter} with rollcalls.`));

  return pipeline;
}

function mepstream(file) {
  const head = "voteid,mepid,vote".split(",");
  const csvwriter = require('csv-write-stream')({separator:",",headers: head,sendHeaders:true});

  const pipeline = chain([
    csvwriter,
    fs.createWriteStream(file)
  ]);
  return pipeline;
};

function writeMEPvotes(mepvotes){
  const types = {
    "Against":"against",
    "For":"for",
    "Abstain":"abstain",
  };

  const pipeline=chain([
    d => {
      for (var n in types) {
        const t=types[n];
        if (!d[n] || !d[n].groups) return;
        d[n].groups.forEach(g => {
          if (!g.votes) return;
          g.votes.forEach(v => {
            console.log({vote:types[n],mepid:v.ep_id,voteid:d.voteid});
            mepvotes.write({vote:types[n],mepid:v.ep_id,voteid:d.voteid});
          });
        });
      };
    }
  ]);
  return pipeline;

//  stream.write(d);


}

function writeSummary(file){
  var rapporteur = function (r) {
        if (!r) return "";
        return r.map(a=>a.ref).join("|");
      };
  var csvRow = function (d) {
    if (!d) return false;
    var data= {
      date: d.ts,
      report: d.report || "",
      title: d.eptitle || d.title,
      type: d.issue_type || "",
      'for': d.For ? d.For.total : 0,
      against:d.Against ? d.Against.total :0,
      abstain:d.Abstain ? d.Abstain.total : 0,
      id:d.voteid,
      rapporteur:(r => r ? r.map(a=>a.ref).join("|") : "")(d.rapporteur)
    };
    return data;
  };

  const head = "date,report,title,type,for,against,abstain,id,rapporteur".split(",");
  const csvwriter = require('csv-write-stream')({separator:",",headers: head,sendHeaders:true});

  const pipeline = chain([
    csvRow,
    csvwriter,
    fs.createWriteStream(file)
  ]);
//  csvwriter.on('data', data => console.log(data));

  return pipeline;
}
/*


  
  fs.createReadStream(options.from).pipe(stream.input)
  var writer = fs.createWriteStream(options.json);
  const csvwriter = require('csv-write-stream')({headers: head});
//  csvwriter.pipe(fs.createWriteStream(options.csv));
  stream.output.pipe(simp);
  simp.pipe(csv).pipe(csvwriter).pipe(fs.createWriteStream(options.csv));
  simp.pipe(JSONStream.stringify()).pipe(writer);

  if (typeof callback == "function") {
    csvwriter.on("finish", function() {
      callback()
    });
  }
}
*/

if (require.main === module) {
  write();
} else {
  exports.write = write;
  exports.processed = total;
}
