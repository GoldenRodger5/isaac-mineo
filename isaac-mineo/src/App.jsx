import { useState } from 'react';
import About from './components/About';
import Projects from './components/Projects';
import Resume from './components/Resume';

const CORRECT_PASSWORD = import.meta.env.VITE_SITE_PASSWORD;

function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');

  if (!unlocked) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-900 text-white px-4">
        <h1 className="text-2xl font-bold mb-4">Enter Password</h1>
        <input
          type="password"
          className="p-2 border border-gray-600 rounded mb-4 text-black"
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={() => setUnlocked(input === CORRECT_PASSWORD)}
          className="bg-green-500 px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-gray-800">
      <About />
      <Projects />
      <Resume />
    </div>
  );
}

export default App;
