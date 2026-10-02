const text=v=>typeof v==='string'?v.trim():'';
const finish=v=>text(v).replace(/\s+([,.;:!?])/g,'$1').replace(/([.!?])\1+/g,'$1').replace(/\.\s*\.$/g,'.').trim();
export function naturalizeCandidateWording(value,{locale='it',claimShape=null}={}){
 let out=text(value).replace(/\b(?:rel|relationship|descriptor|contributor|thread|desc)[-_ ]?\d+\b/gi,'').replace(/^\s*[Ii]l candidato ha\s+/,'Hai ').replace(/^\s*[Ll]a candidata ha\s+/,'Hai ').replace(/\s*,?\s*senza attribuire proprietà personali o autonomia generale\s*[.!]?\s*$/i,'').replace(/\s{2,}/g,' ').trim();
 // Presentation-only weakening: a claimShape that explicitly authorizes no responsibility
 // assertion cannot be surfaced with the Italian ownership-like "conduzione di" wording.
 if(locale==='it'&&text(claimShape?.responsibilityAssertion)==='none')out=out.replace(/\bnella conduzione di\s+([^,.;]+)/gi,'nel lavoro svolto durante $1');
 if(locale==='it')out=out.replace(/\bHai partecipato a partecipazione\s+(a|al|allo|alla|ai|agli|alle)\s+/gi,'Hai partecipato $1 ').replace(/\bHai contribuito a contributo\s+(a|al|allo|alla|ai|agli|alle)\s+/gi,'Hai contribuito $1 ');
 if(locale==='en')out=out.replace(/\bYou participated in participation in\s+/gi,'You participated in ').replace(/\bYou contributed to contribution to\s+/gi,'You contributed to ');
 return finish(out);
}
export function naturalizeEpisodeMeaning(meaning,{locale='it'}={}){
 const d=finish(meaning?.description);if(!d)return '';
 const p=text(meaning?.participation);
 if(locale==='it'){
  if(p==='participated'){const m=d.match(/^partecipazione\s+(a|al|allo|alla|ai|agli|alle)\s+(.+)$/i);return finish(m?`Hai partecipato ${m[1].toLowerCase()} ${m[2]}`:`Hai partecipato a ${d.charAt(0).toLowerCase()+d.slice(1)}`);}
  if(p==='contributed'){const m=d.match(/^contributo\s+(a|al|allo|alla|ai|agli|alle)\s+(.+)$/i);return finish(m?`Hai contribuito ${m[1].toLowerCase()} ${m[2]}`:`Hai contribuito a ${d.charAt(0).toLowerCase()+d.slice(1)}`);}
  return finish(d);
 }
 if(locale==='en'){
  if(p==='participated'){const m=d.match(/^participation\s+in\s+(.+)$/i);return finish(m?`You participated in ${m[1]}`:`You participated in ${d.charAt(0).toLowerCase()+d.slice(1)}`);}
  if(p==='contributed'){const m=d.match(/^contribution\s+to\s+(.+)$/i);return finish(m?`You contributed to ${m[1]}`:`You contributed to ${d.charAt(0).toLowerCase()+d.slice(1)}`);}
 }
 return finish(d);
}
export function normalizeCandidatePunctuation(value){return finish(value)}
