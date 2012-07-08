# herokuExample

An example of using Heroku and Cloudant. It collects tweets for the "couchdb"
search term using Twitter"s API, storing them in the "herokuExample" database.

## Getting Started

These are the install instructions.

1. Clone this repo onto your computer:

`git clone https://github.com/sbisbee/herokuExample.git`

2. Make sure you have set up Heroku properly. See
https://devcenter.heroku.com/articles/quickstart

3. Install the Cloudant add-on, specifying the free version (basic):

`heroku addons:add cloudant:oxygen`

4. Create the app on your Heroku account - you will be using the provided
Procfile:

`heroku create`

5. Deploy your code to Heroku:

`git push heroku master`

6. Scale up the worker process:

`heroku ps:scale worker=1`

7. Log into the Cloudant dashboard and view the "heroku-example" database. You
will see the stored tweets (may take a few minutes to show up depending on the
Twitter Search API and latency) and can write views against them.

## License
Copyright (c) 2012 Sam Bisbee
Licensed under the APACHE-2.0 license.