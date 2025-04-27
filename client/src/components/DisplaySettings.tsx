import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DisplaySettingsProps {
  showThreeLevels: boolean;
  onShowThreeLevelsChange: (value: boolean) => void;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  showThreeLevels,
  onShowThreeLevelsChange
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          <span>Настройки отображения</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Настройки дерева</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-three-levels" 
              checked={showThreeLevels}
              onCheckedChange={(checked) => {
                onShowThreeLevelsChange(checked === true);
              }}
            />
            <Label htmlFor="show-three-levels" className="cursor-pointer">
              Отображать 3 уровня дерева
            </Label>
          </div>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DisplaySettings;