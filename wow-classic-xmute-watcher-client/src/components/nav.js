import React, { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useHistory } from "react-router-dom";
import cx from "classnames";
import { useBreakpoints } from "@utils/breakpoints-context";
import "@styles/nav.scss";

const NavWrapper = () => {
  const { ref: scrollObserverRef, inView: observerInView } = useInView({
    threshold: 0,
    initialInView: true,
  });

  const shouldSticky = !observerInView;

  const {
    isMobile,
    isDesktopMedium,
    isDesktopLarge,
    isDesktopXLarge,
    isDesktopMax,
  } = useBreakpoints();

  const navWrapperClassName = cx("NavWrapper", {
    "NavWrapper--withPadding":
      !shouldSticky &&
      (isDesktopMedium || isDesktopLarge || isDesktopXLarge || isDesktopMax),
  });

  return (
    <>
      <div className={"NavWrapper-scrollObserver"} ref={scrollObserverRef} />
      <nav className={navWrapperClassName}>
        {isMobile ? <MobileNav /> : <DesktopNav shouldSticky={shouldSticky} />}
      </nav>
    </>
  );
};

const MobileNav = () => {
  return (
    <div className="MobileNav">
      <div className="MobileNav-logo" />
    </div>
  );
};

const DesktopNav = ({ shouldSticky }) => {
  const {
    isDesktopSmall,
    isDesktopMedium,
    isDesktopLarge,
    isDesktopXLarge,
    isDesktopMax,
  } = useBreakpoints();

  const navClassName = cx("DesktopNav", {
    "DesktopNav--sticky": shouldSticky,
    "DesktopNav--small": isDesktopSmall,
    "DesktopNav--medium": isDesktopMedium,
    "DesktopNav--large": isDesktopLarge,
    "DesktopNav--xLarge": isDesktopXLarge,
    "DesktopNav--max": isDesktopMax,
  });

  const logoSpacingClassName = cx("DesktopNav-logoSpacing", {
    "DesktopNav-logoSpacing--sticky": shouldSticky,
    "DesktopNav-logoSpacing--small": isDesktopSmall,
    "DesktopNav-logoSpacing--medium": isDesktopMedium,
    "DesktopNav-logoSpacing--large": isDesktopLarge,
    "DesktopNav-logoSpacing--xLarge": isDesktopXLarge,
    "DesktopNav-logoSpacing--max": isDesktopMax,
  });

  const navLogoClassName = cx("DesktopNav-logo", {
    "DesktopNav-logo--sticky": shouldSticky,
    "DesktopNav-logo--small": isDesktopSmall,
    "DesktopNav-logo--medium": isDesktopMedium,
    "DesktopNav-logo--large": isDesktopLarge,
    "DesktopNav-logo--xLarge": isDesktopXLarge,
    "DesktopNav-logo--max": isDesktopMax,
  });

  return (
    <div className={navClassName}>
      <div className={"DesktopNav-contentHolder"}>
        <section className={"DesktopNav-menuButtons"}>
          <div className={navLogoClassName} />
          <div className={logoSpacingClassName} />
          <NavMenuButton text={"MARKET"} topText={"LIVE"} path={"/market"} />
          <NavMenuButton text={"ABOUT"} path={"/about"} />
        </section>
        <section className={"DesktopNav-socialButtons"}>
          <NavMenuDropdown />
          <NavMenuButton
            text={"LINKEDIN"}
            socialIconModifier={"linkedin"}
            extraModifier={"linkedInButton"}
            isExternal={true}
            path={"https://www.linkedin.com/in/tim-kwak/"}
          />
          <NavMenuButton
            text={"GITHUB"}
            socialIconModifier={"github"}
            extraModifier={"githubButton"}
            isExternal={true}
            path={"https://github.com/t-kwak/wow-classic-xmute-watcher"}
          />
        </section>
      </div>
    </div>
  );
};

const NavMenuButton = ({
  text,
  topText,
  extraModifier,
  socialIconModifier,
  isExternal,
  path = "/",
}) => {
  const history = useHistory();
  const NavMenuButtonClassName = cx("NavMenuButton", {
    [`NavMenuButton--${extraModifier}`]: !!extraModifier,
  });
  const NavMenuSocialIconClassName = cx(
    "NavMenuButton-content NavMenuButton-socialIcon",
    {
      [`NavMenuButton-socialIcon--${socialIconModifier}`]: !!socialIconModifier,
    }
  );
  return (
    <div className={NavMenuButtonClassName}>
      <button
        className="NavMenuButton-button"
        onClick={() =>
          isExternal ? window.open(path, "_blank").focus() : history.push(path)
        }
      >
        {socialIconModifier && <span className={NavMenuSocialIconClassName} />}
        <span className="NavMenuButton-content">
          {text}
          {topText && (
            <span className={"NavMenuButton-toptext"}>{topText}</span>
          )}
        </span>
      </button>
    </div>
  );
};

const NavMenuDropdown = () => {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDocumentClick = (event) => {
    if (!dropdownRef?.current?.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick, false);
    document.addEventListener("touchend", handleDocumentClick, false);
    return () => {
      document.removeEventListener("click", handleDocumentClick, false);
      document.removeEventListener("touchend", handleDocumentClick, false);
    };
  }, []);

  const handleControlClick = () => setIsOpen((isOpen) => !isOpen);
  const DropdownMenuClassName = cx("NavMenuDropdown-menu", {
    "NavMenuDropdown-menu--open": isOpen,
  });

  const NavMenuDropdownControlClassName = cx("NavMenuDropdown-control", {
    "NavMenuDropdown-control--open": isOpen,
  });

  const NavMenuDropdownArrowClassName = cx("NavMenuDropdown-arrow", {
    "NavMenuDropdown-arrow--open": isOpen,
  });

  return (
    <div className={"NavMenuDropdown"} ref={dropdownRef}>
      <button className={"NavMenuDropdown-button"} onClick={handleControlClick}>
        <span className={NavMenuDropdownControlClassName}>
          OTHER PROJECTS <span className={NavMenuDropdownArrowClassName} />
        </span>
      </button>
      <div className={DropdownMenuClassName}>
        <ProjectSelector
          projectName={"Music Visualizer"}
          imageRef={"music_vis.jpg"}
          projectUrl={"http://timkwak.com/Music-Visualizer/"}
          projectDescription={
            "3D music visualizer made with Web Audio API and THREE.js"
          }
        />
        <ProjectSelector
          projectName={"jChess"}
          imageRef={"j_chess.jpg"}
          projectUrl={"http://timkwak.com/jChess/"}
          projectDescription={
            "Classic game of chess, made with jQuery, featuring an AI opponent"
          }
        />
        <ProjectSelector
          projectName={"Disclone"}
          imageRef={"disclone.jpg"}
          projectUrl={"https://disclone-app.herokuapp.com/"}
          projectDescription={"Live-chat web-application inspired by Discord"}
        />
      </div>
    </div>
  );
};

const ProjectSelector = ({
  imageRef,
  projectName,
  projectDescription,
  projectUrl,
}) => {
  return (
    <button
      className="ProjectSelector"
      onClick={() => window.open(projectUrl, "_blank").focus()}
    >
      <img
        className="ProjectSelector-img"
        src={require(`/images/${imageRef}`)}
        width={"150"}
        height={"150"}
        alt={"Project Image"}
      />
      <div className="ProjectSelector-texts">
        <div className="ProjectSelector-projectName">{projectName}</div>
        <div className="ProjectSelector-projectDescription">
          {projectDescription}
        </div>
      </div>
    </button>
  );
};

export default NavWrapper;
