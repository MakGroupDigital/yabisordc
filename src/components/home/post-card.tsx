
'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
    Heart, 
    MessageSquare, 
    Share2, 
    Bookmark, 
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


type Post = {
  id: number;
  author: string;
  location: string;
  avatarUrl: string;
  media: { type: 'image' | 'video'; url: string }[];
  caption: string;
  likes: number;
  comments: number;
};

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleLike = () => {
        if (isLiked) {
            setLikeCount(likeCount - 1);
        } else {
            setLikeCount(likeCount + 1);
        }
        setIsLiked(!isLiked);
    };

    const handleBookmark = () => setIsBookmarked(!isBookmarked);

    const hashtags = post.caption.match(/#\w+/g) || [];
    const description = post.caption.replace(/#\w+/g, '').trim();

  return (
    <div className="w-full bg-white p-4 rounded-3xl shadow-xl my-6">
      {/* Post Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 border-2 border-[#FFCC00]">
          <AvatarImage src={post.avatarUrl} alt={post.author} />
          <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <span className="font-headline font-semibold text-lg text-[#003366]">{post.author}</span>
            <p className="font-body text-sm text-gray-500">{post.location}</p>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Signaler</DropdownMenuItem>
                <DropdownMenuItem>Ne plus suivre</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Media */}
      <div className="relative aspect-[1/1] w-full mt-4 group">
         <Carousel className="w-full h-full rounded-2xl overflow-hidden">
          <CarouselContent>
            {post.media.map((item, index) => (
              <CarouselItem key={index}>
                <div className="relative h-full w-full">
                {item.type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={`Post media ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {post.media.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 text-white hover:bg-black/50" />
                <CarouselNext className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 text-white hover:bg-black/50" />
              </>
          )}
        </Carousel>
      </div>

      {/* Post Actions */}
      <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
                <button onClick={handleLike} className="flex items-center gap-1.5 group/like">
                    <Heart className={cn("h-7 w-7 text-gray-400 transition-all duration-200 group-hover/like:scale-110", isLiked && "text-red-500 fill-red-500")} />
                    <span className="font-semibold text-gray-600">{likeCount.toLocaleString()}</span>
                </button>
                <button className="flex items-center gap-1.5 group/comment">
                    <MessageSquare className="h-7 w-7 text-gray-400 transition-all duration-200 group-hover/comment:scale-110" />
                    <span className="font-semibold text-gray-600">{post.comments.toLocaleString()}</span>
                </button>
                <button className="flex items-center gap-1.5 group/share">
                    <Share2 className="h-7 w-7 text-gray-400 transition-all duration-200 group-hover/share:scale-110" />
                </button>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={handleBookmark}>
                    <Bookmark className={cn("h-7 w-7 text-gray-400 transition-colors duration-200", isBookmarked && "text-[#003366] fill-[#003366]")} />
                </button>
            </div>
        </div>

      {/* Post Info */}
      <div className="px-1">
        <p className="font-body text-[#555555]">
            {description}
            {' '}
            {hashtags.map(tag => (
                <span 
                    key={tag} 
                    className="text-[#339966] font-medium cursor-pointer hover:underline transition-all hover:text-[#FF8800]"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const tagWithoutHash = tag.replace(/^#/, '');
                        router.push(`/home/hashtag/${encodeURIComponent(tagWithoutHash)}`);
                    }}
                >
                    {tag}{' '}
                </span>
            ))}
        </p>
      </div>

    </div>
  );
}
