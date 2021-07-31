import React from "react";
import "@styles/bot-pane-about-content.scss";

const BotPaneAboutContent = () => {
  return (
    <div className={"BotPaneAboutContent"}>
      <div className={"BotPaneAboutContent-paragraph"}>
        If you are not a WoW player, the above description probably didn't make
        a whole lot of sense. To explain this application to a non-WoW player, I
        need to first explain the WoW Auction House, how transmutation works in
        the context of WoW, and the economics behind it.
      </div>
      <h2 className={"BotPaneAboutContent-header"}>
        What is an Auction House?
      </h2>
      <div className={"BotPaneAboutContent-paragraph"}>
        WoW is an MMORPG with a player-driven economy. At the center of the
        economy is an Auction House (AH) which lets players put items up for
        sale that others can buy with in-game currency.
      </div>
      <h2 className={"BotPaneAboutContent-header"}>
        What is Alchemy and Transmutation?
      </h2>
      <div className={"BotPaneAboutContent-paragraph"}>
        A character in WoW can have professions. These are essentially "jobs"
        that help you earn in-game money. For example, a miner can collect metal
        ores to sell them to other players; a blacksmith can then forge an armor
        using metal bars and sell them for profit, etc. One such profession is
        alchemy.
      </div>
      <div className={"BotPaneAboutContent-paragraph"}>
        An alchemist makes potions and elixirs for consumption, but another
        thing that they do is transmute items. This is to turn one item into
        another item or to combine a set of items into one single item. For
        example, in The Burning Crusades expansion, one of the more well-known
        transmutation is "Transmute Primal Might," where an alchemist combines 5
        Primals (Earth, Water, Air, Fire and Mana) into the item Primal Might.
      </div>
      <img src={require("/images/recipe.png")} alt={"Sample Recipe"} />
      <h2 className={"BotPaneAboutContent-header"}>The Economics</h2>
      <div className={"BotPaneAboutContent-paragraph"}>
        Unlike in real life, you don't need radioactive decay for these
        transmutations to take place; but you do still need time. Many
        transmutations have cooldowns that prevent an alchemist from performing
        these transmutations more than once a day (e.g. you can transmute Primal
        Might every 20 hours). This creates a technical limit on how many of
        these items can be created on a given day, regardless of the number of
        ingredients available in the market. As a result, except for in rare
        situations, there's always some profit margin that an alchemist can earn
        by purchasing all the ingredients in the auction house and putting the
        transmuted item back in there for sale.
      </div>
      <h2 className={"BotPaneAboutContent-header"}>The Graph</h2>
      <div className={"BotPaneAboutContent-paragraph"}>
        The graph was built using Chart.js with some custom plugins for data
        highlighting and zoom effect. I did my best to make it as intuitive as
        possible, but the highest value series is almost always the transmuted
        item, and the bottom series are the ingredients, which are stacked to
        show total cost.
      </div>
      <img src={require("/images/chart_exp.png")} alt={"Chart explanation"} />
      <h2 className={"BotPaneAboutContent-header"}>Datasource</h2>
      <div className={"BotPaneAboutContent-paragraph"}>
        All the data you see on this website is from Blizzard's Battle.net API.
        With that said, because the API only lets you fetch current AH data, I
        have a Node backend that fetches the data from Blizzard server hourly
        then stores it in GCS. There's a reason why I decided to store the data
        in GCS instead of something more proper like Firestore or InfluxDB: it
        was just too expensive for a personal project. This is not a topic I
        want to cover here, but thank you for reading this far down and feel
        free to reach out if you are curious.
      </div>
    </div>
  );
};

export default BotPaneAboutContent;
