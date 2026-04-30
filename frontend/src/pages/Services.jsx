import { motion } from 'framer-motion';
import { Shield, Zap, BarChart3, Clock, Globe, Lock, Users, CheckCircle, MessageSquare, TrendingUp, Bell, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services({ darkMode }) {
  const mainServices = [
    {
      icon: MessageSquare,
      title: 'Real-Time Text Analysis',
      description: 'Instantly analyze messages, comments, and posts for cyberbullying, toxicity, and harmful content with our advanced AI.',
      features: ['Instant results', 'Multi-language support', 'Context-aware detection', 'Sarcasm detection'],
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Cyberbullying Detection',
      description: 'Our specialized AI model identifies various forms of cyberbullying with 99%+ accuracy across multiple platforms.',
      features: ['Threat classification', 'Severity scoring', 'Pattern recognition', 'False positive filtering'],
      color: 'purple'
    },
    {
      icon: BarChart3,
      title: 'Sentiment Analysis',
      description: 'Understand the emotional tone and intent behind messages to gauge overall conversation health.',
      features: ['Emotion detection', 'Intent analysis', 'Tone evaluation', 'Context understanding'],
      color: 'green'
    },
    {
      icon: Database,
      title: 'Analysis History',
      description: 'Track and review all your past analyses with detailed reports and insights stored securely in the cloud.',
      features: ['Unlimited history', 'Export reports', 'Search & filter', 'Trend visualization'],
      color: 'orange'
    },
    {
      icon: Bell,
      title: 'Alert System',
      description: 'Get notified immediately when high-risk content is detected, enabling quick intervention and response.',
      features: ['Real-time alerts', 'Custom thresholds', 'Multi-channel notifications', 'Priority flagging'],
      color: 'red'
    },
    {
      icon: Globe,
      title: 'API Integration',
      description: 'Integrate our powerful AI into your own applications, platforms, or social media tools seamlessly.',
      features: ['RESTful API', 'Comprehensive docs', 'SDKs available', '99.9% uptime'],
      color: 'indigo'
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals and testing',
      features: [
        '100 analyses per month',
        'Basic text analysis',
        'Cyberbullying detection',
        'Sentiment analysis',
        'Email support',
        '7-day history'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      description: 'Ideal for professionals and educators',
      features: [
        '10,000 analyses per month',
        'Advanced AI models',
        'Detailed reports',
        'Unlimited history',
        'Priority support',
        'Export capabilities',
        'Custom alerts',
        'API access (limited)'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'tailored pricing',
      description: 'For organizations and platforms',
      features: [
        'Unlimited analyses',
        'Custom AI training',
        'Dedicated support',
        'SLA guarantee',
        'White-label options',
        'Advanced API access',
        'Custom integrations',
        'On-premise deployment'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const useCases = [
    {
      icon: Users,
      title: 'Social Media Platforms',
      description: 'Protect your community by automatically moderating comments and posts.',
      examples: ['Comment filtering', 'User reporting', 'Moderation queue']
    },
    {
      icon: Shield,
      title: 'Educational Institutions',
      description: 'Keep students safe online with proactive monitoring of digital communications.',
      examples: ['Student safety', 'Bullying prevention', 'Incident reporting']
    },
    {
      icon: MessageSquare,
      title: 'Chat Applications',
      description: 'Create safer messaging environments with real-time content screening.',
      examples: ['Live chat moderation', 'DM protection', 'Group safety']
    },
    {
      icon: TrendingUp,
      title: 'Brand Protection',
      description: 'Monitor brand mentions and customer interactions for toxic content.',
      examples: ['Reputation management', 'Customer sentiment', 'Crisis prevention']
    }
  ];

  const features = [
    { icon: Zap, text: 'Lightning-fast analysis (<1 second)' },
    { icon: Lock, text: 'Enterprise-grade security & privacy' },
    { icon: Globe, text: 'Support for 50+ languages' },
    { icon: Clock, text: '24/7 automated monitoring' },
    { icon: CheckCircle, text: '99.2% accuracy rate' },
    { icon: BarChart3, text: 'Detailed analytics & insights' }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="pt-16">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-block mb-3">
              <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">
                Our Services
              </span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Powerful AI Solutions for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Online Safety
              </span>
            </h1>
            <p className={`text-lg max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Comprehensive cyberbullying detection and content moderation tools powered by cutting-edge artificial intelligence.
            </p>
          </motion.div>
        </section>

        {/* Key Features Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-3 text-center shadow-md hover:shadow-lg transition-all`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {feature.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Main Services */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Complete Suite of Services
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Everything you need to create and maintain a safe online environment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-${service.color}-100 dark:bg-${service.color}-900/30 flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${service.color}-600`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {service.title}
                  </h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className={`w-4 h-4 mr-2 text-${service.color}-600 flex-shrink-0`} />
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Use Cases */}
        <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-12`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Industry Use Cases
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Trusted across multiple industries and platforms
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-xl p-5`}
                  >
                    <Icon className="w-10 h-10 text-blue-600 mb-3" />
                    <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {useCase.title}
                    </h3>
                    <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {useCase.description}
                    </p>
                    <ul className="space-y-1">
                      {useCase.examples.map((example, idx) => (
                        <li key={idx} className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          • {example}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Flexible Pricing Plans
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Choose the perfect plan for your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all relative ${
                  plan.popular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                  className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                      : darkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`${darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'} rounded-2xl p-8 text-center text-white`}
          >
            <h2 className="text-3xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of users protecting their online communities
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Start Free Trial
              </Link>
              <Link
                to="/analyze"
                className="px-6 py-3 bg-white/10 backdrop-blur text-white border-2 border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-all"
              >
                Try Demo
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
