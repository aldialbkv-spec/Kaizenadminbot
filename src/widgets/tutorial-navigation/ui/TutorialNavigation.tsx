import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import type { TutorialWithProgress } from '../../../entities/tutorial';

interface TutorialNavigationProps {
  tutorials: TutorialWithProgress[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function TutorialNavigation({ 
  tutorials, 
  currentIndex, 
  onNavigate 
}: TutorialNavigationProps) {
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < tutorials.length - 1;
  const currentTutorial = tutorials[currentIndex];
  const watchedCount = tutorials.filter(t => t.watched).length;

  return (
    <div className="space-y-4">
      {/* Navigation Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={!hasPrevious}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 size-4" />
              Предыдущее
            </Button>

            <div className="text-center">
              <div className="text-sm font-medium">
                {currentIndex + 1} / {tutorials.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Просмотрено: {watchedCount}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={!hasNext}
              className="flex-1"
            >
              Следующее
              <ChevronRight className="ml-2 size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial List */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Все видео</h3>
          <div className="space-y-2">
            {tutorials.map((tutorial, index) => (
              <button
                key={tutorial.id}
                onClick={() => onNavigate(index)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  index === currentIndex
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-accent border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {tutorial.watched ? (
                      <CheckCircle2 className="size-5 text-green-500" />
                    ) : (
                      <Circle className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {tutorial.title}
                      </span>
                      {index === currentIndex && (
                        <Badge variant="default" className="text-xs">
                          Сейчас
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(tutorial.duration / 60)}:{String(tutorial.duration % 60).padStart(2, '0')}
                      </span>
                      {tutorial.lastPosition > 0 && !tutorial.watched && (
                        <Badge variant="outline" className="text-xs">
                          {Math.floor((tutorial.lastPosition / tutorial.duration) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
