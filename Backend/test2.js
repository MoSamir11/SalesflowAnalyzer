const axios = require('axios');

const callFunction = async () =>{

  const options = {
    method: 'POST',
    url: 'https://text-analysis12.p.rapidapi.com/sentiment-analysis/api/v1.1',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': 'c9921fad5dmsh6fd97ce87bfe8aap1e4e72jsn0c655b98f0f1',
      'X-RapidAPI-Host': 'text-analysis12.p.rapidapi.com'
    },
    data: {
      language: 'english',
      text: "I think this is not working"
    }
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

callFunction()