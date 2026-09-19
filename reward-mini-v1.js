/* FAMILY GROWTH — TUAN ANH ROBLOX REWARD MINI V1
 * Isolated feature module. Does not alter Stable Base unless explicitly loaded.
 * Reuses FAMILY_DASH_42 rewardHistory and current reward balance.
 */
(function(global){
  'use strict';
  const CHILD='ta';
  const DAILY_LIMIT=60;
  const PASSES={
    roblox20:{id:'roblox20',title:'Roblox 20 phút',icon:'🎮',cost:20,minutes:20},
    roblox30:{id:'roblox30',title:'Roblox 30 phút',icon:'🎮',cost:30,minutes:30}
  };
  function dayKey(d){
    const x=d||new Date();
    const y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,'0'),dd=String(x.getDate()).padStart(2,'0');
    return `${y}-${m}-${dd}`;
  }
  function usedToday(S,date){
    const k=dayKey(date);
    return (S?.rewardHistory?.[CHILD]||[])
      .filter(x=>x.kind==='Roblox Pass'&&x.day===k)
      .reduce((n,x)=>n+(Number(x.minutes)||0),0);
  }
  function canRedeem(S,passId,balance,date){
    const p=PASSES[passId];
    if(!p)return {ok:false,reason:'PASS_NOT_FOUND'};
    const used=usedToday(S,date);
    if(Number(balance)<p.cost)return {ok:false,reason:'INSUFFICIENT_STARS',used,limit:DAILY_LIMIT};
    if(used+p.minutes>DAILY_LIMIT)return {ok:false,reason:'DAILY_LIMIT',used,limit:DAILY_LIMIT};
    return {ok:true,pass:p,used,remaining:DAILY_LIMIT-used-p.minutes};
  }
  function redeem(S,passId,balance,date){
    const check=canRedeem(S,passId,balance,date);
    if(!check.ok)return check;
    const p=check.pass,now=date||new Date();
    S.rewardHistory??={ta:[],mt:[]};
    S.rewardHistory.ta??=[];
    const item={
      id:'RBX'+Date.now(),title:p.title,icon:p.icon,cost:p.cost,
      kind:'Roblox Pass',minutes:p.minutes,day:dayKey(now),
      status:'purchased',time:now.toLocaleString('vi-VN')
    };
    S.rewardHistory.ta.unshift(item);
    return {ok:true,item,used:check.used+p.minutes,remaining:check.remaining};
  }
  global.FGSRobloxRewardMini={CHILD,DAILY_LIMIT,PASSES,dayKey,usedToday,canRedeem,redeem};
})(window);
