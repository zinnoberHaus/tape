export const dynamic='force-dynamic';
import {auth} from '@/lib/auth/server';
import {redirect} from 'next/navigation';
import {sql} from '@/lib/db';
import Admin from '@/components/admin';
export default async function Page(){
 const {data}=await auth.getSession({query:{disableCookieCache:"true"}});if(!data?.user)redirect('/auth/sign-in');
 const rows=await sql()`SELECT role FROM neon_auth."user" WHERE id=${data.user.id} AND NOT COALESCE(banned,false)`;
 if(!rows[0]?.role?.split(',').includes('admin'))return <main className="simple-page"><a href="/app">← Back to workspace</a><h1>Administrator access required</h1><p>This page is available to Tape administrators.</p></main>;
 return <main className="simple-page"><a href="/app" className="brand"><span>T</span>Tape</a><h1>User management</h1><Admin selfId={data.user.id}/></main>;
}
