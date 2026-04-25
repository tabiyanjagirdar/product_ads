'use client'

import React from 'react'
import FormsInput from '../__components/FormsInput'
import PreviewResult from '../__components/PreviewResult'
import { useState } from 'react'
import axios from 'axios'

type FormData={
  file?:File|undefined;
  description:string;
  size:string;
  imageUrl?:string;
}


function ProductImages() {


  const [formData,setFormData]=useState<FormData>();
  const [loading,setLoading]=useState(false);
const onHandleInputChange=(field:string,value:string)=>{
setFormData((prev:any)=>(
  {...prev,
[field]:value
}
))
}

const OnGenerate= async()=>{

if(formData?.file && formData?.imageUrl){
  alert('Please upload Product Image or select sample image to generate AI image');
  return;
}
// if(formData?.description|| formData?.size){
//   alert('Enter all fields to generate AI image');
//   return;

// }
setLoading(true);
const formData_= new FormData();
//@ts-ignore
formData_.append('file',formData?.file);
formData_.append('description',formData?.description??'');
formData_.append('size',formData?.size??'1028x1028');


//Make API call to generate image
const result=await axios.post('/api/generate-product-image',formData_)
console.log(result.data);
setLoading(false);
}

  return (
    <div>
      <h2 className='font-bold text-2xl mb-3'>AI Product Image Generator</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
        <div>
<FormsInput onHandleInputChange={(field:string,value:string)=>onHandleInputChange(field,value)} 
  OnGenerate={OnGenerate}
  loading={loading}
  />
        </div>
        <div className='md:grid-cols-2'>
<PreviewResult />
        </div >
      </div>
    </div>
  )
}

export default ProductImages
