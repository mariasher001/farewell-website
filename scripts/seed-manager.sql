CREATE TABLE IF NOT EXISTS manager_message (
  id         INTEGER     PRIMARY KEY,
  name       TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO manager_message (id, name, message)
VALUES (1, 'Your Manager', 'Click the edit button to add wishes from the manager.')
ON CONFLICT (id) DO NOTHING;
