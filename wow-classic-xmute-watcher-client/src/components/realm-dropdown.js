import React, { useRef, useEffect, useState } from "react";
import cx from "classnames";
import { useParams, useHistory } from "react-router-dom";
import { useBreakpoints } from "@utils/breakpoints-context";
import axios from "axios";
import "@styles/realm-dropdown.scss";

const RealmDropdown = () => {
  const { serverName, auctionHouseName } = useParams();
  const [options, setOptions] = useState([]);
  const history = useHistory();
  const { isMobile } = useBreakpoints();

  const RealmDropdownClassName = cx("RealmDropdown", {
    "RealmDropdown--mobile": isMobile,
  });

  useEffect(() => {
    axios(`/api/realms`).then(({ data }) => {
      setOptions(data);
    });
  }, []);

  return (
    <div className={RealmDropdownClassName}>
      <div className={"RealmDropdown-title"}>Server:</div>
      {options.length ? (
        <Dropdown
          options={options}
          value={serverName}
          onChange={({ value }) => {
            history.push(`/market/${value}/${auctionHouseName}`);
          }}
        />
      ) : (
        <div className="spinner">
          <div className="rect1"></div>
          <div className="rect2"></div>
          <div className="rect3"></div>
          <div className="rect4"></div>
          <div className="rect5"></div>
        </div>
      )}
    </div>
  );
};

export const Dropdown = ({ value, options, onChange }) => {
  const dropdownRef = useRef();
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

  const getSelectedOption = (value) => {
    return options.find((option) => option.value === value) || {};
  };

  const handleControlClick = () => setIsOpen((isOpen) => !isOpen);

  const DropdownArrowClassName = cx("Dropdown-arrow", {
    "Dropdown-arrow--open": isOpen,
  });

  const DropdownMenuClassName = cx("Dropdown-menu", {
    "Dropdown-menu--open": isOpen,
  });

  const handleOptionClick = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={"Dropdown"} ref={dropdownRef}>
      <div className="Dropdown-control" onClick={handleControlClick}>
        {getSelectedOption(value).label}
        <span className={DropdownArrowClassName} />
      </div>
      <div className={DropdownMenuClassName}>
        {options.map((option) => (
          <DropdownOption
            key={`dropdown-option-${option.value}`}
            option={option}
            isSelected={option.value === value}
            handleClick={handleOptionClick}
          />
        ))}
      </div>
    </div>
  );
};

const DropdownOption = ({ option, isSelected, handleClick }) => {
  const DropdownOptionClassName = cx("Dropdown-option", {
    "Dropdown-option--selected": isSelected,
  });
  return (
    <div
      className={DropdownOptionClassName}
      onMouseDown={() => handleClick(option)}
      onClick={() => handleClick(option)}
    >
      {option.label}
    </div>
  );
};

export default RealmDropdown;
