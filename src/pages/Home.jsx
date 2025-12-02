import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Brain, TrendingUp, Lock } from 'lucide-react';

export default function Home({ darkMode }) {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="pt-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                AI-Powered{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cyberbullying
                </span>{' '}
                Detection
              </h1>
              <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Advanced machine learning algorithms to detect toxicity, cyberbullying, and harmful content in real-time. Making the internet a safer place, one message at a time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/analyze"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center"
                >
                  Analyze Now
                </Link>
                <Link
                  to="/login"
                  className={`px-8 py-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center`}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80"
                alt="AI Cybersecurity"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-2xl"></div>
            </motion.div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Powerful Features
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              State-of-the-art AI technology to protect online communities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Toxicity Detection',
                description: 'Identify harmful and toxic language patterns with high accuracy',
                color: 'blue'
              },
              {
                icon: Brain,
                title: 'AI-Powered Analysis',
                description: 'Advanced neural networks trained on millions of data points',
                color: 'purple'
              },
              {
                icon: TrendingUp,
                title: 'Sentiment Analysis',
                description: 'Understand the emotional context and tone of messages',
                color: 'pink'
              },
              {
                icon: Lock,
                title: 'Privacy First',
                description: 'Your data is encrypted and never shared with third parties',
                color: 'indigo'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className={`p-4 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl w-fit mb-4`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className={`${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-600 to-purple-600'} py-20`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Make the Internet Safer?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust SafeText AI to protect their online communities from cyberbullying and toxic behavior.
              </p>
              <Link
                to="/analyze"
                className={`inline-block px-10 py-4 ${darkMode ? 'bg-blue-600' : 'bg-white text-blue-600'} rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200`}
              >
                Start Analyzing
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
