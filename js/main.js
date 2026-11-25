/**
 * ============================================================================
 * AEGIS PROTOCOL: Autonomous Pentest & Blue-Team Tactics - Main Entry Point
 * Orquesta la Máquina de Estados Finitos (FSM), renderizado en Canvas 2D,
 * ciclo de turnos (PLAYER_TURN -> AI_TURN), interacción con la consola SIEM,
 * persistencia SQLite y controles de UI.
 * ============================================================================
 */

import { NetworkGraph, MISSIONS } from './network-graph.js';
import { BLUE_ACTIONS } from './blueteam-actions.js';
import { RedTeamAI } from './redteam-ai.js';
import { audioSynth } from './audio-synth.js';
import { aegisDB } from './db-sqlite.js';

// Estados de la FSM del juego
export const GAME_STATES = {
    PLAYER_TURN: 'PLAYER_TURN',
    ACTION_RESOLUTION: 'ACTION_RESOLUTION',
    AI_TURN: 'AI_TURN',
    SIEM_REPORT: 'SIEM_REPORT',
    CHECK_VICTORY: 'CHECK_VICTORY',
    GAME_OVER: 'GAME_OVER'
};

class AegisGameManager {
    constructor() {
        this.currentMissionIndex = 0;
        this.graph = null;
        this.redTeamAI = new RedTeamAI();
        this.gameState = GAME_STATES.PLAYER_TURN;

        this.currentTurn = 1;
        this.computePoints = 7;
        this.maxCP = 7;
        this.cpPerTurn = 4;
        this.targetTurns = 8;
        this.score = 0;
        this.cvePatchedCount = 0;
        this.threatsNeutralized = 0;
        this.honeypotsTriggered = 0;

        // Elementos DOM
        this.canvas = document.getElementById('network-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.hudMissionId = document.getElementById('hud-mission-id');
        this.hudTurnDisplay = document.getElementById('hud-turn-display');
        this.hudCpDisplay = document.getElementById('hud-cp-display');
        this.hudVaultDisplay = document.getElementById('hud-vault-display');
        this.missionTitleLabel = document.getElementById('mission-title-label');
        this.missionSelectorContainer = document.getElementById('mission-selector-container');
        this.campaignProgressBadge = document.getElementById('campaign-progress-badge');
        this.inspectorContent = document.getElementById('inspector-content');
        this.actionsGridContainer = document.getElementById('actions-grid-container');
        this.siemTerminalLogs = document.getElementById('siem-terminal-logs');

        // Modales
        this.resultModal = document.getElementById('mission-result-modal');
        this.resultModalTitle = document.getElementById('result-modal-title');
        this.resultModalBody = document.getElementById('result-modal-body');
        this.sqlExportModal = document.getElementById('sql-export-modal');
        this.sqlExportTextarea = document.getElementById('sql-export-textarea');

        // Botones
        this.btnEndTurn = document.getElementById('btn-end-turn');
        this.btnToggleSound = document.getElementById('btn-toggle-sound');
        this.btnExportSql = document.getElementById('btn-export-sql');
        this.btnRefreshTopology = document.getElementById('btn-refresh-topology');
        this.btnResetCampaign = document.getElementById('btn-reset-campaign');
        this.btnModalRetry = document.getElementById('btn-modal-retry');
        this.btnModalNext = document.getElementById('btn-modal-next');
        this.btnCopySql = document.getElementById('btn-copy-sql');
        this.btnCloseSqlModal = document.getElementById('btn-close-sql-modal');

        this.init();
    }

    init() {
        this.setupCanvasResize();
        this.bindEvents();
        this.loadMission(0);
        this.renderCampaignList();
        this.renderActionsGrid();
        this.startRenderLoop();

        // Audio ambiental en primera interacción
        const startAudioOnce = () => {
            audioSynth.init();
            audioSynth.startAmbientDrone();
            window.removeEventListener('click', startAudioOnce);
            window.removeEventListener('keydown', startAudioOnce);
        };
        window.addEventListener('click', startAudioOnce);
        window.addEventListener('keydown', startAudioOnce);
    }

    setupCanvasResize() {
        const resize = () => {
            if (!this.canvas) return;
            const container = this.canvas.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                this.canvas.width = Math.max(700, rect.width || 860);
                this.canvas.height = Math.max(480, rect.height || 520);
            }
        };
        window.addEventListener('resize', resize);
        setTimeout(resize, 100);
    }

