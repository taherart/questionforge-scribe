
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Settings, Database, FileQuestion } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", path: "/", icon: <Home size={20} /> },
  { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-16 md:w-64 h-screen sticky top-0 bg-background border-r z-10">
      <div className="h-full flex flex-col">
        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center md:justify-start space-x-2"
          >
            <div className="w-8 h-8 rounded-full bg-primary/80 backdrop-blur flex items-center justify-center text-white font-bold">
              <FileQuestion size={18} />
            </div>
            <h1 className="hidden md:block text-xl font-semibold">MSQ Creator</h1>
          </motion.div>
        </div>
        
        <nav className="mt-4 flex-1">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center justify-center md:justify-start gap-x-3 px-3 py-3 rounded-md text-sm font-medium transition-all",
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.name}</span>
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto p-4 border-t hidden md:block">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Data Status</span>
              <div className="flex items-center mt-1">
                <Database size={14} className="text-primary mr-1" />
                <span className="text-xs font-medium">Connected</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-subtle"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
