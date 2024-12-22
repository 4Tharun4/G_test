import express, { response } from 'express'
import cors from 'cors'
import compression from 'compression'
import bodyParser from 'body-parser'
import http from 'http'
import puppeteer from 'puppeteer'
const app = express();

app.use(cors({
    credentials:true
}));

app.use(compression());
app.use(bodyParser.json());
const  server = http.createServer(app);

app.get("/getdata", async(response)=>{
try {
    const browser = await puppeteer.launch({headless:false});
const page = await browser.newPage();
await page.goto('https://login.gitam.edu/Login.aspx',{waitUntil:"load",timeout:600000});

// Enter login credentials
await page.type('input[name=txtusername]', "BU21CSEN0400267");
await page.type('input[name=password]', "Tharun@123");

// Extract the captcha text and calculate the sum
const captchaText = await page.evaluate(() => {
    //@ts-ignore
    return document.querySelector('#captcha .preview').innerText;
});

const [num1, num2] = captchaText.match(/\d+/g).map(Number);
const solution = num1 + num2;

// Enter the captcha solution
await page.type('#captcha_form', solution.toString());

// Submit the login form
await Promise.all([
    await page.click('#Submit'),
    await page.waitForNavigation({waitUntil:"networkidle2"}).catch(()=>{}),
]);

const loginError = await page.evaluate(() => {
 const errorElement = document.querySelector('#lblmessage');
 return errorElement ? errorElement.textContent.includes('Invalid User ID / Password') : false;
});




const username = await page.evaluate(() => {
// Adjust this selector to match the element where the username is displayed
const usernameElement = document.querySelector('.userName');
return usernameElement ? usernameElement.textContent.trim() : 'Unknown';
});

await browser.close();
if(!username){
    return response.body("username");
}else{
    return response.body({username})
}


} catch (error) {
    
    console.log(error);
    
}


})


server.listen(8080,()=>{
    console.log("server is running in port http://localhost:8080/");
    
});