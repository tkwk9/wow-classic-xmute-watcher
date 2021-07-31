import React from "react";
import "@styles/tooltip.scss";

const Tooltip = ({children}) => {
  return (
    <div className="Tooltip">
      <div className="Tooltip-content">{children}</div>
      <div className="Tooltip-right" />
      <div className="Tooltip-botLeft" />
      <div className="Tooltip-botRight" />
    </div>
  );
};

export default Tooltip;
