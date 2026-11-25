/**
 * ============================================================================
 * AEGIS PROTOCOL: Network Graph Engine
 * Define los 6 escenarios de infraestructura, topologías de nodos y aristas,
 * paquetes en tránsito y renderizado de capas en Canvas 2D.
 * ============================================================================
 */

export const NODE_STATES = {
    SECURE: 'SECURE',           // Verde esmeralda neón - Seguro
    SCANNED: 'SCANNED',         // Ámbar - Reconocido por el Red Team
    COMPROMISED: 'COMPROMISED', // Rojo carmesí - Controlado por el atacante
    ISOLATED: 'ISOLATED',       // Azul cian atenuado - En Sandbox desconectado
    HONEYPOT: 'HONEYPOT'        // Púrpura eléctrico - Trampa señuelo
};

export const NODE_TYPES = {
    EDGE: { name: 'Edge Gateway', icon: '🌐', baseFirewall: 40, cpValue: 2 },
    AUTH: { name: 'Auth Server (JWT/OIDC)', icon: '🔑', baseFirewall: 60, cpValue: 3 },
    AGENT_CLUSTER: { name: 'AI Agent Cluster', icon: '🤖', baseFirewall: 70, cpValue: 4 },
    MCP_SERVER: { name: 'MCP Tool Server', icon: '🔌', baseFirewall: 65, cpValue: 3 },
    WAF: { name: 'WAF / Reverse Proxy', icon: '🛡️', baseFirewall: 80, cpValue: 2 },
    SCADA: { name: 'SCADA PLC Controller', icon: '⚙️', baseFirewall: 50, cpValue: 4 },
    DATA_VAULT: { name: 'Core SQLite Vault', icon: '💎', baseFirewall: 100, cpValue: 5 }
};

