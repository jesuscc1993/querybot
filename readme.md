# QueryBot

## Description

[Discord](https://discordapp.com/) bot that provides web search functionalities. Keywords can be created and used to only search for results on certain websites.

## Technologies
The project runs on [node.js](https://nodejs.org/) and relies on [Mongoose](https://mongoosejs.com/) to handle data management with [MongoDB](https://www.mongodb.com/).

[TypeScript](https://www.typescriptlang.org/) has been used instead of plain JS in order to facilitate a more defined and structured code that can easily highlight errors in the source code rather than at runtime.


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

`!help, !?`  
Displays the bot's help.

`!list, !ls`  
Displays all available keywords.

`!set {keyword} {siteUrl}`  
Sets a site url to a keyword. Example: `!set yt youtube.com`.

`!{keyword} {query}`  
Returns the first search result matching a query on the site corresponding to a keyword. Example: `!yt GMM`.

`!search {query}, !s {query}`  
Returns the first search result matching a query on any site. Example: `!search discord bots`.

## Invite link
[Invite QueryBot to your server](https://discordapp.com/oauth2/authorize?client_id=495279079868596225&scope=bot)
