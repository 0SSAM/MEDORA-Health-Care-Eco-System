/** provision-medora.mjs — تجهيز MEDORA: حساب admin + قاعدة الأدوية المصرية (CC0).
 *  - أسماء الجداول snake_case الفعلية، قيم enum تُقرأ ديناميكيًا،
 *  - اقتطاع تلقائي حسب varchar(l) الفعلي لكل عمود،
 *  - تجزئة scrypt بنفس صيغة التطبيق.
 *  الاستخدام: MEDORA_ADMIN_USERNAME=<username> MEDORA_ADMIN_PASSWORD=<password> DATABASE_URL=<url> node provision-medora.mjs --drugs <csv>
 */
import mysql from "mysql2/promise";
import { scryptSync, randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("PROVISION_ERROR: DATABASE_URL is required");
  process.exit(2);
}
const db = await mysql.createConnection(databaseUrl);

async function allCols(table){ const [r] = await db.query("SHOW COLUMNS FROM `"+table+"`"); return r; }
async function enumOf(table, col){ const rows = await allCols(table); const c = rows.find(x=>x.Field===col); if(!c) return null; const m=String(c.Type).match(/^enum\\((.*)\\)$/); return m? [...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]) : null; }
async function insert(table, data){
  const cols = await allCols(table); const set = new Set(cols.map(c=>c.Field));
  const ins={}; for (const [k,v] of Object.entries(data)) if(set.has(k)) ins[k]=v;
  const keys=Object.keys(ins); if(!keys.length) throw new Error("لا أعمدة في "+table);
  const [r]=await db.query("INSERT INTO `"+table+"` ("+keys.map(k=>"`"+k+"`").join(",")+") VALUES ("+keys.map(()=>"?").join(",")+")", keys.map(k=>ins[k] ?? null));
  return r.insertId;
}
async function one(sql,p=[]){ const [r]=await db.query(sql,p); return r[0]||null; }
function scryptHash(pwd){ const salt=randomBytes(16); const dk=scryptSync(pwd,salt,64,{N:16384,r:8,p:1}); const e=b=>Buffer.from(b).toString("base64url").replace(/=+$/,""); return `scrypt$16384$8$1$${e(salt)}$${e(dk)}`; }

// 1) admin
async function provisionAdmin(user,pass){
  if(await one("SELECT id FROM internal_credentials WHERE username=?",[user])){ console.log("[admin] موجود مسبقًا"); return; }
  const orgTypes=(await enumOf("organizations","organizationType"))||[];
  const cCodes=(await enumOf("organizations","countryCode"))||[];
  const orgId=(await one("SELECT id FROM organizations WHERE legalName='MEDORA Admin Organization'"))?.id || await insert("organizations",{organizationType:(orgTypes.includes("pharmacy")?"pharmacy":orgTypes[0]||"pharmacy"),legalName:"MEDORA Admin Organization",displayName:"MEDORA Admin",countryCode:(cCodes.includes("EG")?"EG":cCodes[0]||"EG"),status:"active"});
  const jC=(await enumOf("jurisdiction_profiles","countryCode"))||[];
  const jCur=(await enumOf("jurisdiction_profiles","currencyCode"))||[];
  await one("SELECT id FROM jurisdiction_profiles WHERE countryCode='EG' LIMIT 1") || await insert("jurisdiction_profiles",{countryCode:(jC.includes("EG")?"EG":jC[0]||"EG"),countryNameAr:"مصر",defaultLocale:"ar",currencyCode:(jCur.includes("EGP")?"EGP":jCur[0]||"EGP"),timezone:"Africa/Cairo",taxProfile:"STANDARD",dateFormat:"YYYY-MM-DD",numberSystem:"latn",active:1});
  const brId=(await one("SELECT id FROM branches WHERE organizationId=? LIMIT 1",[orgId]))?.id || await insert("branches",{organizationId:orgId,code:"MAIN",nameAr:"الفرع الرئيسي",active:1});
  const userId=(await one("SELECT id FROM users WHERE openId='seed-admin'"))?.id || await insert("users",{openId:"seed-admin",name:"Admin",email:"admin@medora.local",role:"admin",loginMethod:"internal"});
  const roles=(await enumOf("organization_memberships","organizationRole"))||["owner"];
  const role=roles.includes("admin")?"admin":roles.includes("owner")?"owner":roles[0];
  if(!(await one("SELECT id FROM organization_memberships WHERE organizationId=? AND userId=?",[orgId,userId]))) await insert("organization_memberships",{organizationId:orgId,userId,organizationRole:role,active:1});
  if(!(await one("SELECT id FROM branch_users WHERE branchId=? AND userId=?",[brId,userId]))) await insert("branch_users",{branchId:brId,userId,active:1});

  const existingCredential = await one("SELECT id FROM internal_credentials WHERE userId=? ORDER BY id LIMIT 1",[userId]);
  if (existingCredential) {
    await db.query("UPDATE internal_credentials SET username=?, passwordHash=?, active=1 WHERE id=?",[user,scryptHash(pass),existingCredential.id]);
  } else {
    await insert("internal_credentials",{userId,username:user,passwordHash:scryptHash(pass),active:1});
  }

  console.log(`[admin] provisioned account role=${role} org=${orgId} branch=${brId} user=${userId}`);
}

