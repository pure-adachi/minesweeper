import flatten from "flat";
import ja from "./ja.json";

export const messages: {
  ja: {
    [key: string]: string;
  };
} = {
  ja: flatten(ja)
};
