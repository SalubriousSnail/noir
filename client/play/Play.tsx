import React from "react";
import { ReactNode } from "react";
import { useClientSelector } from "../store";
import Button from "../Button";
import { useNavigate } from "react-router-dom";
import { Container } from "react-pixi-fiber";
import { targetResolution } from "../Camera";

export default function Play() {
  const decks = useClientSelector((game) => game.decks);
  const navigate = useNavigate();

  let y = 0;
  let buttons: ReactNode[] = [];
  for (const [name, deck] of Object.entries(decks)) {
    buttons.push(
      <Button
        text={name}
        key={name}
        y={y}
        onClick={() => {
          navigate(`/game?deck=${name}`);
        }}
      />
    );

    y += 200;
  }

  return <Container x={targetResolution.width / 2} y={targetResolution.height / 2}>{buttons}</Container>;
}