    loadMission(index) {
        this.currentMissionIndex = index;
        const mission = MISSIONS[index] || MISSIONS[0];
        this.graph = new NetworkGraph(index);

        this.currentTurn = 1;
        this.targetTurns = mission.turnsToSurvive;
        this.computePoints = mission.initialCP;
        this.maxCP = mission.initialCP;
        this.cpPerTurn = mission.cpPerTurn;
        this.score = 0;
        this.cvePatchedCount = 0;
        this.threatsNeutralized = 0;
        this.honeypotsTriggered = 0;
        this.gameState = GAME_STATES.PLAYER_TURN;

        if (this.missionTitleLabel) this.missionTitleLabel.textContent = mission.title;
        if (this.hudMissionId) this.hudMissionId.textContent = `M-0${mission.id}`;

        this.updateHUD();
        this.updateInspector(null);
        this.siemTerminalLogs.innerHTML = '';
        this.logSIEM('SYSTEM', 'INFO', 'INIT', null, null, `Inicializando infraestructura para "${mission.title}". Defiende la Bóveda de Datos por ${this.targetTurns} turnos.`);
        this.renderCampaignList();
        this.renderActionsGrid();
    }

    updateHUD() {
        if (this.hudTurnDisplay) this.hudTurnDisplay.textContent = `${this.currentTurn} / ${this.targetTurns}`;
        if (this.hudCpDisplay) this.hudCpDisplay.textContent = `${this.computePoints} CP`;

        const vault = this.graph.nodes.find(n => n.isTarget);
        if (vault && this.hudVaultDisplay) {
            const pct = Math.round((vault.firewall / vault.maxFirewall) * 100);
            this.hudVaultDisplay.textContent = `${pct}%`;
            this.hudVaultDisplay.style.color = pct > 60 ? 'var(--color-secure)' : (pct > 25 ? 'var(--color-scanned)' : 'var(--color-compromised)');
        }

        if (this.btnEndTurn) {
            this.btnEndTurn.disabled = this.gameState !== GAME_STATES.PLAYER_TURN;
        }
    }

    logSIEM(actor, severity, eventType, sourceNode, targetNode, description) {
        aegisDB.recordCombatLog(
            this.currentMissionIndex + 1,
            this.currentTurn,
            actor,
            severity,
            eventType,
            sourceNode,
            targetNode,
            description
        );

        const timeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = document.createElement('div');
        entry.className = `siem-entry ${severity}`;
        entry.innerHTML = `<span class="siem-time">[${timeStr}]</span><span class="siem-actor">[${actor}]</span> ${description}`;

        this.siemTerminalLogs.appendChild(entry);
        this.siemTerminalLogs.scrollTop = this.siemTerminalLogs.scrollHeight;
    }

    updateInspector(node) {
        if (!this.inspectorContent) return;

        if (!node) {
            this.inspectorContent.innerHTML = `
                <p style="color: var(--text-muted); font-size: 0.75rem; text-align: center;">Haz clic en cualquier nodo del mapa táctico para inspeccionar y aplicar medidas defensivas.</p>
            `;
            return;
        }

        const pct = Math.round((node.firewall / node.maxFirewall) * 100);
        let badgeColor = 'var(--color-secure)';
        if (node.state === 'COMPROMISED') badgeColor = 'var(--color-compromised)';
        else if (node.state === 'SCANNED') badgeColor = 'var(--color-scanned)';
        else if (node.state === 'ISOLATED') badgeColor = 'var(--color-isolated)';
        else if (node.state === 'HONEYPOT') badgeColor = 'var(--color-honeypot)';

        this.inspectorContent.innerHTML = `
            <div class="inspector-title" style="display: flex; justify-content: space-between; align-items: center;">
                <span>${node.name}</span>
                <span style="font-size: 0.7rem; color: ${badgeColor}; font-family: var(--font-mono);">${node.state}</span>
            </div>
            <div class="inspector-stats">
                <div>Tipo: <strong>${node.type}</strong></div>
                <div>Firewall: <strong>${node.firewall}/${node.maxFirewall} (${pct}%)</strong></div>
                <div>Vulnerabilidades CVE: <strong>${node.cveVulnerabilities}</strong></div>
                <div>Reglas WAF: <strong>${node.wafRules || 0}</strong></div>
            </div>
            ${node.hasHoneypot ? '<div style="margin-top: 0.4rem; color: var(--color-honeypot); font-size: 0.72rem;">🍯 Señuelo Honeypot Activo</div>' : ''}
            ${node.isolatedTurnsLeft > 0 ? `<div style="margin-top: 0.4rem; color: var(--color-isolated); font-size: 0.72rem;">🧊 En Sandbox (${node.isolatedTurnsLeft} turnos restantes)</div>` : ''}
        `;

        this.renderActionsGrid();
    }

