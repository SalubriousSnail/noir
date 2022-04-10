// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "This costs $40 less for each location on the board. All cards cost twice as much money.",
	type: () => "location",
	colors: () => [],
	cost: (util, card, player, opponent) => {
		const locations = [...player.board, ...opponent.board.filter(c => c.revealed)]
			.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "location");
		return { money: Math.max(0, 100 - (40 * locations.length)) };
	},
	rank: () => 3,
	play: (util, card, player, opponent) => () => card.revealed = true,
	effects: {
		board: (util, state, player, opponent) => (card) => ({
			...card,
			cost: (util, state, player, opponent) => {
				const cost = card.cost(util, state, player, opponent);
				return { ...cost, money: cost.money * 2 };
			}
		})
	},
}