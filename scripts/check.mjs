import fs from 'node:fs';
import crypto from 'node:crypto';
import dns from 'node:dns';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
dns.setDefaultResultOrder('ipv4first');
export const canonical=x=>x===null||typeof x!=='object'?JSON.stringify(x).replace(/[\u007f-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0')):
 Array.isArray(x)?'['+x.map(canonical).join(',')+']':'{'+Object.keys(x).sort().map(k=>canonical(k)+':'+canonical(x[k])).join(',')+'}';
export const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
export const digest=x=>sha(canonical(x));
export async function rpc(method,params){
 const r=await fetch('https://studio.genlayer.com/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error('HTTP failure');const p=await r.json();if(p.error||p.result==null)throw Error('RPC failure');return p.result;
}
export const client=createClient({chain:studionet});
export const read=(address,functionName,args)=>client.readContract({address,functionName,args});
export async function receipt(hash,expected='SUCCESS',message){
 let tx=await rpc('eth_getTransactionByHash',[hash]);
 for(let i=0;tx.status!=='FINALIZED'&&i<15;i++){await new Promise(r=>setTimeout(r,4000));tx=await rpc('eth_getTransactionByHash',[hash]);}
 const leader=tx.consensus_data?.leader_receipt?.find(x=>x.mode==='leader');
 const raw=leader?.genvm_result?.stderr||leader?.result;
 const decoded=typeof raw!=='string'?'':(/^[A-Za-z0-9+/]*={0,2}$/.test(raw)&&raw.length%4===0?Buffer.from(raw,'base64').toString('utf8'):raw);
 const result={hash,address:tx.to_address??tx.to,status:tx.status,execution:leader?.execution_result,consensus:tx.result_name,
  ...(message?{expected_error_matched:decoded.includes(message)}:{})};
 if(tx.status==='FINALIZED'&&expected==='SUCCESS'&&leader?.execution_result==='SUCCESS'&&tx.result_name==='MAJORITY_DISAGREE')return {...result,committed:false};
 if(tx.status!=='FINALIZED'||leader?.execution_result!==expected||tx.result_name!=='MAJORITY_AGREE'||(message&&!decoded.includes(message)))throw Error('Receipt unverified');
 return {...result,committed:expected==='SUCCESS'};
}
export async function source(address){
 const norm=x=>x.replace(/\r\n/g,'\n').trimEnd()+'\n';
 const actual=norm(Buffer.from(await rpc('gen_getContractCode',[address]),'base64').toString('utf8'));
 if(actual!==norm(fs.readFileSync('contracts/LikelihoodPathLatch.py','utf8')))throw Error('Source mismatch');
 return {address,source_match:true,sha256:sha(actual)};
}
export const initial=()=>({cursor:0,total:0,matches:0,nonmatches:0,unknowns:0,exponent:0,status:'OPEN',steps:0});
export function next(before,label,total,ready){
 if(before.status!=='OPEN')throw Error('Terminal');
 const after={...before,steps:before.steps+1};
 if(!ready){if(label!=='UNKNOWN')throw Error('Failed-source label');after.status='SOURCE_FAILED';return after;}
 if(!Number.isInteger(total)||total<1||total>16||before.cursor>=total||![0,total].includes(before.total)||!['MATCH','NO_MATCH','UNKNOWN'].includes(label))throw Error('Trial schema');
 after.total=total;after.cursor++;
 if(label==='UNKNOWN'){after.unknowns++;after.status='ABSTAINED';}
 else{after[label==='MATCH'?'matches':'nonmatches']++;after.exponent=after.matches-after.nonmatches;
  after.status=after.exponent===3?'UPPER_CROSSED':after.exponent===-3?'LOWER_CROSSED':after.cursor===total?'CAP_REACHED':'OPEN';}
 return after;
}
export function ratio(s){
 // Independent product, rather than exponentiation of the signed tally.
 let n=1n,d=1n;for(let i=0;i<s.matches;i++)n*=3n;for(let i=0;i<s.nonmatches;i++)d*=3n;
 while(n%3n===0n&&d%3n===0n){n/=3n;d/=3n;}
 return {numerator:Number(n),denominator:Number(d),model_only:true,p0:{numerator:1,denominator:4},p1:{numerator:3,denominator:4}};
}
export async function state(address,key){
 const run=await read(address,'get_test',[key]),inputs=run.inputs;
 if(inputs.contract!==address||inputs.policy!=='likelihood-path-latch-v1'||digest(inputs)!==run.input_root||
  digest({contract:address,creator:inputs.creator,nonce:inputs.nonce})!==key)throw Error('Run binding');
 let before=initial(),head=run.input_root;const steps=[];
 for(let i=0;i<run.state.steps;i++){
  const record=await read(address,'get_step',[key,i]),{root,...body}=record,r=record.report,s=r.source;
  if(record.run!==key||record.input_root!==run.input_root||record.previous_head!==head||digest(body)!==root||
   canonical(r.binding)!==canonical({run:key,input_root:run.input_root,previous_head:head,before,policy:inputs.policy})||s.url!==inputs.source.url)throw Error('History/report binding');
  let items=[],status='ACQUISITION_FAILED';
  if(['OK','HASH_MISMATCH'].includes(s.status)){
   if(s.http!==200||sha(s.body)!==s.hash||!Buffer.byteLength(s.body)||Buffer.byteLength(s.body)>6000||s.status!==(s.hash===inputs.source.sha256?'OK':'HASH_MISMATCH'))throw Error('Full source integrity');
   if(s.status==='OK'){
    const doc=JSON.parse(s.body);items=doc.items;
    if(doc.schema!=='sequential-text-v1'||!Array.isArray(items)||!items.length||items.length>16||items.some(x=>typeof x.text!=='string'||typeof x.id!=='string'))throw Error('Corpus schema');
    status='READY';
   }
  }else if(!['UNAVAILABLE','HTTP_ERROR','SIZE_ERROR','ENCODING_ERROR'].includes(s.status)||s.body||s.hash)throw Error('Source failure');
  const item=status==='READY'?items[before.cursor]:null;
  if(r.document_status!==status||canonical(r.item)!==canonical(item))throw Error('Mandatory next item');
  const after=next(before,r.label,items.length,status==='READY');
  if(canonical(after)!==canonical(record.after)||canonical(ratio(after))!==canonical(record.ratio))throw Error('State/ratio derivation');
  before=after;head=root;steps.push({index:i,root,source_status:s.status,item_id:item?.id??null,label:r.label,state:after,ratio:record.ratio});
 }
 if(canonical(before)!==canonical(run.state)||head!==run.head)throw Error('History head');
 if(['ABSTAINED','SOURCE_FAILED'].includes(before.status)){
  let denied=false;try{await read(address,'likelihood_ratio',[key,head]);}catch(e){denied=e.code===-32000&&e.details==='execution failed';}
  if(!denied)throw Error('Incomplete path consumer not denied');
 }else if(canonical(await read(address,'likelihood_ratio',[key,head]))!==canonical({head,state:before,ratio:ratio(before)}))throw Error('Consumer mismatch');
 return {key,inputs,input_root:run.input_root,head,state:before,ratio:ratio(before),steps,verified:true};
}
if(process.argv[1]?.endsWith('check.mjs'))try{
 const [mode,value,extra]=process.argv.slice(2);
 const result=mode==='source'?await source(value):mode==='state'?await state(value,extra):['success','error'].includes(mode)?await receipt(value,mode==='error'?'ERROR':'SUCCESS',extra):null;
 if(!result)throw Error('Unknown mode');console.log(JSON.stringify(result));
}catch{console.error('Sanitized verification failure; inspect recorded hashes before retry');process.exitCode=1;}
