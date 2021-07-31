const fetch = require("node-fetch");
const fetchRetry = require("fetch-retry")(fetch);
const btoa = require("btoa");
const { URLSearchParams } = require("url");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const TBC_CLASSIC_DYNAMIC_NAMESPACE_US = "dynamic-classic-us";

const AUCTION_HOUSES = {
  alliance: 2,
  horde: 6,
};

const ITEMS = {
  23571: "Primal Might",
  22452: "Primal Earth",
  21885: "Primal Water",
  22451: "Primal Air",
  21884: "Primal Fire",
  22457: "Primal Mana",
  23079: "Deep Peridot",
  23107: "Shadow Draenite",
  23112: "Golden Draenite",
  25868: "Skyfire Diamond",
  25867: "Earthstorm Diamond",
  23077: "Blood Garnet",
  21929: "Flame Spessarite",
  23117: "Azure Moonstone",
};

const params = new URLSearchParams();
params.append("namespace", TBC_CLASSIC_DYNAMIC_NAMESPACE_US);
params.append("locale", "en_US");

/**
 * Gets the cheapest price for an item available in the AH. If an
 * auction is posted for multiple quantity, computes individual price.
 *
 * @param {Array} auctions an array of auctions of a single item
 * @returns {number} The current cheapest price in the AH
 */
const findCheapestPrice = (auctions) => {
  let min = Number.POSITIVE_INFINITY;
  auctions.forEach((auction) => {
    if (auction.buyout > 0)
      min = Math.min(min, Math.floor(auction.buyout / auction.quantity));
  });
  return min;
};

/**
 * Takes in the raw AH data, and turns it into the way we need it. Specifically,
 * filters for the items that we want and returns the cheapest price for them.
 *
 * @param {Object} auctionData an object with raw AH data as well as fetch timestamp
 * @returns {Object} Categorized AH data with the cheapest price
 */
const getCheapestAuctions = ({ auctions, fetchTime }) => {
  if (!auctions) return [];
  const data = {};
  const categorizedAuctions = auctions.reduce((acc, auction) => {
    if (ITEMS[auction.item.id]) {
      if (acc[auction.item.id]) {
        acc[auction.item.id].auctions.push(auction);
      } else {
        acc[auction.item.id] = {
          name: ITEMS[auction.item.id],
          fetchTime,
          auctions: [auction],
        };
      }
    }
    return acc;
  }, {});
  Object.keys(categorizedAuctions).forEach((itemId) => {
    const categorizedAuction = categorizedAuctions[itemId];
    const cheapestPrice = findCheapestPrice(categorizedAuction.auctions);
    data[categorizedAuction.name] = [{ x: fetchTime, y: cheapestPrice }];
  });
  return data;
};

/**
 * Fetches all AH data, and injects them into the realms Object
 *
 * @param {Object} realms server data
 * @returns {Promise} A promise that resolves with a mutated realms object with the AH data
 */
const fetchAllAuctionData = (realms) => {
  const fetchAuctions = ({
    realmSlug,
    realmId,
    auctionHouseName,
    auctionHouseId,
  }) => {
    return fetchRetry(
      `https://us.api.blizzard.com/data/wow/connected-realm/${realmId}/auctions/${auctionHouseId}?${params.toString()}`,
      {
        retries: 3,
        retryDelay(attempt) {
          console.log(
            `Fetch for ${realmSlug} ${auctionHouseName} failed... Trying again... attempt: ${attempt}`
          );
          return 500;
        },
      }
    )
      .then((res) => res.json())
      .catch((error) => {
        console.log(error);
        return {};
      });
  };
  const fetchTime = Date.now();
  const allFetches = [];
  console.log("Fetching Live Auction Data...");
  Object.entries(realms).forEach(([realmSlug, { id: realmId }]) => {
    Object.entries(AUCTION_HOUSES).forEach(
      ([auctionHouseName, auctionHouseId]) => {
        allFetches.push(
          fetchAuctions({
            realmSlug,
            realmId,
            auctionHouseName,
            auctionHouseId,
          }).then(
            ({ auctions }) =>
              (realms[realmSlug][auctionHouseName] = getCheapestAuctions({
                auctions,
                fetchTime,
              }))
          )
        );
      }
    );
  });
  return Promise.all(allFetches).then(() => realms);
};

/**
 * Fetches all server data. This is done this way instead of it being a constant
 * in case there's a new server.
 *
 * @returns {Promise} A promise that resolves with realm info
 */
