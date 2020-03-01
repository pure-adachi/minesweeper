import {
  faTired,
  faGrin,
  faGrinStars
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

type GameStatus = "win" | "lose" | null;

interface IProps {
  onClick: () => void;
  gameStatus: GameStatus;
}

const ResetButton = ({ onClick, gameStatus }: IProps) => {
  const ison = () => {
    switch (gameStatus) {
      case "win":
        return <FontAwesomeIcon icon={faGrinStars} />;
      case "lose":
        return <FontAwesomeIcon icon={faTired} />;
      default:
        return <FontAwesomeIcon icon={faGrin} />;
    }
  };

  return (
    <div className="reset-button" onClick={onClick}>
      {ison()}
    </div>
  );
};

export default ResetButton;
