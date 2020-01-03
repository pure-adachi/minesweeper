import { faBomb, faFlag, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { ModeInfoType } from "../../../constraints/Modes";

interface IProps {
  modeInfo: ModeInfoType;
}

type CellStates = "close" | "flag" | "onHold" | "open";

type CellType = {
  state: CellStates;
  bomb: boolean;
  value: number;
};

const Board = ({ modeInfo }: IProps) => {
  const [boardSurfaces, setBoardSurfaces] = useState();

  const initBoard = useCallback(() => {
    const { x, y }: ModeInfoType = modeInfo;

    setBoardSurfaces(
      Array(y).fill(
        Array(x).fill({
          state: "close",
          bomb: false,
          value: 0
        } as CellType)
      )
    );
  }, [modeInfo]);

  useEffect(() => {
    initBoard();
  }, [modeInfo, initBoard]);

  if (!boardSurfaces) {
    return <></>;
  }

  const openCell = (i: number, j: number) => {
    updateCell(i, j, "open");
  };

  const changeCell = (e: React.MouseEvent, i: number, j: number) => {
    e.preventDefault();

    updateCell(i, j, nextState(boardSurfaces[i][j].state));
  };

  const nextState = (state: CellStates) => {
    switch (state) {
      case "close":
        return "flag";
      case "flag":
        return "onHold";
      case "onHold":
        return "close";
      case "open":
        return state;
    }
  };

  const updateCell = (i: number, j: number, state: CellStates) => {
    let board = [...boardSurfaces];
    let row = [...board[i]];
    row[j] = { ...board[i][j], state };
    board[i] = row;

    setBoardSurfaces(board);
  };

  const cellLabel = (cell: CellType) => {
    switch (cell.state) {
      case "close":
        return;
      case "flag":
        return <FontAwesomeIcon icon={faFlag} />;
      case "onHold":
        return <FontAwesomeIcon icon={faQuestion} />;
      case "open":
        if (cell.bomb) {
          return <FontAwesomeIcon icon={faBomb} />;
        } else {
          if (cell.value === 0) {
            return;
          } else {
            return cell.value;
          }
        }
    }
  };

  return (
    <>
      <div className="buttons">
        <button onClick={() => initBoard()}>
          <FormattedMessage id="templates.Board.reset" />
        </button>
      </div>
      <div className="board">
        {boardSurfaces.map((row: CellType[], i: number) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <div
                key={j}
                className={classNames("cell", cell.state)}
                onClick={() => openCell(i, j)}
                onContextMenu={e => changeCell(e, i, j)}
              >
                {cellLabel(cell)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};

export default Board;
