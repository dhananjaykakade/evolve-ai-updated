
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle, ShieldAlert } from 'lucide-react';

interface TestRulesDialogProps {
  testType: 'mcq' | 'coding' | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
}

const TestRulesDialog: React.FC<TestRulesDialogProps> = ({ 
  testType, 
  open, 
  onOpenChange, 
  onStart 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldAlert className="h-5 w-5 text-warning" />
            Important Test Rules
          </DialogTitle>
          <DialogDescription>
            Please read the following rules carefully before starting the test.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="bg-accent/40 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Test Environment Rules:</h3>
            <ul className="space-y-2 pl-5">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <span>The test will run in <strong>fullscreen mode</strong> and cannot be exited until completion.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <span>Switching tabs or windows will trigger a warning.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <span>Right-clicking, F12, and developer tools are disabled.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <span>Copy/paste is disabled in MCQ tests (but allowed in coding tests).</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>After <strong>three warnings</strong>, your test will be automatically terminated.</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{testType === 'mcq' ? 'MCQ' : 'Coding'} Test Information:</h3>
            <ul className="space-y-1 pl-5">
              {testType === 'mcq' ? (
                <>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Multiple choice questions with 4 options each.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>You can use Skip, Save, Review, and Submit buttons to navigate.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Skipped or flagged questions can be revisited before final submission.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>LeetCode-style coding environment with problem statement and test cases.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>You can run your code against test cases before final submission.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Copy/paste is allowed for code in the coding editor only.</span>
                  </li>
                </>
              )}
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Time limit: {testType === 'mcq' ? '30' : '60'} minutes</span>
              </li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onStart} className="w-full sm:w-auto">
            I understand & Start Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestRulesDialog;
