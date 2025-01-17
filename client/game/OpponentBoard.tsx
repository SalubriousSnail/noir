import React, { useContext } from "react";
import { opponent } from "../../common/util";
import { targetResolution } from "../Camera";
import { smallCardHeight, smallCardWidth } from "../Card";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard from "./GameCard";

export default function OpponentBoard() {
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.current.players[opponent(player)].board);

  const x = (targetResolution.width - cards.length * (smallCardWidth + 10)) / 2 + smallCardWidth / 2;
  const y = targetResolution.height * (1 / 4) + smallCardHeight / 2;
  
  return (
    <EnterExitAnimator elements={cards}>
      {(state, status, i) =>
        i != null ? (
          <GameCard state={state} status={status} key={state.id} x={x + i * (smallCardWidth + 10)} y={y} />
        ) : (
          <GameCard useLastPos={true} state={state} status={status} key={state.id} />
        )
      }
    </EnterExitAnimator>
  );
}
