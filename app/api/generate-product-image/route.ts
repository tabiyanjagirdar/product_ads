import { db } from "@/configs/firebaseConfig";
import { imagekit } from "@/lib/imagekit";
import { clientOpenAi } from "@/lib/openai";
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROMPT = `Create a vibrant product showcase image featuring an uploaded image
in the center, surrounded by dynamic splashes of liquid or relevant material that complement the product.
Use a clean, colorful background to make the product stand out. Include subtle elements related to the product's ingredients, or theme floating around to add context and visual interest.
Ensure the product is sharp and in focus, with motion and energy conveyed through the splash effects. Also give me image to video prompt for the same in JSON format: {"textToImage":"", "imageToVideo":""}`;


const AVATAR_PROMPT=`Create a vibrant product showcase image featuring the uploaded product image being held naturally by 
the uploaded avatar image. Position the product clearly in the avatar's hands, making it the focal 
point of the scene. Surround the product with dynamic splashes of liquid or relevant materials that complement the product. 
Use a clean, colorful background to make the product stand out. Add subtle floating elements related to the product's flavor, ingredients, or theme for extra context and visual interest.
Ensure both the avatar and product are sharp, well-lit, and in focus, while motion and energy are conveyed through the splash effects.
Also give me image to video prompt for same in JSON format: {textToImage:"", imageToVideo:""}
`


export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const description = formData.get('description');
        const size = formData.get('size');
        const userEmail=formData.get('userEmail');
        const avatar=formData.get('avatar') as String;


        console.log("DB:", db);

const userRef=collection(db,'users');
const q=query(userRef,where('email','==',userEmail));
const querySnapshot=await getDocs(q);
const userDoc=querySnapshot.docs[0];
const userInfo=userDoc.data();



 // Save to Database 
   const docId=Date.now().toString();
        await setDoc(doc(db, "user-ads",docId), {
            userEmail: userEmail,
            status:'pending',
            description: description,
            size: size
        });



        // Upload product image
        const arrayBuffer = await file.arrayBuffer();
        const base64File = Buffer.from(arrayBuffer).toString('base64');

        const imageKitRef = await imagekit.upload({
            file: base64File,
            fileName: Date.now() + ".png",
            isPublished: true
        });

        console.log(imageKitRef.url);

        // Generate Product Image Prompt using ChatGPT
        const contentArray: any[] = [
            {
                type: "text",
                text: avatar?.length > 2 ? AVATAR_PROMPT : PROMPT,
            },
            {
                type: "image_url",
                image_url: { url: imageKitRef.url },
            },
        ];

        // Add avatar image if provided
        if (avatar?.length > 2) {
            contentArray.push({
                type: "image_url",
                image_url: { url: avatar },
            });
        }

        const response = await clientOpenAi.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: "user",
                    content: contentArray,
                },
            ],
        });

        const textOutput = response.choices[0]?.message?.content?.trim();
        
        let json;
        try {
            json = JSON.parse(textOutput || "{}");
        } catch {
            // If AI doesn't return valid JSON, create a default response
            json = {
                textToImage: "Premium product showcase, studio lighting, splash effects, clean background, hyper realistic",
                imageToVideo: "Cinematic product video, camera rotation, liquid splash animation, premium lighting, marketing ready"
            };
        }



        // Generate Image Product
        const ImageResponse = await clientOpenAi.responses.create({
            model: "gpt-4.1-mini",
            max_output_tokens: 500,
            input: [
                {
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: json?.textToImage,
                        },
                        {
                            type: "input_image",
                            image_url: imageKitRef.url,
                            detail: "low",
                        },
                    ],
                },
            ],
            tools: [{ type: "image_generation" }],
        });

        console.log(ImageResponse.output);
        const imageData = ImageResponse.output
            ?.filter((item: any) => item.type === "image_generation_call")
            .map((item: any) => item.result);

        const generatedImage = imageData?.[0]; // base64 Image



    //Upload generated image to imageKit
    const uploadResult=await imagekit.upload({
        file:`data:image/png;base64,${generatedImage}`,
        fileName:`generated-${Date.now()}.png`,
        isPublished:true
    })

   //Update Doc
   
  await updateDoc(doc(db, "user-ads", docId), {
    finalProductImageUrl: uploadResult.url,
    productImageUrl: imageKitRef.url,
    status: "completed",
    userInfo:userInfo?.credits - 5,
    imageToVideoPrompt:json?.imageToVideo //Save Image to Video Prompt
  });




        return NextResponse.json(uploadResult?.url);


    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: error?.message || "Something went wrong" },
            { status: 500 }
        );
    }
}