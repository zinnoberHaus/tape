'use client';
import {NeonAuthUIProvider} from '@neondatabase/auth-ui';
import {authClient} from '@/lib/auth/client';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
export default function AuthProvider({children}:{children:React.ReactNode}){
  const router=useRouter();
  return <NeonAuthUIProvider authClient={authClient} defaultTheme="dark" navigate={router.push} replace={router.replace} Link={Link} redirectTo="/onboarding" deleteUser={false} changeEmail={false} credentials={{forgotPassword:true}} social={{providers:[]}}>{children}</NeonAuthUIProvider>;
}
