'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600">Cake Topper Designer</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
              <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link 
                href="/designer"
                className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Start Designing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="block text-gray-900">Create Stunning</span>
              <span className="block text-primary-600 mt-2">Cake Toppers</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Design beautiful, personalized cake toppers in minutes. Perfect for weddings, birthdays, and special celebrations.
            </p>
            <div className="mt-10 flex justify-center space-x-6">
              <Link
                href="/designer"
                className="px-8 py-4 rounded-lg text-lg font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Start Designing Free
              </Link>
              <Link
                href="#templates"
                className="px-8 py-4 rounded-lg text-lg font-medium text-primary-600 border-2 border-primary-600 hover:bg-primary-50 transition-colors"
              >
                Browse Templates
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Ready-to-Use Templates</h2>
            <p className="mt-4 text-xl text-gray-600">Start with a beautiful template and customize it to your style</p>
          </motion.div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Template previews would go here */}
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
              <motion.div
                key={index}
                className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium">
                      Use Template
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
            <p className="mt-4 text-xl text-gray-600">Powerful features to bring your ideas to life</p>
          </motion.div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Drag & Drop Editor',
                description: 'Intuitive interface that makes designing effortless and fun.'
              },
              {
                title: 'Premium Fonts',
                description: 'Access to hundreds of beautiful fonts for your designs.'
              },
              {
                title: 'Custom Shapes',
                description: 'Add and customize shapes to match your style.'
              },
              {
                title: 'Real-time Preview',
                description: 'See exactly how your cake topper will look as you design.'
              },
              {
                title: 'Save & Share',
                description: 'Save your designs and share them with others easily.'
              },
              {
                title: 'High Quality Export',
                description: 'Download your designs in high resolution for printing.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Simple Pricing</h2>
            <p className="mt-4 text-xl text-gray-600">Choose the perfect plan for your needs</p>
          </motion.div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Basic',
                price: 'Free',
                features: [
                  'Basic templates',
                  'Essential design tools',
                  '5 designs per month',
                  'Standard quality export'
                ]
              },
              {
                name: 'Pro',
                price: '$9.99/month',
                features: [
                  'All templates',
                  'Advanced design tools',
                  'Unlimited designs',
                  'HD quality export',
                  'Priority support'
                ],
                popular: true
              },
              {
                name: 'Business',
                price: '$29.99/month',
                features: [
                  'Everything in Pro',
                  'Team collaboration',
                  'Custom branding',
                  'API access',
                  '24/7 support'
                ]
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`p-8 rounded-xl ${plan.popular ? 'bg-primary-50 border-2 border-primary-500' : 'bg-white border border-gray-200'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {plan.popular && (
                  <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-4xl font-bold text-gray-900">{plan.price}</p>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`mt-8 w-full py-3 px-6 rounded-lg font-medium ${plan.popular ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50'}`}>
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white">Ready to Create Your Perfect Cake Topper?</h2>
            <p className="mt-4 text-xl text-primary-100">Join thousands of happy customers who have already created their dream designs</p>
            <Link
              href="/designer"
              className="mt-8 inline-block px-8 py-4 rounded-lg text-lg font-medium bg-white text-primary-600 hover:bg-primary-50 transition-colors"
            >
              Start Designing Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Templates</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Twitter</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Instagram</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Facebook</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2024 Cake Topper Designer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
} 