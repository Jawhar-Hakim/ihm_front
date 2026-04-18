import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Brand Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Hire<span className="text-blue-500">Flow</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-xs">
            Connecting the world's best talent with the most innovative companies. 
            Your next career move starts here.
          </p>
          <div className="flex space-x-4 pt-2">
            {/* Replace # with your social links */}
            <a href="#" className="hover:text-blue-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-blue-400 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-blue-400 transition-colors">GitHub</a>
          </div>
        </div>

        {/* For Candidates */}
        <div>
          <h3 className="text-white font-semibold mb-6">For Candidates</h3>
          <ul className="space-y-4 text-sm">
            <li><a href="/jobs" className="hover:text-white transition-colors">Browse Jobs</a></li>
            <li><a href="/categories" className="hover:text-white transition-colors">Job Categories</a></li>
            <li><a href="/resume-builder" className="hover:text-white transition-colors">Resume Builder</a></li>
            <li><a href="/alerts" className="hover:text-white transition-colors">Job Alerts</a></li>
          </ul>
        </div>

        {/* For Employers */}
        <div>
          <h3 className="text-white font-semibold mb-6">For Employers</h3>
          <ul className="space-y-4 text-sm">
            <li><a href="/post-job" className="hover:text-white transition-colors">Post a Job</a></li>
            <li><a href="/hiring-solutions" className="hover:text-white transition-colors">Hiring Solutions</a></li>
            <li><a href="/pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
            <li><a href="/resources" className="hover:text-white transition-colors">Recruiter Resources</a></li>
          </ul>
        </div>

        {/* Support & Newsletter */}
        <div className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-6">Support</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subscribe to newsletters</label>
            <form className="mt-2 flex">
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full bg-slate-800 border-none rounded-l-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white text-sm"
              />
              <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-r-md transition-colors text-white font-medium text-sm">
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs">
        <p>&copy; {new Date().getFullYear()} JobConnect Inc. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">Cookie Policy</a>
          <a href="#" className="hover:text-white">Trust & Safety</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;