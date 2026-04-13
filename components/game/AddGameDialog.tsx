'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Game, GameRequirements } from '@/lib/types';

interface AddGameDialogProps {
  onAdd: (game: Omit<Game, 'id'>) => void;
}

export function AddGameDialog({ onAdd }: AddGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [requirements, setRequirements] = useState<GameRequirements>({
    minCpu: '',
    minGpu: '',
    minRam: 8,
    minStorage: 50,
    recCpu: '',
    recGpu: '',
    recRam: 16,
    recStorage: 50,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !requirements.minCpu || !requirements.minGpu) return;

    onAdd({
      name: name.trim(),
      requirements,
      isCustom: true,
    });

    // Reset form
    setName('');
    setRequirements({
      minCpu: '',
      minGpu: '',
      minRam: 8,
      minStorage: 50,
      recCpu: '',
      recGpu: '',
      recRam: 16,
      recStorage: 50,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Game
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Custom Game</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Game Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter game name"
              required
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Minimum Requirements</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minCpu">CPU</Label>
                <Input
                  id="minCpu"
                  value={requirements.minCpu}
                  onChange={(e) => setRequirements(r => ({ ...r, minCpu: e.target.value }))}
                  placeholder="e.g., Intel Core i5-6600"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minGpu">GPU</Label>
                <Input
                  id="minGpu"
                  value={requirements.minGpu}
                  onChange={(e) => setRequirements(r => ({ ...r, minGpu: e.target.value }))}
                  placeholder="e.g., GTX 1060"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minRam">RAM (GB)</Label>
                <Input
                  id="minRam"
                  type="number"
                  value={requirements.minRam}
                  onChange={(e) => setRequirements(r => ({ ...r, minRam: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStorage">Storage (GB)</Label>
                <Input
                  id="minStorage"
                  type="number"
                  value={requirements.minStorage}
                  onChange={(e) => setRequirements(r => ({ ...r, minStorage: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Recommended Requirements (Optional)</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recCpu">CPU</Label>
                <Input
                  id="recCpu"
                  value={requirements.recCpu || ''}
                  onChange={(e) => setRequirements(r => ({ ...r, recCpu: e.target.value }))}
                  placeholder="e.g., Intel Core i7-8700K"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recGpu">GPU</Label>
                <Input
                  id="recGpu"
                  value={requirements.recGpu || ''}
                  onChange={(e) => setRequirements(r => ({ ...r, recGpu: e.target.value }))}
                  placeholder="e.g., RTX 2070"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recRam">RAM (GB)</Label>
                <Input
                  id="recRam"
                  type="number"
                  value={requirements.recRam || ''}
                  onChange={(e) => setRequirements(r => ({ ...r, recRam: parseInt(e.target.value) || undefined }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recStorage">Storage (GB)</Label>
                <Input
                  id="recStorage"
                  type="number"
                  value={requirements.recStorage || ''}
                  onChange={(e) => setRequirements(r => ({ ...r, recStorage: parseInt(e.target.value) || undefined }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Game</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
