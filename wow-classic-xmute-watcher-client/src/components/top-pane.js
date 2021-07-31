import React from "react";
import cx from "classnames";
import TopPaneMarketContent from "@components/top-pane-market-content";
import TopPaneAboutContent from "@components/top-pane-about-content";
import { useBreakpoints } from "@utils/breakpoints-context";
import "@styles/top-pane.scss";

const TopPane = ({ page }) => {
  const { isMobile } = useBreakpoints();
  const TopPaneContentClassName = cx("TopPane-content", {
    "TopPane-content--mobile": isMobile,
  });
  const TopPaneClassName = cx("TopPane", {
    [`TopPane--${page}`]: true,
  });

  return (
    <section className={TopPaneClassName}>
      <div className={"TopPane-overlay"} />
      <div className={TopPaneContentClassName}>
        {page === "about" && <TopPaneAboutContent />}
        {page === "market" && <TopPaneMarketContent />}
      </div>
    </section>
  );
};

export default TopPane;