const fetchRealmData = () => {
  return fetchRetry(
    `https://us.api.blizzard.com/data/wow/connected-realm/index?${params.toString()}`,
    {
      retries: 3,
      retryDelay(attempt) {
        console.log(
          `Realm list fetch failed... Trying again... attempt: ${attempt}`
        );
        return 500;
      },
    }
  )
    .then((res) => res.json())
    .then(({ connected_realms }) => {
      const fetchRealmPromises = [];
      connected_realms.forEach(({ href }) => {
        fetchRealmPromises.push(
          fetchRetry(`${href}&${params.toString()}`, {
            retries: 3,
            retryDelay(attempt) {
              console.log(
                `Realm fetch failed... Trying again... attempt: ${attempt}`
              );
              return 500;
            },
          })
            .then((res) => res.json())
            .then(({ realms }) => {
              const serverData = realms[0];
              return {
                id: serverData.id,
                slug: serverData.slug,
                name: serverData.name,
                timezone: serverData.timezone,
              };
            })
        );
      });
      return Promise.all(fetchRealmPromises);
    })
    .then((realmsArray) =>
      realmsArray.reduce((realms, realm) => {
        realms[realm.slug] = realm;
        return realms;
      }, {})
    );
};

/**
 * Gets Battle.net API auth token then appends it to params to be used
 * for all other Battle.net requests
 *
 * @param {Object} bnetCredentials Battle.net API credentials
 * @returns {Promise} A promise for then-chaining
 */
const getAccessToken = ({ bnetClientId, bnetClientSecret }) =>
  fetch("https://us.battle.net/oauth/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${bnetClientId}:${bnetClientSecret}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })
    .then((res) => res.json())
    .then(({ access_token }) => {
      params.append("access_token", access_token);
    });

/**
 * Gets the Battle.net client ID and secret from GCP Secret Manager
 *
 * @returns {Promise} A promise that resolves with Battle.net API credentials
 */
const getSecrets = () => {
  const secretClient = new SecretManagerServiceClient();
  const fetchBnetClientID = secretClient.accessSecretVersion({
    name: "projects/wow-classic-xmute-watch/secrets/BNET_CLIENT_ID/versions/latest",
  });
  const fetchBnetClientSecret = secretClient.accessSecretVersion({
    name: "projects/wow-classic-xmute-watch/secrets/BNET_CLIENT_SECRET/versions/latest",
  });
  return Promise.all([fetchBnetClientID, fetchBnetClientSecret]).then(
    ([[idVersion], [secretVersion]]) => {
      return {
        bnetClientId: idVersion.payload.data.toString(),
        bnetClientSecret: secretVersion.payload.data.toString(),
      };
    }
  );
};

/**
 * Chains the above promises to fetch the current AH data
 *
 * @returns {Promise} A promise that resolves with the newly fetched AH data
 */
const fetchAuctionData = async () =>
  getSecrets()
    .then(getAccessToken)
    .then(fetchRealmData)
    .then(fetchAllAuctionData);

/**
 * A helper function to injects the new set of AH data into the instance cache
 *
 * @param {Object} newData new AH data
 * @param {Object} cache current instance cache to be updated
 * @returns {Object} Updated cache. This isn't necessary since this function mutates the cache, but decided, why not.
 */
const updateAuctionCache = (newData, cache = {}) => {
  Object.entries(newData).forEach(([realmSlug, realmData]) => {
    if (!cache[realmSlug]) return (cache[realmSlug] = realmData);

    const cachedRealmData = cache[realmSlug];
    const { alliance: cachedAllianceData, horde: cachedHordeData } =
      cachedRealmData;

    const { alliance: newAllianceData, horde: newHordeData } = realmData;

    Object.keys(newAllianceData).forEach((itemName) => {
      if (!cachedAllianceData[itemName])
        return (cachedAllianceData[itemName] = newAllianceData[itemName]);
      cachedAllianceData[itemName] = [
        ...cachedAllianceData[itemName],
        ...newAllianceData[itemName],
      ];
    });

    Object.keys(newHordeData).forEach((itemName) => {
      if (!cachedHordeData[itemName])
        return (cachedHordeData[itemName] = newHordeData[itemName]);

      cachedHordeData[itemName] = [
        ...cachedHordeData[itemName],
        ...newHordeData[itemName],
      ];
    });
  });
  return cache;
};

module.exports = { fetchAuctionData, updateAuctionCache };
