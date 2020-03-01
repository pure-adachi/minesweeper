import { faBomb, faFlag, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { CellType } from "../../templates/Board";

interface IProps {
  cell: CellType;
}

const CellLabel = ({ cell: { state, bomb, value } }: IProps) => {
  switch (state) {
    case "close":
      return <></>;
    case "flag":
      return <FontAwesomeIcon icon={faFlag} />;
    case "onHold":
      return <FontAwesomeIcon icon={faQuestion} />;
    case "open":
      if (bomb) {
        return <FontAwesomeIcon icon={faBomb} />;
      } else {
        if (value === 0) {
          return <></>;
        } else {
          return <>{value}</>;
        }
      }
  }
};

export default CellLabel;
