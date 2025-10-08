import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

const API_STATS = 'https://functions.poehali.dev/c2549759-4ecf-4f2e-ad07-63ae790e3b2b?stats=true';

interface GroupStats {
  id: number;
  name: string;
  platform: 'vk' | 'telegram';
  avatar?: string;
  members_count: string;
  avg_rating: number;
  reviews_count: number;
  rating_distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
  created_at: string;
}

const StatsPage = () => {
  const [stats, setStats] = useState<GroupStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(API_STATS);
      const data = await response.json();
      setStats(data.stats || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const renderRatingBar = (count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-secondary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground min-w-[30px]">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Загрузка статистики...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {stats.map((group) => (
          <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={group.avatar} alt={group.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                  {group.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-xl text-foreground mb-1">{group.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={group.platform === 'vk' ? 'default' : 'secondary'}>
                        {group.platform === 'vk' ? (
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
                      <span className="text-sm text-muted-foreground">{group.members_count} подписчиков</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Icon name="Star" size={20} className="fill-secondary text-secondary" />
                      <span className="text-2xl font-bold text-foreground">{group.avg_rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{group.reviews_count} отзывов</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Распределение оценок:</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground min-w-[60px]">5 ⭐</span>
                      {renderRatingBar(group.rating_distribution['5'], group.reviews_count)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground min-w-[60px]">4 ⭐</span>
                      {renderRatingBar(group.rating_distribution['4'], group.reviews_count)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground min-w-[60px]">3 ⭐</span>
                      {renderRatingBar(group.rating_distribution['3'], group.reviews_count)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground min-w-[60px]">2 ⭐</span>
                      {renderRatingBar(group.rating_distribution['2'], group.reviews_count)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground min-w-[60px]">1 ⭐</span>
                      {renderRatingBar(group.rating_distribution['1'], group.reviews_count)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {stats.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Статистика пока недоступна</p>
        </div>
      )}
    </div>
  );
};

export default StatsPage;