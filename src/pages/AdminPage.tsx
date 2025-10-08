import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Group {
  id: number;
  name: string;
  platform: string;
  avatar: string;
  members: number;
  rating: number;
  description: string;
  link: string;
  vk_group_id?: string;
  telegram_channel_id?: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'vk',
    avatar: '',
    members: 0,
    description: '',
    link: '',
    vk_group_id: '',
    telegram_channel_id: '',
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/c2549759-4ecf-4f2e-ad07-63ae790e3b2b');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      platform: group.platform,
      avatar: group.avatar,
      members: group.members,
      description: group.description || '',
      link: group.link || '',
      vk_group_id: group.vk_group_id || '',
      telegram_channel_id: group.telegram_channel_id || '',
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedGroup) return;

    try {
      const response = await fetch('https://functions.poehali.dev/c2549759-4ecf-4f2e-ad07-63ae790e3b2b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setEditDialogOpen(false);
      fetchGroups();
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Ошибка при обновлении группы');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Управление группами</h1>
            <p className="text-muted-foreground">Редактирование информации и настройка API</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={group.avatar}
                    alt={group.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{group.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon
                        name={group.platform === 'vk' ? 'MessageCircle' : 'Send'}
                        size={14}
                      />
                      <span>{group.platform === 'vk' ? 'ВКонтакте' : 'Telegram'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{group.members.toLocaleString()} подписчиков</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Star" size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Рейтинг: {group.rating.toFixed(1)}</span>
                  </div>
                  {group.vk_group_id && (
                    <div className="flex items-center gap-2">
                      <Icon name="Hash" size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">VK ID: {group.vk_group_id}</span>
                    </div>
                  )}
                  {group.telegram_channel_id && (
                    <div className="flex items-center gap-2">
                      <Icon name="AtSign" size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">TG: {group.telegram_channel_id}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/group/${group.id}`)}
                  >
                    <Icon name="Eye" size={16} className="mr-2" />
                    Просмотр
                  </Button>
                  <Button className="flex-1" onClick={() => handleEdit(group)}>
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактирование группы</DialogTitle>
            <DialogDescription>
              Обновите информацию о группе и укажите ID для загрузки статистики
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название группы</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Платформа</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vk">ВКонтакте</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">URL аватара</Label>
              <Input
                id="avatar"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="members">Количество подписчиков</Label>
              <Input
                id="members"
                type="number"
                value={formData.members}
                onChange={(e) => setFormData({ ...formData, members: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Ссылка на группу</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://vk.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Icon name="BarChart3" size={18} />
                Настройки API для статистики
              </h4>

              {formData.platform === 'vk' && (
                <div className="space-y-2">
                  <Label htmlFor="vk_group_id">
                    ID группы ВКонтакте
                    <span className="text-xs text-muted-foreground ml-2">
                      (короткое имя или числовой ID)
                    </span>
                  </Label>
                  <Input
                    id="vk_group_id"
                    value={formData.vk_group_id}
                    onChange={(e) => setFormData({ ...formData, vk_group_id: e.target.value })}
                    placeholder="apiclub или 1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Найти в адресе группы: vk.com/<strong>apiclub</strong> или vk.com/club<strong>1</strong>
                  </p>
                </div>
              )}

              {formData.platform === 'telegram' && (
                <div className="space-y-2">
                  <Label htmlFor="telegram_channel_id">
                    Username канала Telegram
                    <span className="text-xs text-muted-foreground ml-2">
                      (без @)
                    </span>
                  </Label>
                  <Input
                    id="telegram_channel_id"
                    value={formData.telegram_channel_id}
                    onChange={(e) => setFormData({ ...formData, telegram_channel_id: e.target.value })}
                    placeholder="durov"
                  />
                  <p className="text-xs text-muted-foreground">
                    Найти в адресе канала: t.me/<strong>durov</strong>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}