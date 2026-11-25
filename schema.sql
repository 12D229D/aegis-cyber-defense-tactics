-- ============================================================================
-- Esquema Declarativo SQLite para Aegis Cyber Defense Tactics (Aegis Protocol)
-- Tabla de progreso de campaña, puntuaciones de misiones y logs de auditoría SIEM
-- ============================================================================

-- 1. Tabla de estado y progreso de la campaña de defensa cibernética
CREATE TABLE IF NOT EXISTS campaign_saves (
    mission_id INTEGER PRIMARY KEY,
    mission_name TEXT NOT NULL,
    unlocked INTEGER NOT NULL DEFAULT 0, -- 1 = desbloqueado, 0 = bloqueado
    completed INTEGER NOT NULL DEFAULT 0, -- 1 = completado, 0 = pendiente
    high_score INTEGER NOT NULL DEFAULT 0,
    best_grade TEXT DEFAULT 'N/A',       -- S, A, B, C, D
    turns_record INTEGER DEFAULT NULL,
    last_played_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Historial detallado de partidas finalizadas
CREATE TABLE IF NOT EXISTS mission_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER NOT NULL,
    mission_name TEXT NOT NULL,
    outcome TEXT NOT NULL,               -- 'VICTORY' | 'DEFEAT'
    grade TEXT NOT NULL,                 -- 'S', 'A', 'B', 'C', 'D'
    score INTEGER NOT NULL,
    turns_survived INTEGER NOT NULL,
    target_turns INTEGER NOT NULL,
    data_vault_integrity INTEGER NOT NULL,
    cve_patched_count INTEGER NOT NULL DEFAULT 0,
    threats_neutralized INTEGER NOT NULL DEFAULT 0,
    honeypots_triggered INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mission_id) REFERENCES campaign_saves(mission_id)
);

-- 3. Telemetría y registro forense SIEM (Security Information and Event Management)
CREATE TABLE IF NOT EXISTS combat_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER NOT NULL,
    turn_number INTEGER NOT NULL,
    actor TEXT NOT NULL,                 -- 'BLUE_TEAM', 'RED_TEAM_AI', 'SYSTEM'
    severity TEXT NOT NULL,              -- 'INFO', 'WARN', 'CRITICAL', 'SUCCESS'
    event_type TEXT NOT NULL,            -- 'PATCH', 'EXPLOIT', 'LATERAL_MOVE', 'ISOLATE', etc.
    source_node TEXT,
    target_node TEXT,
    description TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserción de los 6 escenarios base de la campaña táctica
INSERT OR IGNORE INTO campaign_saves (mission_id, mission_name, unlocked, completed, high_score, best_grade) VALUES
(1, 'Misión 1: Perímetro DMZ de Startup Cloud', 1, 0, 0, 'N/A'),
(2, 'Misión 2: Pasarela FinTech & API Gateways', 0, 0, 0, 'N/A'),
(3, 'Misión 3: Clúster de Agentes IA & Servidores MCP', 0, 0, 0, 'N/A'),
(4, 'Misión 4: Planta Industrial IoT & Control SCADA', 0, 0, 0, 'N/A'),
(5, 'Misión 5: Red Bancaria Core Zero-Trust', 0, 0, 0, 'N/A'),
(6, 'Misión 6: Bóveda Global SQLite & Satélites Edge', 0, 0, 0, 'N/A');
