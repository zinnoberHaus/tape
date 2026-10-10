import {auth} from '@/lib/auth/server';
import {loadWorkspace,sql} from '@/lib/db';
import {workspaceSchema} from '@/lib/workspace';
export async function GET(){
  const {data}=await auth.getSession({query:{disableCookieCache:"true"}});
  if(!data?.user)return Response.json({error:'Sign in to load your workspace.'},{status:401});
  return Response.json(await loadWorkspace(data.user.id),{headers:{'Cache-Control':'private, no-store'}});
}
export async function PUT(request:Request){
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
  const {data}=await auth.getSession({query:{disableCookieCache:"true"}});
  if(!data?.user)return Response.json({error:'Sign in to save your workspace.'},{status:401});
  const raw=await request.text();
  if(raw.length>65536)return Response.json({error:'Workspace is too large.'},{status:413});
  let body;try{body=JSON.parse(raw)}catch{return Response.json({error:'Invalid JSON'},{status:400})}
  const parsed=workspaceSchema.safeParse(body);
  if(!parsed.success)return Response.json({error:'Invalid workspace data.'},{status:400});
  await sql()`INSERT INTO tape_workspace(user_id,data) VALUES(${data.user.id},${JSON.stringify(parsed.data)}::jsonb)
    ON CONFLICT(user_id) DO UPDATE SET data=tape_workspace.data || excluded.data,updated_at=now()`;
  return Response.json({saved:true});
}
