'use client';
import {AccountView} from '@neondatabase/auth-ui';
import {authClient} from '@/lib/auth/client';
import AuthProvider from './auth-provider';
import DeleteAccount from './delete-account';
import {useState} from 'react';
export default function Account(){const [path,setPath]=useState('settings');return <AuthProvider><div className="account-nav">{['settings','security'].map(x=><button key={x} aria-pressed={path===x} onClick={()=>setPath(x)}>{x==='settings'?'Profile':'Password & sessions'}</button>)}<button onClick={async()=>{await authClient.signOut();window.location.assign('/');}}>Sign out</button></div><AccountView path={path} hideNav/>{path==='security'&&<DeleteAccount/>}</AuthProvider>}
