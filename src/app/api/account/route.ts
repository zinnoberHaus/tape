import {auth} from '@/lib/auth/server';
import {sql} from '@/lib/db';
import {z} from 'zod';
export async function DELETE(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 const {data}=await auth.getSession({query:{disableCookieCache:"true"}});if(!data?.user)return Response.json({error:'Sign in first.'},{status:401});
 let body;try{body=z.object({password:z.string().min(8).max(128)}).strict().parse(await request.json())}catch{return Response.json({error:'Enter your current password.'},{status:400});}
 const result=await auth.signIn.email({email:data.user.email,password:body.password});
 if(result.error)return Response.json({error:'Your password was not accepted.'},{status:403});
 await auth.signOut();
 await sql()`DELETE FROM neon_auth."user" WHERE id=${data.user.id}`;
 return Response.json({deleted:true});
}
