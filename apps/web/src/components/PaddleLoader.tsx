"use client";

import { useEffect } from "react";

export function PaddleLoader() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if (!window.Paddle) return;
      if (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox") {
        window.Paddle.Environment?.set("sandbox");
      }
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (token) {
        window.Paddle.Initialize?.({ token });
      }
    };
    document.head.appendChild(script);
  }, []);

  return null;
}
