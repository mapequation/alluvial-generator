import { createContext, Dispatch } from "react";
import type { NetworkFile } from "./types";

type State = {
  isCreatingDiagram: boolean;
  isLoadingExample: boolean;
  isLoadingFiles: boolean;
  infomapRunning: boolean;
  files: NetworkFile[];
  localStorageFiles: File[];
};

type Action = {
  type: string;
  payload?: any;
};

export const initialState = {
  isCreatingDiagram: false,
  isLoadingExample: false,
  isLoadingFiles: false,
  infomapRunning: false,
  files: [],
  localStorageFiles: [],
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "set":
      return { ...state, ...action.payload };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export const LoadContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => {},
});
