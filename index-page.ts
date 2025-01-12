// pages/index.tsx
import { JsonGenerator } from '../components/JsonGenerator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <JsonGenerator />
    </div>
  );
}
