import React from 'react';
import { Button } from '@/components/ui/Button';

export default function SandboxPage() {
  const intents = ["primary", "outline", "secondary", "ghost"] as const;
  const sizes = ["sm", "default", "lg", "icon"] as const;

  return (
    <div className="min-h-screen p-10 bg-black text-white flex flex-col items-center pt-20">
      <h1 className="text-3xl font-bold mb-10 text-primary">UI Kit: Button Variants</h1>

      <div className="w-full max-w-5xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-700 text-gray-400 font-medium">Size \ Intent</th>
              {intents.map(intent => (
                <th key={intent} className="p-4 border-b border-gray-700 capitalize text-center">
                  {intent}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => (
              <tr key={size} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                <td className="p-4 text-gray-400 font-medium capitalize w-32">
                  {size}
                </td>
                {intents.map(intent => (
                  <td key={intent} className="p-4 text-center">
                    <Button intent={intent} size={size}>
                      {size === 'icon' ? '⭐' : 'Button'}
                    </Button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}