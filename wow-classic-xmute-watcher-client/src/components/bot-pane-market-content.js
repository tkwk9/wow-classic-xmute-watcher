import React, { useState, useEffect } from "react";
import MarketChart from "@components/market-chart";
import RecipeOverview from "@components/recipe-overview";
import { useBreakpoints } from "@utils/breakpoints-context";
import { recipes } from "@utils/constants";
import ErrorBoundary from "@utils/error-boundary";
import { useParams } from "react-router-dom";
import Tooltip from "@components/tooltip";
import cx from "classnames";
import axios from "axios";
import "@styles/bot-pane-market-content.scss";

const BotPaneMarketContent = () => {
  const { serverName, auctionHouseName } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [xmuteItem, setXmuteItem] = useState("Primal Might");
  const { isMobile } = useBreakpoints();

  useEffect(() => {
    setLoading(true);
  }, [serverName, auctionHouseName]);

  useEffect(() => {
    if (loading)
      axios(`/api/${serverName}/${auctionHouseName}`).then(({ data }) => {
        setData(data);
        setLoading(false);
      });
  }, [loading]);

  const recipeSelectorsClassName = cx("BotPaneMarketContent-recipeSelectors", {
    "BotPaneMarketContent-recipeSelectors--mobile": isMobile,
  });

  return (
    <div className="BotPaneMarketContent">
      <div className={recipeSelectorsClassName}>
        {Object.keys(recipes).map((recipeName) => (
          <ReceipeSelector
            recipeName={recipeName}
            isSelected={recipeName === xmuteItem}
            handleClick={() => setXmuteItem(recipeName)}
            key={`selector-${recipeName}`}
          />
        ))}
      </div>
      <ErrorBoundary
        xmuteItem={xmuteItem}
        serverName={serverName}
        auctionHouseName={auctionHouseName}
        fallback={
          <h1 className={"BotPaneMarketContent-errorFallback"}>
            There's not enough data on this server...
          </h1>
        }
      >
        {loading ? (
          <div className="sk-cube-grid">
            <div className="sk-cube sk-cube1" />
            <div className="sk-cube sk-cube2" />
            <div className="sk-cube sk-cube3" />
            <div className="sk-cube sk-cube4" />
            <div className="sk-cube sk-cube5" />
            <div className="sk-cube sk-cube6" />
            <div className="sk-cube sk-cube7" />
            <div className="sk-cube sk-cube8" />
            <div className="sk-cube sk-cube9" />
          </div>
        ) : (
          <>
            {isMobile ? (
              <div className={"BotPaneMarketContent-mobileBanner"}>
                <Tooltip>
                  <div className={"BotPaneMarketContent-mobileBannerContent"}>
                    <span>Visit on Desktop</span>
                    <span>To See the AH Chart!</span>
                  </div>
                </Tooltip>
              </div>
            ) : (
              <MarketChart
                data={data}
                recipe={recipes[xmuteItem]}
                serverName={serverName}
                auctionHouseName={auctionHouseName}
              />
            )}
            <RecipeOverview data={data} recipe={recipes[xmuteItem]} />
          </>
        )}
      </ErrorBoundary>
    </div>
  );
};

const ReceipeSelector = ({ recipeName, isSelected, handleClick }) => {
  const className = cx("BotPaneMarketContent-recipeSelector", {
    "BotPaneMarketContent-recipeSelector--selected": isSelected,
  });
  return (
    <button className={className} onClick={handleClick}>
      {recipeName.toUpperCase()}
    </button>
  );
};

export default BotPaneMarketContent;
