const express = require('express');
const { exec } = require('child_process');
const router = express.Router();
const Product = require('../model/product-schema.js');
const cron = require('node-cron');


function executePythonScript() {
  
  exec('python Scrapers/DarazScraper.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

  exec('python Scrapers/TelemartScraper.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
  exec('python Scrapers/MegaScraper.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
  exec('python Scrapers/IshoppingScraper.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}
cron.schedule('00 0 * * *', () => {
  executePythonScript();
  console.log('Running scraper at midnight');
});

router.post('/data', async(req, res) => {

  try {
    const { name, price, image, url, store } = req.body;
    const newData = {
      name,
      price,
      image,
      url,
      store,
    };

    // Perform asynchronous operation, e.g., database insertion
    await Product.create(newData);

    console.log("Data inserted successfully");
    res.status(200).send('Data received and inserted successfully');
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.url) {
      // Handle duplicate key error
      console.log(`Duplicate key error for URL: `);
      // Skip the duplicate entry by returning early
      return res.status(200).send('Duplicate entry skipped');
    } else {
      // Handle other errors
      console.log("Error in inserting data: ", error.message);
      res.status(500).json({ message: error.message });
    }
  }
});



router.get('/result', async (req, res) => {
  const minPrice = parseInt(req.query.minPrice ?? 0);
  const maxPrice = parseInt(req.query.maxPrice ?? 100000);
  const searchQuery = req.query.query; // Extract search query from request query params

  try {
    let query = { price: { $gte: minPrice, $lte: maxPrice } };

    // If searchQuery is provided, add it to the query to filter by name
    if (searchQuery) {
      query.name = { $regex: new RegExp(searchQuery, 'i') }; // Case-insensitive regex search for name
    }
    const products = await Product.find(query).sort({ price: 1 });

    console.log('Products found from database:', products);
    console.log("Min Price:", minPrice);
    console.log("Max Price:", maxPrice);
    res.status(200).json(products);
    console.log('Data sent to front end successfully');
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log('Data not sent to front end successfully');
  }
});

module.exports = router;
