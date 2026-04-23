CREATE TABLE IF NOT EXISTS messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  token      UUID        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO messages (name, message, token)
VALUES (
  'The DB PERF Family',
  'Some people leave a job. You''re leaving a hole in the heart of this team. From the very first day you walked into DB PERF, you changed the energy in the room. You turned debugging sessions into learning moments. You made Mondays feel like catching up with friends. You brought warmth to every standup, every incident, every late-night fix. This isn''t goodbye. It''s just — see you around, legend. 💙',
  '00000000-0000-0000-0000-000000000000'
);
