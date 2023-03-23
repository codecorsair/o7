# o7 Discord bot
A discord bot for the Eve Echoes community!

## Overview
o7 is a hosted bot that is available free for anyone to add to their server. Just [click here](https://discord.com/oauth2/authorize?client_id=753820564665270333&scope=bot&permissions=3072) to invite **o7** to your Discord server.

You are welcome to self-host **o7**, however I can not fully support self-hosted installations. I will try and answer any questions on the official Discord, but I am not available for 24/7 bot support.

## Planed Features
- [ ] Prometheus Metrics endpoint. ([prom-client](https://github.com/siimon/prom-client))

## Project Structure
- **/data** - Data for the bot
- **/example** - Example setup using docker compose
  - **/configs** - Example configs
    - **/bridge.json** - Example bridge config
    - **/cluster.json** - Example cluster config
    - **/bot.json** - Example bot config
  - **/docker-compose.yml** - Example docker compose file
- **/src** - Source code for the bot
  - **/shared** - Shared code
    - **/interfaces** - Interfaces for the bot
    - **/utils** - Utilities for the bot
  - **/bridge** - Bridge between cluster bots
  - **/plugins** - Plugins for the bot
    - **/eve_echoes** - Plugin related to Eve echoes
      - **/commands** - Commands for the eve echoes plugin
      - **/libs** - Libraries for the eve echoes plugin
    - **/system** - Required plugin for the bot (help, about, invite)
      - **/commands** - Commands for the system plugin
      - **/libs** - Libraries for the system plugin
  - **/cluster** - Cluster bot
  - **/bot** - Discord bot instance
    - **/pluginManager** - Plugin manager

## Contributing
Great! You'd like to add a feature to **o7**? I am happy to accept contributions via pull request. 

However, I do ask that you test any changes on a self-hosted bot. If you are planning to contribute I can help get your test bot set up on the official Discord with it's own channel for testing feature changes.

Instructions for setting up the bot for self-hosting can be found on our official Discord.

## Join the community
Have any questions or help with **o7** development by joining our [Official Discord Server](https://discord.gg/PfruVg4)!

## License
Released under the MIT license.

Copyright (c) 2020-present James Ryan Brown

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.