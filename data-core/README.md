# FAMILY GROWTH DATA CORE 1.0

Data foundation for FAMILY GROWTH SYSTEM.

## Safety
- Separate development branch; current STABLE BASE is untouched.
- Dedicated LocalStorage namespace: FGS_DATA_CORE_1_0.
- CRUD, child isolation, diary search/filter, export/import and seed data are included.
- Future PostgreSQL/API integration can replace the storage adapter without changing the UI contract.

## Children
- child_tuan_anh — Nguyễn Tuấn Anh — 7A5
- child_minh_truong — Nguyễn Minh Trường — 1D4

## Integration rule
Migrate one feature at a time: children → TKB → personal schedule → tasks → diary → curriculum → growth/reward. Do not modify the stable build until regression tests pass.
