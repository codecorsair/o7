# o7 Changelog

### 16 SEP 2020 - o7 Goes Live
#### Features include
 * Blueprint command available
 * Market Price command available
 * Application command available
 * Set Role command available
 * Help command available

### 17 SEP 2020 - Blueprints go mobile!
#### New Features & Updates
 * Application system will wait for half a second before asking the next question to prevent message overlaps.
 * New Prefix command available! Set a custom prefix for o7 on your Discord server with the **prefix** command. *note: Only server administrators can use this.*
 * Blueprint command no longer requires a hyphen between the name of blueprint and skill levels
 * Caching of market data so requests can be returned faster and bot can still give prices if the market-data source site goes down for a time.
 * Added section totals on blueprints!
 * Updated text on Market Item search.
 * Added **blueprintm** | **bpm** command for a more mobile friendly view of blueprints!
 * Updated help text! Help text is not sent to you via direct message.
 * Added these change logs! You can view changelogs anytime with the **changelog** command.

#### Bug Fixes
 * Regex updated thanks to `Stokholm` which removes the requirement to have a hyphen between blueprint name and skill levels as well as fixes bugs with the parsing.
 * Blueprint cost calculations take into account quantity of items built, so it's more accurate for drones.
 * Fuzzy searching tuned to improve search results.
 
#### Known Issues
 * Some market items are not available and you'll get a different item even when searching the exact name. This is due to the item you're searching for not existing at all in the data set. This will be addressed in a future update.
 
### 20 SEP 2020 - Did someone ask about Planetary Resources?
#### New Features & updates
 * Added Planetary Resource command! Now you can search for the best locations to set up your mining arrays near your home station.
 * Added jump distance command to quickly let you know how far away any two systems are.
 * Added safer jump distance command to find the distance between two systems if you prefer to stick to hi sec systems.

### 22 SEP 2020 - Tell me what this is!
#### New Features & updates
 * Added new **item** command! This will give you details about any item in game.
 * Updated **jumps** and **safejumps** commands to include the security of the start & end systems as well as the lowest security that will be traveled through.
 * Added item icons to market price searces.
 
#### Bug Fixes
 * Added missing market items to the registry.
 * Added Plasmoids to **pr** command which was missing.

### XX - 
#### New Features & updates
 *
 
#### Bug Fixes
 * Fixed an issue where blueprint searches starting with `MK#` would incorrectly return items.
 * Added some `.`s to the author field on the !bpm command to expand the width of the embed so code blocks won't get squished on many mobile devices. This should give better readability on mobile.

