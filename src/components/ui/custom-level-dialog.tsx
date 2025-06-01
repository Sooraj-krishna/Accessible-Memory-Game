import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomLevelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rows: number, cols: number) => void;
  theme: 'attractive' | 'high-contrast';
}

export const CustomLevelDialog: React.FC<CustomLevelDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  theme
}) => {
  const [rows, setRows] = React.useState('2');
  const [cols, setCols] = React.useState('2');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let numRows = parseInt(rows);
    let numCols = parseInt(cols);
    if (isNaN(numRows) || isNaN(numCols)) {
      setError('Please enter valid numbers');
      return;
    }
    // Clamp values between 2 and 10
    if (numRows < 2) numRows = 2;
    if (numRows > 10) numRows = 10;
    if (numCols < 2) numCols = 2;
    if (numCols > 10) numCols = 10;
    if ((numRows * numCols) % 2 !== 0) {
      setError('Total number of cards must be even');
      return;
    }
    onSubmit(numRows, numCols);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${theme === 'high-contrast' ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-white'} p-6 rounded-xl`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${theme === 'high-contrast' ? 'text-yellow-400' : 'text-purple-600'}`}>
            Create Custom Level
          </DialogTitle>
          <DialogDescription className={theme === 'high-contrast' ? 'text-yellow-400/80' : 'text-gray-600'}>
            Choose your grid size (2x2 to 10x10, default is 2x2)
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="rows" className={theme === 'high-contrast' ? 'text-yellow-400' : 'text-gray-700'}>
                Number of Rows
              </Label>
              <Input
                id="rows"
                type="number"
                min="2"
                max="10"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                className={`mt-1 ${theme === 'high-contrast' ? 'bg-gray-900 text-yellow-400 border-yellow-400' : 'bg-white'}`}
              />
            </div>
            
            <div>
              <Label htmlFor="cols" className={theme === 'high-contrast' ? 'text-yellow-400' : 'text-gray-700'}>
                Number of Columns
              </Label>
              <Input
                id="cols"
                type="number"
                min="2"
                max="10"
                value={cols}
                onChange={(e) => setCols(e.target.value)}
                className={`mt-1 ${theme === 'high-contrast' ? 'bg-gray-900 text-yellow-400 border-yellow-400' : 'bg-white'}`}
              />
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm mt-2">
              {error}
            </p>
          )}
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`${theme === 'high-contrast' ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20' : 'border-gray-300'}`}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={theme === 'high-contrast' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-purple-600 text-white hover:bg-purple-700'}
            >
              Create Level
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 