    renderCampaignList() {
        if (!this.missionSelectorContainer) return;
        this.missionSelectorContainer.innerHTML = '';
        const campaign = aegisDB.getCampaign();

        let unlockedCount = 0;
        campaign.forEach((m, idx) => {
            if (m.unlocked) unlockedCount++;
            const card = document.createElement('div');
            card.className = `mission-card ${!m.unlocked ? 'locked' : ''} ${idx === this.currentMissionIndex ? 'active' : ''}`;
            card.innerHTML = `
                <div class="mission-title-row">
                    <span>${m.unlocked ? (m.completed ? '✅' : '▶️') : '🔒'} ${m.mission_name}</span>
                    <span class="mission-score-badge">${m.best_grade !== 'N/A' ? `Rango ${m.best_grade}` : 'Sin jugar'}</span>
                </div>
                <div class="mission-desc">${MISSIONS[idx]?.description || ''}</div>
            `;

            if (m.unlocked) {
                card.addEventListener('click', () => {
                    audioSynth.playTacticalClick();
                    this.loadMission(idx);
                });
            }
            this.missionSelectorContainer.appendChild(card);
        });

        if (this.campaignProgressBadge) {
            this.campaignProgressBadge.textContent = `${unlockedCount} / 6 DESBLOQUEADAS`;
        }
    }

    renderActionsGrid() {
        if (!this.actionsGridContainer) return;
        this.actionsGridContainer.innerHTML = '';

        const selectedNode = this.graph ? this.graph.getNode(this.graph.selectedNodeId) : null;

        BLUE_ACTIONS.forEach(action => {
            const card = document.createElement('div');
            const canAfford = this.computePoints >= action.cost;
            const validTarget = action.requiresNode ? (selectedNode && action.canApply(selectedNode, this.graph)) : action.canApply(selectedNode, this.graph);
            const isUsable = canAfford && validTarget && this.gameState === GAME_STATES.PLAYER_TURN;

            card.className = `action-card ${!isUsable ? 'disabled' : ''}`;
            card.innerHTML = `
                <div class="action-card-header">
                    <span>${action.icon} ${action.name}</span>
                    <span class="action-cp-badge">${action.cost} CP</span>
                </div>
                <div class="action-card-desc">${action.description}</div>
            `;

            if (isUsable) {
                card.addEventListener('click', () => {
                    this.executeAction(action, selectedNode);
                });
            }
            this.actionsGridContainer.appendChild(card);
        });
    }

    executeAction(action, selectedNode) {
        if (this.computePoints < action.cost) return;

        this.computePoints -= action.cost;
        if (action.id === 'patch_cve') this.cvePatchedCount++;

        const siemHelper = {
            log: (actor, severity, type, src, tgt, desc) => this.logSIEM(actor, severity, type, src, tgt, desc)
        };

        const res = action.execute(selectedNode, this.graph, audioSynth, siemHelper);
        this.score += 75;

        this.updateHUD();
        this.updateInspector(selectedNode);
        this.renderActionsGrid();
    }

    endPlayerTurn() {
        if (this.gameState !== GAME_STATES.PLAYER_TURN) return;

        audioSynth.playTacticalClick();
        this.gameState = GAME_STATES.AI_TURN;
        this.updateHUD();

        // 1. Resolver efectos de aislamiento y turnos de Sandbox
        this.graph.nodes.forEach(n => {
            if (n.state === 'ISOLATED') {
                n.isolatedTurnsLeft -= 1;
                if (n.isolatedTurnsLeft <= 0) {
                    n.state = n.previousState || 'SECURE';
                    this.logSIEM('BLUE_TEAM', 'INFO', 'SANDBOX_RELEASE', null, n.name, `Aislamiento finalizado. Nodo ${n.name} reconectado al bus de red.`);
                }
            }
        });

        // 2. Ejecutar IA del Red Team con breve pausa táctica dramática
        this.logSIEM('SYSTEM', 'WARN', 'PHASE_SHIFT', null, null, `--- FASE DEL RED TEAM (Turno ${this.currentTurn}) ---`);

        setTimeout(() => {
            const siemHelper = {
                log: (actor, severity, type, src, tgt, desc) => this.logSIEM(actor, severity, type, src, tgt, desc)
            };

            const aiResult = this.redTeamAI.executeTurn(this.graph, audioSynth, siemHelper, this.currentTurn);
            if (aiResult.action === 'HONEYPOT_TRIGGERED') {
                this.honeypotsTriggered++;
                this.threatsNeutralized++;
                this.score += 200;
            }

            // 3. Evaluar condiciones de victoria o derrota
            setTimeout(() => {
                this.checkGameState();
            }, 600);
        }, 500);
    }

