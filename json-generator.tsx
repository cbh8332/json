import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, RefreshCw, Upload } from 'lucide-react';

const ConfigEditor = () => {
  const [config, setConfig] = useState({
    name: '',
    description: '',
    task: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 添加新任务
  const addTask = () => {
    setConfig(prev => ({
      ...prev,
      task: [...prev.task, { addons: '', tag: '' }]
    }));
  };

  // 删除任务
  const removeTask = (index) => {
    setConfig(prev => ({
      ...prev,
      task: prev.task.filter((_, i) => i !== index)
    }));
  };

  // 更新任务
  const updateTask = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      task: prev.task.map((task, i) => 
        i === index ? { ...task, [field]: value } : task
      )
    }));
  };

  // 更新基本信息
  const updateBaseConfig = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 生成要保存的 JSON
  const generateSaveData = () => {
    return {
      ...config,
      task: config.task.map(task => ({
        addons: task.addons,
        [tag=${task.tag}] 
      }))
    };
  };

  // 从加载的数据解析tag值
  const parseLoadedData = (data) => {
    return {
      ...data,
      task: data.task.map(task => {
        const tagKey = Object.keys(task).find(k => k.startsWith('tag='));
        return {
          addons: task.addons,
          tag: tagKey ? tagKey.slice(4) : ''
        };
      })
    };
  };

  // 导入配置
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (imported.name !== undefined && imported.description !== undefined && Array.isArray(imported.task)) {
            setConfig(parseLoadedData(imported));
            setMessage('导入成功');
          } else {
            throw new Error('格式不正确');
          }
        } catch (error) {
          setMessage('导入失败：' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // 保存配置到 Gist
  const saveConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateSaveData())
      });
      
      if (!response.ok) throw new Error('保存失败');
      setMessage('保存成功');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 加载配置
  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error('加载失败');
      const data = await response.json();
      setConfig(parseLoadedData(data));
      setMessage('加载成功');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">配置编辑器</h1>
        <div className="space-x-2">
          <label className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">
            <input
              type="file"
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <Upload className="w-5 h-5" />
          </label>
          <button
            onClick={loadConfig}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={saveConfig}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded ${
          message.includes('失败') ? 'bg-red-100' : 'bg-green-100'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          value={config.name}
          onChange={(e) => updateBaseConfig('name', e.target.value)}
          placeholder="名称"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={config.description}
          onChange={(e) => updateBaseConfig('description', e.target.value)}
          placeholder="描述"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-4">
        {config.task.map((task, index) => (
          <div key={index} className="flex space-x-2">
            <input
              type="text"
              value={task.addons}
              onChange={(e) => updateTask(index, 'addons', e.target.value)}
              placeholder="脚本链接"
              className="flex-1 p-2 border rounded"
            />
            <input
              type="text"
              value={task.tag}
              onChange={(e) => updateTask(index, 'tag', e.target.value)}
              placeholder="标签"
              className="w-32 p-2 border rounded"
            />
            <button
              onClick={() => removeTask(index)}
              className="p-2 text-red-500 hover:bg-red-100 rounded"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addTask}
        className="w-full p-2 bg-gray-100 rounded hover:bg-gray-200"
      >
        <Plus className="w-5 h-5 mx-auto" />
      </button>

      <pre className="p-4 bg-gray-100 rounded overflow-auto">
        {JSON.stringify(generateSaveData(), null, 2)}
      </pre>
    </div>
  );
};

export default ConfigEditor;
