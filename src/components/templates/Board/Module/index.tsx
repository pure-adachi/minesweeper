import { faBomb, faFlag, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { CellType, CellStates, initialCell, PositionType } from "../../Board";
import { ModeInfoType } from "../../../../constraints/Modes";

interface IShuffleProps extends PositionType {
  modeInfo: ModeInfoType;
}

export const shuffle = (
  cells: CellType[],
  { i, j, modeInfo: { x, y } }: IShuffleProps
) => {
  let array: CellType[] = [];

  // ダステンフェルドの手法(フィッシャー–イェーツのシャッフルの改良版)でシャッフル
  while (cells.length > 0) {
    const n = cells.length;
    const k = Math.floor(Math.random() * n);

    // 一番最初に選択したマスには爆弾を配置しない為の対策
    if (i * x + j + 1 === array.length + 1) {
      array.push(initialCell);
    }

    array.push(cells[k]);
    cells[k] = cells[n - 1];
    cells = cells.slice(0, n - 1);
  }

  // 一番右下のマスを選択された場合の対策
  if (x * y > array.length) {
    array.push(initialCell);
  }

  return array;
};

export const setBombCount = (array: CellType[][]) => {
  let newArray: CellType[][] = [];

  for (let i = 0; i < array.length; i++) {
    let newRow: CellType[] = [];

    for (let j = 0; j < array[i].length; j++) {
      if (array[i][j].bomb) {
        newRow.push(array[i][j]);
      } else {
        let targetCellsIndex: CellType[] = [];

        // 上下：i
        // 左右：j

        // 左上
        if (j - 1 >= 0 && i - 1 >= 0) {
          targetCellsIndex.push(array[i - 1][j - 1]);
        }
        // 上
        if (i - 1 >= 0) {
          targetCellsIndex.push(array[i - 1][j]);
        }
        // 右上
        if (j + 1 < array[i].length && i - 1 >= 0) {
          targetCellsIndex.push(array[i - 1][j + 1]);
        }
        // 右
        if (j + 1 < array[i].length) {
          targetCellsIndex.push(array[i][j + 1]);
        }
        // 右下
        if (j + 1 < array[i].length && i + 1 < array.length) {
          targetCellsIndex.push(array[i + 1][j + 1]);
        }
        // 下
        if (i + 1 < array.length) {
          targetCellsIndex.push(array[i + 1][j]);
        }
        // 左下
        if (j - 1 >= 0 && i + 1 < array.length) {
          targetCellsIndex.push(array[i + 1][j - 1]);
        }
        // 左
        if (j - 1 >= 0) {
          targetCellsIndex.push(array[i][j - 1]);
        }
        const bombCells: CellType[] = targetCellsIndex.filter(
          ({ bomb }) => bomb
        );

        newRow.push({
          ...array[i][j],
          value: bombCells.length
        });
      }
    }

    newArray.push(newRow);
  }

  return newArray;
};

export const cellLabel = (cell: CellType) => {
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

export const nextState = (state: CellStates) => {
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

export const openedBombCells = (boardSurfaces: CellType[][]) =>
  boardSurfaces.map(cells =>
    cells.map(cell => {
      if (cell.bomb) {
        return {
          ...cell,
          state: "open"
        };
      } else {
        return cell;
      }
    })
  );

export const changedBombCellsToFlag = (boardSurfaces: CellType[][]) =>
  boardSurfaces.map(cells =>
    cells.map(cell => {
      if (cell.bomb) {
        return {
          ...cell,
          state: "flag"
        };
      } else {
        return cell;
      }
    })
  );

export const openAroundSafeCells = (
  boardSurfaces: CellType[][],
  currentPosition: PositionType
) => {
  const { i, j } = currentPosition;
  const { state, value } = boardSurfaces[i][j];
  let newBoardSurfaces: CellType[][] = [...boardSurfaces];

  // 最初は既に空いてる
  if (state === "close") {
    newBoardSurfaces[i][j].state = "open";
  }

  // 爆弾のある手前まで来たら再帰処理終了
  if (value !== 0) {
    return newBoardSurfaces;
  }

  // 上下：i
  // 左右：j

  // 左上
  if (
    j - 1 >= 0 &&
    i - 1 >= 0 &&
    newBoardSurfaces[i - 1][j - 1].state === "close"
  ) {
    newBoardSurfaces = openAroundSafeCells(newBoardSurfaces, {
      i: i - 1,
      j: j - 1
    });
  }
  // 上
  if (i - 1 >= 0 && newBoardSurfaces[i - 1][j].state === "close") {
    newBoardSurfaces = openAroundSafeCells(newBoardSurfaces, {
      i: i - 1,
      j
    });
  }
  // 右上
  if (
    j + 1 < newBoardSurfaces[i].length &&
    i - 1 >= 0 &&
    newBoardSurfaces[i - 1][j + 1].state === "close"
  ) {
    newBoardSurfaces = openAroundSafeCells(newBoardSurfaces, {
      i: i - 1,
      j: j + 1
    });
  }
  // 右
  if (
    j + 1 < newBoardSurfaces[i].length &&
    newBoardSurfaces[i][j + 1].state === "close"
  ) {
    newBoardSurfaces = openAroundSafeCells(newBoardSurfaces, {
      i,
      j: j + 1
    });
  }
  // 右下
  if (
    j + 1 < newBoardSurfaces[i].length &&
    i + 1 < newBoardSurfaces.length &&
    newBoardSurfaces[i + 1][j + 1].state === "close"
  ) {
    newBoardSurfaces = openAroundSafeCells(newBoardSurfaces, {
      i: i + 1,
      j: j + 1
    });
  }
  // 下
  if (
    i + 1 < newBoardSurfaces.length &&
    newBoardSurfaces[i + 1][j].state === "close"
  ) {
    newBoardSurfaces = openAroundSafeCells(newBoardSurfaces, {
      i: i + 1,
      j
    });
  }
  // 左下
  if (
    j - 1 >= 0 &&
    i + 1 < newBoardSurfaces.length &&
    newBoardSurfaces[i + 1][j - 1].state === "close"
  ) {
    newBoardSurfaces = openAroundSafeCells(newBoardSurfaces, {
      i: i + 1,
      j: j - 1
    });
  }
  // 左
  if (j - 1 >= 0 && newBoardSurfaces[i][j - 1].state === "close") {
    newBoardSurfaces = openAroundSafeCells(newBoardSurfaces, {
      i,
      j: j - 1
    });
  }

  return newBoardSurfaces;
};