export const MISSIONS = [
    {
        id: 1,
        title: 'Misión 1: Perímetro DMZ de Startup Cloud',
        description: 'Neutraliza el botnet autónomo que intenta atravesar el WAF y penetrar el Edge Gateway antes de alcanzar la base de datos de usuarios.',
        turnsToSurvive: 8,
        initialCP: 7,
        cpPerTurn: 4,
        nodes: [
            { id: 'n_inet', name: 'Internet Entry Point', type: 'EDGE', x: 120, y: 240, state: 'COMPROMISED', firewall: 20, maxFirewall: 40, isEntry: true },
            { id: 'n_waf', name: 'Cloudflare WAF Proxy', type: 'WAF', x: 300, y: 150, state: 'SECURE', firewall: 70, maxFirewall: 80 },
            { id: 'n_api', name: 'Node.js REST Gateway', type: 'EDGE', x: 300, y: 330, state: 'SECURE', firewall: 50, maxFirewall: 60 },
            { id: 'n_auth', name: 'JWT Auth Microservice', type: 'AUTH', x: 500, y: 180, state: 'SECURE', firewall: 60, maxFirewall: 70 },
            { id: 'n_cache', name: 'In-Memory Cache', type: 'EDGE', x: 500, y: 310, state: 'SECURE', firewall: 40, maxFirewall: 50 },
            { id: 'n_vault', name: 'SQLite Core DB Vault', type: 'DATA_VAULT', x: 720, y: 240, state: 'SECURE', firewall: 100, maxFirewall: 100, isTarget: true }
        ],
        edges: [
            { from: 'n_inet', to: 'n_waf' },
            { from: 'n_inet', to: 'n_api' },
            { from: 'n_waf', to: 'n_auth' },
            { from: 'n_api', to: 'n_auth' },
            { from: 'n_api', to: 'n_cache' },
            { from: 'n_auth', to: 'n_vault' },
            { from: 'n_cache', to: 'n_vault' }
        ]
    },
    {
        id: 2,
        title: 'Misión 2: Pasarela FinTech & API Gateways',
        description: 'Un agente APT altamente sigiloso intenta inyectar payloads en los procesadores de transacciones y falsificar tokens JWT.',
        turnsToSurvive: 10,
        initialCP: 8,
        cpPerTurn: 4,
        nodes: [
            { id: 'n_edge1', name: 'Public API Ingress', type: 'EDGE', x: 100, y: 160, state: 'COMPROMISED', firewall: 30, maxFirewall: 50, isEntry: true },
            { id: 'n_edge2', name: 'Mobile App Gateway', type: 'EDGE', x: 100, y: 320, state: 'SCANNED', firewall: 40, maxFirewall: 50 },
            { id: 'n_waf', name: 'Shield WAF Filter', type: 'WAF', x: 280, y: 240, state: 'SECURE', firewall: 80, maxFirewall: 80 },
            { id: 'n_auth', name: 'OIDC Identity Broker', type: 'AUTH', x: 460, y: 150, state: 'SECURE', firewall: 65, maxFirewall: 70 },
            { id: 'n_tx', name: 'Payment Transaction Engine', type: 'AUTH', x: 460, y: 330, state: 'SECURE', firewall: 70, maxFirewall: 75 },
            { id: 'n_audit', name: 'Compliance SIEM Relay', type: 'EDGE', x: 620, y: 160, state: 'SECURE', firewall: 55, maxFirewall: 60 },
            { id: 'n_vault', name: 'FinTech SQLite Ledger', type: 'DATA_VAULT', x: 740, y: 260, state: 'SECURE', firewall: 100, maxFirewall: 100, isTarget: true }
        ],
        edges: [
            { from: 'n_edge1', to: 'n_waf' },
            { from: 'n_edge2', to: 'n_waf' },
            { from: 'n_waf', to: 'n_auth' },
            { from: 'n_waf', to: 'n_tx' },
            { from: 'n_auth', to: 'n_audit' },
            { from: 'n_tx', to: 'n_audit' },
            { from: 'n_audit', to: 'n_vault' },
            { from: 'n_tx', to: 'n_vault' }
        ]
    },
    {
        id: 3,
        title: 'Misión 3: Clúster de Agentes IA & Servidores MCP',
        description: 'Ataques de Prompt Injection y envenenamiento de herramientas MCP amenazan los agentes de orquestación autónomos.',
        turnsToSurvive: 12,
        initialCP: 9,
        cpPerTurn: 5,
        nodes: [
            { id: 'n_client', name: 'Chat UI Ingress', type: 'EDGE', x: 100, y: 240, state: 'COMPROMISED', firewall: 30, maxFirewall: 50, isEntry: true },
            { id: 'n_guard', name: 'NeMo Guardrails WAF', type: 'WAF', x: 260, y: 150, state: 'SECURE', firewall: 75, maxFirewall: 80 },
            { id: 'n_orch', name: 'Orchestrator Agent Node', type: 'AGENT_CLUSTER', x: 260, y: 330, state: 'SECURE', firewall: 60, maxFirewall: 70 },
            { id: 'n_mcp1', name: 'MCP Filesystem Tool', type: 'MCP_SERVER', x: 460, y: 130, state: 'SECURE', firewall: 65, maxFirewall: 70 },
            { id: 'n_mcp2', name: 'MCP Terminal Shell', type: 'MCP_SERVER', x: 460, y: 250, state: 'SCANNED', firewall: 50, maxFirewall: 65 },
            { id: 'n_eval', name: 'Critic LLM Subagent', type: 'AGENT_CLUSTER', x: 460, y: 370, state: 'SECURE', firewall: 65, maxFirewall: 70 },
            { id: 'n_vault', name: 'Agent Memory Bank (SQLite)', type: 'DATA_VAULT', x: 740, y: 240, state: 'SECURE', firewall: 100, maxFirewall: 100, isTarget: true }
        ],
        edges: [
            { from: 'n_client', to: 'n_guard' },
            { from: 'n_client', to: 'n_orch' },
            { from: 'n_guard', to: 'n_mcp1' },
            { from: 'n_orch', to: 'n_mcp2' },
            { from: 'n_orch', to: 'n_eval' },
            { from: 'n_mcp1', to: 'n_vault' },
            { from: 'n_mcp2', to: 'n_vault' },
            { from: 'n_eval', to: 'n_vault' },
            { from: 'n_guard', to: 'n_orch' }
        ]
    },
    {
        id: 4,
        title: 'Misión 4: Planta Industrial IoT & Control SCADA',
        description: 'Ciberataque híbrido estilo Stuxnet contra controladores de lógica programable (PLC) en una red operativa OT.',
        turnsToSurvive: 12,
        initialCP: 9,
        cpPerTurn: 5,
        nodes: [
            { id: 'n_iot_hub', name: 'Industrial IoT Hub', type: 'EDGE', x: 100, y: 240, state: 'COMPROMISED', firewall: 25, maxFirewall: 45, isEntry: true },
            { id: 'n_ot_firewall', name: 'Air-Gap Firewall Proxy', type: 'WAF', x: 270, y: 160, state: 'SECURE', firewall: 85, maxFirewall: 90 },
            { id: 'n_hmi', name: 'HMI Supervision Console', type: 'EDGE', x: 270, y: 330, state: 'SECURE', firewall: 55, maxFirewall: 65 },
            { id: 'n_plc1', name: 'Turbine Sensor PLC', type: 'SCADA', x: 470, y: 140, state: 'SCANNED', firewall: 50, maxFirewall: 60 },
            { id: 'n_plc2', name: 'Cooling Valve PLC', type: 'SCADA', x: 470, y: 260, state: 'SECURE', firewall: 55, maxFirewall: 60 },
            { id: 'n_rtu', name: 'Telemetry RTU Gateway', type: 'EDGE', x: 470, y: 370, state: 'SECURE', firewall: 60, maxFirewall: 65 },
            { id: 'n_vault', name: 'SCADA Historian SQLite', type: 'DATA_VAULT', x: 740, y: 240, state: 'SECURE', firewall: 100, maxFirewall: 100, isTarget: true }
        ],
        edges: [
            { from: 'n_iot_hub', to: 'n_ot_firewall' },
            { from: 'n_iot_hub', to: 'n_hmi' },
            { from: 'n_ot_firewall', to: 'n_plc1' },
            { from: 'n_ot_firewall', to: 'n_plc2' },
            { from: 'n_hmi', to: 'n_rtu' },
            { from: 'n_plc1', to: 'n_vault' },
            { from: 'n_plc2', to: 'n_vault' },
            { from: 'n_rtu', to: 'n_vault' },
            { from: 'n_plc1', to: 'n_plc2' }
        ]
    },
    {
        id: 5,
        title: 'Misión 5: Red Bancaria Core Zero-Trust',
        description: 'Ataques coordinados de movimiento lateral multifuente con exploits Zero-Day dirigidos al sistema de transferencias interbancarias.',
        turnsToSurvive: 14,
        initialCP: 10,
        cpPerTurn: 5,
        nodes: [
            { id: 'n_ext1', name: 'Branch Office WAN', type: 'EDGE', x: 90, y: 140, state: 'COMPROMISED', firewall: 30, maxFirewall: 50, isEntry: true },
            { id: 'n_ext2', name: 'SWIFT Ingress Gateway', type: 'EDGE', x: 90, y: 340, state: 'SCANNED', firewall: 45, maxFirewall: 60 },
            { id: 'n_ztna', name: 'Zero-Trust Policy Controller', type: 'WAF', x: 260, y: 240, state: 'SECURE', firewall: 85, maxFirewall: 85 },
            { id: 'n_mfa', name: 'Hardware Token MFA Server', type: 'AUTH', x: 420, y: 130, state: 'SECURE', firewall: 70, maxFirewall: 75 },
            { id: 'n_core_app', name: 'Core Banking Service', type: 'AUTH', x: 420, y: 350, state: 'SECURE', firewall: 70, maxFirewall: 75 },
            { id: 'n_microseg', name: 'Micro-Segmentation Mesh', type: 'WAF', x: 580, y: 240, state: 'SECURE', firewall: 80, maxFirewall: 85 },
            { id: 'n_vault', name: 'Interbank SQLite Master Vault', type: 'DATA_VAULT', x: 750, y: 240, state: 'SECURE', firewall: 100, maxFirewall: 100, isTarget: true }
        ],
        edges: [
            { from: 'n_ext1', to: 'n_ztna' },
            { from: 'n_ext2', to: 'n_ztna' },
            { from: 'n_ztna', to: 'n_mfa' },
            { from: 'n_ztna', to: 'n_core_app' },
            { from: 'n_mfa', to: 'n_microseg' },
            { from: 'n_core_app', to: 'n_microseg' },
            { from: 'n_microseg', to: 'n_vault' }
        ]
    },
    {
        id: 6,
        title: 'Misión 6: Bóveda Global SQLite & Satélites Edge',
        description: 'La batalla cibernética definitiva: un consorcio de agentes de inteligencia artificial adversaria ataca simultáneamente todos los perímetros globales.',
        turnsToSurvive: 16,
        initialCP: 12,
        cpPerTurn: 6,
        nodes: [
            { id: 'n_sat1', name: 'Orbital LEO Uplink 1', type: 'EDGE', x: 90, y: 110, state: 'COMPROMISED', firewall: 35, maxFirewall: 50, isEntry: true },
            { id: 'n_sat2', name: 'Orbital LEO Uplink 2', type: 'EDGE', x: 90, y: 370, state: 'COMPROMISED', firewall: 35, maxFirewall: 50, isEntry: true },
            { id: 'n_edge_us', name: 'US Cloudflare Edge SuperPoP', type: 'WAF', x: 260, y: 140, state: 'SECURE', firewall: 85, maxFirewall: 90 },
            { id: 'n_edge_eu', name: 'EU Edge Sovereign Mesh', type: 'WAF', x: 260, y: 340, state: 'SECURE', firewall: 85, maxFirewall: 90 },
            { id: 'n_ai_brain', name: 'Autonomous Defense Sub-Cluster', type: 'AGENT_CLUSTER', x: 440, y: 170, state: 'SECURE', firewall: 75, maxFirewall: 80 },
            { id: 'n_mcp_nexus', name: 'Global MCP Tools Router', type: 'MCP_SERVER', x: 440, y: 310, state: 'SECURE', firewall: 70, maxFirewall: 75 },
            { id: 'n_quantum_gw', name: 'Post-Quantum Crypto Relay', type: 'AUTH', x: 600, y: 240, state: 'SECURE', firewall: 85, maxFirewall: 90 },
            { id: 'n_vault', name: 'Global Sovereign SQLite Master', type: 'DATA_VAULT', x: 760, y: 240, state: 'SECURE', firewall: 100, maxFirewall: 100, isTarget: true }
        ],
        edges: [
            { from: 'n_sat1', to: 'n_edge_us' },
            { from: 'n_sat2', to: 'n_edge_eu' },
            { from: 'n_edge_us', to: 'n_ai_brain' },
            { from: 'n_edge_eu', to: 'n_mcp_nexus' },
            { from: 'n_ai_brain', to: 'n_quantum_gw' },
            { from: 'n_mcp_nexus', to: 'n_quantum_gw' },
            { from: 'n_edge_us', to: 'n_mcp_nexus' },
            { from: 'n_edge_eu', to: 'n_ai_brain' },
            { from: 'n_quantum_gw', to: 'n_vault' }
        ]
    }
];

