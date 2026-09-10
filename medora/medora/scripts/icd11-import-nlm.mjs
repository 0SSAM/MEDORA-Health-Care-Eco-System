#!/usr/bin/env node
/**
 * icd11-import-nlm.mjs — استيعاب رموز ICD-11 من واجهة NLM العامة (clinicaltables v3)
 * المصدر: https://clinicaltables.nlm.nih.gov/apidoc/icd11_codes/v3/doc.html
 * (وقت الجمعة: البيانات "provided as is" ومجانية؛ حقوق المحتوى تبقى لمنظمة الصحة العالمية)
 * الاستخدام: DATABASE_URL="..." node scripts/icd11-import-nlm.mjs [--max N] [--pages N]
 */
import mysql from "mysql2/promise";
const MAX_ROWS = Number(process.argv.find((a,i)=>a==="--max") ? process.argv[process.argv.indexOf("--max")+1] : 12000);
const MAX_PAGES = Number(process.argv.find((a,i)=>a==="--pages") ? process.argv[process.argv.indexOf("--pages")+1] : 30);
const DB_URL = process.env.DATABASE_URL || "mysql://medora:medora@127.0.0.1:3306/medora";
const SRV = "https://clinicaltables.nlm.nih.gov/api/icd11_codes/v3/search";
const DSA = "https://clinicaltables.deepscribe.ai/api/icd11_codes/v3/search";
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const jget=async(u)=>{const r=await fetch(u,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw new Error("HTTP "+r.status);return r.json();};

async function main(){
  const db=await mysql.createConnection(DB_URL);
  let inserted=0, fetched=0, total=0, mode="search";
  const seen=new Set();
  // 1) محاولة FHIR ValueSet $expand أولًا (قائمة كاملة دفعة واحدة)
  for(const base of ["https://clinicaltables.nlm.nih.gov","https://clinicaltables.deepscribe.ai"]){
    for(const path of [`${base}/ValueSet/icd11_codes/$expand?count=20000`]){
      try{
        const j=await jget(path);
        const totalN=Number(j?.expansion?.total||0);
        const contains=j?.expansion?.contains||[];
        if(totalN>0&&contains.length>0){
          mode="fhir-expand";
          console.log("EXPAND_OK",base,"total=",totalN,"contains=",contains.length);
          for(const c of contains){
            const code=c.code; if(!code||seen.has(code))continue; seen.add(code);
            const title=typeof c.display==="string"?c.display:null;
            const uri=c.system?c.code:c.code;
            await db.query(`INSERT INTO icd11_codes (code,title_en,chapter,version,source,uri,is_starter,created_at)
              VALUES (?,?,?,?,?,?,0,NOW()) ON DUPLICATE KEY UPDATE title_en=VALUES(title_en),version=VALUES(version),source=VALUES(source),uri=VALUES(uri)`,
              [code,title,"","ICD-11 MMS (NLM clinicaltables v3)",SRV,uri]);
            inserted++;
          }
          if(inserted>=1000){ await db.end(); console.log(`IMPORT_DONE mode=${mode} inserted=${inserted} fetched=${fetched} total=${total}`); process.exit(0);} 
          await db.end(); console.log(`IMPORT_DONE mode=${mode} inserted=${inserted} fetched=${fetched} total=${total}`); process.exit(0);
        }
      }catch(e){ console.log("expand-skip",base,String(e.message||e).slice(0,80)); }
    }
  }
  // 2) مسح صفحة-بصفحة عبر /search (سقف آمن)
  for(const host of [SRV,DSA]){
    try{
      const p0=await jget(`${host}?terms=&count=500&offset=0&df=code,title&ef=chapter,entityId`);
      if(!Array.isArray(p0)||p0.length<2){ console.log("search-empty",host); continue; }
      total=Number(p0[0]||0); mode="search-paged("+host.split("/")[2]+")";
      console.log("SEARCH_OK",host,"total=",total);
      let page=0;
      while(page<MAX_PAGES && inserted<MAX_ROWS){
        const j= await jget(`${host}?terms=&count=500&offset=${page*500}&df=code,title&ef=chapter,entityId`).catch(()=>null);
        if(!j||!Array.isArray(j)||j.length<4){ break; }
        const codes=j[1]||[]; const extra=j[2]||{}; const rows=j[3]||[];
        if(codes.length===0) break;
        const ch=extra.chapter||[], ei=extra.entityId||[];
        for(let i=0;i<codes.length;i++){
          const code=codes[i]; if(seen.has(code))continue; seen.add(code);
          const title=rows[i]?rows[i][1]:null;
          await db.query(`INSERT INTO icd11_codes (code,title_en,chapter,version,source,uri,is_starter,created_at)
            VALUES (?,?,?,?,?,?,0,NOW()) ON DUPLICATE KEY UPDATE title_en=VALUES(title_en),chapter=VALUES(chapter),version=VALUES(version),source=VALUES(source),uri=VALUES(uri)`,
            [code,title,ch[i]||"","ICD-11 MMS (NLM clinicaltables v3)",host,ei[i]||null]);
          inserted++;
        }
        fetched+=codes.length; page++;
        if(inserted>=MAX_ROWS) break;
        await sleep(50);
      }
      if(inserted>0) break;
    }catch(e){ console.log("search-skip",host,String(e.message||e).slice(0,80)); }
  }
  console.log(`IMPORT_DONE mode=${mode} inserted=${inserted} fetched=${fetched} total=${total}`);
  await db.end();
}
main().then(()=>process.exit(0),e=>{console.error("IMPORT_ERR",String(e.message||e).slice(0,300));process.exit(1);});
