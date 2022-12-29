import React, { Context, useContext, useEffect, useRef, useState } from "react";
import { Container } from "react-pixi-fiber";
import Board from "./Board";
import Hand from "./Hand";
import Rectangle from "../Rectangle";
import { targetResolution } from "../Camera";
import { useClientDispatch, useClientSelector } from "../store";
import EndTurn from "./EndTurn";
import { MoveAnimationContext, MoveAnimationState } from "../MoveAnimation";
import { useSearchParams } from "react-router-dom";
import { PlayerId } from "../../common/gameSlice";
import Resources from "./Resources";
import { batchActions } from "redux-batched-actions";
import { loadCardsFromAction, serverOrigin } from "../cards";
import OpponentBoard from "./OpponentBoard";
import { io, Socket } from "socket.io-client";
import Button from "../Button";
import OpponentHand from "./OpponentHand";
import { reset } from "../../common/historySlice";
import Message from "./Message";
import Deck from "./Deck";
import Grave from "./Grave";

export const SocketContext = React.createContext(null as unknown) as Context<Socket>;
export const PlayerContext = React.createContext(0 as PlayerId);

export default function Game() {
  const [searchParams] = useSearchParams();
  const [player, setPlayer] = useState(null as PlayerId | null);
  const [socket, setSocket] = useState(null as Socket | null);
  const [message, setMessage] = useState("");
  const cards = useRef({} as MoveAnimationState);
  const decks = useClientSelector((state) => state.decks);
  const dispatch = useClientDispatch();

  useEffect(() => {
    const socket = io(serverOrigin);

    socket.on("actions", (actions, name) => {
      (async () => {
        for (const action of actions) {
          await loadCardsFromAction(action);
        }

        dispatch(batchActions(actions, name));
      })();
    });

    socket.on("error", (message) => {
      setMessage("");
      setMessage(message);
    });

    socket.on("init", (player) => {
      setPlayer(player);

      socket.emit("init", {
        deck: decks[searchParams.get("deck")!],
      });
    });

    setSocket(socket);

    socket.emit("queue", "practice");

    return () => {
      socket?.close();
      dispatch(reset());
    };
  }, []);

  if (player == null || socket == null) {
    return <Button text={"Waiting for player"} x={targetResolution.width / 2} y={targetResolution.height / 2} />;
  }

  return (
    <SocketContext.Provider value={socket}>
      <MoveAnimationContext.Provider value={cards}>
        <PlayerContext.Provider value={player}>
          <Container>
            <Rectangle fill={0x202020} width={targetResolution.width} height={targetResolution.height} />
            <EndTurn />
            <Resources />
            <OpponentHand />
            <OpponentBoard />
            <Board />
            <Hand />
            <Grave />
            <Deck />
            <Message text={message} />
          </Container>
        </PlayerContext.Provider>
      </MoveAnimationContext.Provider>
    </SocketContext.Provider>
  );
}
