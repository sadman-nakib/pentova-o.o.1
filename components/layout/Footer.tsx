
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/5 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-white">
            PENTOVA
          </Link>
          <p className="mt-4 text-gray-400 max-w-sm">
            The next generation of tech essentials. High-end gadgets designed for performance, built for the future.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/products?category=audio" className="hover:text-white transition-colors">Audio</Link></li>
            <li><Link to="/products?category=wearables" className="hover:text-white transition-colors">Wearables</Link></li>
            <li><Link to="/products?category=smart-home" className="hover:text-white transition-colors">Smart Home</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Support</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/orders" className="hover:text-white transition-colors">Order Tracking</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} Pentova Technologies. All Rights Reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">X / Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Discord</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
