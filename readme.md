# QueryBot

## Description

Bot that brings search functionalities to [Discord](https://discordapp.com/) thanks to the Google Search API.

## Key Features

- Global search.
- Site search through the use of keywords.
- Excludes NSFW results unless query is run of NSFW channels.

## Technologies

- [TypeScript](https://www.typescriptlang.org/) is used to write robust code that is later transpiled into [JavaScript](https://www.javascript.com/).
- [node.js](https://nodejs.org/) runs the application.
- [Mongoose](https://mongoosejs.com/) acts as a middleware to handle data management with [MongoDB](https://www.mongodb.com/).
- [discord.js](https://discord.js.org/#/) handles communication with the Discord API.

## Installation

1. Install [node.js](https://nodejs.org/)
2. Run the following command:

```
npm i
```

## Configuration

The project requires a settings.ts file to be created.
A settings.example.ts file exists with all the fields required.
In order to generate a Discord authToken, follow [this tutorial](https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/) up to step 3.

## Run

1. Set up up your settings.ts (more information in the configuration section)
2. Run `npm start` on a terminal to start the server.
3. If not added already, add you bot to your server following the guide posted in the configuration section up to step 4.

## Commands

| Syntax                                   | Explanation                                                              | Example                     |
| ---------------------------------------- | ------------------------------------------------------------------------ | --------------------------- |
| `!qb about`                              | Displays information about the bot.                                      |
| `!qb help`<br/>`!qb ?`                   | Displays the bot's help.                                                 |
| `!qb list`<br/>`!qb ls`                  | Displays all available keywords.                                         |
| `!qb search {query}`<br/>`!qb s {query}` | Searches for the query on Google.                                        | _`!qb search discord bots`_ |
| `!qb set {keyword} {siteUrl}`            | Sets a site keyword.                                                     | _`!qb set yt youtube.com`_  |
| `!qb stats`                              | Displays bot statistics.                                                 |
| `!qb unset {keyword}`                    | Unsets a site keyword.                                                   | _`!qb unset yt`_            |
| `!{keyword} {query}`                     | Searches for the query on the site<br>registered for the passed keyword. | _`!yt GMM`_                 |

## Links

- [Invite QueryBot to your server](https://discordapp.com/oauth2/authorize?client_id=495279079868596225&scope=bot&permissions=18432)
- [Issues and suggestions](https://github.com/jesuscc1993/querybot/issues)

## Examples

### Global search

![](readme_assets/search-example.png)

### Keyword search

![](readme_assets/keyword-search-example.png)

## TODO

- Replace DB with something less painful to use (firebase, maybe)
- Enable to configure custom prefix by server
