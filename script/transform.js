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

/*
Do NOT use the xz compression on the stream, it does make a mess and stops after a while
const xz = require("xz");
const decompression = new xz.Decompressor();
*/ 
 

//var mepid= require('../data/mepid.json'); // direct from EP site, for QA
//var csvparse=require('csv-parse/lib/sync.js');


function write(options = {
  from: "data/ep_votes.json",
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
  const pipeline = 
    fs.createReadStream(options.from)
//    .pipe(decompression)
    .pipe(parseVotes(options.since))
//    .pipe(fs.createWriteStream("data/8term.json"))
//    writeMEPvotes(mepvotes)
    .pipe(writeSummary(options.summary))
  
  pipeline.on('end', () =>{
      console.log("the end")
    //mepvotes.end());
  const p1=streamToPromise(mepvotes);
  const p2=streamToPromise(pipeline);
  Promise.all([p1,p2]).then( ()=>{
      console.log("the end")
    }
  );
  });
};

function parseVotes(since) {
  let counter = 0;
  const pipeline = chain([
//    decompression,
    parser(),
    ignore({filter: /\d+\.url$/}),
    ignore({filter: /\d+\._id$/}),
    ignore({filter: /\.groups/}), //if we only want the summary
    streamArray({objectFilter: asm => {
      const value = asm.current; // the value we are working on
      // the value can be incomplete, check if we have necessary properties
      if (value && typeof value.ts == 'string') {
        // we have the timestamp value and can make the final decision now
        return (Date.parse(value.ts.substring(0,10)) >= since);
        // depending on the return value above we made a final decision
        // we accepted or rejected an object,
        // now it will be speedily assembled or skipped.
      }
      // return undefined by default meaning "we are undecided yet"
    }}),
    data => {
      if (Date.parse(data.value.ts.substring(0,10)) < since) {
        process.stdout.write(" ");
        return; // ignore the votes beside the current 8th term
      }
      return data.value;
    }
  ]);
  pipeline.on('data', data => {
    process.stdout.write(".");
//    console.log(data);
    ++counter});
  pipeline.on('end', () =>
    console.log(`The MEP voted ${counter} with rollcalls.`));
  pipeline.on('drain', () => process.stdout.write("D"));
  pipeline.on('readable', () => process.stdout.write("R"));
  pipeline.on('error', (e) => {console.log(e);process.stdout.write("E")});

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
  return;
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
  pipeline.on('data', data => {
    process.stdout.write("x");
  });
  return pipeline;

//  stream.write(d);


}

function writeSummary(file){
  var rapporteur = function (r) {
        if (!r) return "";
        return r.map(a=>a.ref).join("|");
      };
  var csvRow = function (d) {
    var data= {
      date: d.ts,
      report: d.report || "",
      title: d.title,
      eptitle: d.eptitle,
      type: d.issue_type || "",
      'for': d.For ? d.For.total : 0,
      against:d.Against ? d.Against.total :0,
      abstain:d.Abstain ? d.Abstain.total : 0,
      id:d.voteid,
      rapporteur:(r => r ? r.map(a=>a.ref).join("|") : "")(d.rapporteur)
    };
    return data;
  };

  const head = "date,report,title,eptitle,type,for,against,abstain,id,rapporteur".split(",");
  const csvwriter = require('csv-write-stream')({separator:",",headers: head,sendHeaders:true});

  const pipeline = chain([
    csvRow,
    csvwriter,
    fs.createWriteStream(file)
  ]);

  pipeline.on('error', (e) => {console.log(e);process.stdout.write("E")});
  pipeline.on('drain', data => {
    process.stdout.write("]");
  });
  pipeline.on('pipe', data => {
    process.stdout.write("x");
  });

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
