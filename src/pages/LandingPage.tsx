import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Shield, Zap, Github, Twitter, Linkedin } from 'lucide-react';
import appScreenshot from '../assets/billclub8.jpg';
import appScreenshot2 from '../assets/billclub2.jpg';
import appScreenshot3 from '../assets/billclub5.jpg';
import { Link } from 'react-router-dom';
const LandingPage: React.FC = () => {
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const steps = [
        {
            title: "1. Scan Your Receipt",
            description: "Simply scan any receipt to have our AI do the magic",
            image: appScreenshot
        },
        {
            title: "2. Verify Your Items",
            description: "Check for any mistakes and edit them",
            image: appScreenshot3
        },
        {
            title: "3. Share The Link",
            description: "Share the link with your friends and family",
            image: appScreenshot2
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            {/* Navigation */}
            <nav className={`max-w-7xl mx-auto px-6 py-6 fixed top-0 left-0 right-0 transition-all duration-300 ${hasScrolled ? 'bg-white bg-opacity-30 backdrop-blur-lg' : 'bg-transparent'} rounded-lg z-50`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Zap className="h-8 w-8 text-blue-600" />
                        <h1 className="text-2xl font-bold">BILL CLUB</h1>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/scan" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className=" min-h-screen container mx-auto px-6 py-24 md:py-32">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* App Screenshot */}
                    <div className="order-2 md:order-1">
                        <div className="relative transform -rotate-6 w-3/4 max-w-sm mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl opacity-30 blur-xl"></div>
                            <img
                                src={appScreenshot}
                                alt="App Screenshot"
                                className="relative rounded-2xl shadow-2xl w-full border-8 border-white"
                            />
                        </div>
                    </div>

                    {/* Hero Text */}
                    <div className="order-1 md:order-2">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            No download.<br/>
                            No hassle.<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400"> Just a few clicks.</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-600">
                            Effortlessly <span className="underline">split bills with friends</span> using a shareable link.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <Link to="/scan" className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                <span>Scan Receipt</span>
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <a href="#features" className="flex items-center justify-center space-x-2 bg-white text-gray-900 px-8 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                How It Works
                            </a>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-12 flex items-center space-x-8">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-5 w-5 text-green-500" />
                                <span className="text-sm text-gray-600">Secure & Private</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3-Step Guide Section */}
            <section className="py-48 bg-white bg-opacity-50" id="features">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
                        <p className="mt-4 text-xl text-gray-600">It's as simple as 1, 2, 3</p>
                    </div>
                    
                    <div className="relative">                        
                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {steps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <div className="relative">
                                        {/* Step Number */}
                                        <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 text-white rounded-full flex items-center justify-center z-10">
                                            {index + 1}
                                        </div>
                                        {/* Image Container */}
                                        <div className="relative w-80 h-80 mx-auto">
                                            <img
                                                src={step.image}
                                                alt={step.title}
                                                className="relative rounded-2xl shadow-xl object-cover w-full h-full"
                                            />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-2">{step.title}</h3>
                                    <p className="text-gray-600 text-center">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <Zap className="h-6 w-6 text-blue-600" />
                                <span className="text-xl font-bold text-gray-900">Bill Club</span>
                            </div>
                            <p className="text-gray-600 mb-4">
                                The easiest way to split bills with your friends and friends.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-gray-600 hover:text-gray-900">Features</a></li>
                                <li><a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
                                <li><a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><a href="#about" className="text-gray-600 hover:text-gray-900">About</a></li>
                                <li><a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a></li>
                                <li><a href="#privacy" className="text-gray-600 hover:text-gray-900">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            © {new Date().getFullYear()} Bill Club. All rights reserved.
                        </p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-gray-600">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-600">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-600">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
