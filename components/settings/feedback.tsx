import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';

const Feedback: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const topics = [
    { id: 'general', label: 'General feedback' },
    { id: 'issue', label: 'Product Issue' },
    { id: 'feature', label: 'New Feature Request' },
    { id: 'other', label: 'Other (specify in text)' }
  ];

  const handleTopicChange = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback submitted:', { topics: selectedTopics, feedback });
    alert('Thank you for your feedback!');
    setFeedback('');
    setSelectedTopics([]);
  };

  return (
    <div className="  text-white flex items-center justify-center ">
      <div className="w-full  bg-[#191919] rounded-xl p-8 relative">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-medium">
            Help us improve <span className="text-[#F9E36C]">Pohloh</span> by letting us know your feedback!
          </h2>
          <p className="text-sm text-[#CCCCCC] mt-2">
            Select the topic then type your feedback below!
          </p>
        </div>

        {/* Checkbox Group */}
        <div className="flex flex-col gap-3 mb-6">
          {topics.map(topic => (
            <div key={topic.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={topic.id}
                checked={selectedTopics.includes(topic.id)}
                onChange={() => handleTopicChange(topic.id)}
                className="hidden"
              />
              <label
                htmlFor={topic.id}
                className="flex items-center cursor-pointer"
              >
                <div className={`w-4 h-4 border border-[#F9E36C] rounded-sm flex items-center justify-center ${selectedTopics.includes(topic.id) ? 'bg-[#F9E36C]' : 'bg-transparent'}`}>
                  {selectedTopics.includes(topic.id) && (
                    <div className="w-2 h-2 bg-black rounded-[1px]"></div>
                  )}
                </div>
                <span className="text-sm ml-2">{topic.label}</span>
              </label>
            </div>
          ))}
        </div>

        {/* Feedback Textarea */}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback"
            className="w-full min-h-[100px] bg-transparent border border-[#333333] rounded-lg p-3 text-sm text-white focus:border-[#F9E36C] focus:outline-none resize-y"
          />
          <Button
            type="submit"
            className="absolute bottom-3 right-3 w-9 h-9 bg-[#F9E36C] rounded-[9px] flex items-center justify-center hover:bg-[#f8d84e] transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4 text-black" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;