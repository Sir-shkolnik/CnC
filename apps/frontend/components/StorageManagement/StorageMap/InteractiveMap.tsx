'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { 
  useStorageStore, 
  useStorageUnitsByLocation, 
  useSelectedLocation,
  useStorageDragDrop 
} from '@/stores/storageStore';
import { StorageUnit } from '@/types/storage';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Grid, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  RotateCw, 
  Undo, 
  Redo, 
  Settings,
  Eye,
  EyeOff,
  Layers,
  Maximize2,
  Minimize2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface InteractiveMapProps {
  locationId?: string;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  locationId, 
  className = '' 
}) => {
  const selectedLocation = useSelectedLocation();
  const currentLocationId = locationId || selectedLocation;
  const storageUnits = useStorageUnitsByLocation(currentLocationId || '');
  const { isDragging, draggedUnit, undoStack, redoStack } = useStorageDragDrop();
  
  const {
    setDragging,
    setDraggedUnit,
    moveUnit,
    rotateUnit,
    addToUndoStack,
    undo,
    redo,
    setViewMode
  } = useStorageStore();

  // Map state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [gridSize, setGridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Grid configuration
  const gridConfig = {
    width: 800,
    height: 600,
    cellSize: gridSize,
    snapThreshold: snapToGrid ? gridSize / 2 : 0
  };

  // Snap position to grid
  const snapToGridPosition = (x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    
    return { x: snappedX, y: snappedY };
  };

  // Handle unit drag start
  const handleUnitDragStart = (unitId: string, event: any) => {
    setDragging(true);
    setDraggedUnit(unitId);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    
    // Add to undo stack
    const unit = storageUnits.find(u => u.id === unitId);
    if (unit) {
      addToUndoStack({
        type: 'MOVE_UNIT',
        unitId,
        oldPosition: unit.position,
        timestamp: new Date()
      });
    }
  };

  // Handle unit drag end
  const handleUnitDragEnd = (unitId: string, info: PanInfo) => {
    const newPosition = snapToGridPosition(
      position.x + info.point.x,
      position.y + info.point.y
    );
    
    moveUnit(unitId, {
      x: newPosition.x,
      y: newPosition.y,
      rotation: 0,
      gridPosition: {
        row: Math.floor(newPosition.y / gridSize),
        column: Math.floor(newPosition.x / gridSize)
      }
    });
    
    setDragging(false);
    setDraggedUnit(null);
    dragStartRef.current = null;
    
    toast.success('Storage unit moved successfully');
  };

  // Handle unit rotation
  const handleUnitRotate = (unitId: string, direction: 'left' | 'right') => {
    const unit = storageUnits.find(u => u.id === unitId);
    if (!unit) return;
    
    const currentRotation = unit.position.rotation;
    const newRotation = direction === 'left' 
      ? currentRotation - 90 
      : currentRotation + 90;
    
    // Add to undo stack
    addToUndoStack({
      type: 'ROTATE_UNIT',
      unitId,
      oldRotation: currentRotation,
      timestamp: new Date()
    });
    
    rotateUnit(unitId, newRotation);
    toast.success('Storage unit rotated');
  };

  // Handle unit selection
  const handleUnitClick = (unitId: string) => {
    setSelectedUnit(selectedUnit === unitId ? null : unitId);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Get unit color based on status
  const getUnitColor = (unit: StorageUnit) => {
    switch (unit.status) {
      case 'AVAILABLE':
        return 'bg-green-500 hover:bg-green-600';
      case 'OCCUPIED':
        return 'bg-red-500 hover:bg-red-600';
      case 'RESERVED':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'MAINTENANCE':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'OUT_OF_SERVICE':
        return 'bg-gray-700 hover:bg-gray-800';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  // Get unit icon based on type
  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'POD':
        return '📦';
      case 'LOCKER':
        return '🔒';
      case 'CONTAINER':
        return '📦';
      default:
        return '📦';
    }
  };

  // Get unit size display
  const getUnitSizeDisplay = (unit: StorageUnit) => {
    const { width, length, height, unit: unitType } = unit.size;
    return `${width}'×${length}'×${height}'`;
  };

  // Get unit price display
  const getUnitPriceDisplay = (unit: StorageUnit) => {
    return `$${unit.pricing.basePrice}/${unit.pricing.billingCycle.toLowerCase()}`;
  };

  if (!currentLocationId) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Grid className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Location Selected
            </h3>
            <p className="text-gray-500">
              Please select a storage location to view the interactive map
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid className="w-5 h-5" />
            Storage Map
            {currentLocationId && (
              <Badge variant="secondary" className="ml-2">
                {storageUnits.length} Units
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* View Controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={showGrid ? 'bg-blue-100 text-blue-600' : ''}
            >
              <Grid className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLabels(!showLabels)}
              className={showLabels ? 'bg-blue-100 text-blue-600' : ''}
            >
              {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSnapToGrid(!snapToGrid)}
              className={snapToGrid ? 'bg-blue-100 text-blue-600' : ''}
            >
              <Layers className="w-4 h-4" />
            </Button>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={scale <= 0.3}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <span className="text-sm font-medium px-2">
                {Math.round(scale * 100)}%
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={scale >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Reset View */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetView}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={undoStack.length === 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={redoStack.length === 0}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('ANALYTICS')}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 h-full">
        <div 
          ref={mapRef}
          className="relative w-full h-full overflow-hidden bg-gray-50 border rounded-lg"
          style={{ 
            backgroundImage: showGrid ? `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            ` : 'none',
            backgroundSize: `${gridSize * scale}px ${gridSize * scale}px`
          }}
        >
          {/* Map Container */}
          <motion.div
            className="relative w-full h-full"
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center'
            }}
            drag
            dragConstraints={mapRef}
            dragElastic={0.1}
            onDragEnd={(event, info) => {
              setPosition(prev => ({
                x: prev.x + info.offset.x,
                y: prev.y + info.offset.y
              }));
            }}
          >
            {/* Storage Units */}
            {storageUnits.map((unit) => (
              <motion.div
                key={unit.id}
                className={`
                  absolute cursor-move select-none
                  ${getUnitColor(unit)}
                  ${selectedUnit === unit.id ? 'ring-4 ring-blue-400' : ''}
                  ${isDragging && draggedUnit === unit.id ? 'z-50' : 'z-10'}
                  transition-all duration-200 ease-in-out
                `}
                style={{
                  left: unit.position.x,
                  top: unit.position.y,
                  width: unit.size.width * 10, // Scale for display
                  height: unit.size.length * 10,
                  transform: `rotate(${unit.position.rotation}deg)`,
                  transformOrigin: 'center'
                }}
                drag
                dragMomentum={false}
                dragElastic={0.1}
                onDragStart={(event) => handleUnitDragStart(unit.id, event)}
                onDragEnd={(event, info) => handleUnitDragEnd(unit.id, info)}
                onClick={() => handleUnitClick(unit.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Unit Content */}
                <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs font-medium p-1">
                  <div className="text-lg mb-1">
                    {getUnitIcon(unit.type)}
                  </div>
                  
                  {showLabels && (
                    <>
                      <div className="text-center leading-tight">
                        {getUnitSizeDisplay(unit)}
                      </div>
                      <div className="text-center leading-tight font-bold">
                        {getUnitPriceDisplay(unit)}
                      </div>
                      <div className="text-center leading-tight opacity-90">
                        {unit.status}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Unit Controls (when selected) */}
                {selectedUnit === unit.id && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnitRotate(unit.id, 'left');
                      }}
                      className="w-6 h-6 p-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnitRotate(unit.id, 'right');
                      }}
                      className="w-6 h-6 p-0"
                    >
                      <RotateCw className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Empty State */}
            {storageUnits.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Grid className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Storage Units
                  </h3>
                  <p className="text-gray-500 mb-4">
                    This location has no storage units configured
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      // TODO: Open add unit modal
                      toast.success('Add unit functionality coming soon');
                    }}
                  >
                    Add Storage Unit
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Map Overlay */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Map Controls
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• Drag to pan the map</div>
              <div>• Drag units to move them</div>
              <div>• Click units to select</div>
              <div>• Use rotation controls when selected</div>
              <div>• Grid snap: {snapToGrid ? 'ON' : 'OFF'}</div>
            </div>
          </div>
          
          {/* Unit Legend */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Unit Status
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span>Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 