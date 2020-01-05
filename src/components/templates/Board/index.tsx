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
  const [started, setStarted] = useState(false);

  const shuffle = (cells: CellType[]) => {
    const array = [...cells];

    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  };

  const initialBoard = useCallback(() => {
    const { x, y, bomb }: ModeInfoType = modeInfo;
    const initialCell: CellType = {
      state: "close",
      bomb: false,
      value: 0
    };

    let cells: CellType[] = [
      ...Array(bomb).fill({ ...initialCell, bomb: true }),
      ...Array(x * y - bomb).fill(initialCell)
    ];

    cells = shuffle(cells);
    let array: CellType[][] = [];

    for (let i = 0; i < cells.length; i += x) {
      array.push(cells.slice(i, i + x));
    }

    setBoardSurfaces(array);
    setStarted(false);
  }, [modeInfo]);

  useEffect(() => {
    initialBoard();
  }, [modeInfo, initialBoard]);

  if (!boardSurfaces) {
    return <></>;
  }

  const openCell = (i: number, j: number) => {
    if (started) {
      updateCell(i, j, "open");
    } else {
      exchangeFirstSelectedBombCell(i, j);
      setStarted(true);
    }
  };

  const exchangeFirstSelectedBombCell = (x: number, y: number) => {
    if (boardSurfaces[x][y].bomb) {
      for (let i = 0; i < boardSurfaces.length; i++) {
        const safeCellIndex: number = boardSurfaces[i].findIndex(
          ({ bomb }: CellType) => !bomb
        );

        if (safeCellIndex > -1) {
          const array = [...boardSurfaces];

          array[x][y] = {
            ...array[x][y],
            state: "open",
            bomb: false
          };

          array[i][safeCellIndex] = {
            ...array[i][safeCellIndex],
            bomb: true
          };

          setBoardSurfaces(array);

          return;
        }
      }
    }
    updateCell(x, y, "open");
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
        <button onClick={() => initialBoard()}>
          <FormattedMessage id="templates.Board.reset" />
        </button>
      </div>
      <div className="board">
        {boardSurfaces.map((row: CellType[], i: number) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <div
                key={j}
                className={classNames("cell", cell.state, { bomb: cell.bomb })}
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
