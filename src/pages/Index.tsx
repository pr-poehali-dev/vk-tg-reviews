import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GroupCard from '@/components/GroupCard';
import ReviewCard from '@/components/ReviewCard';
import Icon from '@/components/ui/icon';

const mockGroups = [
  {
    id: 1,
    name: 'IT Специалисты',
    platform: 'telegram' as const,
    members: '81K',
    rating: 4.8,
    reviewsCount: 120,
    description: 'Сообщество IT специалистов для обмена опытом и поиска работы',
  },
  {
    id: 2,
    name: 'Дизайн и творчество',
    platform: 'vk' as const,
    members: '300K',
    rating: 4.5,
    reviewsCount: 89,
    description: 'Группа для дизайнеров, художников и всех творческих людей',
  },
  {
    id: 3,
    name: 'Маркетинг PRO',
    platform: 'telegram' as const,
    members: '45K',
    rating: 4.9,
    reviewsCount: 203,
    description: 'Профессиональное сообщество маркетологов и SMM специалистов',
  },
];

const mockReviews = [
  {
    id: 1,
    userName: 'Анна Смирнова',
    rating: 5,
    date: '2 дня назад',
    text: 'Отличное сообщество! Много полезной информации и активное общение. Рекомендую всем IT специалистам.',
    groupName: 'IT Специалисты',
  },
  {
    id: 2,
    userName: 'Дмитрий Иванов',
    rating: 4,
    date: '5 дней назад',
    text: 'Хорошая группа, но иногда много офтопа. В целом доволен контентом и участниками.',
    groupName: 'Дизайн и творчество',
  },
  {
    id: 3,
    userName: 'Мария Петрова',
    rating: 5,
    date: 'неделю назад',
    text: 'Лучший канал по маркетингу! Регулярно делятся кейсами и полезными материалами.',
    groupName: 'Маркетинг PRO',
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
              <Icon name="Star" size={20} className="fill-current" />
            </div>
            <h1 className="text-xl font-bold text-foreground">ReviewHub</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
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
            <Dialog>
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
                    <Input id="name" placeholder="IT Специалисты" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="platform">Платформа</Label>
                    <Select>
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
                    <Label htmlFor="link">Ссылка на группу</Label>
                    <Input id="link" placeholder="https://t.me/example" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea id="description" placeholder="Краткое описание группы" rows={3} />
                  </div>
                  <Button className="w-full">Добавить</Button>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockGroups.map((group) => (
                  <GroupCard key={group.id} {...group} />
                ))}
              </div>
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
                {mockReviews.map((review) => (
                  <ReviewCard key={review.id} {...review} />
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
                <Button>
                  <Icon name="Search" size={18} className="mr-2" />
                  Найти
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="vk">ВКонтакте</TabsTrigger>
                <TabsTrigger value="telegram">Telegram</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {mockGroups.map((group) => (
                    <GroupCard key={group.id} {...group} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="vk" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {mockGroups.filter(g => g.platform === 'vk').map((group) => (
                    <GroupCard key={group.id} {...group} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="telegram" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {mockGroups.filter(g => g.platform === 'telegram').map((group) => (
                    <GroupCard key={group.id} {...group} />
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
              {[...mockGroups].sort((a, b) => b.rating - a.rating).map((group, index) => (
                <div key={group.id} className="relative">
                  {index < 3 && (
                    <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                      {index + 1}
                    </div>
                  )}
                  <GroupCard {...group} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Все отзывы</h2>
            <div className="grid gap-4 max-w-3xl">
              {mockReviews.map((review) => (
                <ReviewCard key={review.id} {...review} />
              ))}
            </div>
          </div>
        )}
      </main>

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