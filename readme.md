# QueryBot

## Description

Bot that brings search functionalities to [Discord](https://discordapp.com/) thanks to the Google Search API.

## Key Features

- Keywords can be created and used to only search for results on certain websites.
- Uses safe search on SFW channels and full search on NSFW channels.
- Automatically leaves servers with > 25 members where over 75% of the member total is comprised of bots (configurable).

## Technologies

- [TypeScript](https://www.typescriptlang.org/) is used to write all code and then transpiled into [JavaScript](https://www.javascript.com/).
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

`!qb about`  
Displays information about the bot.

`!qb help, !qb ?`  
Displays the bot's help.

`!qb list, !qb ls`  
Displays all available keywords.

`!qb set {keyword} {siteUrl}`  
Sets a site keyword.  
_Example: `!qb set yt youtube.com`._

`!qb unset {keyword}`  
Unsets a site keyword.  
_Example: `!qb unset yt`._

`!qb search {query}, !qb s {query}`  
Returns the first search result matching a query on any site.  
_Example: `!qb search discord bots`._

`!{keyword} {query}`  
Returns the first search result matching a query on the site corresponding to a keyword.  
_Example: `!yt GMM`._

## Invite link

[Invite QueryBot to your server](https://discordapp.com/oauth2/authorize?client_id=495279079868596225&scope=bot&permissions=18432)

## TODO

- Enable to configure custom prefix by server
