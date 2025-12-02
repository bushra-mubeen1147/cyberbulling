import { Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HistoryTable({ history, onDelete, darkMode }) {
  const getScoreColor = (score) => {
    if (score < 0.3) return 'text-green-600';
    if (score < 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full text-sm">
        <thead className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <tr>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Text
            </th>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Toxicity
            </th>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Cyberbullying
            </th>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Sarcasm
            </th>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Sentiment
            </th>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Date
            </th>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {history.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`${darkMode ? (index % 2 === 0 ? 'bg-gray-800/40' : 'bg-gray-800/20') : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50')} hover:shadow-sm`}
            >
              <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                <div title={item.fullText} className="max-w-[12rem] truncate">{item.text}</div>
              </td>
              <td className={`px-4 py-3 font-semibold ${getScoreColor(item.toxicity)}`}>
                {(item.toxicity * 100).toFixed(1)}%
              </td>
              <td className={`px-4 py-3 font-semibold ${getScoreColor(item.cyberbullying)}`}>
                {(item.cyberbullying * 100).toFixed(1)}%
              </td>
              <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.sarcasm ? 'Yes' : 'No'}
              </td>
              <td className={`px-4 py-3 capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.sentiment}
              </td>
              <td className={`px-4 py-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.date}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  aria-label="Delete row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
