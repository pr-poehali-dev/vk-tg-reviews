import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReviewCard from '@/components/ReviewCard';
import Icon from '@/components/ui/icon';

const API_GROUPS = 'https://functions.poehali.dev/c2549759-4ecf-4f2e-ad07-63ae790e3b2b';
const API_REVIEWS = 'https://functions.poehali.dev/3c8a0c55-f530-4c42-8527-f6e7e69ca7cf';

interface Group {
  id: number;
  name: string;
  platform: 'vk' | 'telegram';
  members: string;
  rating: number;
  reviews_count: number;
  description: string;
  link?: string;
  avatar?: string;
}

interface Review {
  id: number;
  group_id: number;
  user_name: string;
  user_avatar?: string;
  rating: number;
  text: string;
  created_at: string;
  group_name: string;
}

interface RatingStats {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

const GroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newReviewData, setNewReviewData] = useState({
    user_name: '',
    rating: 5,
    text: ''
  });

  useEffect(() => {
    if (id) {
      fetchGroupData();
      fetchGroupReviews();
    }
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const response = await fetch(API_GROUPS);
      const data = await response.json();
      const foundGroup = data.find((g: any) => g.id === parseInt(id || '0'));
      
      if (foundGroup) {
        setGroup({
          ...foundGroup,
          rating: parseFloat(foundGroup.rating) || 0,
          reviewsCount: foundGroup.reviews_count
        });
      }
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupReviews = async () => {
    try {
      const response = await fetch(`${API_REVIEWS}?group_id=${id}`);
      const data = await response.json();
      setReviews(data);
      
      const stats: RatingStats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      data.forEach((review: Review) => {
        stats[review.rating as keyof RatingStats]++;
      });
      setRatingStats(stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReviewData.user_name || !newReviewData.text) {
      alert('Заполните все поля');
      return;
    }

    try {
      const response = await fetch(API_REVIEWS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: parseInt(id || '0'),
          ...newReviewData
        })
      });
      
      if (response.ok) {
        setReviewDialogOpen(false);
        setNewReviewData({ user_name: '', rating: 5, text: '' });
        fetchGroupReviews();
        fetchGroupData();
      }
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'сегодня';
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дня назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недели назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const renderRatingBar = (rating: number) => {
    const count = ratingStats[rating as keyof RatingStats];
    const total = reviews.length;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground min-w-[60px]">{rating} ⭐</span>
        <div className="flex-1 bg-muted rounded-full h-3">
          <div 
            className="bg-secondary h-3 rounded-full transition-all duration-300" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground min-w-[40px] text-right">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Группа не найдена</p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center gap-4 px-4 max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
              <Icon name="Star" size={20} className="fill-current" />
            </div>
            <h1 className="text-xl font-bold text-foreground">ReviewHub</h1>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="text-center mb-6">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={group.avatar} alt={group.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                    {group.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold text-foreground mb-2">{group.name}</h1>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Badge variant={group.platform === 'vk' ? 'default' : 'secondary'}>
                    {group.platform === 'vk' ? (
                      <span className="flex items-center gap-1">
                        <Icon name="Users" size={14} />
                        ВКонтакте
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Icon name="Send" size={14} />
                        Telegram
                      </span>
                    )}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{group.members} подписчиков</p>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Icon name="Star" size={32} className="fill-secondary text-secondary" />
                  <span className="text-4xl font-bold text-foreground">{group.rating.toFixed(1)}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{reviews.length} отзывов</p>
                
                <Button className="w-full mb-3" onClick={() => setReviewDialogOpen(true)}>
                  <Icon name="MessageSquare" size={16} className="mr-2" />
                  Написать отзыв
                </Button>
                
                {group.link && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={group.link} target="_blank" rel="noopener noreferrer">
                      <Icon name="ExternalLink" size={16} className="mr-2" />
                      Перейти в группу
                    </a>
                  </Button>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Статистика оценок</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating}>
                      {renderRatingBar(rating)}
                    </div>
                  ))}
                </div>
              </div>

              {group.description && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Описание</h3>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-6">Отзывы пользователей</h2>
            
            {reviews.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Пока нет отзывов на эту группу</p>
                <Button onClick={() => setReviewDialogOpen(true)}>
                  Написать первый отзыв
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    userName={review.user_name}
                    userAvatar={review.user_avatar}
                    rating={review.rating}
                    date={formatDate(review.created_at)}
                    text={review.text}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Написать отзыв на {group.name}</DialogTitle>
            <DialogDescription>
              Поделитесь своим опытом о группе
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reviewer-name">Ваше имя</Label>
              <Input
                id="reviewer-name"
                value={newReviewData.user_name}
                onChange={(e) => setNewReviewData({ ...newReviewData, user_name: e.target.value })}
                placeholder="Введите ваше имя"
              />
            </div>
            <div>
              <Label htmlFor="rating">Оценка</Label>
              <Select
                value={String(newReviewData.rating)}
                onValueChange={(value) => setNewReviewData({ ...newReviewData, rating: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2)</SelectItem>
                  <SelectItem value="1">⭐ (1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="review-text">Отзыв</Label>
              <Textarea
                id="review-text"
                value={newReviewData.text}
                onChange={(e) => setNewReviewData({ ...newReviewData, text: e.target.value })}
                placeholder="Напишите ваш отзыв..."
                rows={4}
              />
            </div>
            <Button className="w-full" onClick={handleSubmitReview}>Отправить отзыв</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupPage;