    checkGameState() {
        const vault = this.graph.nodes.find(n => n.isTarget);

        // Derrota: La Bóveda SQLite fue vulnerada (Firewall <= 0)
        if (vault && vault.firewall <= 0) {
            this.handleDefeat();
            return;
        }

        // Avance de turno
        this.currentTurn += 1;

        // Victoria: Se sobrevivió el número requerido de turnos
        if (this.currentTurn > this.targetTurns) {
            this.handleVictory();
            return;
        }

        // Restablecer Compute Points (CP) para el nuevo turno
        this.computePoints = Math.min(15, this.computePoints + this.cpPerTurn);
        this.gameState = GAME_STATES.PLAYER_TURN;
        this.logSIEM('SYSTEM', 'SUCCESS', 'PHASE_SHIFT', null, null, `--- FASE BLUE TEAM (Turno ${this.currentTurn}/${this.targetTurns}) | +${this.cpPerTurn} CP asignados ---`);

        this.updateHUD();
        this.updateInspector(this.graph.getNode(this.graph.selectedNodeId));
        this.renderActionsGrid();
    }

    handleVictory() {
        this.gameState = GAME_STATES.GAME_OVER;
        audioSynth.playVictorySound();

        const vault = this.graph.nodes.find(n => n.isTarget);
        const vaultPct = vault ? Math.round((vault.firewall / vault.maxFirewall) * 100) : 0;
        this.score += vaultPct * 15 + (this.cvePatchedCount * 50) + 500;

        // Cálculo de calificación S, A, B, C
        let grade = 'C';
        if (vaultPct >= 90) grade = 'S';
        else if (vaultPct >= 70) grade = 'A';
        else if (vaultPct >= 50) grade = 'B';

        const mission = MISSIONS[this.currentMissionIndex];
        aegisDB.recordMissionResult({
            missionId: mission.id,
            missionName: mission.title,
            outcome: 'VICTORY',
            grade: grade,
            score: this.score,
            turnsSurvived: this.targetTurns,
            targetTurns: this.targetTurns,
            vaultIntegrity: vaultPct,
            cvePatched: this.cvePatchedCount,
            threatsNeutralized: this.threatsNeutralized,
            honeypotsTriggered: this.honeypotsTriggered
        });

        this.resultModalTitle.textContent = '🏆 ¡INFRAESTRUCTURA ASEGURADA!';
        this.resultModalTitle.style.color = 'var(--color-secure)';
        this.resultModalBody.innerHTML = `
            <p>El Escuadrón Aegis contuvo exitosamente todos los vectores de ataque del Red Team.</p>
            <div style="margin-top: 1rem; background: var(--bg-surface); padding: 0.75rem; border-radius: 6px; font-family: var(--font-mono); font-size: 0.85rem;">
                <div>Calificación: <strong style="color: var(--accent-cyan); font-size: 1.1rem;">${grade}</strong></div>
                <div>Puntuación Final: <strong>${this.score} pts</strong></div>
                <div>Integridad de Bóveda: <strong>${vaultPct}%</strong></div>
                <div>Parches CVE Aplicados: <strong>${this.cvePatchedCount}</strong></div>
                <div>Señuelos Activados: <strong>${this.honeypotsTriggered}</strong></div>
            </div>
        `;

        this.btnModalNext.style.display = (this.currentMissionIndex < MISSIONS.length - 1) ? 'inline-block' : 'none';
        this.resultModal.classList.add('active');
        this.renderCampaignList();
    }

