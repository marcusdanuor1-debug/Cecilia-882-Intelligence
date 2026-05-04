import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Terminal, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  Layers,
  Search,
  Settings,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkFlow, AnalysisResult, AlertSeverity, FlowAction, ThreatMetrics } from './types';
import { generateRandomFlow, analyzeNetworkFlow } from './services/intelligenceService';

// --- Sub-components for High Density Theme ---

const StatusBadge = () => (
  <div className="flex items-center space-x-2 px-3 py-1 bg-green-900/10 border border-green-500/30 rounded">
    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Active Secure Audit</span>
  </div>
);

const MetricCard = ({ label, value, subtext, progress }: { label: string, value: string | number, subtext?: string, progress?: number }) => (
  <div className="bg-(--surface) border border-(--border) rounded p-3 flex flex-col justify-between">
    <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">{label}</div>
    <div className="text-xl font-mono text-white tracking-tighter">
      {value}
      {subtext && <span className="text-[10px] text-(--cyan) ml-1 uppercase">{subtext}</span>}
    </div>
    {progress !== undefined && (
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-2">
        <div className="h-full bg-(--cyan) transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
    )}
  </div>
);

export default function App() {
  const [flows, setFlows] = useState<NetworkFlow[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, AnalysisResult>>({});
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ThreatMetrics>({
    totalFlows: 0,
    activeThreats: 0,
    avgAnomalyScore: 0,
    packetsProcessed: 0
  });
  const [auditLogs, setAuditLogs] = useState<{time: string, level: string, msg: string}[]>([]);

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(async () => {
      const newFlow = generateRandomFlow();
      setFlows(prev => [newFlow, ...prev.slice(0, 19)]);
      
      const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
      
      // Update Audit Logs
      setAuditLogs(prev => [
        { time: timestamp, level: 'INFO', msg: `Observed flow ${newFlow.id.split('-')[1]} from ${newFlow.sourceIp}` },
        ...prev.slice(0, 49)
      ]);

      if (Math.random() > 0.7) {
        const analysis = await analyzeNetworkFlow(newFlow);
        setAnalyses(prev => ({ ...prev, [newFlow.id]: analysis }));
        
        if (analysis.severity === AlertSeverity.CRITICAL || analysis.severity === AlertSeverity.HIGH) {
          setMetrics(prev => ({ ...prev, activeThreats: prev.activeThreats + 1 }));
          setAuditLogs(prev => [
            { time: timestamp, level: 'ALERT', msg: `Anomaly detected in Flow ${newFlow.id}: ${analysis.threatType}` },
            ...prev
          ]);
        }
      }

      setMetrics(prev => ({
        ...prev,
        totalFlows: prev.totalFlows + 1,
        packetsProcessed: prev.packetsProcessed + newFlow.packets
      }));
    }, 2000);

    // Initial audit logs
    setAuditLogs([
      { time: '14:22:01', level: 'INFO', msg: 'InputValidator initialized.' },
      { time: '14:22:04', level: 'INFO', msg: 'Model Loader hot-swapped core.' },
      { time: '14:22:15', level: 'WARN', msg: 'FlowAction latency above threshold.' }
    ]);

    return () => clearInterval(interval);
  }, []);

  const selectedAnalysis = selectedFlowId ? analyses[selectedFlowId] : null;

  return (
    <div className="h-screen bg-(--bg) text-gray-300 font-sans p-4 flex flex-col overflow-hidden select-none">
      {/* Header */}
      <header className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3 h-14 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-(--cyan) flex items-center justify-center rounded text-black font-bold">
            <Shield size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase">CECILIA 882 INTELLIGENCE ENGINE</h1>
            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">
              <span>Production v2.0.0</span>
              <span className="h-1 w-1 bg-gray-600 rounded-full"></span>
              <span>Security Team Authorized Only</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-[9px] text-gray-500 uppercase font-black">System Load</div>
            <div className="text-[11px] font-mono text-(--cyan)">0.14 | 0.22 | 0.19</div>
          </div>
          <div className="h-8 w-[1px] bg-gray-800"></div>
          <StatusBadge />
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-12 gap-4 h-0 min-h-0">
        {/* Left Column (8-col) */}
        <div className="col-span-8 flex flex-col space-y-4 min-w-0">
          {/* Main Table Panel */}
          <section className="bg-[#111214] border border-gray-800 rounded flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="bg-[#1a1b1e] px-3 py-2 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Network Flow Analysis</h2>
              <div className="text-[10px] font-mono text-(--cyan)">{Math.round(metrics.totalFlows / 60)} FLOWS/SEC</div>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
              <table className="w-full text-left border-collapse">
                <thead className="table-header">
                  <tr>
                    <th className="p-2 pl-3">Flow ID</th>
                    <th className="p-2 text-center">Protocol</th>
                    <th className="p-2">Source IP</th>
                    <th className="p-2 text-center">Port</th>
                    <th className="p-2">Intelligence</th>
                    <th className="p-2 text-right pr-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/30">
                  <AnimatePresence initial={false}>
                    {flows.map(flow => {
                      const analysis = analyses[flow.id];
                      const isHigh = analysis?.severity === AlertSeverity.CRITICAL || analysis?.severity === AlertSeverity.HIGH;
                      
                      return (
                        <motion.tr 
                          key={flow.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`table-row cursor-pointer group ${selectedFlowId === flow.id ? 'bg-(--cyan)/15' : ''} ${isHigh ? 'bg-red-500/5' : ''}`}
                          onClick={() => setSelectedFlowId(flow.id)}
                        >
                          <td className="p-2 pl-3 mono-data text-(--cyan) uppercase">{flow.id.split('-')[1]}</td>
                          <td className="p-2 text-center mono-data opacity-50 px-4">{flow.protocol}</td>
                          <td className="p-2 mono-data text-white font-medium">{flow.sourceIp}</td>
                          <td className="p-2 text-center mono-data opacity-60">{flow.port}</td>
                          <td className="p-2">
                            {analysis ? (
                              <div className="flex items-center space-x-2">
                                <div className={`h-1 flex-1 bg-gray-800 rounded-full overflow-hidden`}>
                                   <div className={`h-full ${analysis.severity === AlertSeverity.CRITICAL ? 'bg-(--red)' : 'bg-(--yellow)'}`} style={{ width: `${analysis.anomalyScore * 100}%` }}></div>
                                </div>
                                <span className={`text-[10px] font-bold mono-data ${isHigh ? 'text-red-400' : 'text-gray-500'}`}>
                                  {analysis.severity === AlertSeverity.CRITICAL ? 'CRIT' : analysis.severity === AlertSeverity.HIGH ? 'HIGH' : 'LOW'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex space-x-1">
                                {[0, 1, 2].map(i => <div key={i} className="h-1 w-2 bg-gray-800 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />)}
                              </div>
                            )}
                          </td>
                          <td className="p-2 text-right pr-3 mono-data">
                            {analysis ? (
                              <span className={`px-2 py-0.5 rounded-[1px] text-[9px] font-bold ${analysis.recommendedAction === FlowAction.BLOCK ? 'bg-(--red)/20 text-(--red)' : 'bg-(--green)/20 text-(--green)'}`}>
                                {analysis.recommendedAction}
                              </span>
                            ) : '-'}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom Metrics Section */}
          <section className="h-32 shrink-0 grid grid-cols-3 gap-4">
            <MetricCard label="ThreatSafeMetrics" value={metrics.totalFlows.toLocaleString()} subtext="OPS/S" progress={65} />
            <MetricCard label="MLModelLoader" value="99.8" subtext="% CONF" />
            <MetricCard label="Anomaly Score (AVG)" value={flows.length > 0 ? (flows.reduce((acc, f) => acc + (analyses[f.id]?.anomalyScore || 0), 0) / flows.length * 100).toFixed(1) : '0.0'} subtext="THREAT" progress={42} />
          </section>
        </div>

        {/* Right Column (4-col) */}
        <div className="col-span-4 flex flex-col space-y-4 min-w-0">
          {/* Secure Audit Log */}
          <section className="bg-[#111214] border border-gray-800 rounded flex flex-col h-1/2 min-h-0">
            <div className="bg-[#1a1b1e] px-3 py-2 border-b border-gray-800">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Secure Audit Log</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] text-gray-500 space-y-1.5 custom-scrollbar">
              {auditLogs.map((log, i) => (
                <div key={i} className="leading-tight">
                  <span className="opacity-50">[{log.time}]</span>{' '}
                  <span className={`${log.level === 'ALERT' ? 'text-red-500' : log.level === 'WARN' ? 'text-yellow-500' : 'text-cyan-600'} font-bold`}>
                    {log.level}
                  </span>{' '}
                  {log.msg}
                </div>
              ))}
            </div>
          </section>

          {/* Intelligence & Actions / Threats */}
          <section className="bg-[#111214] border border-gray-800 rounded flex-1 flex flex-col overflow-hidden min-h-0">
             <div className="bg-[#1a1b1e] px-3 py-2 border-b border-gray-800">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Intelligence Brief</h3>
             </div>
             
             <div className="flex-1 p-4 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {selectedAnalysis ? (
                    <motion.div 
                      key={selectedFlowId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Selected Payload</div>
                          <div className="text-sm font-mono text-(--cyan) font-black mb-1">#{selectedFlowId?.split('-')[1]}</div>
                        </div>
                        <div className={`px-2 py-0.5 rounded-[1px] text-[10px] font-bold ${selectedAnalysis.severity === AlertSeverity.CRITICAL ? 'bg-red-500 text-white' : 'bg-(--cyan) text-black'}`}>
                          {selectedAnalysis.severity}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-black/40 border border-white/5 rounded-sm">
                        <div className="text-[10px] font-mono leading-relaxed text-gray-300 italic">
                         &quot;{selectedAnalysis.intelligenceNote}&quot;
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-900/50 p-2 border border-white/5">
                           <div className="text-[8px] opacity-40 uppercase">Origin</div>
                           <div className="text-[10px] font-mono">{flows.find(f => f.id === selectedFlowId)?.sourceIp}</div>
                        </div>
                        <div className="bg-gray-900/50 p-2 border border-white/5">
                           <div className="text-[8px] opacity-40 uppercase">Actioned</div>
                           <div className="text-[10px] font-mono font-bold text-(--green)">{selectedAnalysis.recommendedAction}</div>
                        </div>
                      </div>

                      <button className="w-full py-2 bg-(--cyan) text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all">
                        Execute Remediation
                      </button>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-30 text-center">
                       <Database size={32} />
                       <div className="text-[10px] font-bold uppercase tracking-widest">Standby for<br/>Relational Query</div>
                    </div>
                  )}
                </AnimatePresence>
             </div>

             <div className="bg-gray-900/40 p-3 border-t border-gray-800">
                <div className="flex items-center justify-between text-[10px] mb-2 font-bold uppercase">
                   <span>Threat Distribution</span>
                   <span className="text-red-400">{metrics.activeThreats} Critical</span>
                </div>
                <div className="flex space-x-1">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-4 w-1 flex-1 ${i < metrics.activeThreats ? 'bg-(--red) shadow-[0_0_8px_rgba(239,68,68,0.5)]' : i < 12 ? 'bg-(--cyan)' : 'bg-gray-800'}`} 
                    />
                  ))}
                </div>
             </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3 text-[10px] text-gray-500 font-mono tracking-tighter uppercase h-8 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>STATUS: ENGINE_NOMINAL</span>
          </div>
          <span className="opacity-30">|</span>
          <span>HASH: 8f4e2f9d...23c</span>
          <span className="opacity-30">|</span>
          <span>THREADS: 42_ACTIVE</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>LOC: DATA_CENTER_CHI_04</span>
          <span className="opacity-30">|</span>
          <span className="text-gray-400">LICENSE: MIT CE-882-CORE</span>
        </div>
      </footer>
    </div>
  );
}
