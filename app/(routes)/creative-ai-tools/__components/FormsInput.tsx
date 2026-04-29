'use client'

import React from 'react'
import { ImagePlus, Loader2Icon, Monitor, Smartphone, Sparkle, Sparkles, Square } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'


const sampleProducts=[
    '/headphone.png',
    '/juice-can.png',
    '/perfume2.png',
    '/burger.png',
    '/ice-creame.png',
    
]


const AvatarList=[
  {
    name:'Avatar 1',
    image:'https://ik.imagekit.io/tgfdjceog/Avatar/serious-young-african-man-standing-isolated.jpg'
  },
  {
    name:'Avatar 2',
    image:'https://ik.imagekit.io/tgfdjceog/Avatar/premium_photo-1689568126014-06fea9d5d341.avif'
  },
  {
    name:'Avatar 3',
    image:'https://ik.imagekit.io/tgfdjceog/Avatar/photo-1534528741775-53994a69daeb.avif'
  },
  {
    name:'Avatar 4',
    image:'https://ik.imagekit.io/tgfdjceog/Avatar/premium_photo-1671656349322-41de944d259b.avif'
  },
  {
    name:'Avatar 5',
    image:'https://ik.imagekit.io/tgfdjceog/Avatar/premium_photo-1689551670902-19b441a6afde.avif'
  }
]

type Props={
    onHandleInputChange: any,
    OnGenerate:any,
    loading:boolean,
    enableAvatar:boolean
}

function FormsInput({onHandleInputChange, OnGenerate, loading, enableAvatar}:Props) {
    const [preview,setPreview]=useState<string | null>();
    const  [selectedAvatar,setSelectedAvatar]=useState<string>();
    const onFileSelect=(files:FileList | null)=>{
        if(!files || files.length === 0) return;
        const file = files[0];
        if(file.size > 5 * 1024 * 1024){
            alert('File size exceeds 5MB limit. Please select a smaller file.');
            return;
        }
        onHandleInputChange('file',file);
        setPreview(URL.createObjectURL(file));
    }
  return (
    <div>
      <div>
        <h2 className='font-semibold'>
            1. Upload Product Image
        </h2>
        <div>
            <label htmlFor='imageUpload' className='mt-2 border-dashed border-2 rounded-2xl flex flex-col
             p-4 items-center justify-center min-h-[200px] cursor-pointer'>
              {!preview?  <div className='flex flex-col items-center gap-3'>
                    <ImagePlus className='h-8 w-8 opacity-40'/>
                    <h2 className='text-xl'>Click here to upload Image</h2>
                    <p className='opacity-45'>Upload image upto 5MB</p>
                </div>
                :<Image src={preview} alt='Preview' width={300} height={300} className='w-full h-full max-h-[200px] object-contain 
                rounded-lg '/>
                }
            </label>
            <input type="file" id='imageUpload' className='hidden' accept='image/*'
            onChange={(event)=>onFileSelect(event.target.files)}/>
        </div>
{/* Sample Products */}
{!enableAvatar&&<div>
    <h2 className='opacity-40 text-center mt-3'>Select sample product to try</h2>
        <div className='flex gap-5 items-center'>

{sampleProducts.map((product,index)=>(
    <Image src={product} alt={product} width={100} height={100} key={index}
    className='w-[60px] h-[60px] cursor-pointer hover:scale-105 transition-all rounded-lg'
    onClick={()=>{setPreview(product);
      onHandleInputChange('imageUrl',product);
    }} />
))}
        </div>
      </div>}
      </div>

      {enableAvatar&&
      <div className='mt-8'>
        <h2 className='font-semibold'>
            Select Avatar
        </h2>
        <div className='grid grid-cols-5 gap-3'>
          {AvatarList.map((avatar,index)=>(
          <Image src={avatar.image} alt={avatar.name} width={200} height={200} key={index}
           className={`rounded-lg h-[100px] w-[80px] object-cover cursor-pointer
            ${avatar.name==selectedAvatar && 'border-2 border-primary'}`}
           onClick={()=>{setSelectedAvatar(avatar.name);onHandleInputChange('avatar',avatar.image)}}
           />
          ))}
        </div>
      </div>}


      <div className='mt-8'>
        <h2 className='font-semibold'>
            2. Enter Product Description
        </h2>
        <Textarea placeholder='Tell me more about the product and how you want to display...' 
        className='min-h-[150px] mt-2'
        onChange={(event)=>onHandleInputChange('description',event.target.value)}/>
      </div>


      <div className='mt-8'>
        <h2 className='font-semibold'>
            3. Select Image Size
        </h2>
<Select onValueChange={(value)=>onHandleInputChange('size',value)}>
  <SelectTrigger className="w-full mt-2">
    <SelectValue placeholder="Select Resolution" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectItem value="1024x1024">
        <div className='flex gap-2 items-center'>
            <Square className='h-4 w-4'/>
            <span>1:1</span>
        </div>
      </SelectItem>
      <SelectItem value="1536x1024">
        <div className='flex gap-2 items-center'>
            <Monitor className='h-4 w-4'/>
            <span>16:9</span>
        </div>
      </SelectItem>
      <SelectItem value="1024x1536">
        <div className='flex gap-2 items-center'>
            <Smartphone className='h-4 w-4'/>
            <span>9:16</span>
        </div>
      </SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
      </div>
      <Button 
      disabled={loading}
      className='mt-5 w-full' onClick={OnGenerate}>
        {loading?<Loader2Icon className='animate-spin'/>:<Sparkles/>} Generate </Button>
      <h2 className='mt-1 text-sm opacity-35 text-center'>5 Credit to Generate</h2>
    </div>
  )
}

export default FormsInput

