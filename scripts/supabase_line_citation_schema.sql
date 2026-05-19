alter table pages add column if not exists transcription_reviewed_by text;
alter table pages add column if not exists transcription_reviewed_at timestamptz;
alter table pages add column if not exists transcription_note text;

alter table page_lines add column if not exists transcription_status text;
alter table page_lines add column if not exists reviewed_by text;
alter table page_lines add column if not exists reviewed_at timestamptz;
