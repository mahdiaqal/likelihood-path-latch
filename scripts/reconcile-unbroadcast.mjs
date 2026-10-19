// Read-only network audit. Only the known terminal-state negative demo may be retried.
import fs from 'node:fs';
import {rpc,read} from './check.mjs';
try{
 const p=JSON.parse(fs.readFileSync('PROOFS.json','utf8')),step=process.argv[2];
 const entry=p.transactions.find(x=>x.step===step);
 if(step!=='advance-terminal'||!entry||entry.hash||!entry.broadcast_unknown||entry.verified||entry.retry_after_history_audit)throw Error('Not an eligible no-hash terminal negative test');
 const args=entry.cli_arguments;
 if(args?.[0]!=='write'||args[1]!==p.address||args[2]!=='advance'||args[3]!=='--args')throw Error('Unexpected command');
 const run=await read(p.address,'get_test',[args[4]]);
 if(run.state.status==='OPEN')throw Error('Not terminal');
 const history=await rpc('sim_getTransactionsForAddress',[p.address]);
 if(!Array.isArray(history))throw Error('History unavailable');
 const known=new Set(p.transactions.filter(x=>x.hash).map(x=>x.hash.toLowerCase()));
 if(history.some(t=>!known.has((t.hash??t.tx_hash??'').toLowerCase())||t.status!=='FINALIZED'))throw Error('Unknown or pending transaction exists');
 const latest=await rpc('eth_getTransactionCount',[p.signer,'latest']),pending=await rpc('eth_getTransactionCount',[p.signer,'pending']);
 if(latest!==pending)throw Error('Signer has pending transaction');
 entry.prebroadcast_recovery={prior_attempt_no_hash:true,history_only_known_finalized:true,
  history_hashes:history.map(t=>t.hash??t.tx_hash),latest_nonce:latest,pending_nonce:pending,terminal_state:run.state.status};
 entry.retry_after_history_audit=true;
 fs.writeFileSync('PROOFS.json',JSON.stringify(p,null,2)+'\n');
 console.log(JSON.stringify({step,history_audited:true,pending_nonce_matches:true,retry_eligible:true,sent:false}));
}catch{console.error('Sanitized reconciliation failed; do not resend');process.exitCode=1;}
