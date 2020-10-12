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
#### New Features & Updates
 * Added Planetary Resource command! Now you can search for the best locations to set up your mining arrays near your home station.
 * Added jump distance command to quickly let you know how far away any two systems are.
 * Added safer jump distance command to find the distance between two systems if you prefer to stick to hi sec systems.

### 22 SEP 2020 - Tell me what this is!
#### New Features & Updates
 * Added new **item** command! This will give you details about any item in game.
 * Updated **jumps** and **safejumps** commands to include the security of the start & end systems as well as the lowest security that will be traveled through.
 * Added item icons to market price searces.
 
#### Bug Fixes
 * Added missing market items to the registry.
 * Added Plasmoids to **pr** command which was missing.

### 27 SEP 2020 - It's a team now!
### New Team Members!
A couple amazing people have volunteered to join the o7 team! Now that it's not just myself, I can actually call this a team. I am very much looking forward to working with the new team members and seeing what they will contribute. There are quite a lot of features waiting in the queue and these new team members will help me to get those realized much sooner!

#### New Features & Updates
 * Added icons to blueprints!
 * Added a **dataretention** to dm the user detailing any data stored by the bot, what it is used for and why.
 * Server administrators can now delete all data stored by the bot for their server with the command **deleteguilddata**. *Note: You can get more details about what information the bot actually stores on the **dataretention** command*
 * All users can now delete any data stored by the bot for about their user with the command **deletemydata**. *Note: You can get more details about what information the bot actually stores on the **dataretention** command*
 
#### Bug Fixes
 * Fixed an issue where blueprint searches starting with `MK#` would incorrectly return items.
 * Improved blueprint search logic a bit.
 * Added some `.`s to the author field on the !bpm command to expand the width of the embed so code blocks won't get squished on many mobile devices. This should give better readability on mobile.
 * Added missing planetary resources from the search function

### 30 SEP 2020 - Minerals, Resources, and Ores.. Oh My!
#### New Features & Updates
 * As the first addition of one our new team members on o7 @Cornexo, The bot will now return market prices grouped by ores, minerals, and planetary resources through specific keywords to the **!market** command. Use **!market help** for more details.
 * Added **invite** command which responds with a link you can use to invite o7 to a new server.
 * Simplified the general **!help** command and added a unique help to most all commands to give help speciifc to that command.  *Try !pc help*

 
#### Bug Fixes
 * Removed thumbnail from blueprints for now as they were causing issues on some mobile devices. 


### 11 OCT 2020 - Reprocessing, Auto Voice Channels, and more!
#### New Features & Updates
 * Added **reprocess** command to show what you'll get for reprocessing an item / ore.
 * Added **Auto Voice Channels** module which will let you create a voice channel that will create temporary voice channels automatically whenever a user choice the auto channel.
 * Added Broker's Fees & Transaction Taxes to **blueprint** command. You can optionally provide your accounting skill levels after your manufacturing skill levels to adjust these fees.
 * Added commas to materal costs on **blueprint**s.
 * Added new categories on blueprint result to display applied Manufacturing & Accounting skills.
 * Added a flag to the **help** command `!help here` will respond with the help directly in the channel you've sent the command from instead of a dm.
 * Updated help again, all commands now have a help feature for them.
 * The **planetaryresource* command will now respond with all richness levels, instead of just Perfect / Rich.
 
#### Extra Dev Notes
It's been a bit longer than usual without a changelog post, but not without good reason! I completely re-wrote the framework o7 is built on from scratch. Previously, the bot was built on top of a third-party library, however o7 has outgrown this framework and the rebuild will allow for more features with less work overall. This means faster development and more features faster for you! 
 
One of the new features enabled by this change is the **Auto Voice Channel** module which is a great tool to help reduce the clutter of too many voice channels in your communities! Check it out with the `!voice create` command on your server! *note: use of this command requires the user to have the `MANAGE_CHANNELS` permission, and o7 will need the `MANAGE_CHANNELS` permission in any category in which you wish to use the auto vhoice channels*
