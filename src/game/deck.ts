export function createShuffleDeck(pairCount: number): number[] {
  const cards: number[] = [];

  // Create pairs
  for (let id = 0; id < pairCount; id++) {
    cards.push(id, id);
  }

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const temp = cards[i];
    cards[i] = cards[j];
    cards[j] = temp;
  }

  return cards;
}
