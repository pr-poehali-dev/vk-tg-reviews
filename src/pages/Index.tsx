import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GroupCard from '@/components/GroupCard';
import ReviewCard from '@/components/ReviewCard';
import Header from '@/components/Header';
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

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupDialogOpen, setNewGroupDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    platform: '',
    members: '',
    description: '',
    link: ''
  });
  const [newReviewData, setNewReviewData] = useState({
    user_name: '',
    rating: 5,
    text: ''
  });

  useEffect(() => {
    fetchGroups();
    fetchReviews();
  }, []);

  const fetchGroups = async (search = '', platform = '', sort = 'created_at') => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (platform) params.append('platform', platform);
      if (sort) params.append('sort', sort);
      
      const response = await fetch(`${API_GROUPS}?${params}`);
      const data = await response.json();
      setGroups(data.map((g: any) => ({
        ...g,
        rating: parseFloat(g.rating) || 0,
        reviewsCount: g.reviews_count
      })));
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(API_REVIEWS);
      const data = await response.json();
      setReviews(data.map((r: any) => ({
        ...r,
        userName: r.user_name,
        groupName: r.group_name,
        date: new Date(r.created_at).toLocaleDateString('ru-RU')
      })));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupData.name || !newGroupData.platform) {
      alert('Заполните название и платформу');
      return;
    }

    try {
      const response = await fetch(API_GROUPS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroupData)
      });
      
      if (response.ok) {
        setNewGroupDialogOpen(false);
        setNewGroupData({ name: '', platform: '', members: '', description: '', link: '' });
        fetchGroups();
      }
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const handleWriteReview = (groupId: number) => {
    setSelectedGroupId(groupId);
    setReviewDialogOpen(true);
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
          group_id: selectedGroupId,
          ...newReviewData
        })
      });
      
      if (response.ok) {
        setReviewDialogOpen(false);
        setNewReviewData({ user_name: '', rating: 5, text: '' });
        setSelectedGroupId(null);
        fetchReviews();
        fetchGroups();
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          <nav className="flex items-center gap-1">
            <Button
              variant={activeTab === 'home' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('home')}
              size="sm"
            >
              <Icon name="Home" size={16} className="mr-2" />
              Главная
            </Button>
            <Button
              variant={activeTab === 'search' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('search')}
              size="sm"
            >
              <Icon name="Search" size={16} className="mr-2" />
              Поиск
            </Button>
            <Button
              variant={activeTab === 'top' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('top')}
              size="sm"
            >
              <Icon name="Trophy" size={16} className="mr-2" />
              Топ групп
            </Button>
            <Button
              variant={activeTab === 'reviews' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('reviews')}
              size="sm"
            >
              <Icon name="MessageSquare" size={16} className="mr-2" />
              Все отзывы
            </Button>

          </nav>

          <div className="flex items-center gap-2">
            <Dialog open={newGroupDialogOpen} onOpenChange={setNewGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить группу
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Добавить группу</DialogTitle>
                  <DialogDescription>
                    Добавьте группу ВКонтакте или Telegram для получения отзывов
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Название группы</Label>
                    <Input 
                      id="name" 
                      placeholder="IT Специалисты" 
                      value={newGroupData.name}
                      onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="platform">Платформа</Label>
                    <Select value={newGroupData.platform} onValueChange={(value) => setNewGroupData({...newGroupData, platform: value})}>
                      <SelectTrigger id="platform">
                        <SelectValue placeholder="Выберите платформу" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vk">ВКонтакте</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="members">Количество подписчиков</Label>
                    <Input 
                      id="members" 
                      placeholder="10K" 
                      value={newGroupData.members}
                      onChange={(e) => setNewGroupData({...newGroupData, members: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="link">Ссылка на группу</Label>
                    <Input 
                      id="link" 
                      placeholder="https://t.me/example" 
                      value={newGroupData.link}
                      onChange={(e) => setNewGroupData({...newGroupData, link: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Краткое описание группы" 
                      rows={3}
                      value={newGroupData.description}
                      onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddGroup}>Добавить</Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm">
              <Icon name="User" size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            <section className="text-center py-12 px-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Отзывы на группы ВК и Telegram
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Найдите лучшие сообщества, читайте честные отзывы и делитесь своим опытом
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input
                  placeholder="Поиск по названию группы..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Icon name="Search" size={18} />
                </Button>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">Топ сообществ</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('top')}>
                  Смотреть все
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Загрузка...</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groups.slice(0, 6).map((group) => (
                    <GroupCard key={group.id} {...group} onWriteReview={handleWriteReview} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">Последние отзывы</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('reviews')}>
                  Все отзывы
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </div>
              <div className="grid gap-4">
                {reviews.slice(0, 6).map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    userName={review.user_name}
                    userAvatar={review.user_avatar}
                    rating={review.rating}
                    date={formatDate(review.created_at)}
                    text={review.text}
                    groupName={review.group_name}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Поиск групп</h2>
              <div className="flex gap-2 max-w-2xl">
                <Input
                  placeholder="Введите название группы..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => fetchGroups(searchQuery)}>
                  <Icon name="Search" size={18} className="mr-2" />
                  Найти
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full" onValueChange={(value) => {
              const platform = value === 'all' ? '' : value;
              fetchGroups(searchQuery, platform);
            }}>
              <TabsList>
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="vk">ВКонтакте</TabsTrigger>
                <TabsTrigger value="telegram">Telegram</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {groups.map((group) => (
                    <GroupCard key={group.id} {...group} onWriteReview={handleWriteReview} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="vk" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {groups.filter(g => g.platform === 'vk').map((group) => (
                    <GroupCard key={group.id} {...group} onWriteReview={handleWriteReview} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="telegram" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {groups.filter(g => g.platform === 'telegram').map((group) => (
                    <GroupCard key={group.id} {...group} onWriteReview={handleWriteReview} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === 'top' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Топ групп по рейтингу</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...groups].sort((a, b) => b.rating - a.rating).map((group, index) => (
                <div key={group.id} className="relative">
                  {index < 3 && (
                    <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                  )}
                  <GroupCard {...group} onWriteReview={handleWriteReview} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Все отзывы</h2>
            <div className="grid gap-4 max-w-3xl">
              {reviews.map((review) => (
                <ReviewCard 
                  key={review.id} 
                  userName={review.user_name}
                  userAvatar={review.user_avatar}
                  rating={review.rating}
                  date={formatDate(review.created_at)}
                  text={review.text}
                  groupName={review.group_name}
                />
              ))}
            </div>
          </div>
        )}


      </main>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Написать отзыв</DialogTitle>
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

      <footer className="border-t mt-20">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                <Icon name="Star" size={16} className="fill-current" />
              </div>
              <span className="font-semibold text-foreground">ReviewHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ReviewHub. Платформа отзывов на сообщества
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;