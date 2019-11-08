const fs = require("fs");
const puppeteer = require('puppeteer');

const EMAIL = process.env.FREEML_EMAIL;
const PASSWORD = process.env.FREEML_PASSWORD;
const SLUG = process.env.FREEML_SLUG;
const TARGET_URL = `https://www.freeml.com/${SLUG}`;
// スクレイピングを開始するページのパス。
// FIXME: 1が削除済みの場合2にしてください。
const FIRST_PATH = Number(process.env.FREEML_FIRST || 1);
// 待ち時間(ms)
const WAIT_TIME = 10 * 1000;

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  console.log(`You will sign in freeml.com as ${EMAIL} and Crawl ${TARGET_URL}.`);
  await page.goto('https://www.freeml.com/ep.umzx/grid/General/node/SpLoginFront/');

  // login
  await page.type('#login_l_bg form input[name=email]',  EMAIL)
  await page.type('#login_l_bg form input[name=password]',  PASSWORD)
  await page.click('#login_l_bg form input[type=image]')
  await page.waitForNavigation({timeout: 60000, waitUntil: "domcontentloaded"});
  await page.goto(TARGET_URL);

  // mkdir
  await fs.mkdirSync(`dest/${SLUG}`);
  await fs.mkdirSync(`dest/${SLUG}/image`);
  await fs.mkdirSync(`dest/${SLUG}/html`);
  await fs.mkdirSync(`dest/${SLUG}/pdf`);

  const scrapeAndSave = async (url) => {
    console.log(`scrape ${url}`);
    await page.goto(url);

    // 雑に保存
    const fileName = url.split('/').pop();
    await page.screenshot({path: `dest/${SLUG}/image/${fileName}.png`, fullPage: true});
    await page.pdf({path: `dest/${SLUG}/pdf/${fileName}.pdf`});
    const html = await page.content();
    fs.writeFileSync(`dest/${SLUG}/html/${fileName}.html`, html);

    try {
      const nextUrl = await page.$eval('.main_pad > .mlc_link_area2 .link_right a', el => el.href );
      return nextUrl
    } catch {
      // end
      return;
    }
  }

  let url = `${TARGET_URL}/${FIRST_PATH}`;
  //let url = `http://example.org/hoge`;

  while(true) {
    url = await scrapeAndSave(url);
    if(url) {
      await sleep(WAIT_TIME);
    } else {
      console.log('done');
      break;
    }
  }

  // done
  await browser.close();
})();
