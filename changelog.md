# o7 Changelog

### 16 SEP 2020 - o7 Goes Live
#### Features include
 * Blueprint command available
 * Market Price command available
 * Application command available
 * Set Role command available
 * Help command available

### 18 SEP 2020
#### New Features & updates
 * Application system will wait for half a second before asking the next question to prevent message overlaps.
 * New Prefix command available! Set a custom prefix for o7 on your Discord server with `!prefix`. Must be an Administrator to use this command.
 * Blueprint command no longer requires a hyphen between the name of blueprint and skill levels
 * Caching of market data so requests can be returned faster and bot can still give prices if the market-data source site goes down for a time.
 * Added section totals on blueprints!
 * Updated text on Market Item search.
 * Added **blueprintm** | **bpm** command for a more mobile friendly view of blueprints!


#### Bug Fixes
 * Regex updated thanks to `Stokholm` which removes the requirement to have a hyphen between blueprint name and skill levels as well as fixes bugs with the parsing.
 * Blueprint cost calculations take into account quantity of items built, so it's more accurate for drones.
 * Fuzzy searching tuned to improve search results.

#### Known Issues
 * Some market items are not available and you'll get a different item even when searching the exact name. This is due to the item you're searching for not existing at all in the data set. This will be addressed in a future update.
 
