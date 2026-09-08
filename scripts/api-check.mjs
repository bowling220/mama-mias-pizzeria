import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'https://mama-mias-pizzeria.vercel.app';
let checks=0;
function check(condition,label){assert.ok(condition,label);checks++;console.log('PASS '+label)}
async function request(action,body,cookie=''){const r=await fetch(base+'/api/app?action='+action,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(cookie?{cookie}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return{status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
const unauth=await request('state');check(unauth.status===401,'Unauthenticated data blocked');
check((await request('login',{password:'wrong-qa-password'})).status===401,'Wrong preview password blocked');
const login=await request('login',{password:process.env.TEST_PREVIEW_PASSWORD});check(login.status===200&&login.cookie,'Preview server login');const user=login.cookie;
const state=await request('state',undefined,user);check(state.body.menu.length>60,'Complete catalog loads');check(state.body.location.address==='1529 W 38th St','Correct current address');
check((await request('settings',state.body,user)).status===403,'Visitor cannot change settings');
check((await request('messages',undefined,user)).status===403,'Visitor cannot read owner inbox');
check((await request('orders',{name:'QA Invalid',lines:[]},user)).status===400,'Empty checkout rejected');
const pizza=state.body.menu.find(i=>i.name==='Cheese Pizza');const line={id:crypto.randomUUID(),itemId:pizza.id,size:1,quantity:2,extras:['Pepperoni'],choice:'',notes:'Automated preview QA. Do not prepare.'};
check((await request('orders',{name:'QA Invalid',lines:[{...line,quantity:-1}]},user)).status===400,'Negative quantity rejected');
check((await request('orders',{name:'QA Invalid',lines:[{...line,extras:['unsupported']}]},user)).status===400,'Unknown modifier rejected');
const payload={requestId:crypto.randomUUID(),name:'QA Automated Check',lines:[line],subtotal:1};
const order=await request('orders',payload,user);check(order.status===200&&order.body.subtotal===2510,'Server recalculates tampered subtotal');
const repeated=await request('orders',payload,user);check(repeated.body.id===order.body.id,'Retry does not duplicate order');
const other=await request('login',{password:process.env.TEST_PREVIEW_PASSWORD});const otherOrders=await request('orders',undefined,other.cookie);check(!otherOrders.body.some(o=>o.id===order.body.id),'Other sessions cannot see private test orders');
check((await request('messages',{name:'QA',email:'invalid',message:'test message'},user)).status===400,'Invalid contact email rejected');
check((await request('messages',{name:'QA Automated Check',email:'qa@example.invalid',message:'Preview inbox verification only. No email delivery requested.',type:'QA'},user)).status===200,'Test inquiry saved');
const owner=await request('login',{password:process.env.TEST_OWNER_PASSWORD,admin:true},user);check(owner.status===200&&owner.body.admin,'Separate owner login');const admin=owner.cookie;
check((await request('orders',undefined,admin)).body.some(o=>o.id===order.body.id),'Owner sees submitted test order');
check((await request('messages',undefined,admin)).body.some(m=>m.name==='QA Automated Check'),'Owner inbox receives test inquiry');
check((await request('order-status',{id:order.body.id,status:'Ready'},admin)).status===200,'Kitchen status update saved');
check((await request('orders',undefined,user)).body.find(o=>o.id===order.body.id).status==='Ready','Customer sees kitchen status');
check((await request('settings',{...state.body,location:{...state.body.location,hours:[null]}},admin)).status===400,'Invalid hours rejected');
check((await request('settings',state.body,admin)).status===200,'Owner settings persist successfully');
check((await request('order-status',{id:order.body.id,status:'Completed'},admin)).status===200,'QA order completed');
await request('logout',{},user);check((await request('state')).status===401,'Locked preview requires fresh session');
for(const path of ['/home','/menu','/order','/our-story','/locations','/locations/erie-38th-st','/franchise','/contact','/specials','/privacy','/accessibility','/admin','/missing-page']){const r=await fetch(base+path);check(r.status===200&&(await r.text()).includes('noindex'),'Route served with private metadata '+path)}
console.log(`${checks} integration checks passed.`);
