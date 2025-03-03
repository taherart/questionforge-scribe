
import { motion } from "framer-motion";
import { RefreshCw, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ScanBooksButtonProps {
  isScanning: boolean;
  onScan: (showToast: boolean) => Promise<void>;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ScanBooksButton: React.FC<ScanBooksButtonProps> = ({ isScanning, onScan }) => {
  const handleScan = async () => {
    try {
      await onScan(true);
    } catch (error) {
      console.error("Error scanning for books:", error);
      toast.error("Failed to scan for books. Please try again.");
    }
  };

  return (
    <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
      <Button 
        onClick={handleScan} 
        disabled={isScanning}
        className="group relative"
        variant="default"
      >
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
            <span>Scan for New PDFs with AI</span>
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default ScanBooksButton;
