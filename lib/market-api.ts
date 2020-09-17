import Fuse from 'fuse.js';
import fetch from 'node-fetch';
import items from '../data/market-items.json';

const MARKET_API = 'https://api.eve-echoes-market.com/market-stats/'

export interface MarketItem {
  name_en: string;
  id: string;
  prices: MarketPrice[];
}

export interface MarketPrice {
  time: number;
  lowest_sell: number;
  median_sell: number;
  highest_buy: number;
  median_buy: number;
  volume: number;
}

const fuseOptions = {
  isCaseSensitive: false,
  shouldSort: true,
  includeScore: true,
  ignoreLocation: true,
  includeMatches: false,
  findAllMatches: false,
  minMatchCharLength: 1,
  threshold: 0.2,
  useExtendedSearch: false,
  // ignoreFieldNorm: true,
  sort: (a: { score: number }, b: { score: number }) => b.score - a.score,
  keys: [
    'name_en',
    {
      name: 'keywords',
      weight: 3,
    }
  ]
}

const processedItems = items.map(item => {
  const name = item.name_en;
  const keywords = name.split(' ');
  if (name.endsWith(' iii')) {
    keywords.push('3');
  } else if (name.endsWith(' ii')) {
    keywords.push('2');
  } else if (name.endsWith(' i')) {
    keywords.push('1');
  }
  return  {
    ...item,
    keywords,
  }
});

const marketIndex = Fuse.createIndex(fuseOptions.keys, processedItems);
const fuse = new Fuse(processedItems, fuseOptions, marketIndex);

export function searchItem(searchTerms: string) {
  const results = fuse.search(searchTerms);
    if (results.length == 0) {
      return null;
    }
    return results[0].item;
}

export async function getMarketData(searchTerms: string): Promise<MarketItem | null> {
  const item = searchItem(searchTerms);
  if (item == null) return null;

  try {
    const response = await fetch(`${MARKET_API}${item.id}`);

    if (!response.ok) {
      console.error(`Failed to fetch from Marketplace API with response: ${JSON.stringify(response)}`);
    }

    const prices = await response.json();
    prices.sort((a: { time: number }, b: { time: number}) => b.time - a.time);
    return {
      ...item,
      prices,
    };
  } catch (err) {
    console.error(err);
    console.error(`Failed to fetch from Marketplace API`);
    return null;
  }
}