// 2) الأدوية
async function importDrugs(csvPath){
  if(!existsSync(csvPath)) throw new Error("CSV غير موجود: "+csvPath);
  const [[{c}]]=await db.query("SELECT COUNT(*) c FROM catalog_items WHERE sourceAuthority='EGYPTIAN_DRUG_DATABASE_CC0'");
  if(c>0){ console.log(`[drugs] مستورد مسبقًا (${c})`); return; }
  const userId=(await one("SELECT id FROM users WHERE openId='seed-admin'"))?.id;
  const orgId=(await one("SELECT id FROM organizations WHERE legalName='MEDORA Admin Organization'"))?.id;
  if(!userId||!orgId) throw new Error("أنشئ admin أولاً");
  const cols=await allCols("catalog_items");
  const lim={}; for(const col of cols){ const m=String(col.Type).match(/varchar\\((\\d+)\\)/); if(m) lim[col.Field]=+m[1]; }
  const cap=(k,n)=>v=>{ const s=v==null?null:String(v).trim(); if(!s) return null; const L=Math.min(lim[k]??n??240, n??240); return s.slice(0,L)||null; };
  const cats=await enumOf("catalog_items","category");
  const cat = cats && !cats.includes("medicine") ? cats[0] : "medicine";
  const text=readFileSync(csvPath,"utf8");
  const lines=text.split(/\r?\n/); const header=lines.shift().split(",").map(h=>h.replace(/^"|"$/g,"").trim());
  const hi=Object.fromEntries(header.map((h,i)=>[h,i]));
  const clean=v=>{ const s=String(v??"").replace(/^"|"$/g,"").trim(); return s&&s.toLowerCase()!=="null"?s:null; };
  const batch=[]; let n=0;
  const flush=async rows=>{ await db.query("INSERT INTO catalog_items (organizationId, category, sku, nameAr, nameEn, genericName, manufacturer, priceEgp, sourceAuthority, verificationStatus, createdByUserId) VALUES ?",[rows]); };
  for(const line of lines){
    if(!line.trim()) continue;
    const f=[]; let cur="",q=false;
    for(const ch of line){ if(q){ if(ch==='"')q=false; else cur+=ch; } else if(ch==='"')q=true; else if(ch===","){ f.push(cur); cur=""; } else cur+=ch; }
    f.push(cur);
    const g=k=> hi[k]!==undefined && f[hi[k]]!==undefined ? clean(f[hi[k]]) : null;
    const en=g("commercial_name_en"); if(!en) continue;
    const pr=g("price_egp");
    const price=pr&&/^\d+(\.\d{1,2})?$/.test(pr)?Number(pr):null;
    batch.push([orgId,cat,`EG-ADM-${String(n).padStart(6,"0")}`,cap("nameAr")(g("commercial_name_ar"))||en,cap("nameEn")(en),cap("genericName")(g("scientific_name")),cap("manufacturer")(g("manufacturer")),price,"EGYPTIAN_DRUG_DATABASE_CC0","VERIFIED",userId]);
    n++;
    if(batch.length>=2000){ await flush(batch); batch.length=0; }
  }
  if(batch.length) await flush(batch);
  const [[r2]]=await db.query("SELECT COUNT(*) c FROM catalog_items WHERE sourceAuthority='EGYPTIAN_DRUG_DATABASE_CC0'");
  console.log(`[drugs] مستورد ${n} دواءً | إجمالي القاعدة: ${r2.c}`);
}

const argv = process.argv.slice(2);
const get = (k, d) => { const i = argv.indexOf("--" + k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const adminArg = get("admin", "");
const envUser = process.env.MEDORA_ADMIN_USERNAME || "";
const envPass = process.env.MEDORA_ADMIN_PASSWORD;
let credUser = envUser;
let credPass = envPass;
if (!credUser && !credPass && adminArg) {
  const separator = adminArg.indexOf(":");
  if (separator > 0) {
    credUser = adminArg.slice(0, separator);
    credPass = adminArg.slice(separator + 1);
  }
}
if (!credUser || !credPass) {
  console.error("PROVISION_ERROR: MEDORA_ADMIN_USERNAME and MEDORA_ADMIN_PASSWORD are required");
  process.exit(2);
}
try {
  await provisionAdmin(credUser,credPass);
  const drugsPath = get("drugs", "");
  if(drugsPath) await importDrugs(drugsPath);
  console.log("[done]");
} catch (e) {
  console.error("PROVISION_ERROR:", e instanceof Error ? e.name : "UnknownError");
  process.exit(3);
}
await db.end();
