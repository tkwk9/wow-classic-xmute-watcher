import React from "react";
import "@styles/top-pane-about-content.scss";

const TopPaneAboutContent = () => {
  return (
    <div className="TopPaneAboutContent">
      <div className="TopPaneAboutContent-title">What is this?</div>
      <div className="TopPaneAboutContent-subtitle">
        WoW Classic Xmute Watcher is a web application built to help alchemists
        better understand the transmutation market. It does this by periodically
        collecting auction house information of various transmutation recipes
        and visualizing them.
      </div>
    </div>
  );
};

export default TopPaneAboutContent;
