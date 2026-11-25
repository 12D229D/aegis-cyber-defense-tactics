/**
 * ============================================================================
 * AEGIS PROTOCOL: Blue-Team Tactical Actions
 * Define el catálogo de 10 habilidades defensivas, costos de Compute Points (CP),
 * efectos sobre nodos de la topología y validaciones.
 * ============================================================================
 */

export const BLUE_ACTIONS = [
    {
        id: 'patch_cve',
        name: 'Parche CVE en Caliente',
        cost: 2,
        icon: '🩹',
        description: 'Repara una vulnerabilidad conocida (CVE), eliminando vector de ataque y restaurando 25 de Firewall.',
        requiresNode: true,
        canApply(node) {
            return node && node.state !== 'ISOLATED' && (node.cveVulnerabilities > 0 || node.firewall < node.maxFirewall);
        },
        execute(node, graph, audio, siem) {
            if (node.cveVulnerabilities > 0) {
                node.cveVulnerabilities -= 1;
            }
            node.firewall = Math.min(node.maxFirewall, node.firewall + 25);
            if (node.state === 'SCANNED' && node.cveVulnerabilities === 0) {
                node.state = 'SECURE';
            }
            audio.playPatchDeployed();
            graph.spawnPacket(node.id, node.id, 'PATCH');
            siem.log('BLUE_TEAM', 'SUCCESS', 'PATCH', null, node.name, `Parche CVE aplicado con éxito en ${node.name}. Firewall restaurado a ${node.firewall}/${node.maxFirewall}.`);
            return { success: true, message: `Vulnerabilidad mitigada en ${node.name}.` };
        }
    },
    {
        id: 'deploy_honeypot',
        name: 'Desplegar Honeypot Señuelo',
        cost: 3,
        icon: '🍯',
        description: 'Convierte un nodo seguro en un señuelo de alta atracción que neutraliza el próximo ataque del Red Team.',
        requiresNode: true,
        canApply(node) {
            return node && node.state === 'SECURE' && !node.isTarget && !node.hasHoneypot;
        },
        execute(node, graph, audio, siem) {
            node.hasHoneypot = true;
            node.state = 'HONEYPOT';
            audio.playHoneypotTrap();
            siem.log('BLUE_TEAM', 'INFO', 'HONEYPOT_DEPLOY', null, node.name, `Señuelo Honeypot activado en ${node.name}. Telemetría de engaño activa.`);
            return { success: true, message: `Honeypot desplegado en ${node.name}.` };
        }
    },
    {
        id: 'isolate_sandbox',
        name: 'Aislar en Sandbox Virtual',
        cost: 3,
        icon: '🧊',
        description: 'Corta temporalmente los enlaces de red de un nodo sospechoso por 2 turnos para frenar movimiento lateral.',
        requiresNode: true,
        canApply(node) {
            return node && !node.isTarget && node.state !== 'ISOLATED';
        },
        execute(node, graph, audio, siem) {
            node.previousState = node.state;
            node.state = 'ISOLATED';
            node.isolatedTurnsLeft = 2;
            audio.playIsolateSound();
            siem.log('BLUE_TEAM', 'WARN', 'ISOLATE', null, node.name, `Nodo ${node.name} desconectado y puesto en cuarentena en Sandbox.`);
            return { success: true, message: `${node.name} aislado por 2 turnos.` };
        }
    },
    {
        id: 'rotate_jwt',
        name: 'Rotar Credenciales & JWT',
        cost: 2,
        icon: '🔄',
        description: 'Invalida tokens de sesión y renueva llaves criptográficas en nodos de Autenticación, expulsando sesiones ilícitas.',
        requiresNode: false,
        canApply(node, graph) {
            return true;
        },
        execute(node, graph, audio, siem) {
            let affected = 0;
            graph.nodes.forEach(n => {
                if (n.type === 'AUTH' || n.type === 'WAF') {
                    n.firewall = Math.min(n.maxFirewall, n.firewall + 20);
                    if (n.state === 'SCANNED') {
                        n.state = 'SECURE';
                        affected++;
                    }
                }
            });
            audio.playPatchDeployed();
            siem.log('BLUE_TEAM', 'SUCCESS', 'ROTATE_AUTH', null, 'Auth Cluster', `Rotación de llaves JWT y secretos OAuth completada. ${affected} nodos purgados.`);
            return { success: true, message: `Tokens renovados en toda la infraestructura.` };
        }
    },
    {
        id: 'waf_ruleset',
        name: 'Regla WAF Zero-Trust',
        cost: 2,
        icon: '🛡️',
        description: 'Instala una regla de filtrado de paquetes e inspección profunda en un nodo WAF o Gateway.',
        requiresNode: true,
        canApply(node) {
            return node && (node.type === 'WAF' || node.type === 'EDGE') && node.state !== 'ISOLATED';
        },
        execute(node, graph, audio, siem) {
            node.wafRules = (node.wafRules || 0) + 1;
            node.firewall = Math.min(node.maxFirewall + 20, node.firewall + 30);
            node.maxFirewall = Math.max(node.maxFirewall, node.firewall);
            audio.playPatchDeployed();
            siem.log('BLUE_TEAM', 'SUCCESS', 'WAF_RULE', null, node.name, `Regla WAF agregada a ${node.name}. Resistencia mejorada.`);
            return { success: true, message: `Regla WAF activa en ${node.name}.` };
        }
    },
    {
        id: 'entropy_analysis',
        name: 'Análisis Forense de Entropía',
        cost: 1,
        icon: '🔍',
        description: 'Escanea el nodo y sus adyacentes para detectar payloads ofuscados, malware durmiente o actividad Red Team.',
        requiresNode: true,
        canApply(node) {
            return node !== null;
        },
        execute(node, graph, audio, siem) {
            audio.playScanPulse();
            const neighbors = graph.getConnectedNodes(node.id).map(id => graph.getNode(id));
            let threatFound = false;

            if (node.state === 'COMPROMISED') {
                threatFound = true;
            }

            neighbors.forEach(nbr => {
                if (nbr && nbr.state === 'COMPROMISED') {
                    threatFound = true;
                }
            });

            const verdict = threatFound ? '⚠️ Actividad anómala / Procesos sospechosos detectados en el sector.' : '✅ Cifrado regular. No se detectan anomalías en el vector.';
            siem.log('BLUE_TEAM', threatFound ? 'CRITICAL' : 'INFO', 'FORENSIC_SCAN', node.name, null, `Inspección forense en ${node.name}: ${verdict}`);
            return { success: true, message: verdict };
        }
    },
    {
        id: 'mcp_guardrails',
        name: 'Guardrails de Agentes IA & MCP',
        cost: 3,
        icon: '🤖',
        description: 'Aplica filtros semánticos anti Prompt Injection en nodos de Agentes IA y Servidores de herramientas MCP.',
        requiresNode: true,
        canApply(node) {
            return node && (node.type === 'AGENT_CLUSTER' || node.type === 'MCP_SERVER') && node.state !== 'ISOLATED';
        },
        execute(node, graph, audio, siem) {
            node.cveVulnerabilities = 0;
            node.firewall = node.maxFirewall;
            if (node.state === 'SCANNED') node.state = 'SECURE';
            audio.playPatchDeployed();
            siem.log('BLUE_TEAM', 'SUCCESS', 'AI_GUARDRAIL', null, node.name, `Guardrail NeMo desplegado en ${node.name}. Protegido contra Prompt Injections.`);
            return { success: true, message: `Guardrails reforzados en ${node.name}.` };
        }
    },
    {
        id: 'network_segmentation',
        name: 'Microsegmentación de V-LAN',
        cost: 4,
        icon: '✂️',
        description: 'Corta permanentemente una arista peligrosa que conecta un nodo comprometido con la red interna.',
        requiresNode: true,
        canApply(node, graph) {
            if (!node) return false;
            const edges = graph.edges.filter(e => !e.isSevered && (e.from === node.id || e.to === node.id));
            return edges.length > 0;
        },
        execute(node, graph, audio, siem) {
            const edge = graph.edges.find(e => !e.isSevered && (e.from === node.id || e.to === node.id));
            if (edge) {
                edge.isSevered = true;
                audio.playIsolateSound();
                siem.log('BLUE_TEAM', 'WARN', 'SEGMENTATION', edge.from, edge.to, `Enlace de red entre ${edge.from} y ${edge.to} cortado físicamente.`);
                return { success: true, message: `Ruta de tráfico cortada.` };
            }
            return { success: false, message: `No hay enlaces activos en este nodo.` };
        }
    },
    {
        id: 'decoy_traffic',
        name: 'Inyección de Tráfico Fantasma',
        cost: 2,
        icon: '📡',
        description: 'Emite ráfagas de paquetes sintéticos falsos para desorientar los escaneos de reconocimiento del Red Team.',
        requiresNode: false,
        canApply() {
            return true;
        },
        execute(node, graph, audio, siem) {
            audio.playScanPulse();
            graph.edges.forEach(e => {
                if (Math.random() < 0.6) {
                    graph.spawnPacket(e.from, e.to, 'SCAN');
                }
            });
            siem.log('BLUE_TEAM', 'INFO', 'TRAFFIC_DECOY', null, 'Global Mesh', `Inyección masiva de tráfico señuelo. Red Team perderá precisión.`);
            return { success: true, message: `Tráfico señuelo saturando telemetría del atacante.` };
        }
    },
    {
        id: 'sqlite_vault_harden',
        name: 'Blindaje SQLite con Cifrado AES',
        cost: 4,
        icon: '💎',
        description: 'Refuerza la Bóveda Central de SQLite con cifrado a nivel de página (SQLCipher) y eleva su Firewall máximo en +30.',
        requiresNode: true,
        canApply(node) {
            return node && node.isTarget;
        },
        execute(node, graph, audio, siem) {
            node.maxFirewall += 30;
            node.firewall = node.maxFirewall;
            audio.playPatchDeployed();
            siem.log('BLUE_TEAM', 'SUCCESS', 'VAULT_HARDEN', null, node.name, `Bóveda SQLite fortificada con SQLCipher AES-256. Firewall máximo: ${node.maxFirewall}.`);
            return { success: true, message: `Bóveda Central blindada con éxito.` };
        }
    }
];
