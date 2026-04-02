import { motion } from 'framer-motion';

const KanbanBoard = ({ tasks, onDragEnd }) => {
  const statusColumns = {
    'pending': { color: 'from-orange-400 to-yellow-400', label: 'To Do', icon: '📋' },
    'in-progress': { color: 'from-blue-400 to-indigo-400', label: 'In Progress', icon: '⚡' },
    'completed': { color: 'from-emerald-400 to-teal-400', label: 'Done', icon: '✅' }
  };

  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData('text/plain');
    onDragEnd(taskId, status);
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 -mb-4 px-2">
      {Object.entries(statusColumns).map(([status, column]) => (
        <div
          key={status}
          className="min-w-[320px] flex-1 bg-gradient-to-br from-slate-50/80 via-white/60 to-slate-100/80 dark:from-gray-200/80 dark:via-gray-200/60 dark:to-gray-200/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 min-h-[500px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200/50">
            <div className={`w-12 h-12 bg-gradient-to-r ${column.color} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-xl font-bold text-white drop-shadow-lg">{column.icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-gray-900">{column.label}</h3>
              <p className="text-3xl font-black bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                {getTasksByStatus(status).length}
              </p>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-4 min-h-[400px]">
            {getTasksByStatus(status).map((task) => (
              <motion.div
                key={task._id}
                drag
                draggable
                className="group bg-white/80 dark:bg-gray-500/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 cursor-grab active:cursor-grabbing"
                whileDrag={{ scale: 1.05, zIndex: 10 }}
                data-id={task._id}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-xl text-gray-900 line-clamp-1 pr-4">{task.taskTitle}</h4>
                  <div className="flex items-center gap-2">
                    {task.deadline && new Date(task.deadline) < new Date() && (
                      <div className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full animate-pulse">
                        Overdue
                      </div>
                    )}
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-gray-800 mb-4 text-sm leading-relaxed line-clamp-2">{task.description}</p>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-400/50">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {task.student?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                    <span>{task.student?.name}</span>
                  </div>
                  <div className="text-sm text-black font-medium">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {getTasksByStatus(status).length === 0 && (
              <div className="text-center py-12 opacity-50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">{column.icon}</span>
                </div>
                <p className="text-black font-medium">No {column.label.toLowerCase()} tasks</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
