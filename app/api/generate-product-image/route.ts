import { imagekit } from "@/lib/imagekit";
import { clientOpenAi } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";

const PROMPT = `
Analyze the uploaded product image and create premium ad prompts.

Return ONLY valid JSON in this exact format:

{
  "textToImage": "high converting product ad image prompt",
  "imageToVideo": "cinematic product video prompt"
}

Instructions:
- Product should remain center focus
- Premium lighting
- Splash / motion effects matching product type
- Modern clean background
- Hyper realistic
- High detail
- Marketing ready
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const size = (formData.get("size") as string) || "1536x1024";

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(arrayBuffer).toString("base64");

    // Upload to ImageKit
    const imageKitRef = await imagekit.upload({
      file: base64File,
      fileName: `${Date.now()}.png`,
      isPublished: true,
    });

    const uploadedImageUrl = imageKitRef.url;

    // Generate prompts using OpenAI Vision
    const promptResponse = await clientOpenAi.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: PROMPT,
            },
            {
              type: "input_image",
              image_url: uploadedImageUrl,
            },
          ],
        },
      ],
    });

    const rawText = promptResponse.output_text?.trim() || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        textToImage:
          "Luxury product showcase, studio lighting, premium splash effect, clean background, realistic shadows",
        imageToVideo:
          "Camera rotates around the product, liquid splash animation, glowing premium lighting, cinematic motion",
      };
    }

    // Generate final product ad image
    const imageResponse = await clientOpenAi.images.generate({
      model: "gpt-image-1",
      prompt: parsed.textToImage,
      size: size as "1024x1024" | "1536x1024" | "1024x1536",
    });

    const generatedBase64 = imageResponse.data[0].b64_json;

    if (!generatedBase64) {
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    // Upload generated image to ImageKit
    const finalImage = await imagekit.upload({
      file: generatedBase64,
      fileName: `generated-${Date.now()}.png`,
      isPublished: true,
    });

    return NextResponse.json({
      success: true,
      uploadedImage: uploadedImageUrl,
      generatedImage: finalImage.url,
      textToImage: parsed.textToImage,
      imageToVideo: parsed.imageToVideo,
    });
  } catch (error: any) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}