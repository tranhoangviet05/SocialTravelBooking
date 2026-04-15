import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { MOCK_USERS, TRENDING_TOPICS } from './mockData';

const SearchFeed = () => {
  return (
    <div className="w-full p-6 pt-10">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết hoặc người dùng"
          className="w-full bg-gray-100/80 rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:ring-1 focus:ring-gray-300 transition-shadow text-[15px]"
        />
        <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {/* Recommended Users Section */}
      <div className="mb-8">
        <h2 className="font-bold text-[18px] mb-4">Gợi ý người theo dõi</h2>
        <div className="flex flex-col gap-4">
          {MOCK_USERS.slice(0, 3).map(user => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full object-cover border border-gray-100" />
                <div className="flex flex-col">
                  <span className="font-bold text-[15px] leading-tight hover:underline cursor-pointer">{user.username}</span>
                  <span className="text-gray-500 text-[14px]">{user.name}</span>
                </div>
              </div>
              <button className="px-4 py-1.5 border border-gray-300 rounded-xl text-sm font-semibold hover:bg-black hover:text-white transition-colors">
                Theo dõi
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics Section */}
      <div>
        <h2 className="font-bold text-[18px]">Đang thịnh hành</h2>
        <p className="text-[14px] text-gray-500 mb-4">Những gì mọi người đang bàn luận, do AI tóm tắt</p>

        <div className="flex flex-col">
          {TRENDING_TOPICS.map(topic => (
            <div key={topic.id} className="py-4 border-b border-gray-100 flex justify-between items-center group cursor-pointer">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-[15px] group-hover:underline">{topic.title}</h3>
                <p className="text-[14px] text-gray-500 mt-1 line-clamp-2">{topic.desc}</p>
                {topic.posts && <p className="text-[13px] text-gray-400 mt-2">{topic.posts}</p>}
              </div>
              {topic.img && (
                <img src={topic.img} alt="" className="w-[60px] h-[60px] rounded-xl object-cover border border-gray-100" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFeed;

