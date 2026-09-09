/* FAMILY GROWTH DATA CORE 1.0 */
(function(global){
  "use strict";
  const NS="FGS_DATA_CORE_1_0";
  const now=()=>new Date().toISOString();
  const uid=p=>p+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8);
  const read=(key,fallback=[])=>{try{const v=localStorage.getItem(NS+"_"+key);return v?JSON.parse(v):fallback}catch(e){return fallback}};
  const write=(key,value)=>localStorage.setItem(NS+"_"+key,JSON.stringify(value));
  const clone=v=>JSON.parse(JSON.stringify(v));
  const collections=["families","users","children","academic_years","school_schedule","personal_schedule","tasks","task_logs","modules","module_lessons","module_content","module_progress","diary_entries","reward_rules","reward_transactions","growth_domains","growth_metrics","backup_records","audit_logs","app_settings","sync_queue","devices"];
  function list(entity,filterFn){const a=read(entity);return filterFn?a.filter(filterFn):a}
  function get(entity,id){return list(entity,x=>x.id===id)[0]||null}
  function create(entity,data){const a=read(entity);const item=Object.assign({id:uid(entity.slice(0,-1)||"item"),created_at:now(),updated_at:now()},clone(data));a.push(item);write(entity,a);return item}
  function update(entity,id,patch){const a=read(entity);const i=a.findIndex(x=>x.id===id);if(i<0)return null;a[i]=Object.assign({},a[i],clone(patch),{updated_at:now()});write(entity,a);return a[i]}
  function remove(entity,id){const a=read(entity),n=a.filter(x=>x.id!==id);write(entity,n);return n.length!==a.length}
  function byChild(entity,childId){return list(entity,x=>x.child_id===childId)}
  function searchDiary(q,childId,type){q=(q||"").toLowerCase().trim();return list("diary_entries",x=>(!childId||x.child_id===childId)&&(!type||x.entry_type===type)&&(!q||[x.title,x.content,x.entry_type].join(" ").toLowerCase().includes(q))).sort((a,b)=>String(b.date).localeCompare(String(a.date)))}
  function exportAll(){const data={schema_version:"1.0",exported_at:now()};collections.forEach(k=>data[k]=read(k));return data}
  function validateBackup(data){return !!data&&data.schema_version==="1.0"&&collections.every(k=>Array.isArray(data[k]))}
  function importAll(data){if(!validateBackup(data))throw new Error("BACKUP_INVALID");collections.forEach(k=>write(k,data[k]));return true}
  function seed(){if(read("families").length)return false;const t=now();write("families",[{id:"family_001",name:"Family Growth",status:"active",created_at:t,updated_at:t}]);write("academic_years",[{id:"academic_2026_2027",name:"2026–2027",start_date:"2026-09-01",end_date:"2027-08-31",active:true}]);write("children",[{id:"child_tuan_anh",family_id:"family_001",name:"Nguyễn Tuấn Anh",class_name:"7A5",academic_year_id:"academic_2026_2027",color:"blue",active:true,created_at:t,updated_at:t},{id:"child_minh_truong",family_id:"family_001",name:"Nguyễn Minh Trường",class_name:"1D4",academic_year_id:"academic_2026_2027",color:"green",active:true,created_at:t,updated_at:t}]);return true}
  global.FamilyGrowthData={version:"1.0",namespace:NS,collections,now,uid,list,get,create,update,remove,byChild,searchDiary,exportAll,validateBackup,importAll,seed};
})(window);