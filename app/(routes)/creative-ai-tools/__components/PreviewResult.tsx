import { useAuthContext } from '@/app/provider';
import { db } from '@/configs/firebaseConfig';
import { Button } from '@/components/ui/button';
import { Download, Sparkles,Loader2Icon, LoaderCircle, Play } from 'lucide-react';
import Link from 'next/link';

import {
  collection,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

 export type PreviewProduct = {
  id: string;
  finalProductImageUrl: string;
  productImageUrl: string;
  description: string;
  size: string;
  status: string,
  imageToVideoStatus:string,
  videoUrl:string;
};

function PreviewResult() {
  const { user } = useAuthContext();
  const [productList, setProductList] = useState<PreviewProduct[]>([]);
const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!user?.email) return;

    const q = query(
      collection(db, 'user-ads'),
      where('userEmail', '==', user.email)
    );

    const unSub = onSnapshot(q, (querySnapshot) => {
      const matchedDocs: PreviewProduct[] = [];

      querySnapshot.forEach((doc) => {
        matchedDocs.push({
          ...(doc.data() as PreviewProduct),
          id: doc.id
        });
      });
console.log('Matched user-ads:', matchedDocs);
      setProductList(matchedDocs);
    });

    return () => unSub();
  }, [user?.email]);




const DownloadImage= async (imageUrl:string)=>{
  const result= await fetch(imageUrl);
  const blob= await result.blob();
  const blobUrl=window.URL.createObjectURL(blob);

  const a=document.createElement('a');
  a.href=blobUrl;

  a.setAttribute('download','generated-image.png');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}

const GenerateVideo=async(config:any)=>{
  setLoading(true);
const result=await axios.post('/api/generate-product-video',{
  imageUrl:config?.finalProductImageUrl,
  imageToVideoPrompt:config?.imageToVideoPrompt,
  uid:user?.uid,
  docId:config?.id
});
setLoading(false);
console.log('Generated Video URL:', result.data);
}

  return (
    <div className='p-5 rounded-2xl border'>
      <h2 className='font-bold text-2xl'>
        Generated Result
      </h2>

      <div className='grid grid-cols-2 mt-4 md:grid-cols-2 lg:grid-cols-2 gap-5'>
  {productList.map((product, index) => (
    <div key={index} className='border rounded-xl p-2'>
      {product.status === 'completed' ? (
        <div>
          <Image
            src={product.finalProductImageUrl}
            alt={product.id}
            width={500}
            height={500}
            className='w-full h-[250px] object-cover rounded-lg'
          />

          <div className='flex justify-between items-center mt-2'>
            <div className='flex items-center gap-2'>
              <Button variant='ghost' onClick={ ()=>DownloadImage(product.finalProductImageUrl)}>
                <Download />
              </Button>

<Link href={product.finalProductImageUrl} target='_blank' rel='noopener noreferrer'>

              <Button variant='ghost'>
                View
              </Button>
              </Link>
              {product?.videoUrl && <Link href={product?.videoUrl} target='_blank' rel='noopener noreferrer'>
              <Button variant={'ghost'}><Play/></Button>
              </Link>}
            </div>

          {!product?.videoUrl&&  <Button 
            disabled={product?.imageToVideoStatus === 'pending'}
            
            onClick={()=>GenerateVideo(product)}>

              {product?.imageToVideoStatus === 'pending'?<LoaderCircle className='animate-spin h-4 w-4'/>:
              <Sparkles className='mr-1 h-4 w-4' />}
              Animate
            </Button>}
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center h-full min-h-[250px] border rounded-xl bg-zinc-500'>
          <Loader2Icon className='animate-spin h-8 w-8' />
          <h2 className='mt-2'>Generating...</h2>
        </div>
      )}
    </div>
  ))}
</div>
    </div>
  );
}

export default PreviewResult;