'use client';
import {AuthView} from '@neondatabase/auth-ui';
import AuthProvider from './auth-provider';
export default function AuthScreen({path}:{path:string}){return <AuthProvider><AuthView path={path}/></AuthProvider>}
