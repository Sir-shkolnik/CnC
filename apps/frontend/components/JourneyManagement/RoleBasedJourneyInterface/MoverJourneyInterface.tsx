'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { 
  Package, 
  Camera, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  FileText,
  Clock,
  Users,
  MessageSquare,
  Phone,
  MapPin,
  Upload,
  Download,
  Truck
} from 'lucide-react';

interface MoverJourneyInterfaceProps {
  journeyId: string;
  journey: any;
}

export const MoverJourneyInterface: React.FC<MoverJourneyInterfaceProps> = ({ 
  journeyId, 
  journey 
}) => {
  const [currentTask, setCurrentTask] = useState(1);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Mover-specific tasks
  const moverTasks = [
    {
      id: 1,
      title: 'Pre-Move Setup',
      icon: Package,
      status: 'completed',
      items: [
        'Equipment check',
        'Safety gear verification', 
        'Moving supplies ready'
      ],
      color: 'bg-green-500'
    },
    {
      id: 2,
      title: 'Item Documentation',
      icon: FileText,
      status: 'active',
      items: [
        'Photo inventory',
        'Condition assessment',
        'Special handling notes'
      ],
      color: 'bg-blue-500'
    },
    {
      id: 3,
      title: 'Loading Process',
      icon: Upload,
      status: 'pending',
      items: [
        'Careful loading',
        'Securing items',
        'Loading photos'
      ],
      color: 'bg-orange-500'
    },
    {
      id: 4,
      title: 'Delivery & Unload',
      icon: Download,
      status: 'pending',
      items: [
        'Careful unloading',
        'Item placement',
        'Final inspection'
      ],
      color: 'bg-purple-500'
    }
  ];

  const safetyChecklist = [
    'Safety equipment worn',
    'Lifting techniques proper',
    'Path clear of obstacles',
    'Team communication active'
  ];

  const quickActions = [
    { 
      label: 'Document Item', 
      icon: Camera, 
      action: 'document',
      color: 'bg-blue-500'
    },
    { 
      label: 'Report Damage', 
      icon: AlertTriangle, 
      action: 'damage',
      color: 'bg-red-500'
    },
    { 
      label: 'Safety Issue', 
      icon: Shield, 
      action: 'safety',
      color: 'bg-yellow-500'
    },
    { 
      label: 'Call Team', 
      icon: Phone, 
      action: 'call',
      color: 'bg-green-500'
    }
  ];

  const handleTaskComplete = (taskId: number) => {
    setCurrentTask(taskId + 1);
  };

  const handleItemComplete = (itemId: string) => {
    setCompletedItems([...completedItems, itemId]);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'document':
        // Open camera for item documentation
        break;
      case 'damage':
        // Open damage report form
        break;
      case 'safety':
        // Report safety concern
        break;
      case 'call':
        // Contact team member
        break;
    }
  };

  const renderCurrentTask = () => {
    const task = moverTasks.find(t => t.id === currentTask);
    if (!task) return null;

    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg ${task.color} flex items-center justify-center`}>
                <task.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{task.title}</CardTitle>
                <Badge variant="warning">Active Task</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Task {task.id} of {moverTasks.length}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Task Items:</h4>
            {task.items.map((item, index) => {
              const itemId = `${task.id}-${index}`;
              const isCompleted = completedItems.includes(itemId);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`w-5 h-5 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                      {item}
                    </span>
                  </div>
                  {!isCompleted && (
                    <Button size="sm" variant="secondary" onClick={() => handleItemComplete(itemId)}>
                      Complete
                    </Button>
                  )}
                </div>
              );
            })}
            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={() => handleTaskComplete(task.id)}
              disabled={task.items.length !== completedItems.filter(id => id.startsWith(`${task.id}-`)).length}
            >
              Complete {task.title}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Mobile Header */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardContent className="p-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Package className="w-8 h-8 mr-2" />
              <h1 className="text-xl font-bold">Mover Tasks</h1>
            </div>
            <div className="flex items-center justify-center space-x-4 text-sm opacity-90">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Pickup Location
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                9:30 AM
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Status */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Safety Status</span>
            </div>
            <Badge variant="success">All Clear</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {safetyChecklist.map((item, index) => (
              <div key={index} className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-green-700">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Progress */}
      <div className="flex items-center justify-between px-2">
        {moverTasks.map((task, index) => (
          <div key={task.id} className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                task.status === 'completed' ? 'bg-green-500' :
                task.status === 'active' ? task.color :
                'bg-gray-300'
              }`}
            >
              {task.status === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                task.id
              )}
            </div>
            <span className={`text-xs mt-1 text-center ${
              task.status === 'active' ? 'text-gray-900 font-medium' : 'text-gray-500'
            }`}>
              {task.title.split(' ')[0]}
            </span>
            {index < moverTasks.length - 1 && (
              <div className={`w-16 h-1 mt-2 ${
                task.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Task */}
      {renderCurrentTask()}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.action === 'damage' || action.action === 'safety' ? "danger" : "secondary"}
                className="flex flex-col items-center justify-center h-20 p-3"
                onClick={() => handleQuickAction(action.action)}
              >
                <action.icon className="w-6 h-6 mb-2" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Item Documentation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Items Documented
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Camera className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">Living Room Sofa</div>
                  <div className="text-xs text-gray-500">Good condition • 3 photos</div>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Camera className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">Dining Table</div>
                  <div className="text-xs text-gray-500">Minor scratch • 4 photos</div>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <Button variant="secondary" className="w-full mt-3">
            <Camera className="w-4 h-4 mr-2" />
            Document New Item
          </Button>
        </CardContent>
      </Card>

      {/* Team Communication */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Team Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Truck className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Driver: "Arrived at pickup location"</div>
                <div className="text-xs text-gray-500">2 minutes ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm font-medium">Dispatcher: "Customer is ready"</div>
                <div className="text-xs text-gray-500">5 minutes ago</div>
              </div>
            </div>
          </div>
          <Button variant="secondary" className="w-full mt-3">
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Update
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};