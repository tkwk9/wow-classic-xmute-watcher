import React from "react";
import { Reagent, XmuteItem } from "@components/icons";
import { useBreakpoints } from "@utils/breakpoints-context";
import "@styles/recipe-overview.scss";

const RecipeOverview = ({ data, recipe }) => {
  const { isMobile } = useBreakpoints();
  const currentPrice = Object.entries(data).reduce(
    (acc, [itemName, prices]) => {
      acc[itemName] = prices[prices.length - 1].y;
      return acc;
    },
    {}
  );
  const totalReagentCost = Object.values(recipe.ingredients).reduce(
    (acc, ingredient) =>
      acc + currentPrice[ingredient.name] * ingredient.quantity,
    0
  );

  const { ingredients, xmuteItem } = recipe;
  return (
    <div className="RecipeOverview">
      <h2 className={`RecipeOverview-title ${
            isMobile ? "RecipeOverview-title--mobile" : ""
          }`}>
        <span>Recipe Details</span>
        {!isMobile && <span> - </span>}
        <span>Current Market Price</span>
      </h2>
      <div
        className={`RecipeOverview-content ${
          isMobile ? "RecipeOverview-content--mobile" : ""
        }`}
      >
        <div
          className={`RecipeOverview-reagents ${
            isMobile ? "RecipeOverview-reagents--mobile" : ""
          }`}
        >
          {ingredients.map(ingredient => (
            <Reagent
              key={`ingredient-${ingredient.name}-${ingredient.quantity}`}
              itemInfo={ingredient}
              price={currentPrice[ingredient.name]}
            />
          ))}
        </div>
        <div
          className={`RecipeOverview-arrow ${
            isMobile ? "RecipeOverview-arrow--mobile" : ""
          }`}
        />
        <div className="RecipeOverview-xmuteItem">
          <XmuteItem
            itemInfo={xmuteItem}
            price={currentPrice[xmuteItem.name]}
            totalReagentCost={totalReagentCost}
          />
        </div>
      </div>
    </div>
  );
};

export default RecipeOverview;
