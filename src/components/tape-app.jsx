'use client';
import '@neondatabase/auth-ui/css';
import '@/design/hover.css';
import React from 'react';
import {createTapeModel} from './tape-model';
const TapeModel=createTapeModel(React.Component);
import TapeView from './tape-view';
import {parseHoldings,symbols} from '@/lib/workspace';
const savedKeys=['watched','tracked','follow','alList','holdings'];
class TapeApp extends TapeModel {
 constructor(props){super(props);this.state={...this.state,...props.workspace,syncStatus:props.demo?'Demo · sign up to save':'All changes saved',importText:'',importError:''};this.pending={};this.saving=false;}
 componentDidMount(){
  super.componentDidMount();
  this.tapePaused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.readHash=()=>{const [screen,sym]=location.hash.slice(1).split('/');if(['home','opps','ticker','smart','news','portfolio','alerts'].includes(screen))super.go(screen,sym&&this.D.TK[sym]?{sym}:{});};
  this.readHash();window.addEventListener('hashchange',this.readHash);
  this.beforeLeave=e=>{if(this.saving||Object.keys(this.pending).length){e.preventDefault();e.returnValue='';}};
  window.addEventListener('beforeunload',this.beforeLeave);
 }
 componentDidUpdate(prevProps,prevState){
  super.componentDidUpdate(prevProps);
  if(prevState.holdings!==this.state.holdings)this._pf=null;
  if(this.props.demo)return;
  for(const k of savedKeys)if(prevState[k]!==this.state[k]&&this.state[k]!==undefined)this.pending[k]=this.state[k];
  if(Object.keys(this.pending).length&&!this.saving&&!this.saveFailed)this.flush();
 }
 async flush(){
  if(this.saving||!Object.keys(this.pending).length)return;
  this.saving=true;this.saveFailed=false;const patch=this.pending;this.pending={};this.setState({syncStatus:'Saving…'});
  try{const r=await fetch('/api/workspace',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch),keepalive:true});if(!r.ok)throw Error();this.setState({syncStatus:'All changes saved'});}
  catch{this.saveFailed=true;this.pending={...patch,...this.pending};this.setState({syncStatus:'Save failed · use Retry below'});this.saving=false;return;}
  this.saving=false;if(Object.keys(this.pending).length)this.flush();
 }
 componentWillUnmount(){super.componentWillUnmount();window.removeEventListener('hashchange',this.readHash);window.removeEventListener('beforeunload',this.beforeLeave);window.speechSynthesis?.cancel();}
 go(screen,extra){super.go(screen,extra);if(typeof window!=='undefined')history.replaceState(null,'','#'+screen+(screen==='ticker'?'/'+(extra?.sym||this.state.sym):''));}
 pf(){this._pf=null;return super.pf();}
 togglePlay(){
  if(!('speechSynthesis' in window)){this.setState({notice:'Your browser does not support audio briefings.'});return;}
  if(this.state.playing){window.speechSynthesis.cancel();this.setState({playing:false});return;}
  const speech=new SpeechSynthesisUtterance('Tape sample briefing, October 10, 2026. This is illustrative market data, not live investment advice. Money is rotating into power and defense and out of megacap chips. Vistra has the strongest example setup, followed by Lockheed Martin. Carvana shows bearish signals. Review the earnings calendar and concentration risk before forming your thesis.');
  speech.onend=()=>this.setState({playing:false});speech.onerror=()=>this.setState({playing:false});window.speechSynthesis.speak(speech);this.setState({playing:true});
 }
 async complete(input){
  if(this.props.demo)throw new Error('Create an account to use the AI analyst.');
  const task=input.system.startsWith('Convert')?'screen':input.system.startsWith('Turn')?'alert':'chat';
  const r=await fetch('/api/analyst',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task,messages:input.messages,sym:this.state.sym})});
  const body=await r.json();if(!r.ok)throw new Error(body.error||'The analyst is unavailable.');return body.text;
 }
 async ask(q){
  if(this.props.demo){this.setState({aiOpen:true,msgs:[...(this.state.msgs||this.seedMsgs()),{role:'user',text:q},{role:'ai',text:'Create a free Tape account to ask the AI analyst and save your research. This demo lets you explore every research screen using illustrative data.'}]});return;}
  return super.ask(q);
 }
 renderVals(){
  const values=super.renderVals();
  values.h.playLabel=this.state.playing?'❚❚ Stop briefing':'▶ Listen to sample briefing';
  values.pf.methods=[{k:'Upload a CSV',n:'Columns: ticker, shares, average cost. Supported symbols are shown in the editor.',a:'Choose CSV',onClick:()=>this.fileInput.current?.click()},{k:'Type or paste',n:'Add one position per line, with ticker, shares and average cost.',a:'Open editor',onClick:()=>this.setState({importOpen:true,importText:(this.state.holdings||this.D.HOLD).map(r=>r.join(', ')).join('\n')})}];
  values.pf.importNote='Holdings use sample closing prices.';
  if(this.state.holdings){
   const held=new Set(this.state.holdings.map(r=>r[0]));
   values.pf.ideas=values.pf.ideas.filter(x=>held.has(x.sym));
   values.h.watch=values.h.watch.filter((x,i)=>i===0?held.has('CVNA'):i===1?this.pf().nvdaLook>0:true);
  }
  return {...values,portfolioLabel:this.state.holdings?'Your holdings · sample prices':'Sample portfolio · Oct 9',syncStatus:this.state.syncStatus,accountHref:this.props.demo?'/auth/sign-up':'/account',accountName:this.props.user?.name||'Create account',initials:(this.props.user?.name||'Demo').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()};
 }
 fileInput=React.createRef();
 importHoldings(){try{const holdings=parseHoldings(this.state.importText);if(!holdings.every(r=>this.D.TK[r[0]]))throw Error('One or more tickers are not included in the demo dataset.');this._pf=null;this.setState({holdings,importOpen:false,pfImport:false,importError:''});}catch(e){this.setState({importError:e.message});}}
 render(){return <>
  <TapeView {...this.renderVals()}/>
  {this.props.demo&&<a className="demo-cta" href="/auth/sign-up">Demo workspace · Create your account →</a>}
  {this.state.syncStatus.startsWith('Save failed')&&<button className="demo-cta" onClick={()=>this.flush()}>Retry saving workspace</button>}
  <input type="file" accept=".csv,text/csv" hidden ref={this.fileInput} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>100000){this.setState({notice:'Choose a CSV smaller than 100 KB.'});return;}this.setState({importText:await file.text(),importOpen:true,importError:''});e.target.value='';}}/>
  {this.state.importOpen&&<div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="import-title"><button className="modal-close" onClick={()=>this.setState({importOpen:false})} aria-label="Close import">×</button><h2 id="import-title">Your holdings</h2><p>One position per line: ticker, shares, average cost. CSV headers are supported.</p><textarea aria-label="Holdings" rows={8} value={this.state.importText} onChange={e=>this.setState({importText:e.target.value})}/><p className="subtle">Dataset symbols: {symbols.filter(x=>this.D.TK[x]).join(', ')}. Values use sample prices.</p>{this.state.importError&&<p role="alert" className="error-text">{this.state.importError}</p>}<button className="primary" onClick={()=>this.importHoldings()}>Save holdings</button></section></div>}
  {this.state.notice&&<div className="notice" role="status">{this.state.notice}<button onClick={()=>this.setState({notice:''})}>Dismiss</button></div>}
 </>;}
}

/** @param {{demo?: boolean, user?: {name:string,email:string}, workspace?: import("@/lib/workspace").Workspace}} props */
export default function TapeWorkspace(props){return <TapeApp {...props}/>;}
