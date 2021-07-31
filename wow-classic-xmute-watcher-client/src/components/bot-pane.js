import React from "react";
import cx from "classnames";
import BotPaneMarketContent from "@components/bot-pane-market-content";
import BotPaneAboutContent from "@components/bot-pane-about-content";
import "@styles/bot-pane.scss";

const BotPane = ({ page }) => {
  const BotPaneClassName = cx("BotPane", {
    [`BotPane--${page}`]: true,
  });
  return (
    <section className={BotPaneClassName}>
      <div className={"BotPane-content"}>
        {page === "market" && <BotPaneMarketContent />}
        {page === "about" && <BotPaneAboutContent />}
      </div>
    </section>
  );
};

export default BotPane;
