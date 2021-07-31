import "@utils/polyfill";
import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Nav from "@components/nav";
import TopPane from "@components/top-pane";
import BotPane from "@components/bot-pane";
import BreakpointsContext from "@utils/breakpoints-context";

import "@styles/reset.scss";
import "@styles/app.scss";

const App = () => (
  <div className="App">
    <BreakpointsContext>
      <Router>
        <Nav />
        <Switch>
          <Route exact path="/about">
            <TopPane page={"about"} />
            <BotPane page={"about"} />
          </Route>
          <Route exact path="/market/:serverName/:auctionHouseName">
            <TopPane page={"market"} />
            <BotPane page={"market"} />
          </Route>
          <Redirect from={"/"} to={"/market/faerlina/alliance"} />
        </Switch>
      </Router>
    </BreakpointsContext>
  </div>
);

ReactDOM.render(<App />, document.getElementById("root"));
