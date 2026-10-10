import {neon} from '@neondatabase/serverless';
import type {Workspace} from './workspace';
export function sql(){return neon(process.env.DATABASE_URL!);}
export async function loadWorkspace(userId:string):Promise<Workspace>{
  const rows=await sql()`SELECT data FROM tape_workspace WHERE user_id=${userId}`;
  return (rows[0]?.data as Workspace)||{};
}
