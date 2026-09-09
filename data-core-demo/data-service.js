/* FAMILY GROWTH DATA CORE 1.0 */
(function(global){
  "use strict";
  const NS="FGS_DATA_CORE_1_0";
  const now=()=>new Date().toISOString();
  const uid=p=>p+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8);
  const memory={};
  const storageOK=()=>{try{const k=NS+"_test";localStorage.setItem(k,"1");localStorage.removeItem(k);return true}catch(e){return false}};
  const read=(key,fallback=[])=>{try{const v=localStorage.getItem(NS+"_"+key);if(v)return JSON.parse(v)}catch(e){} return Object.prototype.hasOwnProperty.call(memory,key)?clone(memory[key]):clone(fallback)};
  const write=(key,value)=>{memory[key]=clone(value);try{localStorage.setItem(NS+"_"+key,JSON.stringify(value))}catch(e){} return value};
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
  function seed(){
    const t=now();
    if(!read("families").length) write("families",[{id:"family_001",name:"Family Growth",status:"active",created_at:t,updated_at:t}]);
    if(!read("academic_years").length) write("academic_years",[{id:"academic_2026_2027",name:"2026–2027",start_date:"2026-09-01",end_date:"2027-08-31",active:true}]);
    if(!read("children").length) write("children",[
      {id:"child_tuan_anh",family_id:"family_001",name:"Nguyễn Tuấn Anh",class_name:"7A5",academic_year_id:"academic_2026_2027",color:"blue",active:true,created_at:t,updated_at:t},
      {id:"child_minh_truong",family_id:"family_001",name:"Nguyễn Minh Trường",class_name:"1D4",academic_year_id:"academic_2026_2027",color:"green",active:true,created_at:t,updated_at:t}
    ]);
    if(!read("school_schedule").length){
      const TA={1:["CHAOCO","TABT","HĐTN","TOÁN","TOÁN"],2:["GDĐP","TIN","VĂN","VĂN","HÓA"],3:["NHẠC","SỬ","TD","SỬ","VĂN"],4:["ANH","CN","ĐỊA","TD","SINH"],5:["GDCD","ANH","VĂN","ANH","LÝ"],6:["TOÁN","MT","SINH","TOÁN","SH"]};
      const rows=[]; Object.keys(TA).forEach(d=>TA[d].forEach((subject,i)=>rows.push({id:uid("sch"),child_id:"child_tuan_anh",academic_year_id:"academic_2026_2027",day_of_week:+d,period:i+1,subject,active:true})));
      write("school_schedule",rows);
    }
    if(!read("personal_schedule").length){
      const p=[
        [1,"13:30","15:00","Toán phụ đạo tại Trung tâm","Trung tâm Tràng An"],
        [3,"17:00","18:30","Toán phụ đạo tại Trung tâm","Trung tâm Tràng An"],
        [4,"13:30","15:00","Ngữ văn phụ đạo tại Trung tâm","Trung tâm Tràng An"],
        [4,"15:15","16:45","Tiếng Anh phụ đạo tại Trung tâm","Trung tâm Tràng An"],
        [5,"13:30","15:00","Ngữ văn phụ đạo tại Trung tâm","80 Kẻ Vẽ"],
        [1,"20:30","21:00","Mentor 1:1","Online"],
        [0,"15:15","16:15","Phát triển năng lực & Kỹ năng sống","Online"],
        [-1,"05:30","06:00","🏃 CLB Thể chất","Online"],
        [-1,"06:00","06:30","🏃 CLB Thể chất","Online"],
        [-1,"21:15","21:45","🌙 CLB Thể chất","Online"]
      ];
      write("personal_schedule",p.map(x=>({id:uid("ps"),child_id:"child_tuan_anh",academic_year_id:"academic_2026_2027",day_of_week:x[0],start_time:x[1],end_time:x[2],activity_name:x[3],location:x[4],active:true})));
    }
    if(!read("tasks").length){
      const ta=["Tự thức dậy","Gấp chăn / sắp xếp giường","Vệ sinh cá nhân","Học tập chủ động 60 phút","Đọc sách 20 phút","Dọn bàn học","Việc nhà hôm nay","Tự sắp xếp đồ dùng","Việc quan trọng trước giải trí","Chuẩn bị đồ cho ngày mai","Tự đánh giá hôm nay"];
      const mt=["Tự thức dậy","Gấp chăn / sắp xếp chỗ ngủ","Vệ sinh cá nhân","Học tập / luyện tập 20 phút","Đọc truyện / sách 15 phút","Tự cất đồ chơi","Giúp một việc nhỏ","Tự sắp xếp đồ dùng","Làm việc cần làm trước khi xem màn hình","Chuẩn bị đồ cho ngày mai","Nói một điều vui hôm nay"];
      write("tasks",ta.map((title,i)=>({id:uid("task"),child_id:"child_tuan_anh",title,category:"daily",frequency:"daily",points:i<3?5:10,active:true,created_at:t,updated_at:t})).concat(mt.map((title,i)=>({id:uid("task"),child_id:"child_minh_truong",title,category:"daily",frequency:"daily",points:i<3?5:10,active:true,created_at:t,updated_at:t}))));
    }
    if(!read("diary_entries").length) write("diary_entries",[
      {id:"diary_seed_1",child_id:"child_tuan_anh",date:"2026-09-06",entry_type:"reminder",title:"Lịch học Teen Care",content:"CLB Thể chất: chọn 05:30–06:00 / 06:00–06:30 / 21:15–21:45. Thứ 2 Mentor 1:1 20:30–21:00. Chủ nhật Kỹ năng sống 15:15–16:15.",priority:"normal",created_by:"parent",created_at:t,updated_at:t},
      {id:"diary_seed_2",child_id:"child_tuan_anh",date:"2026-09-06",entry_type:"center",title:"Lịch phụ đạo Trung tâm",content:"Thứ 2 Toán 13:30–15:00; Thứ 4 Toán 17:00–18:30; Thứ 5 Ngữ văn 13:30–15:00, Tiếng Anh 15:15–16:45; Thứ 6 Ngữ văn 13:30–15:00.",priority:"normal",created_by:"parent",created_at:t,updated_at:t}
    ]);
    if(!read("modules").length) write("modules",[
      {id:"module_01",module_number:1,title:"Quản lý tiền lì xì / tiền tiêu xài cá nhân",description:"Phân biệt cần và muốn; tiết kiệm và lựa chọn.",category:"Tư duy tài chính",age_min:7,age_max:18,active:true,created_at:t,updated_at:t},
      {id:"module_02",module_number:2,title:"Tự quản lý thời gian",description:"Biến việc cần làm thành kế hoạch và thói quen.",category:"Tự quản",age_min:7,age_max:18,active:true,created_at:t,updated_at:t},
      {id:"module_03",module_number:3,title:"Quản lý cảm xúc",description:"Nhận diện cảm xúc và lựa chọn cách phản ứng.",category:"Cảm xúc",age_min:7,age_max:18,active:true,created_at:t,updated_at:t}
    ]);
    if(!read("reward_rules").length) write("reward_rules",[
      {id:"reward_50",name:"Chọn phim gia đình",points_required:50,active:true},
      {id:"reward_80",name:"Chọn món ăn cuối tuần",points_required:80,active:true},
      {id:"reward_120",name:"Thêm 30 phút hoạt động yêu thích",points_required:120,active:true},
      {id:"reward_160",name:"Chọn một hoạt động gia đình",points_required:160,active:true},
      {id:"reward_250",name:"Phần thưởng đặc biệt",points_required:250,active:true}
    ]);
    return true;
  }
  global.FamilyGrowthData={version:"1.0",namespace:NS,collections,now,uid,list,get,create,update,remove,byChild,searchDiary,exportAll,validateBackup,importAll,seed,storageOK};
})(window);