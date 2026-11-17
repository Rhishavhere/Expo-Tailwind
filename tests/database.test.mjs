import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
test('PostgreSQL migrations, RLS, capacity, votes and atomic expense splits',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth to authenticated;grant execute on function auth.uid() to authenticated;
 create publication supabase_realtime;`);
 for(const name of (await readdir('supabase/migrations')).filter(n=>n.endsWith('.sql')).sort())await db.exec(await readFile('supabase/migrations/'+name,'utf8'));
 const ids=Array.from({length:6},(_,i)=>'10000000-0000-4000-8000-'+String(i+1).padStart(12,'0'));
 for(const [index,id]of ids.entries())await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)',[id,'test'+index+'@example.test',JSON.stringify({display_name:'Traveller '+index})]);
 await db.exec(await readFile('supabase/seed.sql','utf8'));
 const signIn=async i=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[ids[i]]);await db.exec('set role authenticated');};
 await signIn(0);
 assert.equal((await db.query('select * from public.profiles')).rows.length,1);
 const destination=(await db.query('select id from public.destinations limit 1')).rows[0].id;
 const trip=(await db.query('select public.create_trip_with_owner($1::jsonb) as id',[JSON.stringify({name:'Test trip',destination_id:destination,start_date:'2026-12-12',end_date:'2026-12-17',currency:'INR',budget_scope:'per_person'})])).rows[0].id;
 assert.equal((await db.query('select * from public.trip_members')).rows.length,1);
 const invitations=[];
 for(let i=1;i<=4;i++)invitations.push((await db.query('select public.invite_to_trip($1,$2) as id',[trip,ids[i]])).rows[0].id);
 await assert.rejects(db.query('select public.invite_to_trip($1,$2)',[trip,ids[5]]),/five members/);
 await signIn(5);assert.equal((await db.query('select * from public.trips')).rows.length,0);
 await assert.rejects(db.query('select public.respond_invitation($1,true)',[invitations[0]]),/unavailable/);
 for(let i=1;i<=4;i++){await signIn(i);await db.query('select public.respond_invitation($1,true)',[invitations[i-1]]);}
 await signIn(0);assert.equal((await db.query('select * from public.trip_members')).rows.length,5);
 await assert.rejects(db.query('insert into public.trip_members(trip_id,user_id,role) values($1,$2,$3)',[trip,ids[5],'member']),/permission denied/);
 const expense={trip_id:trip,title:'Chai',category:'food',amount_minor:101,currency:'INR',paid_by:ids[0],expense_date:'2026-12-12',participants:ids.slice(0,5)};
 const expenseId=(await db.query('select public.save_expense($1::jsonb) as id',[JSON.stringify(expense)])).rows[0].id;
 const split=(await db.query('select share_minor from public.expense_splits order by user_id')).rows.map(s=>Number(s.share_minor));
 assert.deepEqual(split,[21,20,20,20,20]);assert.equal(split.reduce((a,b)=>a+b,0),101);
 await assert.rejects(db.query('select public.save_expense($1::jsonb)',[JSON.stringify({...expense,title:'Bad',participants:[ids[5]]})]),/members/);
 assert.equal((await db.query('select * from public.expenses')).rows.length,1);
 const itemId=(await db.query("insert into public.itinerary_items(trip_id,day_date,title,created_by) values($1,'2026-12-12','A walk',$2) returning id",[trip,ids[0]])).rows[0].id;
 await db.query('select public.vote_item($1,1)',[itemId]);await db.query('select public.vote_item($1,-1)',[itemId]);
 assert.equal((await db.query('select value from public.itinerary_votes')).rows[0].value,-1);
 const oldItem=(await db.query('select updated_at from public.itinerary_items where id=$1',[itemId])).rows[0].updated_at;
 await db.query("update public.itinerary_items set title='New walk' where id=$1",[itemId]);
 await assert.rejects(db.query('select public.move_item($1,1,$2)',[itemId,oldItem]),/changed/);
 await assert.rejects(db.query('select public.apply_itinerary($1,$2::jsonb)',[trip,JSON.stringify([{day_date:'2026-12-12',title:'Valid'},{day_date:'2027-01-01',title:'Outside dates'}])]),/foreign key/);
 assert.equal((await db.query('select * from public.itinerary_items')).rows.length,1);
 await assert.rejects(db.query('select public.edit_trip_dates($1,$2,$3)',[trip,'2026-12-13','2026-12-17']),/Move or remove/);
 await signIn(1);await assert.rejects(db.query('delete from public.expenses where id=$1 returning id',[expenseId]).then(r=>{if(!r.rows.length)throw new Error('not allowed');}),/not allowed/);
 await signIn(0);await assert.rejects(db.query('select public.remove_trip_member($1,$2)',[trip,ids[0]]),/Owner cannot leave/);
 }finally{await db.close();}
});
