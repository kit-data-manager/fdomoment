import { Card } from '@/components/ui/card';
import Module from '@/components/module';

export default function Editor() {
  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <Card>
          <Module />
        </Card>
      </div>
    </div>
  );
}