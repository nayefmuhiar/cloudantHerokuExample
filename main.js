var request = require('request');
var sag = require('sag');

var TWITTER_URL_ROOT = 'http://search.twitter.com/search.json';

var searchRoot = '?q=';

var run;
var suspend;

var docsQueue = (function() {
  var queue = [];

  return {
    add: function(doc) {
      queue.push(doc);
    },

    flush: function() {
      sag.bulk({
        docs: queue,
        callback: function(resp, succ) {
          if(succ) {
            console.log('persisted');

            queue = [];
          }
          else {
            console.log('not persisted');
          }
        }
      });
    }
  };
}());

var searchAndPersist = function(qry) {
  console.log('searching twitter with: ' + qry);

  request(TWITTER_URL_ROOT + qry, function(err, resp, body) {
    var i;

    if(err) {
      console.log('HTTP error code from Twitter: ' + resp.statusCode);
    }
    else {
      body = JSON.parse(body);

      if(body.results.length) {
        for(i in body.results) {
          if(body.results.hasOwnProperty(i)) {
            body.results[i]._id = body.results[i].id_str;

            docsQueue.add(body.results[i]);
          }
        }

        docsQueue.flush();
      }
      else {
        console.log('no results from twitter');
      }

      if(body.next_page) {
        run(body.next_page, true);
      }
      else {
        suspend();
      }
    }
  });
};

run = function(qry, dontCheckLatestPersisted) {
  qry = (qry || searchRoot) + '&result_type=recent&show_user=false';

  if(dontCheckLatestPersisted) {
    sag.getAllDocs({
      limit: 1,
      descending: true,
      startKey: JSON.stringify('9'),
      callback: function(res, succ) {
        if(!succ) {
          throw new Error('Could not query latest: ' + res._HTTP.status);
        }

        if(res.body.rows.length) {
          console.log('latest twitter id in db: ' + res.body.rows[0].id);

          searchAndPersist(qry + '&since_id=' + res.body.rows[0].id);
        }
      }
    });
  }
  else {
    searchAndPersist(qry);
  }
};

suspend = function() {
  console.log('suspending');
  setTimeout(run, 300000);
};

if(typeof process.argv[2] !== 'string') {
  throw new Error('No search term provided: `node ./main.js "search term"`');
}

searchRoot += '"' + process.argv[2] + '"';

if(typeof process.env.CLOUDANT_URL !== 'string') {
  throw new Error('The CLOUDANT_URL environment variable is not set.');
}

sag = sag.serverFromURL(process.env.CLOUDANT_URL);

sag.setDatabase('heroku-example', true, function(exists) {
  if(!exists) {
    throw new Error('Was not able to find or create the herokuExample database.');
  }

  run();
});
