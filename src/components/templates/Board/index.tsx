import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { ModeInfoType } from "../../../constraints/Modes";
import {
  cellLabel,
  nextState,
  setBombCount,
  shuffle,
  openedBombCells,
  changedBombCellsToFlag,
  openAroundSafeCells
} from "./Module";

interface IProps {
  modeInfo: ModeInfoType;
}

export type CellStates = "close" | "flag" | "onHold" | "open";

export type CellType = {
  state: CellStates;
  bomb: boolean;
  value: number;
};

export type PositionType = {
  i: number;
  j: number;
};

export const initialCell: CellType = {
  state: "close",
  bomb: false,
  value: 0
};

const Board = ({ modeInfo }: IProps) => {
  const [boardSurfaces, setBoardSurfaces] = useState();
  const [started, setStarted] = useState(false);
  const [startPosition, setStartPosition] = useState();
  const [currentPosition, setCurrentPosition] = useState();
  const [gameStatus, setGameStatus] = useState();

  const initialBoard = useCallback(() => {
    const { x, y }: ModeInfoType = modeInfo;

    let cells: CellType[] = Array(x * y).fill(initialCell);
    let array: CellType[][] = [];

    for (let i = 0; i < cells.length; i += x) {
      array.push(cells.slice(i, i + x));
    }

    setBoardSurfaces(array);
    setStarted(false);
    setStartPosition(null);
    setCurrentPosition(null);
    setGameStatus(null);
  }, [modeInfo]);

  useEffect(() => {
    initialBoard();
  }, [initialBoard]);

  const setBoardItems = useCallback(() => {
    const { x, y, bomb }: ModeInfoType = modeInfo;

    let cells: CellType[] = [
      ...Array(bomb).fill({ ...initialCell, bomb: true }),
      ...Array(x * y - bomb - 1).fill(initialCell) // 初回選択マスは爆弾無しとする為に-1
    ];

    let array: CellType[] = shuffle(cells, { ...startPosition, modeInfo });
    let newArray: CellType[][] = [];

    for (let i = 0; i < array.length; i += x) {
      newArray.push(array.slice(i, i + x));
    }
    setBoardSurfaces(setBombCount(newArray));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startPosition]);

  useEffect(() => {
    if (startPosition) {
      setBoardItems();
      setStarted(true);
    }
  }, [startPosition, setBoardItems]);

  useEffect(() => {
    if (currentPosition) {
      const { i, j } = currentPosition;
      const { bomb, state, value } = boardSurfaces[i][j];
      if (bomb) {
        setGameStatus("lose");
      } else {
        const closeSafeCellRows = boardSurfaces.filter((cells: CellType[]) => {
          const safeCellsRows = cells.filter(
            cell => !cell.bomb && cell.state === "close"
          );
          return safeCellsRows.length > 0;
        });
        if (closeSafeCellRows.length === 0) {
          setGameStatus("win");
        } else if (value === 0 && state === "open") {
          setBoardSurfaces(openAroundSafeCells(boardSurfaces, currentPosition));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPosition]);

  useEffect(() => {
    switch (gameStatus) {
      case "lose":
        setBoardSurfaces(openedBombCells(boardSurfaces));
        break;
      case "win":
        setBoardSurfaces(changedBombCellsToFlag(boardSurfaces));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStatus]);

  const updateCell = useCallback(
    (i: number, j: number, state: CellStates) => {
      let board = [...boardSurfaces];
      let row = [...board[i]];
      row[j] = { ...board[i][j], state };
      board[i] = row;

      setBoardSurfaces(board);
    },
    [boardSurfaces]
  );

  const openCell = useCallback(
    (i: number, j: number) => {
      if (!gameStatus) {
        if (startPosition) {
          if (boardSurfaces[i][j].state === "close") {
            updateCell(i, j, "open");
            setCurrentPosition({ i, j });
          }
        } else {
          setStartPosition({ i, j });
          setCurrentPosition({ i, j });
        }
      }
    },
    [boardSurfaces, startPosition, updateCell, gameStatus]
  );

  useEffect(() => {
    if (started && startPosition) {
      openCell(startPosition.i, startPosition.j);
    }
  }, [started, openCell, startPosition]);

  if (!boardSurfaces) {
    return <></>;
  }

  const changeCell = (e: React.MouseEvent, i: number, j: number) => {
    e.preventDefault();

    if (startPosition && !gameStatus) {
      updateCell(i, j, nextState(boardSurfaces[i][j].state));
    }
  };

  return (
    <>
      <div>
        {gameStatus && (
          <FormattedMessage id={`templates.Board.${gameStatus}`} />
        )}
      </div>
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
