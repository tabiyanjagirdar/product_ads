import React from 'react'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Aitools = [
    {
        name: 'AI Product Image',
        desc:'Generate high-quality, professional product images instantly with AI',
        bannerImage:'/product-image.png',
        path:'/creative-ai-tools/product-images'
    },
    {
        name: 'AI Product Video',
        desc:'Create engaging product showcase videos with AI in minutes',
        bannerImage:'/product-video.png',
        path:'/'
    },
    {
        name: 'AI Product With Avatar',
        desc:'Bring your products to life with AI-generated avatars.',
        bannerImage:'/product-avatar.png',
        path:'/'
    }
]

function AiToolList() {
  return (
    <div>
      <h2 className='font-bold text-2xl mb-2'>Creative AI Tools</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {Aitools.map((tool,index) => (
            <div key={index} className='flex items-center justify-between p-7 bg-zinc-800 rounded-2xl'>
                <div>  
                    <h2 className='font-bold text-2xl'>{tool.name}</h2>
                    <p className='opacity-60 mt-2'>{tool.desc}</p>
                    <Link href={tool.path}>
                    <Button className='mt-4'>Create Now</Button>
                    </Link>
                </div>
<Image src={tool.bannerImage} alt={tool.name}
 width={400}
  height={200} 
  className='w-[200px]' 
  />
            </div>
        ))}
      </div>
    </div>
  )
}

export default AiToolList
