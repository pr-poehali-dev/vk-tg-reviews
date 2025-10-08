import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface GroupCardProps {
  id: number;
  name: string;
  platform: 'vk' | 'telegram';
  members: string;
  rating: number;
  reviewsCount: number;
  description: string;
  avatar?: string;
  onWriteReview?: (groupId: number) => void;
}

export default function GroupCard({
  id,
  name,
  platform,
  members,
  rating,
  reviewsCount,
  description,
  avatar,
  onWriteReview
}: GroupCardProps) {
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={16}
        className={i < Math.floor(rating) ? 'fill-secondary text-secondary' : 'text-muted-foreground'}
      />
    ));
  };

  return (
    <Card className="p-5 hover:shadow-lg transition-shadow duration-300 animate-fade-in bg-card">
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg text-foreground mb-1">{name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={platform === 'vk' ? 'default' : 'secondary'} className="text-xs">
                  {platform === 'vk' ? (
                    <span className="flex items-center gap-1">
                      <Icon name="Users" size={12} />
                      ВКонтакте
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Icon name="Send" size={12} />
                      Telegram
                    </span>
                  )}
                </Badge>
                <span className="text-sm text-muted-foreground">{members} подписчиков</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {renderStars()}
            </div>
            <span className="font-bold text-foreground">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({reviewsCount} отзывов)</span>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Icon name="Eye" size={16} className="mr-2" />
              Отзывы
            </Button>
            {onWriteReview && (
              <Button size="sm" className="flex-1 sm:flex-none" onClick={() => onWriteReview(id)}>
                <Icon name="MessageSquare" size={16} className="mr-2" />
                Написать
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}