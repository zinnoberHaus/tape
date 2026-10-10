import {test,expect} from '@playwright/test';
test('all v2 research screens and portfolio import work',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/demo');await expect(page.getByRole('heading',{name:/3 strong setups/})).toBeVisible();await page.screenshot({path:'artifacts/dashboard-desktop.png',fullPage:true});
 await page.locator('nav').getByRole('button',{name:/Opportunities/}).click();await expect(page.getByText(/12 setups/).first()).toBeVisible();
 await page.getByRole('button',{name:'Bearish',exact:true}).click();await expect(page.getByText(/2 setups/).first()).toBeVisible();
 await page.getByPlaceholder('Search a ticker, or ask Tape anything…').fill('NVDA');await page.getByPlaceholder('Search a ticker, or ask Tape anything…').press('Enter');await expect(page.getByRole('heading',{name:'NVDA',exact:true})).toBeVisible();await page.screenshot({path:'artifacts/ticker-desktop.png',fullPage:true});
 for(const label of ['Smart money','News','Portfolio','Alerts']){await page.locator('nav').getByRole('button',{name:new RegExp(label)}).click();await expect(page.locator('main h1')).toBeVisible();}
 await page.locator('nav').getByRole('button',{name:'Portfolio',exact:true}).click();await page.getByRole('button',{name:'Re-import',exact:true}).click();await page.getByRole('button',{name:/Type or paste/}).click();await page.getByRole('textbox',{name:'Holdings',exact:true}).fill('VST, 10, 180\nLMT, 5, 400');await page.getByRole('button',{name:'Save holdings',exact:true}).click();await expect(page.getByText('Your holdings · sample prices')).toBeVisible();await expect(page.locator('body')).not.toContainText('NaN');await expect(page.locator('body')).not.toContainText('Infinity');
 await page.setViewportSize({width:390,height:844});await page.goto('/demo');await expect(page.getByRole('heading',{name:/3 strong setups/})).toBeVisible();await page.screenshot({path:'artifacts/dashboard-mobile.png',fullPage:true});
 expect(errors).toEqual([]);
});
test('landing and authentication render, protected routes require a session',async({page,request})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:/Turn the noise/})).toBeVisible();await page.screenshot({path:'artifacts/landing-desktop.png',fullPage:true});
 await page.goto('/app');await expect(page).toHaveURL(/\/auth\/sign-in/);await expect(page.getByRole('textbox',{name:/email/i})).toBeVisible();await page.screenshot({path:'artifacts/signin-desktop.png',fullPage:true});
 expect((await request.get('/api/workspace')).status()).toBe(401);
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.screenshot({path:'artifacts/landing-mobile.png',fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
