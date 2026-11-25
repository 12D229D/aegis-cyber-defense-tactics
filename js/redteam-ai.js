/**
 * ============================================================================
 * AEGIS PROTOCOL: Autonomous Red-Team Adversary AI
 * Inteligencia artificial adversaria que utiliza un árbol de utilidad / heurística
 * para ejecutar: Reconocimiento (Scan), Explotación de CVEs, Movimiento Lateral
 * y Exfiltración de la Bóveda de Datos SQLite.
 * ============================================================================
 */

export class RedTeamAI {
    constructor() {
        this.compromisedNodes = [];
        this.stealthRating = 75; // Porcentaje de sigilo del atacante
    }

    /**
     * Evalúa y ejecuta el turno táctico de la IA
     * @param {NetworkGraph} graph 
     * @param {CyberAudioEngine} audio 
     * @param {Object} siem 
     * @param {number} turnNumber 
     * @returns {Object} Resumen de acciones tomadas
     */
    executeTurn(graph, audio, siem, turnNumber) {
        const compromised = graph.nodes.filter(n => n.state === 'COMPROMISED');
        const candidateMoves = [];

        // Si no hay nodos comprometidos, el atacante intenta entrar por los puntos de entrada (nodos isEntry)
        if (compromised.length === 0) {
            const entryNodes = graph.nodes.filter(n => n.isEntry && n.state !== 'ISOLATED');
            if (entryNodes.length > 0) {
                const target = entryNodes[Math.floor(Math.random() * entryNodes.length)];
                target.state = 'COMPROMISED';
                target.firewall = Math.max(10, target.firewall - 25);
                audio.playIntrusionAlert();
                siem.log('RED_TEAM_AI', 'CRITICAL', 'PERIMETER_BREACH', null, target.name, `¡Brecha perimetral! Nodo de entrada ${target.name} comprometido nuevamente.`);
                return { action: 'BREACH', target: target.name };
            }
        }

        // Generar lista de posibles acciones evaluadas por el árbol de utilidad
        compromised.forEach(sourceNode => {
            const connectedIds = graph.getConnectedNodes(sourceNode.id);
            connectedIds.forEach(targetId => {
                const targetNode = graph.getNode(targetId);
                if (!targetNode || targetNode.state === 'ISOLATED') return;

                // 1. Si el objetivo es un Honeypot, tiene un atractivo aparente muy alto para engañar a la IA
                if (targetNode.hasHoneypot || targetNode.state === 'HONEYPOT') {
                    candidateMoves.push({
                        type: 'ATTACK_HONEYPOT',
                        source: sourceNode,
                        target: targetNode,
                        utilityScore: 90
                    });
                    return;
                }

                // 2. Si el objetivo es la Bóveda Central (Data Vault)
                if (targetNode.isTarget) {
                    const score = 100 - (targetNode.firewall / 2);
                    candidateMoves.push({
                        type: 'EXFILTRATE_VAULT',
                        source: sourceNode,
                        target: targetNode,
                        utilityScore: score + 30
                    });
                    return;
                }

                // 3. Si el objetivo es Seguro, evaluar movimiento lateral o escaneo
                if (targetNode.state === 'SECURE') {
                    const score = 50 + (targetNode.cveVulnerabilities * 15) - (targetNode.firewall / 3);
                    candidateMoves.push({
                        type: 'LATERAL_MOVE',
                        source: sourceNode,
                        target: targetNode,
                        utilityScore: score
                    });
                } else if (targetNode.state === 'SCANNED') {
                    // Explotar nodo ya escaneado
                    const score = 65 + (targetNode.cveVulnerabilities * 20) - (targetNode.firewall / 4);
                    candidateMoves.push({
                        type: 'EXPLOIT_CVE',
                        source: sourceNode,
                        target: targetNode,
                        utilityScore: score
                    });
                }
            });
        });

        // Si no hay objetivos directos conectados a nodos comprometidos, explorar reconocimiento en nodos lejanos
        if (candidateMoves.length === 0) {
            const unscanned = graph.nodes.filter(n => n.state === 'SECURE' && !n.isTarget && n.state !== 'ISOLATED');
            if (unscanned.length > 0) {
                const target = unscanned[Math.floor(Math.random() * unscanned.length)];
                target.state = 'SCANNED';
                target.cveVulnerabilities = Math.min(2, target.cveVulnerabilities + 1);
                graph.spawnPacket(compromised[0]?.id || target.id, target.id, 'SCAN');
                audio.playIntrusionAlert();
                siem.log('RED_TEAM_AI', 'WARN', 'PORT_SCAN', null, target.name, `Escaneo sigiloso detectado en ${target.name}. Vulnerabilidad CVE identificada.`);
                return { action: 'SCAN', target: target.name };
            }
        }

        // Ordenar candidatos por puntuación de utilidad descendente
        candidateMoves.sort((a, b) => b.utilityScore - a.utilityScore);
        const chosen = candidateMoves[0];

        if (!chosen) {
            siem.log('RED_TEAM_AI', 'INFO', 'IDLE', null, null, `El agente Red Team está recalculando rutas de infiltración...`);
            return { action: 'IDLE' };
        }

        // Ejecutar la acción elegida
        const { type, source, target } = chosen;

        if (type === 'ATTACK_HONEYPOT') {
            // El Honeypot atrapa al atacante y neutraliza el movimiento
            target.hasHoneypot = false;
            target.state = 'SECURE';
            audio.playIsolateSound();
            graph.spawnPacket(source.id, target.id, 'MALICIOUS');
            siem.log('SYSTEM', 'SUCCESS', 'HONEYPOT_TRIGGERED', source.name, target.name, `🎯 ¡TRAMPA EXITOSA! El atacante mordió el señuelo en ${target.name}. Payload neutralizado y firma registrada.`);
            return { action: 'HONEYPOT_TRIGGERED', target: target.name };
        }

        if (type === 'EXFILTRATE_VAULT') {
            // Ataque directo a la Bóveda Central
            const damage = 20 + Math.floor(Math.random() * 15);
            target.firewall = Math.max(0, target.firewall - damage);
            graph.spawnPacket(source.id, target.id, 'MALICIOUS');
            audio.playIntrusionAlert();
            siem.log('RED_TEAM_AI', 'CRITICAL', 'DATA_EXFILTRATION', source.name, target.name, `🚨 ¡ALERTA CRÍTICA! Intento de exfiltración en ${target.name}. Integridad de Bóveda reducida en -${damage}% (Actual: ${target.firewall}%).`);
            return { action: 'EXFILTRATE', target: target.name, damage };
        }

        if (type === 'EXPLOIT_CVE') {
            // Explotación de vulnerabilidad
            target.firewall = Math.max(0, target.firewall - 35);
            graph.spawnPacket(source.id, target.id, 'MALICIOUS');
            if (target.firewall <= 15) {
                target.state = 'COMPROMISED';
                audio.playIntrusionAlert();
                siem.log('RED_TEAM_AI', 'CRITICAL', 'NODE_COMPROMISED', source.name, target.name, `💥 Nodo ${target.name} COMPROMETIDO por exploit Zero-Day. Movimiento lateral exitoso.`);
            } else {
                audio.playIntrusionAlert();
                siem.log('RED_TEAM_AI', 'WARN', 'CVE_EXPLOIT_ATTEMPT', source.name, target.name, `Intento de explotación en ${target.name}. Firewall resiste a ${target.firewall}%.`);
            }
            return { action: 'EXPLOIT', target: target.name };
        }

        if (type === 'LATERAL_MOVE') {
            // Movimiento lateral / reconocimiento inicial
            target.state = 'SCANNED';
            target.firewall = Math.max(0, target.firewall - 15);
            target.cveVulnerabilities = Math.min(2, target.cveVulnerabilities + 1);
            graph.spawnPacket(source.id, target.id, 'MALICIOUS');
            audio.playIntrusionAlert();
            siem.log('RED_TEAM_AI', 'WARN', 'LATERAL_MOVEMENT', source.name, target.name, `Movimiento lateral desde ${source.name} hacia ${target.name}. Puertos expuestos.`);
            return { action: 'LATERAL_MOVE', target: target.name };
        }

        return { action: 'NONE' };
    }
}
