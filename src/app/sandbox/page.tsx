import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SandboxPage() {
  const intents = ["primary", "outline", "secondary", "ghost"] as const;
  const sizes = ["sm", "default", "lg", "icon"] as const;

  return (
    <div className="min-h-screen p-10 bg-black text-white flex flex-col items-center pt-20 gap-16 pb-20">
      <div className="w-full max-w-5xl overflow-x-auto">
        <h1 className="text-3xl font-bold mb-10 text-primary">UI Kit: Button Variants</h1>
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

      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-primary">UI Kit: Inputs</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4 p-6 border border-gray-700 rounded-2xl bg-[#121212]">
            <h3 className="text-xl font-semibold text-gray-300 border-b border-gray-700 pb-2">Default</h3>
            <Input variant="default" inputSize="default" placeholder="Default size..." />
            <Input variant="default" inputSize="lg" placeholder="Large size..." />
            <Input variant="default" shape="pill" placeholder="Pill shape..." />
            <Input variant="default" disabled placeholder="Disabled state..." />
          </div>

          <div className="flex flex-col gap-4 p-6 border border-gray-700 rounded-2xl bg-[#1a1a1a]">
            <h3 className="text-xl font-semibold text-gray-300 border-b border-gray-700 pb-2">Dark</h3>
            <Input variant="dark" inputSize="default" placeholder="Default size..." />
            <Input variant="dark" inputSize="lg" placeholder="Large size..." />
            <Input variant="dark" shape="pill" placeholder="Pill shape..." />
            <Input variant="dark" disabled placeholder="Disabled state..." />
          </div>

          <div className="flex flex-col gap-4 p-6 border border-gray-700 rounded-2xl bg-gray-800">
            <h3 className="text-xl font-semibold text-gray-300 border-b border-gray-700 pb-2">Light</h3>
            <Input variant="light" inputSize="default" placeholder="Default size..." />
            <Input variant="light" inputSize="xl" placeholder="XL size..." />
            <Input variant="light" shape="pill" inputSize="xl" placeholder="Pill & XL size..." />
            <Input variant="light" disabled placeholder="Disabled state..." />
          </div>
        </div>
      </div>
    </div>
  );
}