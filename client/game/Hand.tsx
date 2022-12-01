import { DisplayObject, InteractionEvent } from "pixi.js";
import React, { createRef, FunctionComponentElement, Ref, RefObject, useContext } from "react";
import { useDrag } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { currentPlayer } from "../../common/util";
import { targetResolution } from "../Camera";
import { CardProps, cardWidth } from "../Card";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import { GameCard } from "./GameCard";

const HandCard = React.forwardRef(function HandCard(props: CardProps, ref: Ref<Container>) {
  const turn = useClientSelector((state) => state.game.turn);
  const player = useContext(PlayerContext);
  const isTurn = currentPlayer({ turn }) == player;

  const [{}, drag] = useDrag(() => ({
    type: "card",
    item: props.state,
    collect: () => ({}),
  }));

  function pointerdown(e: InteractionEvent) {
    if (isTurn) {
      drag({ current: e.target });
    }
  }

  return <GameCard {...props} ref={ref} interactive pointerdown={pointerdown} />;
});

export default function Hand() {
  const player = useContext(PlayerContext);
  const cards = useClientSelector((state) => state.game.players[player].hand);

  const nodes: FunctionComponentElement<{ ref: RefObject<DisplayObject> }>[] = [];

  let i = 0;
  for (const card of cards) {
    nodes.push(<HandCard zIndex={20 + i} state={card} key={card.id} ref={createRef()} x={i * (cardWidth / 4 + 10)} />);
    i++;
  }

  let x = (targetResolution.width - i * (cardWidth / 4 + 10)) / 2;
  let y = targetResolution.height * (3 / 4);

  return (
    <Container x={x} y={y}>
      {nodes}
    </Container>
  );
}
