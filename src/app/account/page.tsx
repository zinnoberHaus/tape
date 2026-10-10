export const dynamic='force-dynamic';
import {auth} from '@/lib/auth/server';
import {redirect} from 'next/navigation';
import Account from '@/components/account';
export default async function Page(){const {data}=await auth.getSession({query:{disableCookieCache:"true"}});if(!data?.user)redirect('/auth/sign-in');return <main className="simple-page account-page"><a href="/app" className="brand"><span>T</span>Tape</a><a href="/app">← Back to workspace</a><h1>Your account</h1><Account/></main>}