    handleDefeat() {
        this.gameState = GAME_STATES.GAME_OVER;
        audioSynth.playDefeatSound();

        const mission = MISSIONS[this.currentMissionIndex];
        aegisDB.recordMissionResult({
            missionId: mission.id,
            missionName: mission.title,
            outcome: 'DEFEAT',
            grade: 'D',
            score: this.score,
            turnsSurvived: this.currentTurn - 1,
            targetTurns: this.targetTurns,
            vaultIntegrity: 0,
            cvePatched: this.cvePatchedCount,
            threatsNeutralized: this.threatsNeutralized,
            honeypotsTriggered: this.honeypotsTriggered
        });

        this.resultModalTitle.textContent = '💀 ¡BRECHA CRÍTICA: BÓVEDA EXFILTRADA!';
        this.resultModalTitle.style.color = 'var(--color-compromised)';
        this.resultModalBody.innerHTML = `
            <p>El agente Red Team logró vulnerar la Bóveda de Datos SQLite y exfiltrar los registros soberanos.</p>
            <div style="margin-top: 1rem; background: var(--bg-surface); padding: 0.75rem; border-radius: 6px; font-family: var(--font-mono); font-size: 0.85rem;">
                <div>Calificación: <strong style="color: var(--color-compromised); font-size: 1.1rem;">D</strong></div>
                <div>Puntuación: <strong>${this.score} pts</strong></div>
                <div>Turnos Resistidos: <strong>${this.currentTurn - 1} / ${this.targetTurns}</strong></div>
            </div>
        `;

        this.btnModalNext.style.display = 'none';
        this.resultModal.classList.add('active');
        this.renderCampaignList();
    }

    bindEvents() {
        // Clic en Canvas para seleccionar nodos
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            const clickedNode = this.graph.findNodeAt(x, y);
            if (clickedNode) {
                audioSynth.playTacticalClick();
                this.graph.selectedNodeId = clickedNode.id;
                this.updateInspector(clickedNode);
            } else {
                this.graph.selectedNodeId = null;
                this.updateInspector(null);
            }
        });

        // Hover en Canvas
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            const hovered = this.graph.findNodeAt(x, y);
            this.graph.hoveredNodeId = hovered ? hovered.id : null;
            this.canvas.style.cursor = hovered ? 'pointer' : 'crosshair';
        });

        // Finalizar Turno
        this.btnEndTurn.addEventListener('click', () => {
            this.endPlayerTurn();
        });

        // Botón Sonido
        this.btnToggleSound.addEventListener('click', () => {
            const isMuted = audioSynth.toggleMute();
            this.btnToggleSound.textContent = isMuted ? '🔇 Sonido: OFF' : '🔊 Sonido: ON';
        });

        // Botón Reiniciar Misión
        this.btnRefreshTopology.addEventListener('click', () => {
            audioSynth.playTacticalClick();
            this.loadMission(this.currentMissionIndex);
        });

        // Botón Reiniciar Campaña
        this.btnResetCampaign.addEventListener('click', () => {
            if (confirm('¿Deseas reiniciar todo el progreso de la campaña y las puntuaciones guardadas en SQLite?')) {
                aegisDB.resetAllProgress();
                this.loadMission(0);
                this.renderCampaignList();
            }
        });

        // Botón Exportar SQL
        this.btnExportSql.addEventListener('click', () => {
            audioSynth.playTacticalClick();
            const sqlDump = aegisDB.exportAsSQL();
            this.sqlExportTextarea.value = sqlDump;
            this.sqlExportModal.classList.add('active');
        });

        // Botón Copiar SQL
        this.btnCopySql.addEventListener('click', () => {
            navigator.clipboard.writeText(this.sqlExportTextarea.value);
            this.btnCopySql.textContent = '¡Copiado!';
            setTimeout(() => {
                this.btnCopySql.textContent = 'Copiar al Portapapeles';
            }, 1500);
        });

        // Botón Cerrar Modal SQL
        this.btnCloseSqlModal.addEventListener('click', () => {
            this.sqlExportModal.classList.remove('active');
        });

        // Modales de Victoria / Derrota
        this.btnModalRetry.addEventListener('click', () => {
            this.resultModal.classList.remove('active');
            this.loadMission(this.currentMissionIndex);
        });

        this.btnModalNext.addEventListener('click', () => {
            this.resultModal.classList.remove('active');
            if (this.currentMissionIndex < MISSIONS.length - 1) {
                this.loadMission(this.currentMissionIndex + 1);
            }
        });
    }

    startRenderLoop() {
        const loop = () => {
            if (this.graph && this.ctx) {
                this.graph.update();
                this.graph.render(this.ctx, this.canvas.width, this.canvas.height);
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

// Inicialización de la aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
    window.aegisGame = new AegisGameManager();
});
