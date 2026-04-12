interface PaddleCheckout {
  open: (options: Record<string, unknown>) => void;
}

interface PaddleInstance {
  Checkout: PaddleCheckout;
  Initialize?: (options: { token: string }) => void;
  Environment?: { set: (env: string) => void };
}

interface Window {
  Paddle?: PaddleInstance;
}
