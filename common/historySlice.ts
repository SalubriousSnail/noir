import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Target } from "./card";
import { GameAction, gameReducers, GameState, initialGameState } from "./gameSlice";

export type HistoryState = {
  history: GameAction[];
  current: GameState;
};

export function initialHistoryState(): HistoryState {
  return {
    history: [],
    current: initialGameState(),
  };
}

export type HistoryAction = PayloadAction<HistoryParams, `history/${keyof typeof historySlice.actions}`>;

export type HistoryParams = SetActionParams | SetHiddenParams | SetUndoneParams;

export type SetActionParams = {
  index: number;
  action: GameAction;
};

export type SetHiddenParams = {
  index: number;
  card: Target;
};

export type SetUndoneParams = {
  index: number;
};

function reduce(history: GameAction[], state: GameState) {
  for (const action of history) {
    const name = action.type.replace("game/", "") as keyof typeof gameReducers;
    (gameReducers[name] as (state: GameState, action: GameAction) => void)(state, action);
  }

  return state;
}

export const historySlice = createSlice({
  name: "history",
  initialState: initialHistoryState(),
  reducers: {
    reset: () => initialHistoryState(),
    setAction: (state, action: PayloadAction<SetActionParams>) => {
      state.history[action.payload.index] = action.payload.action;
      state.current = reduce(state.history, initialGameState());
    },
    setHidden: (state, action: PayloadAction<SetHiddenParams>) => {
      state.history[action.payload.index] = { type: "game/hidden", payload: { card: action.payload.card } };
      state.current = reduce(state.history, initialGameState());
    },
    setUndone: (state, action: PayloadAction<SetUndoneParams>) => {
      state.history[action.payload.index] = {
        type: "game/undone",
        payload: { action: state.history[action.payload.index] },
      };
      state.current = reduce(state.history, initialGameState());
    },
  },
});

export const { reset, setAction, setHidden, setUndone } = historySlice.actions;
