import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface ReviewCardProps {
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  text: string;
  groupName?: string;
}

export default function ReviewCard({
  userName,
  userAvatar,
  rating,
  date,
  text,
  groupName
}: ReviewCardProps) {
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={14}
        className={i < Math.floor(rating) ? 'fill-secondary text-secondary' : 'text-muted-foreground'}
      />
    ));
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-300 animate-fade-in">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {userName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-sm text-foreground">{userName}</h4>
              {groupName && <p className="text-xs text-muted-foreground">Отзыв на {groupName}</p>}
            </div>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>

          <div className="flex items-center gap-1 mb-2">
            {renderStars()}
          </div>

          <p className="text-sm text-foreground leading-relaxed">{text}</p>
        </div>
      </div>
    </Card>
  );
}