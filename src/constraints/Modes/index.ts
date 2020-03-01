export type ModeInfoType = {
  bomb: number;
  x: number;
  y: number;
};

type ModesType = {
  [key: string]: ModeInfoType;
};

const Modes: ModesType = {
  easy: {
    bomb: 10,
    x: 9,
    y: 9
  },
  normal: {
    bomb: 40,
    x: 16,
    y: 16
  },
  hard: {
    bomb: 99,
    x: 30,
    y: 16
  }
};

export default Modes;
