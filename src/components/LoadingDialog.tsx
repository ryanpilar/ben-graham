import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader } from 'lucide-react'; // Make sure you've installed lucide-react

const LoadingDialog = () => (
  <Dialog open={true}>
    <DialogContent className="flex justify-center items-center">
      <div className="animate-spin">
        <Loader size={32} /> 
      </div>
    </DialogContent>
  </Dialog>
);

export default LoadingDialog