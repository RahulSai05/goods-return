import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material"; // Importing both MUI dropdown icons

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
`;

const SelectContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: black;
  width: 300px;

  > label {
    font-size: 1.25rem;
    font-weight: bold;
  }
`;

const Dropdown = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  font-weight: 500;
  position: relative;
  border: 2px solid #4caf50;
  border-radius: 8px;
  outline: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  background-color: ${(props) => (props.disabled ? "#f0f0f0" : "white")};
  border-color: ${(props) => (props.disabled ? "#ccc" : "#4caf50")};
`;

const StyledDropdown = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  cursor: pointer;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  outline: none;
`;

const DropdownItem = styled.div`
  padding: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const DeviceSelector = ({
  onSelectionChange,
  options = [],
  labelName,
  defaultValue = "Select the return item",
  disabled = false, // New disabled prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState(defaultValue);
  const dropdownRef = useRef(null);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);
  const handleSelect = (value, label) => {
    setSelectedLabel(label);
    setIsOpen(false);
    onSelectionChange(value);
  };

  return (
    <div className="wrapper">
      <SelectContainer>
        <label htmlFor="device-selector" className="dropdown-label">
          {labelName}
        </label>

        <Dropdown disabled={disabled} ref={dropdownRef}>
          <StyledDropdown onClick={() => !disabled && setIsOpen(!isOpen)}>
            <span>{selectedLabel}</span>
            {isOpen ? <ArrowDropUp /> : <ArrowDropDown />}
          </StyledDropdown>
          {isOpen && !disabled && (
            <DropdownMenu>
              <SearchInput
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={disabled}
              />
              {filteredOptions.map((option, index) => (
                <DropdownItem
                  key={index}
                  onClick={() => handleSelect(option.value, option.label)}
                >
                  {option.label}
                </DropdownItem>
              ))}
              {filteredOptions.length === 0 && (
                <DropdownItem>No options found</DropdownItem>
              )}
            </DropdownMenu>
          )}
        </Dropdown>
      </SelectContainer>
    </div>
  );
};

export default DeviceSelector;
