
import { motion } from "framer-motion";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScanBooksButtonProps {
  isScanning: boolean;
  onScan: (showToast: boolean) => Promise<void>;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ScanBooksButton: React.FC<ScanBooksButtonProps> = ({ isScanning, onScan }) => {
  return (
    <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
      <Button 
        onClick={() => onScan(true)} 
        disabled={isScanning}
        className="group"
      >
        {isScanning ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
        )}
        Scan for New PDFs
      </Button>
    </motion.div>
  );
};

export default ScanBooksButton;
