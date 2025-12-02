import { motion } from 'framer-motion';
import { Shield, Target, Users, Award, TrendingUp, Heart, Zap, Globe } from 'lucide-react';

export default function About({ darkMode }) {
  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Our primary mission is to create safer online environments for everyone.',
      color: 'blue'
    },
    {
      icon: Heart,
      title: 'Empathy Driven',
      description: 'We understand the impact of cyberbullying and work to prevent it with compassion.',
      color: 'pink'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Leveraging cutting-edge AI technology to stay ahead of emerging threats.',
      color: 'yellow'
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Making the internet safer for communities worldwide, one message at a time.',
      color: 'green'
    }
  ];

  const stats = [
    { value: '10M+', label: 'Messages Analyzed', icon: TrendingUp },
    { value: '50K+', label: 'Active Users', icon: Users },
    { value: '99.2%', label: 'Accuracy Rate', icon: Award },
    { value: '100+', label: 'Countries Served', icon: Globe }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'CEO & Co-Founder',
      expertise: 'AI Research & Machine Learning',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      expertise: 'Natural Language Processing',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      expertise: 'User Experience & Safety',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'
    },
    {
      name: 'David Kumar',
      role: 'Lead Data Scientist',
      expertise: 'Deep Learning & Analytics',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'
    }
  ];

  const milestones = [
    { year: '2020', event: 'SafeText AI Founded', description: 'Started with a mission to combat cyberbullying' },
    { year: '2021', event: 'First Million Analyzed', description: 'Reached 1M messages analyzed milestone' },
    { year: '2022', event: 'Global Expansion', description: 'Launched in 50+ countries with multi-language support' },
    { year: '2023', event: 'AI Breakthrough', description: 'Achieved 99%+ accuracy in toxicity detection' },
    { year: '2024', event: 'Industry Recognition', description: 'Won Best AI Safety Solution Award' },
    { year: '2025', event: 'Platform Evolution', description: 'Launched real-time API and enterprise solutions' }
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
                About SafeText AI
              </span>
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Making the Internet a{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Safer Place
              </span>
            </h1>
            <p className={`text-lg max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              We're on a mission to combat cyberbullying and create safer online communities through advanced AI technology and compassionate innovation.
            </p>
          </motion.div>
        </section>

        {/* Our Story */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Our Story
              </h2>
              <div className={`space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>
                  SafeText AI was born from a simple yet powerful idea: what if we could use artificial intelligence to protect people from online harassment before it causes harm?
                </p>
                <p>
                  Founded in 2020 by a team of AI researchers and child safety advocates, we've grown from a small startup to a trusted platform serving millions of users worldwide.
                </p>
                <p>
                  Our journey has been driven by the belief that everyone deserves to feel safe online. Through continuous innovation and dedication, we've built one of the most accurate and comprehensive cyberbullying detection systems available today.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                alt="Team collaboration"
                className="rounded-xl shadow-lg w-full"
              />
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-12`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Our Core Values
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-5 shadow-lg hover:shadow-xl transition-all`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-${value.color}-100 dark:bg-${value.color}-900/30 flex items-center justify-center mb-3`}>
                    <Icon className={`w-6 h-6 text-${value.color}-600`} />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {value.title}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Timeline */}
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
                Our Journey
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Key milestones in our mission to create safer online spaces
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-xl p-5 border-l-4 border-blue-600`}
                >
                  <div className="text-blue-600 font-bold text-sm mb-1">{milestone.year}</div>
                  <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {milestone.event}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {milestone.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Meet Our Team
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              The passionate people behind SafeText AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all`}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {member.name}
                  </h3>
                  <div className="text-blue-600 text-sm font-semibold mb-2">{member.role}</div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {member.expertise}
                  </p>
                </div>
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
            <h2 className="text-3xl font-bold mb-3">Join Our Mission</h2>
            <p className="text-lg mb-6 opacity-90">
              Help us create a safer internet for everyone
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/signup"
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Get Started Free
              </a>
              <a
                href="/contact"
                className="px-6 py-3 bg-white/10 backdrop-blur text-white border-2 border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-all"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
