import React, { useState } from 'react';
import { 
  TreebankNode, 
  TreebankEdge, 
  RootTreebankInfo, 
  SarfParadigmItem 
} from '../types/quran';
import { 
  GitFork, 
  Layers, 
  Sparkles, 
  BookOpen, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Tag
} from 'lucide-react';

interface MorphologyDependencyTreeProps {
  nodes: TreebankNode[];
  edges: TreebankEdge[];
  roots: RootTreebankInfo[];
  verseKey: string;
}

export const MorphologyDependencyTree: React.FC<MorphologyDependencyTreeProps> = ({
  nodes,
  edges,
  roots,
  verseKey
}) => {
  const [selectedNode, setSelectedNode] = useState<TreebankNode | null>(null);
  const [showSarfParadigms, setShowSarfParadigms] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState<RootTreebankInfo | null>(roots[0] || null);

  if (!nodes || nodes.length === 0) {
    return null;
  }

  // Category Colors
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'verb':
        return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300';
      case 'noun':
      case 'proper_noun':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300';
      case 'particle':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300';
      case 'pronoun':
      case 'relative':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300';
      case 'adjective':
        return 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300';
      default:
        return 'border-slate-300 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'verb': return 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200';
      case 'noun': return 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200';
      case 'proper_noun': return 'bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200';
      case 'particle': return 'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200';
      case 'pronoun': return 'bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  // Node width & spacing calculation for SVG arcs
  const nodeWidth = 96;
  const nodeGap = 16;
  const totalWidth = Math.max(750, nodes.length * (nodeWidth + nodeGap) + 40);
  const svgHeight = 110;

  const getNodeX = (pos: number) => {
    // Reverse for RTL layout
    const idx = nodes.findIndex(n => n.position === pos);
    if (idx === -1) return 0;
    // Map from right to left
    return totalWidth - ((idx + 0.5) * (nodeWidth + nodeGap) + 20);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-5 font-ibm select-none">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <GitFork className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>نحوی شجرہ (Syntactic Dependency Treebank)</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-mono">
                {verseKey}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              corpus.quran.com کے طرز پر جملے کی ترکیبی ساخت اور روابط
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">فعل (Verb)</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300/40">اسم (Noun)</span>
          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/40">حرف (Particle)</span>
          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300/40">ضمير (Pronoun)</span>
        </div>
      </div>

      {/* SVG Dependency Arcs & Horizontal Word Rail */}
      <div className="w-full overflow-x-auto pb-4">
        <div style={{ minWidth: `${totalWidth}px` }} className="relative flex flex-col items-center">
          
          {/* SVG Canvas for Arcs */}
          <svg 
            width={totalWidth} 
            height={svgHeight} 
            className="overflow-visible pointer-events-none"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill="#10b981" />
              </marker>
              <marker
                id="arrowhead-blue"
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>

            {/* Draw Dependency Arcs */}
            {edges.map((e, idx) => {
              const x1 = getNodeX(e.source);
              const x2 = getNodeX(e.target);
              const dx = x2 - x1;
              const arcHeight = Math.min(80, Math.max(35, Math.abs(dx) * 0.35));
              const startY = svgHeight - 6;
              const controlY = startY - arcHeight;
              const midX = (x1 + x2) / 2;

              return (
                <g key={`edge-${idx}`}>
                  <path
                    d={`M ${x1} ${startY} Q ${midX} ${controlY} ${x2} ${startY}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.8"
                    strokeDasharray={e.label_code === 'LINK' ? '3 3' : 'none'}
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Arc Label Badge */}
                  <rect
                    x={midX - 32}
                    y={controlY - 8}
                    width="64"
                    height="16"
                    rx="8"
                    fill="currentColor"
                    className="text-white dark:text-slate-900"
                    stroke="#10b981"
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={controlY + 4}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-ibm"
                  >
                    {e.label_arabic}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Word Nodes Strip (RTL Flow) */}
          <div 
            dir="rtl"
            className="flex items-start gap-4 pt-2"
          >
            {nodes.map((n) => {
              const isSelected = selectedNode?.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => setSelectedNode(n)}
                  style={{ width: `${nodeWidth}px` }}
                  className={`p-2 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all ${
                    getCategoryColor(n.category)
                  } ${
                    isSelected ? 'ring-3 ring-amber-400 scale-105 shadow-md' : 'hover:scale-102 hover:shadow-xs'
                  }`}
                >
                  {/* Arabic Token */}
                  <div className="font-qcf text-base sm:text-lg mb-1 leading-tight font-bold">
                    {n.text_uthmani}
                  </div>

                  {/* Urdu Gloss */}
                  <div className="text-[10px] text-slate-600 dark:text-slate-300 font-app line-clamp-1 mb-1.5">
                    {n.translation_ur || n.translation_en}
                  </div>

                  {/* Syntactic Role Pill */}
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-ibm ${getCategoryBadge(n.category)}`}>
                    {n.role_arabic}
                  </span>

                  {/* Root Tag if exists */}
                  {n.root && (
                    <span className="text-[8.5px] text-slate-500 font-mono mt-1">
                      {n.root}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Selected Word Details Inspector */}
      {selectedNode && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-qcf font-bold text-slate-900 dark:text-white">
                {selectedNode.text_uthmani}
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold ${getCategoryBadge(selectedNode.category)}`}>
                {selectedNode.role_arabic} ({selectedNode.role_code})
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              بند کریں ✕
            </button>
          </div>

          {/* Sub-Word Morphemes Decomposition */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-1.5">
              تجزیہ اجزائے کلمہ (Sub-word Morpheme Segments):
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedNode.sub_segments.map((seg, sIdx) => (
                <div
                  key={sIdx}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs flex items-center gap-2"
                >
                  <span className="font-qcf text-base text-emerald-600 dark:text-emerald-400 font-bold">
                    {seg.text}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {seg.type}: {seg.pos}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar Details */}
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <strong>نحوی و صرفی تفصیل:</strong> {selectedNode.grammar_details}
          </div>
        </div>
      )}

      {/* 10 Classical Sarf Verb Forms Section */}
      {roots.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            onClick={() => setShowSarfParadigms(prev => !prev)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer py-1"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>علم الصرف — مشتقات و افعال کے اوزان عشره (10 Classical Verb Forms)</span>
            </div>
            {showSarfParadigms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSarfParadigms && (
            <div className="mt-3 space-y-3 animate-fadeIn">
              {/* Root Switcher */}
              <div className="flex flex-wrap gap-2">
                {roots.map(r => (
                  <button
                    key={r.root}
                    onClick={() => setSelectedRoot(r)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedRoot?.root === r.root
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    جذر: {r.root}
                  </button>
                ))}
              </div>

              {/* 10 Forms Table */}
              {selectedRoot && selectedRoot.paradigms.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                      <tr>
                        <th className="p-2.5">باب / وزن</th>
                        <th className="p-2.5">ماضی (Past)</th>
                        <th className="p-2.5">مضارع (Present)</th>
                        <th className="p-2.5">مصدر (Verbal Noun)</th>
                        <th className="p-2.5">اسم فاعل (Active)</th>
                        <th className="p-2.5">معنی و خاصیت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-ibm">
                      {selectedRoot.paradigms.map((p: SarfParadigmItem) => (
                        <tr key={p.form} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-2.5 font-bold text-emerald-600">
                            {p.wazan} <span className="text-[10px] text-slate-400">({p.form})</span>
                          </td>
                          <td className="p-2.5 font-qcf text-sm">{p.madi}</td>
                          <td className="p-2.5 font-qcf text-sm">{p.mudari}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{p.masdar}</td>
                          <td className="p-2.5 font-qcf text-sm">{p.ism_fail}</td>
                          <td className="p-2.5 text-[11px] text-slate-500">{p.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
