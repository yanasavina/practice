const fs = require('fs')
const path = require('path');
const puppeteer = require('puppeteer')
delete require.cache[require.resolve('puppeteer')];
const { launchOptions, pageOptions } = require('./puppeteer.config.js');
const lighthouse = require('lighthouse/lighthouse-core/fraggle-rock/api.js')
const sleep = ms => new Promise(res => setTimeout(res, ms));


const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 10000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length; 

    let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

    //console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize, " body html size: ", bodyHTMLSize);

    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
      countStableSizeIterations++;
    else 
      countStableSizeIterations = 0; 

    if(countStableSizeIterations >= minStableSizeIterations) {
      console.log("Fully Rendered Page: " + page.url());
      break;
    }

    lastHTMLSize = currentHTMLSize;

	await sleep(3000);
  }  
};

async function captureReport() {
	// const browser = await puppeteer.launch({args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', '--disable-gpu', '--disable-gpu-sandbox', '--display', '--ignore-certificate-errors', '--disable-storage-reset=true']});
	const browser = await puppeteer.launch({"headless": false, args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', '--ignore-certificate-errors', '--disable-storage-reset=true']});
	const page = await browser.newPage();
	const baseURL = "http://localhost/";
    
    
	
	await page.setViewport({"width":1920,"height":1080});
	await page.setDefaultTimeout(10000);
	
	const navigationPromise = page.waitForNavigation({timeout: 30000, waitUntil: ['domcontentloaded']});
	await page.goto(baseURL, pageOptions);
    await navigationPromise;
		
	const flow = await lighthouse.startFlow(page, {
		name: 'perfTest',
		configContext: {
		  settingsOverrides: {
			throttling: {
			  rttMs: 40,
			  throughputKbps: 10240,
			  cpuSlowdownMultiplier: 1,
			  requestLatencyMs: 0,
			  downloadThroughputKbps: 0,
			  uploadThroughputKbps: 0
			},
			throttlingMethod: "simulate",
			screenEmulation: {
			  mobile: false,
			  width: 1920,
			  height: 1080,
			  deviceScaleFactor: 1,
			  disabled: false,
			},
			formFactor: "desktop",
			onlyCategories: ['performance'],
		  },
		},
	});

  	//================================NAVIGATE================================
    await flow.navigate(baseURL, {
		stepName: 'open main page'
		});
  	console.log('main page is opened');
	
	const name = "John";
	const address = "Bakery street";
	const postal = "123";
	const city =  "London";
	const country = "AF";
	const phone = "1231242";
	const email = "abc@dfg.com";
	
	//================================SELECTORS================================
	const tablesTab 		= "li[class='page_item page-item-13']";
	const tablePage			= "img[alt='living room table8']";
	const tablePageCheck 	= "table[class='sku-table']";
	const addToCartButton 	= "button[type='submit']"; 
	const addToCart 		= "span[class='al-box success cart-added-info ']"; 
	const placeAnOrder 		= "input[value='Place an order']"; 
	const submitOrder 		= "input[name='cart_submit']";
	const cartName 			= "input[name='cart_name']";
	const cartAddress 		= "input[name='cart_address']";
	const cartPostal 		= "input[name='cart_postal']";
	const cartCity 			= "input[name='cart_city']";
	const cartCountry 		= "select[name='cart_country']";
	const cartPhone 		= "input[name='cart_phone']";
	const cartEmail 		= "input[name='cart_email']";
	const thankYou 			= "header[class='entry-header']"

	
	//================================PAGE_ACTIONS================================
	await flow.startTimespan({ stepName: 'Open tables tab' });
		await page.click(tablesTab);
        await waitTillHTMLRendered(page);
		await page.waitForSelector(tablePage);
    await flow.endTimespan();
    console.log('tables tab is opened');

	await page.waitForSelector(tablePage);
	await flow.startTimespan({ stepName: 'Open table page' });
		await page.click(tablePage);
		await waitTillHTMLRendered(page);
		await page.waitForSelector(tablePageCheck);
	await flow.endTimespan();
	console.log('table page is opened');

	await flow.startTimespan({ stepName: 'Add table to cart' });
		await page.click(addToCartButton);
		await waitTillHTMLRendered(page);
		await page.waitForSelector(addToCart);
	await flow.endTimespan();
	console.log('added to cart');

	await flow.startTimespan({ stepName: 'Open cart' });
		await page.click(addToCart);
		await waitTillHTMLRendered(page);
		await page.waitForSelector(placeAnOrder);
	await flow.endTimespan();
	console.log('cart is opened');

	await flow.startTimespan({ stepName: 'Click place an order' });
		await sleep(2000);
		await page.click(placeAnOrder);
		await waitTillHTMLRendered(page);
		await page.waitForSelector(submitOrder);
	await flow.endTimespan();
	console.log('clicked place an order button');

	await flow.startTimespan({ stepName: 'Fill all fields and submit order' });
		await page.waitForSelector(cartName);
		await page.type(cartName, name);
		await sleep(2000);
		await page.waitForSelector(cartAddress);
		await page.type(cartAddress, address);
		await sleep(2000);
		await page.waitForSelector(cartPostal);
		await page.type(cartPostal, postal);
		await sleep(2000);
		await page.waitForSelector(cartCity);
		await page.type(cartCity, city);
		await sleep(2000);
		await page.waitForSelector(cartCountry);
		await page.click(cartCountry)
		await page.type(cartCountry, country);
		await sleep(2000);
		await page.waitForSelector(cartPhone);
		await page.type(cartPhone, phone);
		await sleep(2000);
		await page.waitForSelector(cartEmail);
		await page.type(cartEmail, email);
		await sleep(2000);

		await page.click(submitOrder);
        await waitTillHTMLRendered(page);
		await page.waitForSelector(thankYou);
    await flow.endTimespan();
    console.log('Order is submitted');

	

	//================================REPORTING================================
	const reportPath = path.join(__dirname,  '/userflowReport.html');

	const report = await flow.generateReport();
	fs.writeFileSync(reportPath, report);

    await browser.close();
}
captureReport();