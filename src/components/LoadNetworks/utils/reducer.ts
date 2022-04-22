type State = {
  isCreatingDiagram: boolean;
  isLoadingExample: boolean;
  isLoadingFiles: boolean;
  infomapRunning: boolean;
  files: readonly any[]; // FIXME any
  localStorageFiles: readonly any[]; // FIXME any
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
} as const;

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
