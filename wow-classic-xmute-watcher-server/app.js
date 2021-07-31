const express = require("express");
const { fetchAuctionData, updateAuctionCache } = require("./fetchAuctionData");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const app = express();
const PORT = 8080;
const fileName = "auctionData_v3.prod.txt";

let instanceCache = [];

const storage = new Storage();
const bucket = storage.bucket("wow-classic-xmute-watch.appspot.com");
const file = bucket.file(fileName);

/**
 * Attempts to read stored data from GSC and then initalizes server instance cache
 * If the file doesn't exist for whatever reason, fetch a new set of data and then
 * stores it in GSC.
 *
 * @returns {void}
 */
const setInitialData = async () =>
  file
    .download()
    .then(([data]) => JSON.parse(data.toString("utf8")))
    .catch(() => {
      console.error("Auction Data not found in GSC.");
      return fetchAuctionData()
        .then(updateAuctionCache)
        .then((auctionData) => {
          const stream = file.createWriteStream();
          stream.end(JSON.stringify(auctionData));
          return auctionData;
        });
    })
    .then((auctionData) => {
      instanceCache = auctionData;
    });

/**
 * Starts the server. This should always happen after intializing data.
 *
 * @returns {void}
 */
const startServer = () => {
  console.log(`App starting...`);

  /**
   * Static assets. Figured using a CDN for a personal project
   * like this wasn't worth it.
   */
  app.use(
    "/static",
    express.static(
      path.resolve(__dirname, "../wow-classic-xmute-watcher-client/build")
    )
  );

  /**
   * Responds with the instance cache. Was used for debugging 
   * at the start of the project, but not really used anymore.
   * But decided to keep because... why not ?\_(«Ä)_/?
   */
  app.get("/api/all", (_, res) => {
    return res.json(instanceCache);
  });

  /**
   * Returns alphabetically ordered realm (server) data. Used
   * to populate the server selector.
   */
  app.get("/api/realms", (_, res) => {
    res.json(
      Object.entries(instanceCache)
        .map(([value, { name: label }]) => ({
          value,
          label,
        }))
        .sort((a, b) => {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        })
    );
  });

  /**
   * Responds with raw server data. Used by the marketing page to populate
   * the graph.
   */
  app.get("/api/:serverName/:auctionHouseName?", (req, res) => {
    const { serverName, auctionHouseName } = req.params;
    res.json(instanceCache[serverName][auctionHouseName]);
  });

  /**
   * Route to fetch a new set of AH data. Can only be called by
   * a cron job.
   */
  app.get("/fetch_auctions", async (req, res) => {
    console.log("Fetching new batch...");
    const isCron = req.get("X-Appengine-Cron");
    if (isCron) {
      const newAuctionData = await fetchAuctionData();
      instanceCache = updateAuctionCache(newAuctionData, instanceCache);
      const stream = file.createWriteStream();
      stream.end(JSON.stringify(instanceCache));
      res.sendStatus(200);
    } else {
      console.log("Unauthorized fetch_auction request");
      res.sendStatus(401);
    }
  });

  /**
   * Any other route will respond with the html. If the route is invalid,
   * react router will redirect to /market/faerlina/alliance
   */
  app.get("*", (_, res) => {
    console.log("Web Request Accepted!");
    res.sendFile(
      path.resolve(
        __dirname,
        "../wow-classic-xmute-watcher-client/build",
        "index.html"
      )
    );
  });

  app.listen(PORT, () => {
    console.log(`App ready to accept requests!`);
  });
};

module.exports = { setInitialData, startServer };
