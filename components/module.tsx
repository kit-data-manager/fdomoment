import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Module() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Component</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is the module component rendered inside a shadcn card.</p>
      </CardContent>
    </Card>
  );
}