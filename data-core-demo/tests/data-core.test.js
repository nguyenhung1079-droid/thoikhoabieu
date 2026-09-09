const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function makeStorage() {
  const m = new Map();
  return {
    getItem: k => m.has(k) ? m.get(k) : null,
    setItem: (k,v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    clear: () => m.clear()
  };
}

const service = fs.readFileSync("data-core-demo/data-service.js", "utf8");
const context = { window: {}, localStorage: makeStorage(), console };
vm.createContext(context);
vm.runInContext(service, context, { filename: "data-service.js" });
const F = context.window.FamilyGrowthData;
assert.ok(F, "FamilyGrowthData must load");

function assertCount(entity, n) {
  assert.equal(F.list(entity).length, n, entity + " seed count");
}

F.seed();
assert.equal(F.version, "1.0");
assert.equal(F.namespace, "FGS_DATA_CORE_1_0");
assert.ok(F.storageOK());

assertCount("families", 1);
assertCount("academic_years", 1);
assertCount("children", 2);
assertCount("school_schedule", 30);
assertCount("personal_schedule", 10);
assertCount("tasks", 22);
assertCount("diary_entries", 2);
assertCount("modules", 3);
assertCount("reward_rules", 5);

// Child isolation
const ta = "child_tuan_anh", mt = "child_minh_truong";
assert.ok(F.byChild("tasks", ta).length > 0);
assert.ok(F.byChild("tasks", mt).length > 0);
assert.ok(F.byChild("tasks", ta).every(x => x.child_id === ta));
assert.ok(F.byChild("tasks", mt).every(x => x.child_id === mt));

// CRUD: children
const child = F.create("children", { name:"QA Child", class_name:"QA", academic_year_id:"academic_2026_2027", active:true });
assert.ok(child.id);
assert.equal(F.get("children", child.id).name, "QA Child");
assert.equal(F.update("children", child.id, { class_name:"QA2" }).class_name, "QA2");
assert.equal(F.remove("children", child.id), true);
assert.equal(F.get("children", child.id), null);

// CRUD: tasks
const task = F.create("tasks", { child_id:ta, title:"QA Task", category:"study", frequency:"daily", points:7, active:true });
assert.equal(F.get("tasks", task.id).title, "QA Task");
F.update("tasks", task.id, { title:"QA Task Updated", points:9 });
assert.equal(F.get("tasks", task.id).points, 9);
assert.equal(F.remove("tasks", task.id), true);

// CRUD: diary + filters/search
const diary = F.create("diary_entries", { child_id:mt, date:"2026-09-08", entry_type:"school", title:"QA School", content:"Need search this unique phrase", priority:"normal" });
assert.equal(F.searchDiary("unique phrase", mt, "school").length, 1);
assert.equal(F.searchDiary("unique phrase", ta, "school").length, 0);
F.update("diary_entries", diary.id, { title:"QA School Updated" });
assert.equal(F.get("diary_entries", diary.id).title, "QA School Updated");
assert.equal(F.remove("diary_entries", diary.id), true);

// CRUD: modules
const mod = F.create("modules", { module_number:99, title:"QA Module", category:"QA", description:"test", age_min:7, age_max:18, active:true });
assert.equal(F.get("modules", mod.id).title, "QA Module");
F.update("modules", mod.id, { description:"updated" });
assert.equal(F.get("modules", mod.id).description, "updated");
assert.equal(F.remove("modules", mod.id), true);

// CRUD: rewards
const reward = F.create("reward_rules", { name:"QA Reward", points_required:999, active:true });
assert.equal(F.get("reward_rules", reward.id).points_required, 999);
F.update("reward_rules", reward.id, { points_required:1000 });
assert.equal(F.get("reward_rules", reward.id).points_required, 1000);
assert.equal(F.remove("reward_rules", reward.id), true);

// Backup validation + round trip
const backup = F.exportAll();
assert.equal(backup.schema_version, "1.0");
assert.ok(F.validateBackup(backup));
const bad = { ...backup, tasks: {} };
assert.equal(F.validateBackup(bad), false);

const before = JSON.stringify(F.exportAll());
F.create("tasks", { child_id:ta, title:"Temporary", category:"other", frequency:"daily", points:1, active:true });
assert.notEqual(JSON.stringify(F.exportAll()), before);
F.importAll(backup);
assert.equal(JSON.stringify(F.exportAll()), before);

// Persistence across service reload
const persisted = context.localStorage;
const context2 = { window: {}, localStorage: persisted, console };
vm.createContext(context2);
vm.runInContext(service, context2, { filename: "data-service-reload.js" });
const F2 = context2.window.FamilyGrowthData;
assert.equal(F2.list("children").length, 2);
assert.equal(F2.list("diary_entries").length, 2);
assert.equal(F2.list("tasks").length, 22);

// Syntax check for the inline application script
const html = fs.readFileSync("data-core-demo/index.html", "utf8");
const start = html.lastIndexOf("<script>");
const end = html.lastIndexOf("</script>");
assert.ok(start >= 0 && end > start);
const inline = html.slice(start + 8, end);
fs.writeFileSync("/tmp/family-growth-inline.js", inline);
console.log("DATA CORE SERVICE TEST: PASS");
console.log("SEED: PASS");
console.log("CHILD ISOLATION: PASS");
console.log("CRUD children/tasks/diary/modules/rewards: PASS");
console.log("DIARY SEARCH: PASS");
console.log("BACKUP VALIDATE/RESTORE: PASS");
console.log("LOCALSTORAGE RELOAD PERSISTENCE: PASS");
console.log("INLINE JS EXTRACTED: PASS");
