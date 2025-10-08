import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function Header() {
  return (
    <header className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Icon name="Star" size={24} className="text-primary" />
          <h1 className="text-xl font-bold text-foreground">GroupRate</h1>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/admin">
              <Icon name="Settings" size={18} className="mr-2" />
              Управление
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
