import { Container } from "pixi.js";
import { app } from "..";
import { defaultCardState, defaultPlayerState, sort } from "../../common/card";
import { getCards, loadCards, util } from "../card";
import { getDeck, setDeck } from "../decks";
import { button } from "../sprites/text";
import { cardSprite } from "../sprites/card";
import { beginState } from "../state"
import { below, wrap, left, right, top, update, vertical } from "../ui";

export async function buildState(name: string) {
  beginState(`build/${name}`);

  const cardList = new Container();
  const deckList = new Container();

  const deckName = button(name);

  await loadCards();
  const cards = (await getCards()).map(c => defaultCardState(c));
  sort(util, cards, defaultPlayerState(), defaultPlayerState());

  const deck: string[] = getDeck(name);

  let scroll = 0;
  window.addEventListener('wheel', (e) => {
    scroll -= e.deltaY;
    if (scroll > 0) scroll = 0;
    cardList.y = 5 + scroll;
  });

  const cardSprites = await update(cardList, async function*() {
    for (const card of cards) {
      const sprite = await cardSprite(card, defaultPlayerState(), defaultPlayerState());
  
      sprite.on('pointerdown', () => {
        deck.push(card.name);
        deck.sort();
        refresh();
      });
  
      yield sprite;
    }
  });
  
  async function refresh() {
    setDeck(name, deck);

    deckName.text = `${name} (${deck.length}/30)`;

    const deckSprites = await update(deckList, async function*() {
      for (const name of deck) {
        const sprite = button(name);

        sprite.on('pointerdown', () => {
          deck.splice(deck.findIndex(x => x == name), 1);
          refresh();
        });

        yield sprite;
      }
    });

    right(deckName, app.screen, 5);
    top(deckName, 5);
    
    left(cardList, 5);
    top(cardList, 5 + scroll);
    wrap(cardSprites, { width: app.screen.width - deckList.width - 5, height: app.screen.height }, 5);
  
    right(deckList, app.screen, 5);
    below(deckName, deckList, 20);
    vertical(deckSprites, 5);
  }

  refresh();

  app.stage.addChild(cardList);
  app.stage.addChild(deckList);
  app.stage.addChild(deckName);
}