export class NetworkGraph {
    constructor(missionIndex = 0) {
        this.missionData = MISSIONS[missionIndex] || MISSIONS[0];
        this.nodes = [];
        this.edges = [];
        this.packets = [];
        this.selectedNodeId = null;
        this.hoveredNodeId = null;
        this.initGraph();
    }

    initGraph() {
        // Clonación profunda de nodos y bordes para evitar mutaciones de configuración estática
        this.nodes = this.missionData.nodes.map(n => ({
            ...n,
            cveVulnerabilities: n.state === 'COMPROMISED' ? 2 : (n.state === 'SCANNED' ? 1 : 0),
            wafRules: 0,
            hasHoneypot: false,
            isolatedTurnsLeft: 0,
            radius: n.isTarget ? 30 : 24,
            pulsePhase: Math.random() * Math.PI * 2
        }));

        this.edges = this.missionData.edges.map(e => ({
            ...e,
            isSevered: false
        }));

        this.packets = [];
        this.selectedNodeId = null;
    }

    getNode(nodeId) {
        return this.nodes.find(n => n.id === nodeId);
    }

    getConnectedNodes(nodeId) {
        const connected = [];
        this.edges.forEach(edge => {
            if (edge.isSevered) return;
            if (edge.from === nodeId) connected.push(edge.to);
            if (edge.to === nodeId) connected.push(edge.from);
        });
        return [...new Set(connected)];
    }

