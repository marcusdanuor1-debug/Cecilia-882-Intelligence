import { GoogleGenAI, Type } from "@google/genai";
import { NetworkFlow, AnalysisResult, AlertSeverity, FlowAction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeNetworkFlow(flow: NetworkFlow): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following network flow for potential security threats as the Cecilia 882 Intelligence Engine.
    
    Flow Data:
    Timestamp: ${flow.timestamp}
    Source IP: ${flow.sourceIp}
    Destination IP: ${flow.destIp}
    Port: ${flow.port}
    Protocol: ${flow.protocol}
    Bytes: ${flow.bytes}
    Packets: ${flow.packets}
    Flags: ${flow.flags}

    Respond with a detailed security analysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            anomalyScore: { type: Type.NUMBER, description: "A value between 0 and 1 indicating how anomalous the flow is." },
            severity: { type: Type.STRING, enum: Object.values(AlertSeverity), description: "Threat severity level." },
            threatType: { type: Type.STRING, description: "Type of threat identified (e.g., Port Scan, DDoS, SQL Injection)." },
            intelligenceNote: { type: Type.STRING, description: "Detailed intelligence notes explaining the reasoning." },
            recommendedAction: { type: Type.STRING, enum: Object.values(FlowAction), description: "Recommended immediate action." },
          },
          required: ["anomalyScore", "severity", "intelligenceNote", "recommendedAction"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      flowId: flow.id,
      ...result
    };
  } catch (error) {
    console.error("Cecilia Intelligence Analysis Failed:", error);
    // Fallback logic
    return {
      flowId: flow.id,
      anomalyScore: 0.1,
      severity: AlertSeverity.LOW,
      intelligenceNote: "Intelligence engine encountered an error. Defaulting to baseline analysis.",
      recommendedAction: FlowAction.ALLOW
    };
  }
}

// Utility to generate random flows for the demo
export function generateRandomFlow(): NetworkFlow {
  const protocols: ('TCP' | 'UDP' | 'ICMP')[] = ['TCP', 'UDP', 'ICMP'];
  const commonIps = ['192.168.1.1', '10.0.0.5', '172.16.0.21', '8.8.8.8', '45.12.33.109'];
  const sourceIp = commonIps[Math.floor(Math.random() * commonIps.length)];
  const destIp = commonIps[Math.floor(Math.random() * commonIps.length)];
  
  return {
    id: `flow-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    sourceIp,
    destIp,
    port: Math.floor(Math.random() * 65535),
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    bytes: Math.floor(Math.random() * 5000),
    packets: Math.floor(Math.random() * 50),
    flags: Math.random() > 0.5 ? 'SYN' : 'ACK/PSH'
  };
}
