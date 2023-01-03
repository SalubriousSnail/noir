// @ts-check
/** @type {import("../../common/card").PartialCardInfoComputation} */
exports.card = (util, game, card) => ({
    text: "Every other turn: gain a Disloyal New Hire.",
    type: "agent",
    cost: { money: 12 },
    colors: ["purple"],
    turn: function* () {
      const turns = card.props.turns ?? 0;
  
      yield* util.setProp(game, {
        card,
        name: "turns",
        value: (turns + 1) % 2,
      });
  
      if (turns == 0) {
        yield* util.addCard(game, {
          card: util.cid(),
          name: "New Hire",
          player: util.findCard(game, card).player,
          zone: "board",
          state: {
            modifiers: [{ card, name: "disloyal" }],
          },
        });
      }
    },
    modifiers: {
      disloyal: util.keywordModifier("disloyal"),
    },
  });
  