    spawnPacket(fromId, toId, type = 'LEGITIMATE') {
        const fromNode = this.getNode(fromId);
        const toNode = this.getNode(toId);
        if (!fromNode || !toNode) return;

        this.packets.push({
            fromId,
            toId,
            startX: fromNode.x,
            startY: fromNode.y,
            endX: toNode.x,
            endY: toNode.y,
            progress: 0,
            speed: 0.015 + Math.random() * 0.01,
            type: type // 'LEGITIMATE' | 'MALICIOUS' | 'SCAN' | 'PATCH'
        });
    }

    update(dt = 1) {
        // Actualizar fases de pulsos visuales de nodos
        this.nodes.forEach(node => {
            node.pulsePhase += 0.04;
        });

        // Actualizar animación de paquetes que transitan por aristas
        for (let i = this.packets.length - 1; i >= 0; i--) {
            const p = this.packets[i];
            p.progress += p.speed;
            if (p.progress >= 1) {
                this.packets.splice(i, 1);
            }
        }

        // Generar tráfico residual cosmético ocasional entre nodos seguros
        if (Math.random() < 0.03 && this.edges.length > 0) {
            const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
            const from = this.getNode(edge.from);
            const to = this.getNode(edge.to);
            if (from && to && from.state !== 'ISOLATED' && to.state !== 'ISOLATED') {
                const type = (from.state === 'COMPROMISED') ? 'MALICIOUS' : 'LEGITIMATE';
                this.spawnPacket(from.id, to.id, type);
            }
        }
    }

