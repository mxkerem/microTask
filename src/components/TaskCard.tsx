import React from 'react';
import { TaskInfo } from '@/types';

interface TaskCardProps {
  task: TaskInfo;
  onPayClick?: (task: TaskInfo) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onPayClick }) => {
  const handlePayClick = () => {
    if (onPayClick) {
      onPayClick(task);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">Task #{task.taskId}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Amount: {task.paymentAmount} XLM
          </p>
        </div>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
          Completed
        </span>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          Freelancer: {task.freelancerAddress.slice(0, 8)}...{task.freelancerAddress.slice(-4)}
        </p>
        {task.timestamp && (
          <p className="text-xs text-gray-500 mt-1">
            {new Date(task.timestamp).toLocaleDateString()}
          </p>
        )}
      </div>

      <button
        onClick={handlePayClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
      >
        Process Payment
      </button>
    </div>
  );
};

export default TaskCard;