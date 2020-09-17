import Fuse from 'fuse.js';
import fetch from 'node-fetch';
import items from '../data/market-items.json';

const MARKET_API = 'https://api.eve-echoes-market.com/market-stats/'
const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 minute cache age
const cache: { [id: string]: {
  item: MarketItem;
  added: Date;
}} = {};

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

export async function cacheAllItems() {
  for (const item of items) {
    await getMarketData(item.name_en);
  }
}

export async function getMarketData(searchTerms: string): Promise<MarketItem | null> {
  const item = searchItem(searchTerms);
  if (item == null) return null;

  if (cache[item.id] && new Date().getTime() - cache[item.id].added.getTime() < CACHE_MAX_AGE) {
    return cache[item.id].item;
  }
  
  try {
    const response = await fetch(`${MARKET_API}${item.id}`);

    if (!response.ok) {
      console.error(`Failed to fetch from Marketplace API with response: ${JSON.stringify(response)}`);
    }

    const prices = await response.json();
    prices.sort((a: { time: number }, b: { time: number}) => b.time - a.time);
    const result = {
      ...item,
      prices,
    };
    cache[result.id] = {
      item: result,
      added: new Date(),
    };
  } catch (err) {
    console.error(err);
    console.error(`Failed to fetch from Marketplace API`);
    if (cache[item.id]) return cache[item.id].item;
  }
  return null;
}