    render(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);

        // Fondo de cuadrícula cyberpunk táctica
        this.renderGrid(ctx, width, height);

        // Renderizar aristas / enlaces de red
        this.renderEdges(ctx);

        // Renderizar paquetes en tránsito
        this.renderPackets(ctx);

        // Renderizar nodos
        this.renderNodes(ctx);
    }

    renderGrid(ctx, width, height) {
        ctx.strokeStyle = 'hsla(217, 33%, 25%, 0.25)';
        ctx.lineWidth = 1;

        const gridSize = 40;
        ctx.beginPath();
        for (let x = 0; x < width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Círculos de radar tenues en el centro
        ctx.save();
        ctx.strokeStyle = 'hsla(210, 100%, 60%, 0.04)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 180, 0, Math.PI * 2);
        ctx.arc(width / 2, height / 2, 320, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    renderEdges(ctx) {
        this.edges.forEach(edge => {
            const from = this.getNode(edge.from);
            const to = this.getNode(edge.to);
            if (!from || !to) return;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);

            if (edge.isSevered || from.state === 'ISOLATED' || to.state === 'ISOLATED') {
                ctx.setLineDash([4, 6]);
                ctx.strokeStyle = 'hsla(215, 20%, 45%, 0.35)';
                ctx.lineWidth = 1.5;
            } else if (from.state === 'COMPROMISED' && to.state === 'COMPROMISED') {
                ctx.strokeStyle = 'hsla(354, 85%, 55%, 0.7)';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = 'hsla(354, 85%, 55%, 0.6)';
                ctx.shadowBlur = 8;
            } else if (from.state === 'COMPROMISED' || to.state === 'COMPROMISED') {
                ctx.strokeStyle = 'hsla(38, 92%, 50%, 0.6)';
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = 'hsla(210, 100%, 60%, 0.35)';
                ctx.lineWidth = 2;
                ctx.shadowColor = 'hsla(210, 100%, 60%, 0.3)';
                ctx.shadowBlur = 5;
            }

            ctx.stroke();
            ctx.restore();
        });
    }

    renderPackets(ctx) {
        this.packets.forEach(p => {
            const curX = p.startX + (p.endX - p.startX) * p.progress;
            const curY = p.startY + (p.endY - p.startY) * p.progress;

            ctx.save();
            ctx.beginPath();
            ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);

            if (p.type === 'MALICIOUS') {
                ctx.fillStyle = 'hsl(354, 90%, 60%)';
                ctx.shadowColor = 'hsl(354, 100%, 50%)';
                ctx.shadowBlur = 10;
            } else if (p.type === 'SCAN') {
                ctx.fillStyle = 'hsl(38, 95%, 55%)';
                ctx.shadowColor = 'hsl(38, 100%, 50%)';
                ctx.shadowBlur = 8;
            } else if (p.type === 'PATCH') {
                ctx.fillStyle = 'hsl(190, 100%, 55%)';
                ctx.shadowColor = 'hsl(190, 100%, 55%)';
                ctx.shadowBlur = 10;
            } else {
                ctx.fillStyle = 'hsl(150, 85%, 55%)';
                ctx.shadowColor = 'hsl(150, 85%, 55%)';
                ctx.shadowBlur = 6;
            }

            ctx.fill();
            ctx.restore();
        });
    }

    renderNodes(ctx) {
        this.nodes.forEach(node => {
            const isSelected = this.selectedNodeId === node.id;
            const isHovered = this.hoveredNodeId === node.id;
            const pulse = Math.sin(node.pulsePhase) * 2.5;

            ctx.save();

            // Color del tema según el estado
            let mainColor = 'hsl(150, 70%, 45%)';
            let glowColor = 'hsla(150, 70%, 45%, 0.35)';
            let statusLabel = 'SECURE';

            if (node.state === 'COMPROMISED') {
                mainColor = 'hsl(354, 85%, 55%)';
                glowColor = 'hsla(354, 85%, 55%, 0.5)';
                statusLabel = 'COMPROMISED';
            } else if (node.state === 'SCANNED') {
                mainColor = 'hsl(38, 92%, 50%)';
                glowColor = 'hsla(38, 92%, 50%, 0.4)';
                statusLabel = 'SCANNED';
            } else if (node.state === 'ISOLATED') {
                mainColor = 'hsl(210, 40%, 65%)';
                glowColor = 'hsla(210, 40%, 65%, 0.25)';
                statusLabel = 'ISOLATED';
            } else if (node.state === 'HONEYPOT') {
                mainColor = 'hsl(280, 85%, 65%)';
                glowColor = 'hsla(280, 85%, 65%, 0.5)';
                statusLabel = 'HONEYPOT';
            }

            // Anillo exterior pulsante
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius + pulse + (isSelected ? 6 : 0), 0, Math.PI * 2);
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = isSelected ? 3 : 1.5;
            ctx.stroke();

            // Halo de selección
            if (isSelected || isHovered) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius + 10, 0, Math.PI * 2);
                ctx.strokeStyle = isSelected ? 'hsl(210, 100%, 70%)' : 'hsla(210, 100%, 70%, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([3, 3]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Cuerpo del nodo (glassmorphic dark)
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'hsl(222, 47%, 14%)';
            ctx.fill();

            ctx.lineWidth = 2.5;
            ctx.strokeStyle = mainColor;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 12;
            ctx.stroke();

            // Ícono interior del nodo
            ctx.shadowBlur = 0;
            ctx.font = `${node.isTarget ? 17 : 14}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const nodeTypeInfo = NODE_TYPES[node.type] || NODE_TYPES.EDGE;
            ctx.fillText(nodeTypeInfo.icon, node.x, node.y);

            // Barra de salud / Firewall
            const barW = node.radius * 2 + 4;
            const barH = 4;
            const barX = node.x - barW / 2;
            const barY = node.y + node.radius + 6;
            const fwPercent = Math.max(0, Math.min(1, node.firewall / node.maxFirewall));

            ctx.fillStyle = 'hsla(217, 33%, 20%, 0.8)';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = mainColor;
            ctx.fillRect(barX, barY, barW * fwPercent, barH);

            // Nombre y etiquetas del nodo
            ctx.font = '11px "Outfit", "Inter", sans-serif';
            ctx.fillStyle = 'hsl(210, 40%, 98%)';
            ctx.fillText(node.name, node.x, barY + 14);

            // Indicador de CVEs o Reglas WAF
            if (node.cveVulnerabilities > 0) {
                ctx.font = '10px "JetBrains Mono", monospace';
                ctx.fillStyle = 'hsl(354, 85%, 65%)';
                ctx.fillText(`⚠️ CVE:${node.cveVulnerabilities}`, node.x, barY + 26);
            } else if (node.wafRules > 0) {
                ctx.font = '10px "JetBrains Mono", monospace';
                ctx.fillStyle = 'hsl(190, 90%, 55%)';
                ctx.fillText(`🛡️ WAF:${node.wafRules}`, node.x, barY + 26);
            }

            ctx.restore();
        });
    }

    findNodeAt(x, y) {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const n = this.nodes[i];
            const dist = Math.hypot(n.x - x, n.y - y);
            if (dist <= n.radius + 6) {
                return n;
            }
        }
        return null;
    }
}
