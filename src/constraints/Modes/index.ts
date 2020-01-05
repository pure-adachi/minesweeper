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
    x: 10,
    y: 7
  },
  normal: {
    bomb: 40,
    x: 18,
    y: 14
  },
  hard: {
    bomb: 99,
    x: 24,
    y: 20
  }
};

export default Modes;
