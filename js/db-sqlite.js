/**
 * ============================================================================
 * AEGIS PROTOCOL: SQLite Persistence Layer
 * Adaptador SQLite in-browser con almacenamiento local estructurado y exportación .sql
 * ============================================================================
 */

export class AegisDatabase {
    constructor() {
        this.storageKeyCampaign = 'aegis_cyber_campaign_saves';
        this.storageKeyScores = 'aegis_cyber_mission_scores';
        this.storageKeyLogs = 'aegis_cyber_combat_logs';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKeyCampaign)) {
            const initialCampaign = [
                { mission_id: 1, mission_name: 'Misión 1: Perímetro DMZ de Startup Cloud', unlocked: 1, completed: 0, high_score: 0, best_grade: 'N/A', turns_record: null },
                { mission_id: 2, mission_name: 'Misión 2: Pasarela FinTech & API Gateways', unlocked: 0, completed: 0, high_score: 0, best_grade: 'N/A', turns_record: null },
                { mission_id: 3, mission_name: 'Misión 3: Clúster de Agentes IA & Servidores MCP', unlocked: 0, completed: 0, high_score: 0, best_grade: 'N/A', turns_record: null },
                { mission_id: 4, mission_name: 'Misión 4: Planta Industrial IoT & Control SCADA', unlocked: 0, completed: 0, high_score: 0, best_grade: 'N/A', turns_record: null },
                { mission_id: 5, mission_name: 'Misión 5: Red Bancaria Core Zero-Trust', unlocked: 0, completed: 0, high_score: 0, best_grade: 'N/A', turns_record: null },
                { mission_id: 6, mission_name: 'Misión 6: Bóveda Global SQLite & Satélites Edge', unlocked: 0, completed: 0, high_score: 0, best_grade: 'N/A', turns_record: null }
            ];
            this.saveCampaign(initialCampaign);
        }
        if (!localStorage.getItem(this.storageKeyScores)) {
            localStorage.setItem(this.storageKeyScores, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.storageKeyLogs)) {
            localStorage.setItem(this.storageKeyLogs, JSON.stringify([]));
        }
    }

    getCampaign() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeyCampaign)) || [];
        } catch {
            return [];
        }
    }

    saveCampaign(data) {
        localStorage.setItem(this.storageKeyCampaign, JSON.stringify(data));
    }

    getScores() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeyScores)) || [];
        } catch {
            return [];
        }
    }

    getLogs(limit = 100) {
        try {
            const logs = JSON.parse(localStorage.getItem(this.storageKeyLogs)) || [];
            return logs.slice(-limit);
        } catch {
            return [];
        }
    }

    recordCombatLog(missionId, turn, actor, severity, eventType, sourceNode, targetNode, description) {
        const logs = this.getLogs(500);
        const logEntry = {
            log_id: Date.now() + Math.floor(Math.random() * 1000),
            mission_id: missionId,
            turn_number: turn,
            actor: actor,
            severity: severity,
            event_type: eventType,
            source_node: sourceNode || null,
            target_node: targetNode || null,
            description: description,
            timestamp: new Date().toISOString()
        };
        logs.push(logEntry);
        localStorage.setItem(this.storageKeyLogs, JSON.stringify(logs));
        return logEntry;
    }

    recordMissionResult({ missionId, missionName, outcome, grade, score, turnsSurvived, targetTurns, vaultIntegrity, cvePatched, threatsNeutralized, honeypotsTriggered }) {
        const scores = this.getScores();
        const scoreRecord = {
            id: scores.length + 1,
            mission_id: missionId,
            mission_name: missionName,
            outcome: outcome,
            grade: grade,
            score: score,
            turns_survived: turnsSurvived,
            target_turns: targetTurns,
            data_vault_integrity: vaultIntegrity,
            cve_patched_count: cvePatched || 0,
            threats_neutralized: threatsNeutralized || 0,
            honeypots_triggered: honeypotsTriggered || 0,
            created_at: new Date().toISOString()
        };
        scores.push(scoreRecord);
        localStorage.setItem(this.storageKeyScores, JSON.stringify(scores));

        // Actualizar campaña
        const campaign = this.getCampaign();
        const mission = campaign.find(m => m.mission_id === missionId);
        if (mission) {
            if (outcome === 'VICTORY') {
                mission.completed = 1;
                // Desbloquear siguiente misión
                const nextMission = campaign.find(m => m.mission_id === missionId + 1);
                if (nextMission) {
                    nextMission.unlocked = 1;
                }
            }
            if (score > mission.high_score) {
                mission.high_score = score;
                mission.best_grade = grade;
                mission.turns_record = turnsSurvived;
            }
            this.saveCampaign(campaign);
        }

        return scoreRecord;
    }

    resetAllProgress() {
        localStorage.removeItem(this.storageKeyCampaign);
        localStorage.removeItem(this.storageKeyScores);
        localStorage.removeItem(this.storageKeyLogs);
        this.init();
    }

    exportAsSQL() {
        const campaign = this.getCampaign();
        const scores = this.getScores();
        const logs = this.getLogs(200);

        let sql = `-- ========================================================\n`;
        sql += `-- EXPORTACIÓN DE TELEMETRÍA Y PROGRESO AEGIS PROTOCOL\n`;
        sql += `-- Generado: ${new Date().toISOString()}\n`;
        sql += `-- ========================================================\n\n`;

        sql += `DELETE FROM campaign_saves;\n`;
        campaign.forEach(c => {
            sql += `INSERT INTO campaign_saves (mission_id, mission_name, unlocked, completed, high_score, best_grade, turns_record) VALUES (${c.mission_id}, '${c.mission_name.replace(/'/g, "''")}', ${c.unlocked}, ${c.completed}, ${c.high_score}, '${c.best_grade}', ${c.turns_record !== null ? c.turns_record : 'NULL'});\n`;
        });

        sql += `\nDELETE FROM mission_scores;\n`;
        scores.forEach(s => {
            sql += `INSERT INTO mission_scores (mission_id, mission_name, outcome, grade, score, turns_survived, target_turns, data_vault_integrity, cve_patched_count, threats_neutralized, honeypots_triggered, created_at) VALUES (${s.mission_id}, '${s.mission_name.replace(/'/g, "''")}', '${s.outcome}', '${s.grade}', ${s.score}, ${s.turns_survived}, ${s.target_turns}, ${s.data_vault_integrity}, ${s.cve_patched_count}, ${s.threats_neutralized}, ${s.honeypots_triggered}, '${s.created_at}');\n`;
        });

        sql += `\nDELETE FROM combat_logs;\n`;
        logs.forEach(l => {
            const src = l.source_node ? `'${l.source_node}'` : 'NULL';
            const tgt = l.target_node ? `'${l.target_node}'` : 'NULL';
            sql += `INSERT INTO combat_logs (mission_id, turn_number, actor, severity, event_type, source_node, target_node, description, timestamp) VALUES (${l.mission_id}, ${l.turn_number}, '${l.actor}', '${l.severity}', '${l.event_type}', ${src}, ${tgt}, '${l.description.replace(/'/g, "''")}', '${l.timestamp}');\n`;
        });

        return sql;
    }
}

export const aegisDB = new AegisDatabase();
