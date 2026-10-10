import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
test('signup, onboarding, persistence, isolation, AI, settings and signout',async({page,playwright,baseURL})=>{
 const email=`tape-qa-${randomUUID()}@example.invalid`,password=randomUUID()+'Aa9!';
 const second=await playwright.request.newContext({baseURL});
 const secondEmail=`tape-qa-${randomUUID()}@example.invalid`;
 const origin=baseURL!;const headers={origin};
 try{
 await page.goto('/auth/sign-up');
 await page.getByRole('textbox',{name:'Name',exact:true}).fill('Tape QA');
 await page.getByRole('textbox',{name:'Email',exact:true}).fill(email);
 await page.locator('input[name="password"]').fill(password);
 await page.getByRole('button',{name:'Create an account',exact:true}).click();
 await expect(page).toHaveURL(/\/onboarding/, {timeout:20000});
 await page.getByRole('button',{name:'Open my workspace →',exact:true}).click();
 await expect(page).toHaveURL(/\/app/);await expect(page.getByRole('heading',{name:/3 strong setups/})).toBeVisible();
 const own=page.request;
 await page.goto('/app#ticker/VST');await page.getByRole('button',{name:'Track this setup',exact:true}).click();await expect(page.getByRole('status')).toHaveText('All changes saved');expect((await (await own.get('/api/workspace')).json()).tracked.VST).toBe(true);

 const save=await own.put('/api/workspace',{headers,data:{tracked:{VST:1},holdings:[['VST',10,180]],onboarded:true}});expect(save.status()).toBe(200);
 await page.reload();expect((await (await own.get('/api/workspace')).json()).tracked.VST).toBe(1);
 await expect(page.locator('body')).not.toContainText('NaN');await expect(page.locator('body')).not.toContainText('Infinity');
 expect((await own.put('/api/workspace',{headers:{origin:'https://untrusted.example'},data:{watched:{VST:1}}})).status()).toBe(403);
 expect((await own.put('/api/workspace',{headers,data:{user_id:'another-user'}})).status()).toBe(400);
 const signup2=await second.post('/api/auth/sign-up/email',{headers,data:{email:secondEmail,password,name:'Tape QA isolated'}});expect(signup2.status()).toBe(200);
 const other=await second.get('/api/workspace');expect(other.status()).toBe(200);expect(await other.json()).toEqual({});
 const ask=await own.post('/api/analyst',{headers,data:{task:'chat',sym:'VST',messages:[{role:'user',content:'What are the main risks in the sample VST setup?'}]}});expect(ask.status()).toBe(200);const answer=await ask.json();expect(answer.text.length).toBeGreaterThan(40);expect(answer.text.toLowerCase()).toContain('sample');
 await page.goto('/account');await expect(page.getByRole('heading',{name:'Your account'})).toBeVisible();await expect(page.getByText('Name',{exact:true}).first()).toBeVisible();await page.screenshot({path:'artifacts/account-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Password & sessions',exact:true}).click();await expect(page.getByText('Change Password',{exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page).toHaveURL(/\/$/);
 expect((await own.get('/api/workspace')).status()).toBe(401);
 await page.goto('/auth/sign-in');await page.getByRole('textbox',{name:'Email',exact:true}).fill(email);await page.locator('input[name="password"]').fill(password);await page.getByRole('button',{name:'Login',exact:true}).click();await expect(page).toHaveURL(/\/app/,{timeout:20000});
 expect((await own.delete('/api/account',{headers,data:{password:'incorrect-password'}})).status()).toBe(403);
 expect((await own.delete('/api/account',{headers,data:{password}})).status()).toBe(200);
 expect((await own.get('/api/workspace')).status()).toBe(401);
 }finally{
  await page.request.delete('/api/account',{headers,data:{password}});
  await second.delete('/api/account',{headers,data:{password}});await second.dispose();
 }
});
