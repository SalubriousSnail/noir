// @ts-check
/** @type {import("../../common/card").CardInfo} */
exports.card = {
	text: () => "Each turn: destroy a hidden agent in your deck and gain $30. If it's purple, gain $40 instead.",
	type: () => "location",
	colors: () => ["purple"],
	cost: () => ({ money: 75 }),
	rank: () => 2,
	turn: {
		board: (util, card, player, opponent) => {
			const agents = player.deck
				.filter(c => util.getCardInfo(c, player, opponent).type(util, c, player, opponent) == "agent")
				.filter(c => !c.revealed);
			const agent = util.sample(agents);
			if (agent) {
				const index = player.deck.findIndex(x => util.isEqual(agent, x));
				if (index >= 0) player.deck.splice(index, 1);
				if (util.getCardInfo(agent, player, opponent).colors(util, agent, player, opponent).includes("purple")) {
					player.money += 40;
				} else {
					player.money += 30;
				}
	
			}
		}
	}
}