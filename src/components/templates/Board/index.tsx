import { faFlag, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { MobileView } from "react-device-detect";
import { ModeInfoType } from "../../../constraints/Modes";
import {
  nextState,
  setBombCount,
  shuffle,
  openedBombCells,
  changedBombCellsToFlag,
  openAroundSafeCells,
  flagCount
} from "./Module";
import BombCount from "../../molecules/BombCount";
import Time from "../../molecules/Time";
import CellLabel from "../../atoms/CellLabel";
import ResetButton from "../../atoms/ResetButton";

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
  const [startUnixTime, setStartUnixTime] = useState();
  const [finishedUnixTime, setFinishedUnixTime] = useState();
  const [modeInMobile, setModeInMobile] = useState();

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
    setStartUnixTime(null);
    setFinishedUnixTime(null);
    setModeInMobile(null);
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
    setStartUnixTime(Math.floor(new Date().getTime() / 1000));
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
            cell => !cell.bomb && cell.state !== "open"
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
    if (gameStatus) {
      switch (gameStatus) {
        case "lose":
          setBoardSurfaces(openedBombCells(boardSurfaces));
          break;
        case "win":
          setBoardSurfaces(changedBombCellsToFlag(boardSurfaces));
          break;
      }

      setFinishedUnixTime(Math.floor(new Date().getTime() / 1000));
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
      if (startPosition) {
        if (boardSurfaces[i][j].state === "close") {
          updateCell(i, j, "open");
          setCurrentPosition({ i, j });
        }
      } else {
        setStartPosition({ i, j });
        setCurrentPosition({ i, j });
      }
    },
    [boardSurfaces, startPosition, updateCell]
  );

  const handleClick = (i: number, j: number) => {
    if (!gameStatus && boardSurfaces[i][j].state !== "open") {
      if (modeInMobile === "flag") {
        if (boardSurfaces[i][j].state === "flag") {
          updateCell(i, j, "close");
        } else {
          updateCell(i, j, "flag");
        }
      } else if (modeInMobile === "hold") {
        if (boardSurfaces[i][j].state === "onHold") {
          updateCell(i, j, "close");
        } else {
          updateCell(i, j, "onHold");
        }
      } else {
        openCell(i, j);
      }
    }
  };

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

  const flagMode = () => {
    if (started) {
      setModeInMobile(modeInMobile === "flag" ? null : "flag");
    }
  };

  const holdMode = () => {
    if (started) {
      setModeInMobile(modeInMobile === "hold" ? null : "hold");
    }
  };

  return (
    <>
      <div className="board">
        <div className="game-info">
          <BombCount count={modeInfo.bomb - flagCount(boardSurfaces)} />
          <ResetButton onClick={initialBoard} gameStatus={gameStatus} />
          <Time
            startUnixTime={startUnixTime}
            finishedUnixTime={finishedUnixTime}
          />
        </div>
        <div className={classNames("cell-area", { end: gameStatus })}>
          {boardSurfaces.map((row: CellType[], i: number) => (
            <div key={i} className="row">
              {row.map((cell, j) => (
                <div
                  key={j}
                  className={classNames("cell", cell.state, {
                    bomb: cell.bomb && cell.state === "open",
                    selected:
                      currentPosition &&
                      currentPosition.i === i &&
                      currentPosition.j === j,
                    [`bombCount-${cell.value}`]: cell.state === "open",
                    notBomb: gameStatus && cell.state === "flag" && !cell.bomb
                  })}
                  onClick={() => handleClick(i, j)}
                  onContextMenu={e => changeCell(e, i, j)}
                >
                  <CellLabel cell={cell} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <MobileView viewClassName="mobile-menu">
        <div
          className={classNames("flag-mode", {
            active: modeInMobile === "flag"
          })}
          onClick={flagMode}
        >
          <FontAwesomeIcon icon={faFlag} />
        </div>
        <div
          className={classNames("hold-mode", {
            active: modeInMobile === "hold"
          })}
          onClick={holdMode}
        >
          <FontAwesomeIcon icon={faQuestion} />
        </div>
      </MobileView>
    </>
  );
};

export default Board;
