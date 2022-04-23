// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn, if you played an agent last turn, destroy one of your opponent's agents.",
	type: () => "agent",
	colors: () => ["orange"],
	cost: () => ({ money: 55 }),
	rank: () => 2,
	play: (util, card, player, opponent) => () => card.number.played = 1,
	turn: (util, card, player, opponent) => {
		if (card.number.played > 0) {
			card.number.played = 0;
			util.destroyRandom(util.filter([...opponent.board, ...opponent.deck], "agent", player, opponent), player, opponent);
		}
	},
	effects: {
		board: (util, state, you, opponent) =>  (info) => ({
			...info,
			play: (util, card, player, opponent) => {
				const play = (info.play ?? (() => () => {}))(util, card, player, opponent);
				if (play == null) return play;
				return (choice) => {
					play(choice);
					if (player.id == you.id) {
						state.number.played++;
					}
				};
			},
		})
	},
}