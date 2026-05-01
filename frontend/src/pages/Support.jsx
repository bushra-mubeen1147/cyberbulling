import { useState } from 'react';
import { 
  MessageCircle,
  Send,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Mail,
  ArrowRight
} from 'lucide-react';

export default function Support({ darkMode }) {
  const [activeTab, setActiveTab] = useState('feedback');
  const [formData, setFormData] = useState({
    type: 'bug',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      question: 'How accurate is the toxicity detection?',
      answer: 'Our AI model achieves 95% accuracy in detecting cyberbullying, harassment, and toxic content. The accuracy improves as you use the system.'
    },
    {
      question: 'Can I delete my analysis history?',
      answer: 'Yes, you can delete individual analyses or clear your entire history from the History tab. This action is permanent.'
    },
    {
      question: 'What is the API rate limit?',
      answer: 'Free tier allows 100 analyses per month, Standard tier allows 1,000, and Premium tier offers unlimited access.'
    },
    {
      question: 'Is my data private?',
      answer: 'Yes, all your data is encrypted end-to-end and never shared with third parties. We comply with GDPR and privacy regulations.'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can submit a support ticket here, email us at support@safetext.ai, or check our documentation.'
    },
    {
      question: 'Does the app work offline?',
      answer: 'No, the app requires an internet connection to process analyses as it uses our cloud-based AI model.'
    }
  ];

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Learn how to use SafeText AI',
      icon: BookOpen,
      link: '#'
    },
    {
      title: 'API Documentation',
      description: 'Integrate SafeText into your app',
      icon: MessageSquare,
      link: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      icon: MessageCircle,
      link: '#'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: HelpCircle,
      link: '#'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ type: 'bug', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Support & Feedback
        </h1>
        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Get help or share your feedback
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'feedback'
              ? 'border-blue-600 text-blue-600'
              : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          <MessageCircle className="w-5 h-5 inline-block mr-2" />
          Feedback & Issues
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'faq'
              ? 'border-blue-600 text-blue-600'
              : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          <HelpCircle className="w-5 h-5 inline-block mr-2" />
          FAQ
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'resources'
              ? 'border-blue-600 text-blue-600'
              : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          <BookOpen className="w-5 h-5 inline-block mr-2" />
          Resources
        </button>
      </div>

      {/* Content */}
      {activeTab === 'feedback' && (
        <div className={`p-8 rounded-xl border ${
          darkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Thank You!
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your feedback has been submitted. We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type
                </label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="feedback">General Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject
                </label>
                <input 
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Brief description of your feedback"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message
                </label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Provide as much detail as possible..."
                  rows={6}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Send className="w-5 h-5" />
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      )}

      {activeTab === 'faq' && (
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className={`p-4 rounded-lg border ${
                darkMode
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } transition-colors cursor-pointer group`}
            >
              <summary className={`font-medium flex items-center justify-between ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <span>{faq.question}</span>
                <ArrowRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
              </summary>
              <p className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <a
                key={idx}
                href={resource.link}
                className={`p-6 rounded-xl border ${
                  darkMode
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } transition-all group cursor-pointer`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 group-hover:shadow-lg transition-shadow">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {resource.title}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {resource.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Contact Card */}
      <div className={`p-6 rounded-xl border ${
        darkMode
          ? 'bg-blue-900/20 border-blue-800'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-start gap-4">
          <Mail className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'} flex-shrink-0 mt-1`} />
          <div>
            <h3 className={`font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
              Need Direct Support?
            </h3>
            <p className={`text-sm mb-3 ${darkMode ? 'text-blue-200/70' : 'text-blue-700/70'}`}>
              Email us at support@safetext.ai or contact us through the contact page for urgent issues.
            </p>
            <a href="mailto:support@safetext.ai" className={`text-sm font-semibold flex items-center gap-1 ${darkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-800'} transition-colors`}>
              support@safetext.ai
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
