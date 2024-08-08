const axios = require('axios');
const { searchForItem, findIngredientsIds } = require('./xivapi');

const baseUrl = "https://universalis.app/api/v2/chaos/";
const searchUrl = "https://xivapi.com/search?string=";


const getItemsData = async (itemName) => {
  //fetch item's ID by NAME from xivapi.com
  try {

    const searchedName = await searchForItem(itemName);
    const id = searchedName.Results[0].ID;
    //fetch item data from universalis based on ID
    const { data } = await axios.get(`${baseUrl}/${id}?listings=5`);
    const filteredData = data.listings.map((item) => {
      return (item.pricePerUnit + " gil each, in " + item.worldName + "\n");
    })
    const itemData = {
      name: "**" + searchedName.Results[0].Name + "**",
      listings: filteredData
    }
    return itemData;
  } catch(err) {
    console.error(err);
    return 'Error';
  }
  
}


exports.getItemsData = getItemsData;