const { Client, IntentsBitField } = require('discord.js');
require('dotenv').config();
const { getItemsData } = require('./api');
const { searchForItem, findIngredientsIds, findNameUsingId } = require('./xivapi');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent
  ]
});

client.on('ready', (c) => {
  console.log(`${c.user.tag} is online!`);
})

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  const messageContent = msg.content.substring(7, msg.content.length)
  if (msg.content.substring(0, 6) === '!fetch') {
    searchForItem(messageContent);
    const response = await getItemsData(messageContent);

    if (response === "Error") {
      msg.reply('Error finding item!');
      return;
    }

    let fullString = ''
    response.listings.forEach((item) => {
      fullString = fullString + item;
    })

    msg.reply(response.name + " \n" + fullString);
  }

  //-----------------------------------------------------------

  if (msg.content.substring(0, 6) === '!craft') {
    const item = msg.content.substring(7, msg.content.length);
    const ingredientsData = await findIngredientsIds(item);
    // console.log(ingredientsData);
    if (ingredientsData === 'err') msg.reply('Error occured!');

    const ingredients = ingredientsData.map(item => {
      const countKey = Object.keys(item).find(key => key.startsWith('AmountIngredient'));
      return {
        id: item.id,
        count: item[countKey]
      }
    });
    // console.log(ingredients);



    const craftedItemNameAndPrice = await getItemsData(item);
    // console.log(craftedItemNameAndPrice);


    const itemNames = [];
    const itemCount = [];
    const itemPriceAndWorld = [];

    console.time('start1');
    for(let i = 0; i<ingredients.length; i++) {
      itemNames.push(await findNameUsingId(ingredients[i].id));
      itemCount.push(ingredients[i].count);
      itemPriceAndWorld.push(await getItemsData(itemNames[i]));
    }
    
    // console.log(itemNames, itemCount, itemPriceAndWorld);

    let totalCost = 0;

    for(let i = 0; i < itemNames.length; i++) {
      const gil = Number((itemPriceAndWorld[i].listings[0]).split(' ')[0]);
      totalCost = totalCost + itemCount[i] * gil;
    }
    console.timeEnd('start1');
      
    let itemNamesString = '';
    
    for (let i = 0; i< itemNames.length; i++) {
      itemNamesString = itemNamesString + itemNames[i] + ' : ' + itemCount[i] + ' piece(s), ' + itemPriceAndWorld[i].listings[0] + '\n';
    }
    const profit = Number((craftedItemNameAndPrice.listings[0]).split(' ')[0]) - totalCost;

    msg.reply(`To Craft ${craftedItemNameAndPrice.name}, you will need: \`\`\`${itemNamesString} \n Cheapest ${craftedItemNameAndPrice.name}: ${craftedItemNameAndPrice.listings[0]} \n Total costs of materials: ${totalCost} \n Potential Profit: ${profit}\`\`\``);
  }
})

client.login(process.env.TOKEN);