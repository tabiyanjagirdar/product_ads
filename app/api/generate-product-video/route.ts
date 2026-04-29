import { db } from "@/configs/firebaseConfig";
import { imagekit } from "@/lib/imagekit";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    // ===============================
    // GET REQUEST DATA
    // ===============================
    const {
      imageUrl,
      imageToVideoPrompt,
      docId,
    } = await req.json();

    if (!imageUrl || !docId) {
      return NextResponse.json(
        { error: "Missing imageUrl or docId" },
        { status: 400 }
      );
    }

    // ===============================
    // UPDATE FIRESTORE STATUS
    // ===============================
    await updateDoc(doc(db, "user-ads", docId), {
      imageToVideoStatus: "pending",
    });

    // ===============================
    // INPUT FOR REPLICATE
    // ===============================
    const input = {
      image: imageUrl,
      prompt:
        imageToVideoPrompt ||
        "Cinematic motion, smooth camera movement, premium lighting",
    };

    // ===============================
    // GENERATE VIDEO
    // ===============================
    const output = await replicate.run(
      "wan-video/wan-2.2-i2v-fast",
      { input }
    );

    console.log("Replicate Output:", output);

    // ===============================
    // EXTRACT VIDEO URL SAFELY
    // ===============================
    let videoUrl = "";

    if (typeof output === "string") {
      videoUrl = output;
    } else if (Array.isArray(output)) {
      videoUrl = String(output[0]);
    } else if (
      output &&
      typeof output === "object" &&
      "url" in output &&
      typeof output.url === "function"
    ) {
      videoUrl = output.url().toString();
    } else {
      videoUrl = String(output);
    }

    // ===============================
    // SAVE RESULT TO FIRESTORE
    // ===============================
    await updateDoc(doc(db, "user-ads", docId), {
      imageToVideoStatus: "completed",
      videoUrl: videoUrl,
    });


    const resp= await fetch(videoUrl);
    const videoBuffer=Buffer.from(await resp.arrayBuffer());

    const uploadResult=await imagekit.upload({
    file:videoBuffer,
    fileName:`generated-video-${Date.now()}.mp4`,
    isPublished:true
    })
    // ===============================
    // SUCCESS RESPONSE
    // ===============================
    return NextResponse.json({
      success: true,
      videoUrl,
    });
  } catch (error: any) {
    console.error("VIDEO GENERATION ERROR:", error);

    // ===============================
    // OPTIONAL FAIL STATUS
    // ===============================
    try {
      const body = await req.json().catch(() => null);

      if (body?.docId) {
        await updateDoc(doc(db, "user-ads", body.docId), {
          imageToVideoStatus: "failed",
        });
      }
    } catch {}

    // ===============================
    // HANDLE RATE LIMIT
    // ===============================
    if (
      error?.message?.includes("429") ||
      error?.message?.includes("Too Many Requests")
    ) {
      return NextResponse.json(
        {
          error:
            "Rate limited. Please wait 10 seconds and try again.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Video generation failed",
      },
      { status: 500 }
    );
  }
}