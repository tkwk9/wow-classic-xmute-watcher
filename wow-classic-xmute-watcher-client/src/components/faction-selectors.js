import React from "react";
import cx from "classnames";
import { useParams, useHistory } from "react-router-dom";
import { useBreakpoints } from "@utils/breakpoints-context";
import "@styles/faction-selectors.scss";

const FactionSelectors = () => {
  const { serverName, auctionHouseName } = useParams();
  const { isMobile } = useBreakpoints();
  const history = useHistory();

  const FactionsSelectorsClassName = cx("FactionSelectors", {
    "FactionSelectors--mobile": isMobile
  });

  const FactionSelectorAllianceClassName = cx("FactionSelectors-selector", {
    "FactionSelectors-selector--selected": auctionHouseName === "alliance"
  });
  const FactionSelectorHordeClassName = cx("FactionSelectors-selector", {
    "FactionSelectors-selector--selected": auctionHouseName === "horde"
  });

  return (
    <div className={FactionsSelectorsClassName}>
      <button
        className={FactionSelectorAllianceClassName}
        onClick={() => history.push(`/${serverName}/alliance`)}
      >
        <div
          className={"FactionSelectors-logo FactionSelectors-logo--alliance"}
        />
        ALLIANCE
      </button>
      <button
        className={FactionSelectorHordeClassName}
        onClick={() => history.push(`/market/${serverName}/horde`)}
      >
        <div className={"FactionSelectors-logo FactionSelectors-logo--horde"} />
        HORDE
      </button>
    </div>
  );
};

export default FactionSelectors;
