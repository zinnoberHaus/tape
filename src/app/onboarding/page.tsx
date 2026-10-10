export const dynamic='force-dynamic';
import {auth} from '@/lib/auth/server';
import {loadWorkspace} from '@/lib/db';
import {redirect} from 'next/navigation';
import Onboarding from '@/components/onboarding';
export default async function Page(){const {data}=await auth.getSession({query:{disableCookieCache:"true"}});if(!data?.user)redirect('/auth/sign-in');const w=await loadWorkspace(data.user.id);if(w.onboarded)redirect('/app');return <main className="simple-page"><a href="/" className="brand"><span>T</span>Tape</a><Onboarding name={data.user.name}/></main>}
