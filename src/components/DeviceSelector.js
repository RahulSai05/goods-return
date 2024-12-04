import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50vh;
`;

const SelectContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: black;

    > label{
        font-size: 1.25rem;
        font-weight: bold;
    }
    > select {
        padding: 0.75em;
        font-size: 1rem;
        background-color: #fff;
        outline: none;
    }
`;


const DeviceSelector = ({ onSelectionChange }) => {
  return (
    <div className="wrapper">
      <div className="select-container">
        <label htmlFor="device-selector" className="dropdown-label">
          Select Device to return
        </label>
        <select
          id="device-selector"
          className="styled-dropdown"
          onChange={onSelectionChange}
          defaultValue=""
        >
          <option value="" disabled>
            Select the return item
          </option>
          <option value="Iphone">Iphone</option>
          <option value="Watch">Watch</option>
          <option value="Camera">Camera</option>
          <option value="Laptop">Laptop</option>
        </select>
      </div>
    </div>
  );
};
export default DeviceSelector;