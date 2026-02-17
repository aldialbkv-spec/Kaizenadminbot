import { useMemo } from 'react';
import type { SpaghettiZone, SpaghettiRoute } from '../../../entities/vsm/model/types';

interface SpaghettiDiagramProps {
  zones: SpaghettiZone[];
  routes: SpaghettiRoute[];
}

const nodeColors = {
  storage: '#10b981',     // green
  office: '#3b82f6',      // blue
  production: '#f59e0b',  // amber
  warehouse: '#8b5cf6',   // purple
};

const edgeColors = {
  transport: '#ef4444',   // red
  motion: '#f97316',      // orange
  waiting: '#eab308',     // yellow
};

export function SpaghettiDiagram({ zones, routes }: SpaghettiDiagramProps) {
  const width = 800;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 250;
  const nodeWidth = 120;
  const nodeHeight = 50;

  // Calculate positions for each zone
  const zonePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; zone: SpaghettiZone }> = {};
    zones.forEach((zone, index) => {
      const angle = (index / zones.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions[zone.id] = { x, y, zone };
    });
    return positions;
  }, [zones, centerX, centerY, radius]);

  return (
    <div className="w-full relative border rounded-lg bg-gray-50 overflow-hidden">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[600px]"
      >
        <defs>
          {/* Markers for arrows */}
          {Object.entries(edgeColors).map(([type, color]) => (
            <marker
              key={type}
              id={`arrow-${type}`}
              markerWidth="10"
              markerHeight="7"
              refX="10" // Tip of the arrow (at x=10) should be at the end of the line
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={color} />
            </marker>
          ))}
        </defs>

        {/* Edges (Routes) */}
        {routes.map((route, index) => {
          const start = zonePositions[route.from];
          const end = zonePositions[route.to];

          if (!start || !end) return null;

          // Calculate intersection points to clip lines at node boundaries
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const angle = Math.atan2(dy, dx);
          
          // Distance from center to rect edge along the line angle
          // For start node (moving forward)
          const distStart = Math.min(
            (nodeWidth / 2) / Math.abs(Math.cos(angle)),
            (nodeHeight / 2) / Math.abs(Math.sin(angle))
          );
          
          // For end node (moving backward, same dim)
          const distEnd = Math.min(
            (nodeWidth / 2) / Math.abs(Math.cos(angle)),
            (nodeHeight / 2) / Math.abs(Math.sin(angle))
          );

          const x1 = start.x + distStart * Math.cos(angle);
          const y1 = start.y + distStart * Math.sin(angle);
          const x2 = end.x - distEnd * Math.cos(angle);
          const y2 = end.y - distEnd * Math.sin(angle);

          return (
            <g key={`edge-${index}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={edgeColors[route.wasteType]}
                strokeWidth="3"
                markerEnd={`url(#arrow-${route.wasteType})`}
                opacity="0.7"
              />
              {/* Edge Label (midpoint) */}
              <foreignObject
                x={(start.x + end.x) / 2 - 40}
                y={(start.y + end.y) / 2 - 20}
                width="80"
                height="40"
              >
                <div className="bg-white/90 px-1 py-0.5 rounded border border-gray-200 text-[10px] text-center shadow-sm">
                  <div className="font-medium text-gray-900 leading-tight">{route.distance}</div>
                  <div className="text-gray-500 leading-tight">{route.frequency}</div>
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* Nodes (Zones) */}
        {Object.values(zonePositions).map(({ x, y, zone }) => (
          <g key={zone.id} transform={`translate(${x}, ${y})`}>
            {/* Node Box */}
            <rect
              x={-nodeWidth / 2}
              y={-nodeHeight / 2}
              width={nodeWidth}
              height={nodeHeight}
              rx="8"
              fill={nodeColors[zone.type]}
              stroke="white"
              strokeWidth="2"
              filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.1))"
            />
            {/* Node Label */}
            <foreignObject 
              x={-nodeWidth / 2} 
              y={-nodeHeight / 2} 
              width={nodeWidth} 
              height={nodeHeight}
            >
              <div className="w-full h-full flex items-center justify-center text-center px-2">
                <span className="text-white font-medium text-sm leading-tight">
                  {zone.name}
                </span>
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>

      {/* Легенда */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border text-sm">
        <div className="font-medium mb-2">Типы зон:</div>
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: nodeColors.storage }}></div>
            <span>Склад</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: nodeColors.office }}></div>
            <span>Офис</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: nodeColors.production }}></div>
            <span>Производство</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: nodeColors.warehouse }}></div>
            <span>Склад ГП</span>
          </div>
        </div>
        
        <div className="font-medium mb-2">Типы потерь:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ background: edgeColors.transport }}></div>
            <span>Транспортировка</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ background: edgeColors.motion }}></div>
            <span>Лишние движения</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ background: edgeColors.waiting }}></div>
            <span>Ожидание</span>
          </div>
        </div>
      </div>
    </div>
  );
}
