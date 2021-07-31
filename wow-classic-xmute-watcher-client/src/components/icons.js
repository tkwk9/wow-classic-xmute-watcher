import React from "react";
import Tooltip from "@components/tooltip";
import "@styles/icons.scss";

export const Reagent = ({ itemInfo, price }) => {
  return (
    <div className={"Reagent"}>
      <ItemIcon itemInfo={itemInfo} quantity={itemInfo.quantity} />
      <Tooltip>
        <div className="Reagent-name">{itemInfo.name}</div>
        <div className="Reagent-level">{`Item Level ${itemInfo.level}`}</div>
        <Price prefix={"Current AH Price:"} price={price} />
        <Price prefix={"Required Cost:"} price={price * itemInfo.quantity} />
      </Tooltip>
    </div>
  );
};

export const XmuteItem = ({ itemInfo, price, totalReagentCost }) => {
  return (
    <div className={"XmuteItem"}>
      <ItemIcon itemInfo={itemInfo} />
      <Tooltip>
        <div className="XmuteItem-name">{itemInfo.name}</div>
        <div className="XmuteItem-level">{`Item Level ${itemInfo.level}`}</div>
        <Price prefix={"Tota Reagent Cost:"} price={totalReagentCost} />
        <Price prefix={"Current AH Price:"} price={price} />
        <br />
        <Price prefix={"Proft:"} price={price - totalReagentCost} />
      </Tooltip>
    </div>
  );
};

export const ItemIcon = ({ itemInfo, quantity = 1 }) => {
  return (
    <div className="ItemIcon">
      <img
        className="ItemBorder"
        src={require(`/images/item_border.png`)}
        alt={"Item Border"}
      />
      <img
        className="ItemImage"
        src={require(`/images/${itemInfo.iconImage}`)}
        alt={itemInfo.name}
      />
      <div className="ItemCount">{quantity}</div>
    </div>
  );
};

export const TooltipItemIcon = ({ itemInfo }) => {
  return (
    <div className="TooltipItemIcon">
      <img
        className="TooltipItemBorder"
        src={require(`/images/item_border.png`)}
        alt={"Item Border"}
      />
      <img
        className="TooltipItemImage"
        src={require(`/images/${itemInfo.iconImage}`)}
        alt={itemInfo.name}
      />
    </div>
  );
};

export const Price = ({ prefix = "", price }) => {
  const sign = price < 0 ? "-" : "";
  const absPrice = Math.abs(price);
  const gold = Math.floor(absPrice / 10000);
  const silver = Math.floor((absPrice % 10000) / 100);
  const copper = absPrice % 100;

  const priceSpan = (
    <span>
      {!!gold && (
        <span className="UnitAmount">
          {sign}
          {gold}
          <span className="GoldIcon" />
        </span>
      )}
      {!!silver && (
        <span className="UnitAmount">
          {!gold && sign}
          {silver}
          <span className="SilverIcon" />
        </span>
      )}
      {!!copper && (
        <span className="UnitAmount">
          {!gold && !silver && sign}
          {copper}
          <span className="CopperIcon" />
        </span>
      )}
    </span>
  );

  return (
    <div className="Price">
      {prefix}
      {priceSpan}
    </div>
  );
};
