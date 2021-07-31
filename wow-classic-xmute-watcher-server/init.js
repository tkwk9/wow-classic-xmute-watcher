const { setInitialData, startServer } = require("./app.js");

setInitialData().then(startServer);
