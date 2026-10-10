export const dynamic='force-dynamic';
import {auth} from '@/lib/auth/server';
import {loadWorkspace} from '@/lib/db';
import {redirect} from 'next/navigation';
import TapeApp from '@/components/tape-app';
export default async function Page(){
 const {data}=await auth.getSession({query:{disableCookieCache:"true"}}); if(!data?.user)redirect('/auth/sign-in');
 const workspace=await loadWorkspace(data.user.id);
 if(!workspace.onboarded)redirect('/onboarding');
 return <TapeApp user={{name:data.user.name,email:data.user.email}} workspace={workspace}/>;
}
