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

const initialCell: CellType = {
  state: "close",
  bomb: false,
  value: 0
};

const Board = ({ modeInfo }: IProps) => {
  const [boardSurfaces, setBoardSurfaces] = useState();
  const [startPosition, setStartPosition] = useState();
  const [started, setStarted] = useState(false);

  const initialBoard = useCallback(() => {
    const { x, y }: ModeInfoType = modeInfo;

    let cells: CellType[] = Array(x * y).fill(initialCell);
    let array: CellType[][] = [];

    for (let i = 0; i < cells.length; i += x) {
      array.push(cells.slice(i, i + x));
    }

    setBoardSurfaces(array);
    setStartPosition(null);
    setStarted(false);
  }, [modeInfo]);

  useEffect(() => {
    initialBoard();
  }, [modeInfo, initialBoard]);

  const setBoardItems = useCallback(() => {
    console.log("初回選択場所", startPosition, "爆弾、数字の配置開始");

    const { x, y, bomb }: ModeInfoType = modeInfo;

    let cells: CellType[] = [
      ...Array(bomb).fill({ ...initialCell, bomb: true }),
      ...Array(x * y - bomb - 1).fill(initialCell) // 初回選択マスは爆弾無しとする為に-1
    ];

    let array: CellType[] = [];
    let newArray: CellType[][] = [];

    // ダステンフェルドの手法(フィッシャー–イェーツのシャッフルの改良版)でシャッフル
    while (cells.length > 0) {
      const n = cells.length;
      const k = Math.floor(Math.random() * n);

      if ((startPosition.i + 1) * (startPosition.j + 1) === array.length + 1) {
        array.push(initialCell);
      }

      array.push(cells[k]);
      cells[k] = cells[n - 1];
      cells = cells.slice(0, n - 1);
    }

    for (let i = 0; i < array.length; i += x) {
      newArray.push(array.slice(i, i + x));
    }

    setBoardSurfaces(newArray);
  }, [modeInfo, startPosition]);

  useEffect(() => {
    if (startPosition) {
      setBoardItems();
      setStarted(true);
    }
  }, [startPosition, setBoardItems]);

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
        }
      } else {
        setStartPosition({ i, j });
      }
    },
    [boardSurfaces, startPosition, updateCell]
  );

  useEffect(() => {
    if (started) {
      openCell(startPosition.i, startPosition.j);
    }
  }, [started, openCell, startPosition]);

  if (!boardSurfaces) {
    return <></>;
  }

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
