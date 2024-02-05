const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors'); // Import the cors package


const app = express();
const port = 8000;

app.use(cors());
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

app.get('/', (req, ers) => {
    res.send('This api is created by Dhruv Kotawni. Follow him on LinkedIn: https://www.linkedin.com/in/dhruv-kotawani/ and GitHub: https://github.com/druvkotwani  ');
})

app.get('/news', async (req, res) => {
    try {
        const indianStartupNewsData = await getIndianStartupNews();
        const inc42Data = await getInc42Data();
        const moneyControlData = await getMoneyControlData();
        // const startupStoryMediaData = await startupStoryMedia();
        // Combine the data from different sources
        let allData = [...indianStartupNewsData, ...inc42Data, ...moneyControlData,];

        // Shuffle the combined data
        allData = shuffleArray(allData);
        res.json(allData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});
// app.get('/yourstory', async (req, res) => {

//     try {
//         const url = 'https://yourstory.com/';
//         const response = await axios.get(url);
//         const html = response.data;
//         const $ = cheerio.load(html);

//         const result = $('.knHSVR a').map((index, element) => {
//             const href = $(element).attr('href');
//             const title = $(element).attr('title');
//             let imgSrc = $(element).find('img').attr('data-src');

//             if (!imgSrc) {
//                 imgSrc = $(element).find('img').attr('src');
//             }
//             // Return an object with the desired attributes
//             return { href, 'title': title, 'imgSrc': imgSrc, 'source': 'Inc42' };
//         }).get();

//         res.json(result);

//     } catch (error) {
//         console.error(error);
//     }
// });

app.get('/techpluto', async (req, res) => {
    try {
        const url = 'https://www.techpluto.com/category/funding-news/';
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const result = $('.elementor-post').map((index, element) => {
            const href = $(element).find('.elementor-post__thumbnail__link').attr('href');
            const title = $(element).find('.elementor-post__title a').text();
            let imgSrc = $(element).find('.elementor-post__thumbnail img').attr('src');

            // Return an object with the desired attributes
            return { href, title, imgSrc, source: 'TechPluto' };
        }).get();

        res.json(result);

    } catch (error) {
        console.error('Axios Error:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }

});

async function getIndianStartupNews() {
    try {
        const url = 'https://indianstartupnews.com/news';
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const firstATag = $('.article-box a').first();
        const href = firstATag.attr('href');
        const ariaLabel = firstATag.attr('aria-label');
        const imgSrc = $('.article-box img').first().attr('src');

        const resultObj = {
            href: 'https://indianstartupnews.com' + href,
            title: ariaLabel,
            imgSrc: imgSrc,
            source: 'IndianStartupNews'
        };

        const result = $('.post-collection a').map((index, element) => {
            const link = $(element).attr('href');
            const href = 'https://indianstartupnews.com' + link;
            const ariaLabel = $(element).attr('aria-label');
            const imgSrc = $(element).find('img').attr('src');

            // Return an object with the desired attributes
            return { href, 'title': ariaLabel, 'imgSrc': imgSrc, 'source': 'IndianStartupNews' };
        }).get();
        result.unshift(resultObj);

        return result;
    } catch (error) {
        throw error;
    }
}

async function getInc42Data() {
    try {
        const url = 'https://inc42.com/buzz/';
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const result = $('.card-image a').map((index, element) => {
            const href = $(element).attr('href');
            const title = $(element).attr('title');
            let imgSrc = $(element).find('img').attr('data-src');

            if (!imgSrc) {
                imgSrc = $(element).find('img').attr('src');
            }
            // Return an object with the desired attributes
            return { href, 'title': title, 'imgSrc': imgSrc, 'source': 'inc42' };
        }).get();

        return result;
    } catch (error) {
        throw error;
    }
}

async function getMoneyControlData() {
    try {
        const url = 'https://www.moneycontrol.com/news/technology-startups';
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const result = [];

        // Select all <li> elements within the specified <ul>
        const listItems = $('ul.clearfix li');

        // Iterate over each <li> element
        listItems.each((index, element) => {
            // Select the relevant elements within the <li>
            const heading = $(element).find('h4 a').text();
            const href = $(element).find('h4 a').attr('href');
            const imgSrc = $(element).find('figure img').attr('src');

            // Store information in the result array
            if (heading && href && imgSrc) {
                result.push({
                    href,
                    title: heading,
                    imgSrc,
                    source: 'MoneyControl'
                });
            }

        });

        return result;
    } catch (error) {
        throw error;
    }
}

async function startupStoryMedia() {

    const url = 'https://startupstorymedia.com/category/insights/';
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const results = [];

    $('.post_item_wraper_two').each((index, element) => {
        const title = $(element).find('.post_title a').text();
        const imgSrc = $(element).find('.post_avtar img').attr('src');
        const href = $(element).find('.post_title a').attr('href');

        if (title && imgSrc && href) {
            results.push({
                title,
                imgSrc,
                href,
                source: 'StartupStoryMedia'
            });
        }
    });
    return results;
}



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


