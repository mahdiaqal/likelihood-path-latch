import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {rpc,receipt,source,state,read,digest,sha} from './check.mjs';
const file='PROOFS.json',signer='0x7a413BB4AB62E31d62d4cD9efC8C8a8Dae37FB42';
let proofs;
if(fs.existsSync(file))proofs=JSON.parse(fs.readFileSync(file,'utf8'));
else{
 const commit=process.argv[2];if(!/^[0-9a-f]{40}$/.test(commit??''))throw Error('Supply published fixture commit');
 proofs={network:'studionet',chain_id:61999,signer,fixture_commit:commit,transactions:[],runs:{}};
}
const save=()=>fs.writeFileSync(file,JSON.stringify(proofs,null,2)+'\n');
proofs.final_readback_verified=false;save();
function broadcast(args,onHash){return new Promise((resolve,reject)=>{
 const proc=spawn(process.execPath,['--dns-result-order=ipv4first','scripts/run-cli.cjs',...args],{windowsHide:true,
  env:{...process.env,LATCH_TEST_ACCOUNT:process.env.LATCH_TEST_ACCOUNT||'studio-proof-deployer'},stdio:['ignore','pipe','pipe']});
 let carry='';proc.stderr.resume();proc.stdout.on('data',chunk=>{carry+=chunk.toString();const lines=carry.split(/\r?\n/);carry=lines.pop();
  for(const line of lines)if(/^BROADCAST_HASH 0x[0-9a-fA-F]{64}$/.test(line))onHash(line.split(' ')[1]);});
 proc.on('error',()=>reject(Error('CLI launch failed')));proc.on('close',resolve);
});}
async function tx(step,args,expected='SUCCESS',message){
 let entry=proofs.transactions.find(x=>x.step===step);
 if(entry&&!entry.hash&&entry.retry_after_history_audit===true){
  entry.retry_after_history_audit=false;entry.broadcast_unknown=true;save();
  await broadcast(args,hash=>{entry.hash=hash;delete entry.broadcast_unknown;save();console.log(step+' '+hash);});
 }
 if(!entry){entry={step,verified:false,broadcast_unknown:true,cli_arguments:args};proofs.transactions.push(entry);save();
  await broadcast(args,hash=>{entry.hash=hash;delete entry.broadcast_unknown;save();console.log(step+' '+hash);});}
 if(!entry.hash)throw Error('Unknown broadcast outcome; inspect signer history');
 Object.assign(entry,await receipt(entry.hash,expected,message),{verified:true});save();
 console.log(JSON.stringify({step,status:entry.status,execution:entry.execution,consensus:entry.consensus}));return entry;
}
const predicate='The message asks its recipient to disclose a password, private key or recovery phrase to another person.';
async function create(name,fixture,bad=false){
 const path='examples/'+fixture+'.json',coordinate='mahdiaqal/likelihood-path-latch/'+proofs.fixture_commit+'/'+path;
 await tx('create-'+name,['write',proofs.address,'create_test','--args',name,predicate,coordinate,bad?'f'.repeat(64):sha(fs.readFileSync(path))]);
 return digest({contract:proofs.address,creator:signer,nonce:name});
}
async function advance(name,key,cursor){
 const entry=await tx(name,['write',proofs.address,'advance','--args',key,String(cursor)]);
 if(!entry.committed){
  const run=await read(proofs.address,'get_test',[key]);entry.no_cursor_advance=run.state.cursor===cursor;save();
  if(!entry.no_cursor_advance)throw Error('Disagreement advanced state');
 }
 return entry.committed;
}
try{
 if(await rpc('eth_chainId',[])!=='0xf22f')throw Error('Wrong chain');
 const deployed=await tx('deploy',['deploy','--contract','contracts/LikelihoodPathLatch.py']);
 if(!deployed.committed)throw Error('Deploy uncommitted');
 proofs.address=deployed.address;proofs.source=await source(proofs.address);save();
 const upper=await create('upper-v1','upper');
 await tx('skip-upper',['write',proofs.address,'advance','--args',upper,'1'],'ERROR','Cursor mismatch');
 for(let i=0;i<3;i++){
  if(!await advance('upper-step-'+i,upper,i))break;
  if(i===0)await tx('replay-upper-cursor',['write',proofs.address,'advance','--args',upper,'0'],'ERROR','Cursor mismatch');
 }
 proofs.runs.upper=await state(proofs.address,upper);save();
 if(proofs.runs.upper.state.status!=='OPEN')await tx('advance-terminal',['write',proofs.address,'advance','--args',upper,String(proofs.runs.upper.state.cursor)],'ERROR','Test terminal');
 const lower=await create('lower-v1','lower');
 for(let i=0;i<3;i++)if(!await advance('lower-step-'+i,lower,i))break;
 proofs.runs.lower=await state(proofs.address,lower);save();
 const cap=await create('cap-v1','cap');
 for(let i=0;i<2;i++)if(!await advance('cap-step-'+i,cap,i))break;
 proofs.runs.cap=await state(proofs.address,cap);save();
 const bad=await create('bad-v1','upper',true);
 await advance('bad-source',bad,0);proofs.runs.bad=await state(proofs.address,bad);save();
 let denied=false;try{await read(proofs.address,'likelihood_ratio',[upper,'f'.repeat(64)]);}catch(e){denied=e.code===-32000&&e.details==='execution failed';}
 if(!denied)throw Error('Wrong-head denial unverified');proofs.wrong_head_consumer_denied=true;
 for(const [name,prior] of Object.entries(proofs.runs)){
  const current=await state(proofs.address,prior.key);if(current.head!==prior.head)throw Error('Negative tests changed history');proofs.runs[name]=current;
 }
 if(proofs.transactions.some(t=>!t.verified||t.broadcast_unknown))throw Error('Unverified transaction remains');
 proofs.source=await source(proofs.address);proofs.final_readback_verified=true;save();
 proofs.expected_outcomes_matched={upper:proofs.runs.upper.state.status==='UPPER_CROSSED',lower:proofs.runs.lower.state.status==='LOWER_CROSSED',cap:proofs.runs.cap.state.status==='CAP_REACHED',bad:proofs.runs.bad.state.status==='SOURCE_FAILED'};save();
 console.log(JSON.stringify({complete:true,address:proofs.address,outcomes:Object.fromEntries(Object.entries(proofs.runs).map(([k,v])=>[k,v.state.status]))}));
}catch{console.error('Sanitized proof workflow stopped; inspect recorded hashes/state before retry');process.exitCode=1;}
