import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Brain, TrendingUp, Lock, Zap, Users, CheckCircle, BarChart3, Globe, MessageSquare, AlertTriangle, Heart } from 'lucide-react';

export default function Home({ darkMode }) {
  const stats = [
    { value: '99.2%', label: 'Accuracy Rate' },
    { value: '10M+', label: 'Messages Analyzed' },
    { value: '50K+', label: 'Active Users' },
    { value: '<1s', label: 'Response Time' }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Toxicity Detection',
      description: 'Identify harmful and toxic language patterns with industry-leading accuracy',
      color: 'blue',
      details: 'Detects harassment, hate speech, and offensive content'
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced neural networks trained on millions of real-world data points',
      color: 'purple',
      details: 'Continuously learning and improving'
    },
    {
      icon: TrendingUp,
      title: 'Sentiment Analysis',
      description: 'Understand the emotional context and tone behind every message',
      color: 'pink',
      details: 'Identifies positive, negative, and neutral sentiments'
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'End-to-end encryption ensures your data is never shared with third parties',
      color: 'indigo',
      details: 'GDPR & CCPA compliant'
    },
    {
      icon: Zap,
      title: 'Real-Time Processing',
      description: 'Instant analysis with lightning-fast response times',
      color: 'yellow',
      details: 'Process thousands of messages per second'
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Detect cyberbullying in over 50+ languages worldwide',
      color: 'green',
      details: 'Expanding language support monthly'
    }
  ];

  const useCases = [
    {
      icon: Users,
      title: 'Social Media Platforms',
      description: 'Protect your community from toxic behavior and harassment'
    },
    {
      icon: MessageSquare,
      title: 'Chat Applications',
      description: 'Keep conversations respectful and safe in real-time'
    },
    {
      icon: BarChart3,
      title: 'Content Moderation',
      description: 'Streamline your moderation workflow with AI assistance'
    },
    {
      icon: Heart,
      title: 'Mental Health',
      description: 'Support wellbeing by identifying harmful content early'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Input Your Text',
      description: 'Paste or type the message you want to analyze'
    },
    {
      step: '2',
      title: 'AI Analysis',
      description: 'Our advanced algorithms process the text in milliseconds'
    },
    {
      step: '3',
      title: 'Get Results',
      description: 'Receive detailed insights about toxicity, sentiment, and risk levels'
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="pt-16">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-3">
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">
                  #1 Cyberbullying Detection Platform
                </span>
              </div>
              <h1 className={`text-4xl md:text-5xl font-bold mb-5 ${darkMode ? 'text-white' : 'text-gray-900'} leading-tight`}>
                AI-Powered{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cyberbullying
                </span>{' '}
                Detection
              </h1>
              <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                Advanced machine learning algorithms to detect toxicity, cyberbullying, and harmful content in real-time. Making the internet a safer place, one message at a time.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 shadow`}>
                    <div className="text-xl font-bold text-blue-600">{stat.value}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/analyze"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center"
                >
                  Try it Free
                </Link>
                <Link
                  to="/login"
                  className={`px-6 py-3 ${darkMode ? 'bg-gray-800 text-white border-2 border-gray-700' : 'bg-white text-gray-900 border-2 border-gray-200'} rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-center`}
                >
                  Sign Up
                </Link>
              </div>
              
              <p className={`mt-3 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                No credit card required • Free trial available
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80"
                alt="AI Cybersecurity"
                className="rounded-xl shadow-xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-xl"></div>
              
              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className={`absolute -bottom-4 -left-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 shadow-xl max-w-xs`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Safe Content</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No toxicity detected</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-8`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className={`text-sm md:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              How It Works
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Simple, fast, and accurate. Get started in three easy steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg text-center h-full`}>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                    {item.step}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group`}
              >
                <div className={`p-4 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                  {feature.description}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {feature.details}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-12`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Who Can Benefit?
              </h2>
              <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Our solution works across multiple platforms and use cases
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300`}
                >
                  <div className={`p-3 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl w-fit mx-auto mb-4`}>
                    <useCase.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {useCase.title}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {useCase.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Trusted by Leading Organizations
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Join thousands of organizations using SafeText AI
            </p>
          </motion.div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 md:p-12 shadow-xl`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Early Detection
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Identify potential issues before they escalate
                </p>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  24/7 Protection
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Round-the-clock monitoring and protection
                </p>
              </div>
              <div className="text-center">
                <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Community Wellbeing
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Foster positive and respectful online spaces
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'} py-12`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/analyze"
                  className={`inline-block px-10 py-4 ${darkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'} rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200`}
                >
                  Start Analyzing Free
                </Link>
                <Link
                  to="/login"
                  className="inline-block px-10 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold shadow-lg hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
                >
                  View Pricing
                </Link>
              </div>
              <p className="mt-6 text-sm text-blue-100">
                ✓ No credit card required  ✓ 14-day free trial  ✓ Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
