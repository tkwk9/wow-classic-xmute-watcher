import React from "react";
import cx from "classnames";
import { useBreakpoints } from "@utils/breakpoints-context";
import { Link } from "react-router-dom";
import RealmDropdown from "@components/realm-dropdown";
import FactionSelectors from "@components/faction-selectors";
import "@styles/top-pane-market-content.scss";

const TopPaneMarketContent = () => {
  const { isMobile } = useBreakpoints();
  const TopPaneMarketContentClassName = cx("TopPaneMarketContent-selectors", {
    "TopPaneMarketContent-selectors--mobile": isMobile,
  });

  return (
    <div className={"TopPaneMarketContent"}>
      <h1 className={"TopPaneMarketContent-title"}>
        WoW Classic Xmute Watcher
      </h1>
      <div className={"TopPaneMarketContent-notes"}>
        <h2 className={"TopPaneMarketContent-subheader"}>
          Thank you for visiting!
        </h2>
        <span className={"TopPaneMarketContent-sentence"}>
          All auction house data is fetched hourly by the Express backend as a
          cron job.
        </span>
        <span className={"TopPaneMarketContent-sentence"}>
          For more information about the site, please visit the{" "}
          <Link to="/about">about page</Link>.
        </span>
        <br />
        <div className={TopPaneMarketContentClassName}>
          <FactionSelectors />
          <RealmDropdown />
        </div>
      </div>
    </div>
  );
};

export default TopPaneMarketContent;
