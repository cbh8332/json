// pages/api/config.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');

// 确保数据目录存在
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// 确保配置文件存在
if (!fs.existsSync(CONFIG_PATH)) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ name: "", description: "", task: [] }));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      return res.status(200).json(config);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to read configuration' });
    }
  }

  if (req.method === 'POST') {
    try {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(req.body, null, 2));
      return res.status(200).json({ message: 'Configuration saved successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save configuration' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// components/JsonGenerator.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const JsonGenerator = () => {
  const [config, setConfig] = useState({
    name: "",
    description: "",
    task: [{ addons: "", tag: "" }]
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error('Failed to load configuration');
      const data = await response.json();
      setConfig(data);
      showMessage('success', '配置已加载');
    } catch (error) {
      showMessage('error', '加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const saveConfig = async (newConfig = config) => {
    try {
      setLoading(true);
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      
      if (!response.ok) throw new Error('Failed to save configuration');
      showMessage('success', '配置已保存');
    } catch (error) {
      showMessage('error', '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddScript = () => {
    setConfig(prev => ({
      ...prev,
      task: [...prev.task, { addons: "", tag: "" }]
    }));
  };

  const handleRemoveScript = (index: number) => {
    setConfig(prev => ({
      ...prev,
      task: prev.task.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleScriptChange = (index: number, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      task: prev.task.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>配置生成器</CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={loadConfig} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            刷新
          </Button>
          <Button 
            onClick={() => saveConfig()} 
            disabled={loading}
            size="sm"
          >
            保存
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {message.text && (
          <Alert className={message.type === 'error' ? 'bg-red-50' : 'bg-green-50'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">名称:</label>
          <Input
            value={config.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="请输入名称"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">描述:</label>
          <Input
            value={config.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="请输入描述"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">脚本列表</h3>
            <Button 
              onClick={handleAddScript}
              disabled={loading}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              添加脚本
            </Button>
          </div>

          {config.task.map((script, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  value={script.addons}
                  onChange={e => handleScriptChange(index, 'addons', e.target.value)}
                  placeholder="脚本链接"
                />
                <Input
                  value={script.tag}
                  onChange={e => handleScriptChange(index, 'tag', e.target.value)}
                  placeholder="脚本名称"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveScript(index)}
                disabled={loading}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">当前配置:</label>
          <Textarea
            value={JSON.stringify(config, null, 2)}
            readOnly
            className="font-mono h-48"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default JsonGenerator;

// pages/index.tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <JsonGenerator />
    </div>
  );
}
