import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
test('only administrators can list users, disable access and revoke sessions',async({page,playwright,baseURL})=>{
 test.skip(!process.env.DATABASE_URL,'Admin fixture requires the dedicated test database credential.');
 const sql=neon(process.env.DATABASE_URL!),password=randomUUID()+'Ab9!';const email=`tape-qa-${randomUUID()}@example.invalid`,secondEmail=`tape-qa-${randomUUID()}@example.invalid`;const headers={origin:baseURL!};const other=await playwright.request.newContext({baseURL});
 try{
  const signup=await page.request.post('/api/auth/sign-up/email',{headers,data:{email,name:'Tape QA admin',password}});expect(signup.status()).toBe(200);
  expect((await page.request.get('/api/auth/admin/list-users?limit=10')).status()).toBe(403);
  await sql`UPDATE neon_auth."user" SET role='admin' WHERE email=${email}`;
  await page.request.post('/api/auth/sign-out',{headers});
  expect((await page.request.post('/api/auth/sign-in/email',{headers,data:{email,password}})).status()).toBe(200);
  expect((await other.post('/api/auth/sign-up/email',{headers,data:{email:secondEmail,name:'Tape QA member',password}})).status()).toBe(200);
  await page.goto('/admin');await expect(page.getByRole('heading',{name:'User management'})).toBeVisible();
  await page.getByRole('searchbox',{name:'Search users by email'}).fill(secondEmail);await page.getByRole('button',{name:'Search',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button',{name:'Disable',exact:true}).click();await expect(page.locator('tbody')).toContainText('Disabled');
  expect((await other.get('/api/workspace')).status()).toBe(401);
  await page.getByRole('button',{name:'Enable',exact:true}).click();await expect(page.locator('tbody')).toContainText('Active');
  expect((await other.post('/api/auth/sign-in/email',{headers,data:{email:secondEmail,password}})).status()).toBe(200);
  await page.getByRole('button',{name:'Revoke sessions',exact:true}).click();await expect(page.getByRole('button',{name:'Revoke sessions',exact:true})).toBeEnabled();
  expect((await other.get('/api/workspace')).status()).toBe(401);
  await page.screenshot({path:'artifacts/admin-desktop.png',fullPage:true});
 } finally {
  await sql`DELETE FROM neon_auth."user" WHERE email IN (${email},${secondEmail})`;
  await other.dispose();
 }
});
