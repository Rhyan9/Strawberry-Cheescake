const axios = require('axios');
const XIVAPI = require('@xivapi/js');
const xiv = new XIVAPI({
  private_key: '66fc940ed3114718a4738d4357d2be372533ed5616fa4fd98809a0fbd11101e8',
});

const searchForItem = async (itemName) => {
  try {
    const response = await xiv.search(itemName);
    return response;
  } catch (err) {
    console.error(err);
    return 'err';
  }
}

const findIngredientsIds = async (itemName) => {
  const results = await searchForItem(itemName);
  if (results === 'err') return;
  const resultArray = results.Results;
  const foundRecipe = resultArray.find((obj) => obj.Url.substring(1, 5) === 'Reci');
  // console.log(foundRecipe.Url);
  try {
    const { data } = await axios.get(`https://xivapi.com${foundRecipe.Url}`);

    const keys = Object.keys(data);
    // console.log(keys);
  
    let iteration = keys.filter((key) => (
      key.includes('AmountIngredient') && data[key] > 0
    ));
  
    iteration = iteration.map((key) => (
      { [key]: data[key], num: key.slice(-1) }
    ));
  
    iteration = iteration.map((key) => {
      return {
        ...key,
        id: data[`ItemIngredient${key.num}TargetID`]
      }
    });
    return iteration;
  } catch (err) {
    console.error(err);
    return 'err';
  }
  
}

const findNameUsingId = async (id) => {
  const { data } = await axios.get(`https://www.xivapi.com/item/${id}`);
  return data.Name;
}


exports.searchForItem = searchForItem;
exports.findIngredientsIds = findIngredientsIds;
exports.findNameUsingId = findNameUsingId;
