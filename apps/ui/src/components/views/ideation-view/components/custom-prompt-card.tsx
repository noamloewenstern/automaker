/**
 * CustomPromptCard - Entry point card for custom prompt creation
 * Used in category grid and at bottom of prompt lists
 */

import { PenLine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CustomPromptCardProps {
  categoryLabel?: string;
  onClick: () => void;
}

export function CustomPromptCard({ categoryLabel, onClick }: CustomPromptCardProps) {
  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1 border-dashed border-2"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
            <PenLine className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              Custom Prompt
            </h3>
            <p className="text-muted-foreground text-sm">
              {categoryLabel
                ? `Write custom instructions for ${categoryLabel} ideas`
                : 'Write your own instructions to generate ideas'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * CustomPromptListCard - Variant for the prompt list (horizontal layout)
 */
export function CustomPromptListCard({ categoryLabel, onClick }: CustomPromptCardProps) {
  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-md hover:-translate-x-1 border-dashed border-2"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-5">
          <div className="p-3 rounded-xl shrink-0 bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
            <PenLine className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              Custom Prompt
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {categoryLabel
                ? `Write custom instructions to generate ${categoryLabel} ideas`
                : 'Write your own instructions to generate ideas'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
