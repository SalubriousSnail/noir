import React, { MutableRefObject, Ref, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";
import { EnterExitAnimator } from "../EnterExitAnimation";
import { useClientSelector } from "../store";
import { PlayerContext } from "./Game";
import GameCard, { gameCardHeight, GameCardProps, gameCardWidth } from "./GameCard";
import { defaultUtil, isLoaded, loadCard, useCardInfo } from "../cards";
import Reticle from "./Reticle";
import { getCardColor } from "../Card";

const HandCard = React.forwardRef(function HandCard(props: GameCardProps, ref: Ref<Container>) {
  const cardRef = useRef() as MutableRefObject<Required<Container>>;
  const targetRef = useRef() as MutableRefObject<Required<Container>>;
  const cardInfo = useCardInfo(props.state);

  useImperativeHandle(ref, () => cardRef.current);

  useEffect(() => {
    if (cardRef.current) {
      drag(cardInfo.targets ? targetRef : cardRef);
    }
  }, [cardInfo]);

  const [{ isDragging, globalPosition }, drag] = useDrag(
    () => ({
      type: cardInfo.targets ? "target" : "card",
      item: props.state,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
        globalPosition: monitor.getInitialClientOffset(),
      }),
    }),
    [cardInfo]
  );

  let x = props.x;
  let y = props.y;

  if (cardRef.current && isDragging && globalPosition) {
    const position = cardRef.current.parent.toLocal({ x: globalPosition.x, y: globalPosition.y });
    x = position.x;
    y = position.y;
  }

  const card = <GameCard {...props} x={x} y={y} ref={cardRef} interactive />;

  if (cardInfo.targets) {
    const target = <Reticle x={x} y={y} ref={targetRef} isDragging={isDragging} color={getCardColor(cardInfo)} />;
    return (
      <>
        {card}
        {target}
      </>
    );
  } else {
    return card;
  }
});

export default function Hand() {
  const [_, setHasLoaded] = useState(false);
  const player = useContext(PlayerContext);
  const game = useClientSelector((state) => state.game.current);
  const cards = game.players[player].deck;

  useEffect(() => {
    if (cards.some((card) => !isLoaded(card))) {
      setHasLoaded(false);
    }

    (async () => {
      for (const card of cards.filter((c) => !isLoaded(c))) {
        await loadCard(card);
      }

      setHasLoaded(true);
    })();
  }, [cards]);

  const hand = cards
    .filter((card) => isLoaded(card))
    .filter((card) => {
      const info = defaultUtil.getCardInfo(game, card);
      return defaultUtil.canPayCost(game, player, info.colors, info.cost);
    });

  let offset = gameCardWidth - 20;
  if (offset * hand.length > 2500) {
    offset /= (offset * hand.length) / 2500;
  }

  const x = (targetResolution.width - hand.length * offset) / 2 + gameCardWidth / 2;
  const y = targetResolution.height * (3 / 4) + gameCardHeight / 2 + 20;

  return (
    <EnterExitAnimator elements={hand}>
      {(state, status, i) =>
        i != null ? (
          <HandCard
            zIndex={20 + i}
            state={state}
            status={status}
            key={state.id}
            x={x + i * offset}
            y={y + Math.abs((i - (hand.length - 1) / 2.0) * 10)}
            angle={(i - (hand.length - 1) / 2.0) * 1}
          />
        ) : (
          <HandCard useLastPos={true} state={state} status={status} key={state.id} />
        )
      }
    </EnterExitAnimator>
  );
}
