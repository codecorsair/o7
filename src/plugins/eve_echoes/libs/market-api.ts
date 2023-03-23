import fetch from 'node-fetch';
import { getItemId } from './items';
import items from '@/data/bot/market-items.json';
import { timeoutPromise } from './timeout-promise';

const MARKET_API = 'https://api.eve-echoes-market.com/market-stats/'
const CACHE_MAX_AGE = 30 * 60 * 1000; // 30 minute cache age
const cache: { [id: string]: {
  item: MarketItem;
  added: Date;
}} = {};

export interface MarketItem {
  id: number;
  prices: MarketPrice[];
}

export interface MarketPrice {
  time: number;
  lowest_sell: number;
  sell: number;
  highest_buy: number;
  buy: number;
  volume: number;
}

export async function cacheAllItems() {
  for (const item of items) {
    await getMarketData(item.name);
  }
}

export function getLatestValidPrice(item: MarketItem) {
  let index = 0;
  let price = item.prices[index];
  while (price && (!price.sell || !price.buy) && index < item.prices.length) {
    price = item.prices[++index];
  }
  return price;
}

export async function getMarketData(searchTerms: string): Promise<MarketItem | null> {
  const id = getItemId(searchTerms);
  if (id == null) return null;

  if (cache[id] && new Date().getTime() - cache[id].added.getTime() < CACHE_MAX_AGE) {
    return cache[id].item;
  }
  
  try {
    const response = await timeoutPromise(10000, fetch(`${MARKET_API}${id}`));

    if (!response || !response.ok) {
      console.error(`Failed to fetch from Marketplace API with response: ${JSON.stringify(response)}`);
      return null;
    }

    const prices = await response.json() as any;
    prices.sort((a: { time: number }, b: { time: number}) => b.time - a.time);
    const result = {
      id,
      prices,
    };
    cache[result.id] = {
      item: result as MarketItem,
      added: new Date(),
    };
    return result as MarketItem;
  } catch (err) {
    console.error(err);
    console.error(`Failed to fetch from Marketplace API`);
    if (cache[id]) return cache[id].item;
  }
  return null;
}