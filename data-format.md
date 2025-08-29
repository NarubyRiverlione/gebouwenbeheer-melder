# report

- id INTEGER PRIMARY KEY AUTOINCREMENT,
- message TEXT NOT NULL,
- building TEXT,
- floor TEXT,
- apartment_Number TEXT,
- reporter_name TEXT,
- reporter_email TEXT,
- reporter_phone TEXT,
- timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
- status TEXT DEFAULT 'pending',
- is_processed BOOLEAN DEFAULT false
- is_resolved BOOLEAN DEFAULT false
- category TEXT,
- priority TEXT,
- cluster_id INTEGER,
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP

# issue cluster

- id INTEGER PRIMARY KEY AUTOINCREMENT,
- main_issue TEXT NOT NULL,
- severity TEXT NOT NULL,
- category TEXT NOT NULL,
- estimated_impact TEXT,
- created_date DATE DEFAULT CURRENT_DATE,
- status TEXT DEFAULT 'open'
